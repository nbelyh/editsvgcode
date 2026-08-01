import { getAuth } from 'firebase/auth';
import { buildSvgContext, executeReadTool, applyLineEdits, applyLineEditBatches, summarizeLineEdits, type LineEdit, type LineEditOutcome } from './svg-ai';
import { generateImage, modifyImage } from './image-gen';
import { fetchIcons, formatIconForModel, type IconResult } from './icon-search';
import { getElementBounds } from './svg-bounds';
import { sanitizeHistory } from './chat-sanitize';
import { config } from './config';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface Credits {
  remaining: number;
  limit: number;
  tier?: "free" | "pro";
  creditsByModel?: Record<string, number>;
  /** Purchased pack credits (never expire). */
  packCredits?: number;
  /** ISO date string of next monthly recharge (free signed-in users only). */
  rechargeAt?: string;
}

export interface ChatResponse {
  message: string;
  toolCalls?: ChatToolCall[];
  credits: Credits;
  /** Raw API output items — store these and replay on the next turn. */
  rawOutput: unknown[];
}

export interface ChatErrorResponse {
  error: string;
  remaining?: number;
  limit?: number;
  code?: 'INSUFFICIENT_CREDITS' | 'PRO_REQUIRED' | 'UNKNOWN_MODEL';
}

/** Extended Error with credits-specific fields. */
export interface CreditsError extends Error {
  code: 'CREDITS_ERROR';
  creditCode?: 'INSUFFICIENT_CREDITS' | 'PRO_REQUIRED' | 'UNKNOWN_MODEL';
  remaining?: number;
  limit?: number;
}

export function isCreditsError(err: unknown): err is CreditsError {
  return err instanceof Error && (err as CreditsError).code === 'CREDITS_ERROR';
}

const API_URL = config.API_URL;

/** Raw response shape from the server (thin AI proxy) */
interface ServerResponse {
  output: Array<{
    type: string;
    name?: string;
    call_id?: string;
    arguments?: string;
    content?: Array<{ type: string; text?: string }>;
  }>;
  credits: Credits;
  tokens?: {
    model: string;
    input_tokens: number;
    output_tokens: number;
    cached_tokens: number;
  };
}

const MAX_TOOL_ROUNDS = 10;

async function callServer(
  body: { input: unknown[]; model?: string; effort?: string; skipCredits?: boolean },
  idToken: string,
  signal?: AbortSignal,
  _retried?: boolean,
): Promise<ServerResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify(body),
    signal,
  });

  // If 401 (token revoked/expired), force-refresh and retry once
  if (res.status === 401 && !_retried) {
    const user = getAuth().currentUser;
    if (user) {
      const freshToken = await user.getIdToken(true);
      return callServer(body, freshToken, signal, true);
    }
  }

  const data = await res.json();

  if (!res.ok) {
    const err = data as ChatErrorResponse;
    const error = new Error(err.error ?? `Request failed (${res.status})`) as CreditsError;
    if (res.status === 402) {
      error.code = 'CREDITS_ERROR';
      error.creditCode = err.code;
      error.remaining = err.remaining;
      error.limit = err.limit;
    }
    throw error;
  }

  return data as ServerResponse;
}

export type ProgressStatus =
  | 'thinking'
  | 'generating-image'
  | 'modifying-image'
  | 'vectorizing'
  | { tool: string; round: number };

export type { IconResult };

/**
 * A tool call surfaced in the UI's tool list. Named for its original use
 * (read-only lookups) and kept as-is because the field is persisted with every
 * stored chat; edit calls now appear here too, summarized.
 */
export interface ReadToolCall {
  name: string;
  args: Record<string, unknown>;
  result: string;
}

