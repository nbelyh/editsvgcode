/**
 * Reading the chat API's streamed reply.
 *
 * Asked with `stream: true`, the API sends server-sent events: answer text and reasoning
 * summaries while the model works, then one `response.completed` event carrying the body a
 * non-streamed call returns. The caller gets the same result either way, so nothing past the
 * transport changes.
 */

/** What the panel can show while a call runs. */
export type ChatStreamUpdate =
  | { kind: 'text'; delta: string }
  | { kind: 'reasoning'; delta: string }
  | { kind: 'tool'; name: string };

/**
 * Read a server-sent event stream, handing each event's `data:` payload, parsed as JSON, to
 * onEvent; returning 'stop' from onEvent ends the read there. Chunks can split an event, a
 * line or a multi-byte character anywhere, and comment lines — the server's keepalives — are
 * skipped.
 *
 * However the read ends early — asked to stop, or an event that cannot be read — the response
 * is cancelled rather than left half-read: the server stops generating, and charging for, a
 * reply only once its connection closes.
 */
export async function readSseEvents(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: unknown) => 'stop' | undefined,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let data: string | null = null;

  /** One complete line; true once onEvent has asked to stop. */
  const take = (line: string): boolean => {
    if (line === '') {
      const payload = data;
      data = null;
      return payload !== null && payload !== '' && onEvent(JSON.parse(payload)) === 'stop';
    }
    if (line.startsWith('data:')) {
      const value = line.slice(line.startsWith('data: ') ? 6 : 5);
      data = data === null ? value : `${data}\n${value}`;
    }
    return false;
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      // An event the stream ended in the middle of is discarded, as the SSE spec says: its
      // closing blank line never came, so its data may be cut short too.
      if (done) return;
      buffer += decoder.decode(value, { stream: true });
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, newline).replace(/\r$/, '');
        buffer = buffer.slice(newline + 1);
        if (take(line)) {
          await reader.cancel();
          return;
        }
      }
    }
  } catch (err) {
    reader.cancel(err).catch(() => {});
    throw err;
  }
}

/**
 * Read the chat API's event stream to its result: updates go to onUpdate as they arrive, and
 * the promise resolves with the `response.completed` body. An `error` event — how the API
 * fails once the stream has started — rejects with its message, as a failed JSON call would.
 *
 * Reading stops at the result. The server has charged for the answer by then, so a
 * connection that drops in the moment before it would have closed must not turn a finished
 * answer into an error. A stream that ends without a result — cut off, including partway
 * through the result itself — rejects as incomplete.
 */
export async function readChatStream<T>(
  body: ReadableStream<Uint8Array>,
  onUpdate?: (update: ChatStreamUpdate) => void,
): Promise<T> {
  let result: T | undefined;
  let failure: string | undefined;

  await readSseEvents(body, (raw) => {
    const event = raw as {
      type?: string;
      delta?: unknown;
      item?: { type?: string; name?: string };
      response?: T;
      error?: unknown;
    };
    switch (event.type) {
      case 'response.output_text.delta':
        onUpdate?.({ kind: 'text', delta: String(event.delta ?? '') });
        break;
      case 'response.reasoning_summary_text.delta':
        onUpdate?.({ kind: 'reasoning', delta: String(event.delta ?? '') });
        break;
      case 'response.reasoning_summary_part.added':
        // A new summary paragraph: keep it from running into the previous one.
        onUpdate?.({ kind: 'reasoning', delta: '\n\n' });
        break;
      case 'response.output_item.added':
        if (event.item?.type === 'function_call' && event.item.name) {
          onUpdate?.({ kind: 'tool', name: event.item.name });
        }
        break;
      case 'response.completed':
        result = event.response;
        return 'stop';
      case 'error':
        failure = String(event.error ?? 'The AI request failed.');
        return 'stop';
    }
    return undefined;
  });

  if (failure !== undefined) throw new Error(failure);
  if (result === undefined) throw new Error('The AI response ended before it was complete.');
  return result;
}

/**
 * Output items as they are kept for replay and saved with the chat: reasoning items lose
 * their summary text. Summaries are asked for so the panel can show what the model is
 * thinking while it works, and past that point they are a liability. Replayed, they ride
 * along on every later request and count against the free tier's request size; saved, they
 * are readable by anyone who can open a shared document, and they can restate the server's
 * instructions. An empty summary is the shape a non-streamed call always returned, and the
 * API replays it as before.
 */
export function withoutReasoningSummaries<T>(items: readonly T[]): T[] {
  return items.map((item) => {
    const candidate = item as { type?: unknown; summary?: unknown };
    return candidate.type === 'reasoning' && Array.isArray(candidate.summary) && candidate.summary.length > 0
      ? ({ ...(item as object), summary: [] } as T)
      : item;
  });
}
