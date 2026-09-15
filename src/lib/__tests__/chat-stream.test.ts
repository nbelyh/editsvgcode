// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readSseEvents, readChatStream, withoutReasoningSummaries, type ChatStreamUpdate } from '../chat-stream';

/** A body delivering `text` in chunks of `size` bytes — small enough to split events,
 *  lines and multi-byte characters — and then closing. */
function bodyOf(text: string, size = 5): ReadableStream<Uint8Array> {
  const bytes = new TextEncoder().encode(text);
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (let i = 0; i < bytes.length; i += size) controller.enqueue(bytes.slice(i, i + size));
      controller.close();
    },
  });
}

/** A body that sends `text` and then stays open, as a server still generating would. Says
 *  whether the reader hung up. */
function openBodyOf(text: string) {
  const state = { cancelled: false };
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(text));
    },
    cancel() {
      state.cancelled = true;
    },
  });
  return { body, state };
}

const frame = (event: Record<string, unknown>) => `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('readSseEvents', () => {
  it('reassembles events split across chunks, multi-byte characters included', async () => {
    const got: unknown[] = [];
    await readSseEvents(bodyOf(frame({ type: 'a', text: 'Grüße — ✓' }) + frame({ type: 'b' }), 3), (e) => {
      got.push(e);
      return undefined;
    });
    expect(got).toEqual([{ type: 'a', text: 'Grüße — ✓' }, { type: 'b' }]);
  });

  it('skips keepalive comments and accepts CRLF line endings', async () => {
    const got: unknown[] = [];
    await readSseEvents(bodyOf(': keepalive\r\n\r\ndata: {"type":"x"}\r\n\r\n: keepalive\n\n'), (e) => {
      got.push(e);
      return undefined;
    });
    expect(got).toEqual([{ type: 'x' }]);
  });

  it('discards an event the stream ended in the middle of', async () => {
    // Its closing blank line never came, so its data may be cut short too (SSE spec).
    const got: unknown[] = [];
    await readSseEvents(bodyOf(frame({ type: 'whole' }) + 'data: {"type":"cu'), (e) => {
      got.push(e);
      return undefined;
    });
    expect(got).toEqual([{ type: 'whole' }]);
  });

  it('hangs up when an event cannot be read', async () => {
    // Left half-read, the response keeps the server generating — and charging — a reply
    // nobody will see.
    const { body, state } = openBodyOf('data: {not json\n\n');
    await expect(readSseEvents(body, () => undefined)).rejects.toThrow(SyntaxError);
    await settle();
    expect(state.cancelled).toBe(true);
  });
});

describe('readChatStream', () => {
  it('reports progress as it arrives and resolves with the completed body', async () => {
    const response = { output: [{ type: 'message' }], credits: { remaining: 47, limit: 50 } };
    const updates: ChatStreamUpdate[] = [];
    const result = await readChatStream(bodyOf([
      frame({ type: 'response.reasoning_summary_part.added' }),
      frame({ type: 'response.reasoning_summary_text.delta', delta: '**Planning**' }),
      frame({ type: 'response.output_item.added', item: { type: 'function_call', name: 'set_text' } }),
      frame({ type: 'response.output_text.delta', delta: 'Done' }),
      ': keepalive\n\n',
      frame({ type: 'response.completed', response }),
    ].join('')), (u) => updates.push(u));

    expect(updates).toEqual([
      { kind: 'reasoning', delta: '\n\n' },
      { kind: 'reasoning', delta: '**Planning**' },
      { kind: 'tool', name: 'set_text' },
      { kind: 'text', delta: 'Done' },
    ]);
    expect(result).toEqual(response);
  });

  it('stops reading at the result rather than waiting for the connection to close', async () => {
    // The answer is paid for once it arrives; a drop in the moment before the close must
    // not turn it into an error.
    const response = { output: [], credits: { remaining: 1, limit: 50 } };
    const { body, state } = openBodyOf(frame({ type: 'response.completed', response }));
    await expect(readChatStream(body)).resolves.toEqual(response);
    expect(state.cancelled).toBe(true);
  });

  it('rejects with the message of an error event', async () => {
    await expect(readChatStream(bodyOf(
      frame({ type: 'response.output_text.delta', delta: 'Half' }) + frame({ type: 'error', error: 'Rate limit reached' }),
    ))).rejects.toThrow('Rate limit reached');
  });

  it('rejects when the stream ends without a result', async () => {
    await expect(readChatStream(bodyOf(frame({ type: 'response.output_text.delta', delta: 'Half' }))))
      .rejects.toThrow(/ended before/);
  });

  it('reports a result cut off partway as incomplete, not as broken JSON', async () => {
    await expect(readChatStream(bodyOf(
      frame({ type: 'response.output_text.delta', delta: 'Half' })
        + 'event: response.completed\ndata: {"type":"response.completed","response":{"output":[{"type":"mess',
    ))).rejects.toThrow(/ended before/);
  });
});

describe('withoutReasoningSummaries', () => {
  it('empties reasoning summaries and leaves every other item alone', () => {
    const items = [
      { type: 'reasoning', id: 'rs_1', summary: [{ type: 'summary_text', text: 'Intent #2 says icons first.' }] },
      { type: 'function_call', call_id: 'c1', name: 'set_text', arguments: '{}' },
      { type: 'reasoning', id: 'rs_2', summary: [] },
    ];
    expect(withoutReasoningSummaries(items)).toEqual([
      { type: 'reasoning', id: 'rs_1', summary: [] },
      { type: 'function_call', call_id: 'c1', name: 'set_text', arguments: '{}' },
      { type: 'reasoning', id: 'rs_2', summary: [] },
    ]);
    // A copy: the items the caller still holds keep their text.
    expect(items[0].summary).toHaveLength(1);
  });
});