/**
 * A compact stand-in for an edit call's arguments — the line ranges it touched,
 * not their contents. Enough to see what a call did without carrying the
 * document into the chat history.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function describeEditArgs(name: string, args: any): Record<string, unknown> {
  if (name === 'replace_lines') {
    // Accept the legacy single-range shape too — it is deliberately still
    // applied, so logging it as "0 edits" would misreport a call that worked.
    const edits = (Array.isArray(args?.edits)
      ? args.edits
      : typeof args?.start === 'number' ? [{ start: args.start, end: args.end }] : []
    ) as Array<{ start?: number; end?: number }>;
    const ranges = edits.map((e) => (e.start === e.end ? `${e.start}` : `${e.start}-${e.end}`));
    return {
      edits: edits.length,
      // Long batches would otherwise print a wall of numbers in the toggle.
      lines: ranges.length > 12 ? `${ranges.slice(0, 12).join(', ')}, … (+${ranges.length - 12} more)` : ranges.join(', '),
    };
  }
  if (name === 'replace_svg') {
    return { replacedWholeDocument: true, size: `${Math.round(String(args?.svg ?? '').length / 1024)} KB` };
  }
  if (name === 'generate_image' || name === 'modify_image') {
    return { prompt: String(args?.prompt ?? '').slice(0, 200) };
  }
  return {};
}

/**
 * Read the edit calls out of one response and resolve them all against the same
 * snapshot, keyed by call_id.
 *
 * A whole-document rewrite ends the run: after replace_svg or an image tool the
 * snapshot no longer describes the text, so later line numbers mean nothing and
 * are deliberately left unplanned rather than applied to something the model
 * never saw.
 */
function planResponseLineEdits(
  snapshot: string,
  output: ServerResponse['output'],
): Map<string, { svg: string; outcomes: LineEditOutcome[] }> {
  const ids: string[] = [];
  const batches: LineEdit[][] = [];

  for (const item of output) {
    if (item.type !== 'function_call') continue;
    if (item.name === 'replace_svg' || item.name === 'generate_image' || item.name === 'modify_image') break;
    if (item.name !== 'replace_lines') continue;

    let parsed: { edits?: unknown; start?: unknown; end?: unknown; content?: unknown };
    try {
      parsed = JSON.parse(item.arguments ?? '{}');
    } catch {
      continue; // truncated arguments are reported by the normal tool path
    }

    if (Array.isArray(parsed.edits)) {
      batches.push(parsed.edits as LineEdit[]);
    } else if (typeof parsed.start === 'number') {
      // The single-range shape this tool used to take. The two repos deploy
      // separately, so a browser running the new client can be talking to an API
      // still advertising the old schema; accepting both means the deploy order
      // cannot silently turn every edit into a no-op.
      batches.push([{ start: parsed.start as number, end: parsed.end as number, content: parsed.content as string }]);
    } else {
      batches.push([]);
    }
    ids.push(item.call_id!);
  }

  const out = new Map<string, { svg: string; outcomes: LineEditOutcome[] }>();
  if (ids.length === 0) return out;
  const { svgAfter, outcomes } = applyLineEditBatches(snapshot, batches);
  ids.forEach((id, i) => out.set(id, { svg: svgAfter[i], outcomes: outcomes[i] }));
  return out;
}

export async function sendChatRequest(
  conversationHistory: unknown[],
  userText: string,
  currentSvg: string,
  selectedElement?: string,
  selectedLineRange?: { start: number; end: number },
  model?: string,
  imageModel?: string,
  signal?: AbortSignal,
  onProgress?: (status: ProgressStatus) => void,
  effort?: string,
  onIconPick?: (icons: IconResult[]) => Promise<IconResult | 'more' | 'none'>,
  onToolCall?: (tc: ReadToolCall) => void,
  onImageConfirm?: (summary: string, isModify: boolean) => Promise<boolean>,
  lastPngDataUrl?: string,
): Promise<ChatResponse> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }

  const idToken = await user.getIdToken();

  // Normalize line endings — Monaco on Windows uses \r\n, models always output \n
  const normalizedSvg = currentSvg.replace(/\r\n/g, '\n');

  // Build budgeted context on the client
  const svgContext = buildSvgContext(normalizedSvg, selectedElement, selectedLineRange);

  // Build input: previous history + svgContext (refreshed each turn) + new user message
  const input: unknown[] = [
    ...sanitizeHistory(conversationHistory),
    // When there is prior history, warn the model that line numbers may have shifted
    ...(conversationHistory.length > 0
      ? [{ role: 'developer', content: 'The SVG document has been updated since the earlier messages. Line numbers from previous tool calls and search results are now stale — do NOT reuse them. Always rely on the current SVG context below and re-run search_svg or read_svg_lines if you need line numbers.' }]
      : []),
    // When a previously generated image exists, tell the model so it knows modify_image is available
    ...(lastPngDataUrl
      ? [{ role: 'developer', content: 'IMPORTANT: The current SVG was generated from an AI image (generate_image or modify_image was used earlier in this conversation). A source PNG is available for further editing. If the user asks to change, add, or remove visual elements in this image, strongly prefer the modify_image tool — the vectorized SVG paths are auto-generated and very hard to edit by hand. Only use replace_lines for trivial attribute changes (e.g. width/height, opacity, transforms) that don\'t alter the image content itself.' }]
      : []),
    { role: 'developer', content: svgContext },
    { role: 'user', content: userText },
  ];

  // First call
  onProgress?.('thinking');
  let response = await callServer({ input, model, effort }, idToken, signal);

  // Collect all raw output items across agentic rounds for the caller to store
  const allRawOutput: unknown[] = [];

  // Agentic loop — execute read-only tools locally, send results back. Image
  // confirmation lives in the same loop: a declined generate/modify_image sends
  // a rejection and the continuation often calls read tools again (e.g.
  // search_svg to find lines to edit), so control must flow back through here.
  // The final response always passes the confirmation gate — the loop exits
  // through the no-read-calls branch or by exhausting the continuation budget
  // (MAX_TOOL_ROUNDS), and the post-processing sweep below answers any calls
  // left over from a budget exit so no unanswered call is ever persisted.
  let iconsRejected = false; // track if user already clicked "None — generate instead"
  let imageApproved = false; // user confirmed the image call in the final response
  for (let round = 0; ; round++) {
    const readCalls = response.output.filter(
      item => item.type === 'function_call' && (item.name === 'read_svg_lines' || item.name === 'search_svg' || item.name === 'search_icons' || item.name === 'get_element_bounds')
    );

    if (readCalls.length === 0) {
      // No read tools — check for a generate_image or modify_image call that needs confirmation
      const genImageCall = response.output.find(
        item => item.type === 'function_call' && (item.name === 'generate_image' || item.name === 'modify_image')
      );
      if (genImageCall && onImageConfirm) {
        const genArgs = JSON.parse(genImageCall.arguments!);
        imageApproved = await onImageConfirm(genArgs.summary || genArgs.prompt, genImageCall.name === 'modify_image');
        if (!imageApproved) {
          // User declined — send rejection back and ask model to use SVG tools
          allRawOutput.push(...response.output);
          const rejectionMsg = genImageCall.name === 'modify_image'
            ? 'User declined AI image modification. Try to make the requested change using SVG editing tools (replace_lines or replace_svg) instead.'
            : 'User declined AI image generation. Draw the image yourself using SVG code with replace_svg instead. Create it using manual SVG paths, shapes, and elements. Do your best to produce a good result.';
          allRawOutput.push({
            type: 'function_call_output',
            call_id: genImageCall.call_id,
            output: rejectionMsg,
          });
          // Provide OK outputs for any other tool calls in this response
          for (const item of response.output) {
            if (item.type === 'function_call' && item.call_id !== genImageCall.call_id) {
              allRawOutput.push({ type: 'function_call_output', call_id: item.call_id, output: 'OK' });
            }
          }
          if (round >= MAX_TOOL_ROUNDS) {
            // Out of continuation budget — end the turn with the rejection
            // recorded; the declined call must not reach final processing.
            response = { output: [], credits: response.credits };
            break;
          }
          onProgress?.('thinking');
          const continuationInput = [...input, ...allRawOutput];
          response = await callServer({ input: continuationInput, model, effort, skipCredits: true }, idToken, signal);
          continue;
        }
      }
      break;
    }

    // Out of continuation budget — stop querying; the sweep below answers the
    // read calls left in this response.
    if (round >= MAX_TOOL_ROUNDS) break;

    // Report which tools are being called this round
    for (const call of readCalls) {
      onProgress?.({ tool: call.name!, round: round + 1 });
    }

    // Accumulate intermediate output + tool results into input for next round
    allRawOutput.push(...response.output);
    const toolResults: unknown[] = [];
    for (const call of readCalls) {
      const args = JSON.parse(call.arguments!);
      let result: string | null = null;
      if (call.name === 'search_icons') {
        if (iconsRejected) {
          result = 'User already rejected icon results. Use generate_image to create a custom icon instead.';
        } else {
          const excludeNames: string[] = [];
          let picked = false;
          while (!picked) {
            const { icons, error } = await fetchIcons(args.query, args.style, args.noAttribution ?? true, args.palette ?? 'any', signal, excludeNames);
            if (error || icons.length === 0) {
              result = error ?? 'No icons found.';
              picked = true;
            } else if (onIconPick) {
              const selected = await onIconPick(icons);
              if (selected === 'none') {
                result = 'User rejected all icon results and wants a custom generated icon instead. Use generate_image to create the icon.';
                iconsRejected = true;
                picked = true;
              } else if (selected === 'more') {
                excludeNames.push(...icons.map(i => i.name));
              } else {
                result = formatIconForModel(selected);
                picked = true;
              }
            } else {
              result = formatIconForModel(icons[0]);
              picked = true;
            }
          }
        }
      } else if (call.name === 'get_element_bounds') {
        result = getElementBounds(normalizedSvg, args.selector);
      } else {
        result = executeReadTool(call.name!, args, normalizedSvg);
      }
      const output = { type: 'function_call_output', call_id: call.call_id, output: result ?? '' };
      toolResults.push(output);
      onToolCall?.({ name: call.name!, args, result: result ?? '' });
    }
    // Answer any non-read calls mixed into the same response — an unanswered
    // call makes the API reject the continuation. Edits and image calls are
    // only executed from a final, read-free response, so tell the model to
    // re-issue them (image calls then pass the confirmation gate normally).
    const readIds = new Set(readCalls.map(c => c.call_id));
    for (const item of response.output) {
      if (item.type === 'function_call' && !readIds.has(item.call_id)) {
        toolResults.push({ type: 'function_call_output', call_id: item.call_id, output: 'Not executed: tool results for your read-only calls are provided first. Re-issue this call in your next response if still needed.' });
      }
    }
    allRawOutput.push(...toolResults);

    // Send continuation: full input so far + intermediate outputs + tool results
    onProgress?.('thinking');
    const continuationInput = [...input, ...allRawOutput];
    response = await callServer({ input: continuationInput, model, effort, skipCredits: true }, idToken, signal);
  }

  // Final output
  allRawOutput.push(...response.output);

  // Extract message + tool calls from final response
  let message = '';
  const toolCalls: ChatToolCall[] = [];
  let latestCredits: Credits = response.credits;

  // Every line number the model wrote in this response refers to the document it
  // was SHOWN — not to the result of its own earlier call in the same response,
  // which is exactly how it is told to split large jobs. So all the edit calls
  // are resolved together against that one snapshot before any of them is
  // applied; resolving them one at a time against a mutating document shifted
  // the second call's line numbers by however much the first one grew or shrank
  // the file.
  const editPlan = planResponseLineEdits(normalizedSvg, response.output);
  // Whether the whole document has actually been rewritten this response. The
  // planner stops at calls that COULD rewrite it; only this says one DID, and
  // the difference decides whether later line numbers are stale or fine.
  let documentReplaced = false;

  // Track running SVG state so multiple tool calls chain correctly
  let runningSvg = normalizedSvg;
  // Track the latest generated PNG for modify_image chaining within a single turn
  let currentPngDataUrl = lastPngDataUrl;

  for (const item of response.output) {
    if (item.type === 'message') {
      for (const part of item.content ?? []) {
        if (part.type === 'output_text' && part.text) {
          message += part.text;
        }
      }
    } else if (item.type === 'function_call' && (item.name === 'replace_svg' || item.name === 'replace_lines' || item.name === 'generate_image' || item.name === 'modify_image')) {
      if ((item.name === 'generate_image' || item.name === 'modify_image') && onImageConfirm && !imageApproved) {
        // Image call that never passed the confirmation gate (budget exit with
        // a mixed response) — answer it without executing so no credits are
        // spent unconfirmed.
        allRawOutput.push({ type: 'function_call_output', call_id: item.call_id, output: 'Not executed: image generation requires user confirmation and the tool-call limit for this turn was reached.' });
        continue;
      }
      // A tool call whose arguments are cut off mid-string is not a parse bug to
      // propagate — it means the model ran out of output budget while writing
      // them. Throwing here lost the whole turn, including any calls that were
      // complete. Answer this one call and carry on.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let args: any;
      try {
        args = JSON.parse(item.arguments!);
      } catch {
        const explanation = 'Not executed: the arguments to this call were cut off before they were complete, so nothing was changed. You ran out of room. Split the work into several smaller calls — each with fewer edits — rather than one large one.';
        allRawOutput.push({ type: 'function_call_output', call_id: item.call_id, output: explanation });
        // Leave a visible trace. Skipping straight to the next item produced no
        // proposal and no tool-list entry, so a response whose only call was
        // truncated rendered as an empty assistant bubble with a credit spent.
        onToolCall?.({ name: item.name, args: { truncated: true }, result: explanation });
        continue;
      }
      let toolOutput = 'OK';
      if (item.name === 'replace_lines') {
        const planned = editPlan.get(item.call_id!);
        if (!planned && documentReplaced) {
          // The document really was rewritten earlier in this response, so these
          // line numbers no longer describe anything.
          args.notExecuted = true;
          args.failedOperations = ['the document was replaced earlier in this response'];
          toolOutput = 'Not executed: the document was replaced earlier in this response, so these line numbers are stale. Re-read it and re-issue.';
        } else if (!planned) {
          // The planner stops at any image call, but the loop may never execute
          // one — an unconfirmed image, or modify_image with no PNG to modify.
          // Nothing was replaced, so claiming otherwise would drop good edits and
          // tell the model something untrue. Apply against the current document.
          const { svg, outcomes } = applyLineEdits(runningSvg, Array.isArray(args.edits)
            ? args.edits
            : typeof args.start === 'number' ? [{ start: args.start, end: args.end, content: args.content }] : []);
          args.svg = svg;
          runningSvg = svg;
          const problems = outcomes.filter((o) => o.status !== 'applied');
          if (problems.length) args.failedOperations = problems.map((o) => `${o.label}: ${o.detail}`);
          toolOutput = summarizeLineEdits(outcomes);
        } else {
          args.svg = planned.svg;
          runningSvg = planned.svg;
          const problems = planned.outcomes.filter((o) => o.status !== 'applied');
          if (problems.length) args.failedOperations = problems.map((o) => `${o.label}: ${o.detail}`);
          toolOutput = summarizeLineEdits(planned.outcomes);
        }
      } else if (item.name === 'replace_svg') {
        runningSvg = args.svg;
        documentReplaced = true;
      } else if (item.name === 'generate_image') {
        onProgress?.('generating-image');
        let result;
        try {
          result = await generateImage(args.prompt, imageModel, signal, (s) => onProgress?.(s));
        } catch (err) {
          if (isCreditsError(err)) throw err;
          throw err instanceof Error ? err : new Error(String(err));
        }
        args.svg = result.svg;
        args.pngDataUrl = result.pngDataUrl;
        runningSvg = result.svg;
        documentReplaced = true;
        latestCredits = result.credits;
        currentPngDataUrl = result.pngDataUrl;
      } else if (item.name === 'modify_image') {
        if (!currentPngDataUrl) {
          // Same reason as the refused line edit: without this the call would
          // render as "Accepted" despite doing nothing.
          args.notExecuted = true;
          toolOutput = 'Error: No previously generated image available to modify. Use generate_image to create a new image first.';
        } else {
          onProgress?.('modifying-image');
          let result;
          try {
            result = await modifyImage(args.prompt, currentPngDataUrl, imageModel, signal, (s) => onProgress?.(s));
          } catch (err) {
            if (isCreditsError(err)) throw err;
            throw err instanceof Error ? err : new Error(String(err));
          }
          args.svg = result.svg;
          args.pngDataUrl = result.pngDataUrl;
          runningSvg = result.svg;
          documentReplaced = true;
          latestCredits = result.credits;
          currentPngDataUrl = result.pngDataUrl;
        }
      }
      toolCalls.push({ name: item.name, arguments: args });
      // Surface the edit alongside the read calls, so the tool list shows the
      // whole turn rather than only the lookups. Deliberately a SUMMARY, never
      // the arguments: this list is persisted with the chat, and one
      // replace_lines call can carry hundreds of full lines — storing those
      // would duplicate the document into every message.
      onToolCall?.({ name: item.name, args: describeEditArgs(item.name, args), result: toolOutput });
      // Add function_call_output so the API sees completed tool calls on replay
      allRawOutput.push({ type: 'function_call_output', call_id: item.call_id, output: toolOutput });
    }
  }

  // Safety net: every function_call in rawOutput must have a matching
  // function_call_output — an unanswered call corrupts the stored history and
  // is rejected by the API on replay. Reachable when the continuation budget
  // runs out mid-conversation or the model calls a tool this client doesn't
  // know about.
  const items = allRawOutput as Array<{ type?: string; call_id?: string }>;
  const answeredIds = new Set(items.filter(i => i.type === 'function_call_output').map(i => i.call_id));
  const unanswered = items.filter(i => i.type === 'function_call' && !answeredIds.has(i.call_id));
  for (const call of unanswered) {
    allRawOutput.push({ type: 'function_call_output', call_id: call.call_id, output: 'Not executed: tool-call limit reached for this turn.' });
  }

  return {
    message,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    credits: latestCredits,
    rawOutput: allRawOutput,
  };
}

/**
 * Gallery title + description written by the cheapest model, for the publish
 * dialog's "Suggest with AI" button. Costs one credit, charged server-side only
 * when a usable answer comes back.
 *
 * Throws a CreditsError on 402 exactly like the chat path, so callers can tell
 * "out of credits" apart from a transport failure.
 */
export async function suggestGalleryMetaAi(
  svg: string,
  opts?: { image?: string; prompt?: string },
): Promise<{ title: string; description: string }> {
  const user = getAuth().currentUser;
  if (!user) throw new Error('Not authenticated');
  const idToken = await user.getIdToken();

  const res = await fetch(`${API_URL}/api/suggest-meta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
    // The rendered preview is what the model actually looks at; the markup rides
    // along only as a fallback for drawings that could not be rasterised.
    body: JSON.stringify({
      svg: svg.replace(/\r\n/g, '\n'),
      image: opts?.image,
      prompt: opts?.prompt,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const err = data as ChatErrorResponse;
    const error = new Error(err.error ?? `Request failed (${res.status})`) as CreditsError;
    if (res.status === 402) {
      error.code = 'CREDITS_ERROR';
      error.creditCode = err.code;
      error.remaining = err.remaining;
      error.limit = err.limit;
    }
    throw error;
  }
  return data as { title: string; description: string };
}
