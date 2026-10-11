import { getAuth } from 'firebase/auth';
import {
  buildSvgContext, executeReadTool, applyPlannedBatches, editsOf, planEditCall, emptyCallHint,
  isStructuralEditTool, summarizeEdits, validityRegression,
  type LineEditOutcome, type PlannedEdit,
} from './svg-ai';
import { generateImage, modifyImage } from './image-gen';
import { fetchIcons, formatIconForModel, type IconResult } from './icon-search';
import { getElementBounds } from './svg-bounds';
import { renderSnapshot } from './svg-snapshot';
import { fadedOutWarning } from './faded-out';
import { pictureItem, withPictures, type TurnPicture } from './chat-pictures';
import { pictureForModel } from './pasted-image';
import type { ImageStyle } from './models';
import { sanitizeHistory } from './chat-sanitize';
import { config } from './config';
import { readChatStream, withoutReasoningSummaries, type ChatStreamUpdate } from './chat-stream';
import { restoreEmbeddedData, unknownEmbeddedRefusal } from './embedded-data';

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
  /** The turn stopped because it used up its tool-call rounds, not because it
   * was finished. On a large document the model can spend the whole budget
   * looking around and never reach the edit, and the tool calls it did make
   * look identical to a turn that simply had nothing to change — so the caller
   * has to say what happened and offer to carry on. */
  outOfToolRounds?: boolean;
  /** What the model reasoned across the turn, as it streamed. For the finished message in
   * this session only — it is never saved (see chat-history's toStored). */
  reasoning?: string;
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
  onUpdate?: (update: ChatStreamUpdate) => void,
  _retried?: boolean,
): Promise<ServerResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    // Ask for the streamed reply. An API that predates streaming ignores the flag and
    // answers with JSON, which the path below still reads — the two repos deploy separately.
    // pictures: this build answers get_png_image, so the API may offer it. One that predates
    // the tool does not say so, and is not offered a call it would leave unanswered.
    body: JSON.stringify({ ...body, stream: true, pictures: true }),
    signal,
  });

  // If 401 (token revoked/expired), force-refresh and retry once
  if (res.status === 401 && !_retried) {
    const user = getAuth().currentUser;
    if (user) {
      const freshToken = await user.getIdToken(true);
      return callServer(body, freshToken, signal, onUpdate, true);
    }
  }

  // Refusals (credits, size, auth) still come back as JSON statuses; only a call that is
  // actually running arrives as a stream.
  if (res.ok && res.body && res.headers.get('Content-Type')?.includes('text/event-stream')) {
    return readChatStream<ServerResponse>(res.body, onUpdate);
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

/** A turn's live progress: answer text and reasoning as they stream in, and `start` when a
 *  new call to the model begins, whose output replaces what the previous call showed. */
export type ChatLiveUpdate = { kind: 'start' } | Exclude<ChatStreamUpdate, { kind: 'tool' }>;

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
  if (isStructuralEditTool(name)) {
    const edits = editsOf(args) as Array<{ selector?: string; name?: string; property?: string; position?: string }>;
    const targets = edits.map((e) => {
      if (name === 'set_attribute') return `${e.name}@${e.selector}`;
      if (name === 'set_style_rule') return `${e.selector} { ${e.property} }`;
      if (name === 'insert_element') return `${e.position} ${e.selector}`;
      return String(e.selector);
    });
    return {
      edits: edits.length,
      targets: targets.length > 12 ? `${targets.slice(0, 12).join(', ')}, … (+${targets.length - 12} more)` : targets.join(', '),
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
 * What the model is told when the user's message comes with a picture. The picture can be
 * meant several ways, and each wants a different tool, so the note names them; without it a
 * model asked to "make this an SVG" can only try to draw it from memory of the request.
 */
const ATTACHED_PICTURE_NOTE = 'The user attached a picture to this message; you can see it. Read the request to know what it is for. In this turn the image tools start FROM THIS PICTURE: generate_image and modify_image both hand it to the image model as the picture to work on, so either may be used even though no picture was generated earlier, and the prompt is an instruction about this picture, not a description of a new one. (1) To recreate the picture as SVG — "convert this", "make this an SVG", "redraw this": for a logo, an icon, a diagram or other flat artwork of a few shapes, write clean SVG yourself with replace_svg, with the same shapes, colours and proportions, sized to the picture. For anything more detailed — a character, a scene, a photo, an illustration with shading — use modify_image with a prompt such as "Redraw this picture as a flat vector illustration, keeping the subject, pose, composition, colours and details", adding anything the user asked to change; the result is traced to SVG. Do not draw a detailed picture by hand: the likeness is lost — unless the user asks for simple shapes or says not to use the image model, and then draw it by hand as well as shapes allow. (2) To change WHAT THE PICTURE SHOWS — remove the background, change a colour scheme, add or remove an object — use modify_image and say what to change. (3) Otherwise the picture is a reference for an edit to the current drawing below — match its colours, copy a shape from it, add what it shows — and you edit the drawing as usual. A white background in the picture may stand for a transparent one: leave it out rather than drawing a white rectangle, unless the request asks for a background. Later messages show this picture again for reference, until the user attaches another.';

/**
 * What the model is told when the picture the user attached earlier is shown again. A
 * follow-up such as "redraw it closer to the original" is about that picture, and without it
 * the model could only ask for the original — it was sent with one message and never again.
 */
const REFERENCE_PICTURE_NOTE = 'The picture with this message is one the user attached EARLIER in this conversation, shown again for reference; it is not a new attachment. The current drawing may have been made from it — traced, or redrawn by the image model and then traced — so when the user asks for the result to be closer to the original, or refers to "the picture", compare the drawing with this picture and say concretely what differs. modify_image edits the most recent generated picture when there is one, and the image model does not see this reference picture: to bring a redraw closer to it, describe the differences precisely in the modify_image prompt — faces, hair or fur, clothing, colours, proportions, missing details. When nothing was generated yet, modify_image starts from this picture.';

/** What a picture confirmation asks: to generate a new one, change the one generated earlier,
 *  or work from a picture the user attached. */
export type ImageConfirmKind = 'generate' | 'modify' | 'picture';

/**
 * Read every edit call out of one response and resolve them all against the same
 * snapshot, keyed by call_id.
 *
 * Line ranges and structural addresses are planned together, not separately:
 * once each is resolved to the bytes it covers, an element edit that lands on a
 * line another call is rewriting is the same kind of contradiction as two
 * overlapping line ranges, and is reported rather than compounded.
 *
 * A whole-document rewrite ends the run: after replace_svg or an image tool the
 * snapshot no longer describes the text, so later addresses mean nothing and are
 * deliberately left unplanned rather than applied to something the model never
 * saw.
 */
function planResponseEdits(
  snapshot: string,
  output: ServerResponse['output'],
): { plans: Map<string, { svg: string; outcomes: LineEditOutcome[] }>; refusals: Map<string, string> } {
  const ids: string[] = [];
  const batches: PlannedEdit[][] = [];
  const refusals = new Map<string, string>();

  for (const item of output) {
    if (item.type !== 'function_call') continue;
    // Only replace_svg is certain to rewrite the document; past it, nothing in
    // this response describes the same text. An IMAGE call is not certain — the
    // user may decline it, or modify_image may have no PNG to work from — so
    // calls after one are planned here too, against the same snapshot, and the
    // execution loop refuses them only if a replacement actually happened.
    // Re-planning them later against a document the earlier calls had already
    // mutated reintroduced exactly the cross-call drift this planner removes.
    const structural = isStructuralEditTool(item.name ?? '');
    if (item.name !== 'replace_svg' && item.name !== 'replace_lines' && !structural) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any;
    try {
      parsed = JSON.parse(item.arguments ?? '{}');
    } catch {
      // Truncated arguments are reported by the normal tool path. A truncated replace_svg still
      // ends the run: whether it was meant to rewrite everything is all that is known of it.
      if (item.name === 'replace_svg') break;
      continue;
    }

    const plan = planEditCall(snapshot, item.name!, parsed);
    if (plan.kind === 'refused') {
      refusals.set(item.call_id!, plan.reason);
      continue;
    }
    // A refused replace_svg rewrites nothing, so the calls after it still describe the snapshot
    // and are planned as usual; only one that will be applied ends the run.
    if (plan.kind === 'replace') break;
    batches.push(plan.planned);
    ids.push(item.call_id!);
  }

  const plans = new Map<string, { svg: string; outcomes: LineEditOutcome[] }>();
  if (ids.length === 0) return { plans, refusals };
  const { svgAfter, outcomes } = applyPlannedBatches(snapshot, batches);
  ids.forEach((id, i) => plans.set(id, { svg: svgAfter[i], outcomes: outcomes[i] }));
  return { plans, refusals };
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
  onImageConfirm?: (summary: string, kind: ImageConfirmKind) => Promise<boolean>,
  lastPngDataUrl?: string,
  onLiveUpdate?: (update: ChatLiveUpdate) => void,
  /** A picture the user attached to this message, as a PNG data URL. */
  picture?: string,
  /** The picture the user attached most recently, on an earlier message, shown again. */
  reference?: string,
  /** How generated and edited pictures are drawn. Read when a picture is made, not when the
   *  message is sent: it is chosen on the card that asks before the picture is made, mid-turn. */
  getImageStyle?: () => ImageStyle,
): Promise<ChatResponse> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }

  const idToken = await user.getIdToken();

  // Every call to the model goes through here. Each one starts a fresh stretch of live
  // text, and a tool call the model begins writing is shown by name: once the reasoning is
  // done, composing a large edit is most of what is left of the turn. The reasoning is also
  // gathered across the calls for the finished message, here rather than by the caller, so
  // it belongs to this turn and no other.
  let calls = 0;
  let reasoning = '';
  const callModel = (body: { input: unknown[]; skipCredits?: boolean }) => {
    const call = ++calls;
    if (reasoning.trim()) reasoning += '\n\n';
    onLiveUpdate?.({ kind: 'start' });
    return callServer({ ...body, model, effort }, idToken, signal, (update) => {
      if (update.kind === 'tool') {
        onProgress?.({ tool: update.name, round: call });
        return;
      }
      if (update.kind === 'reasoning') reasoning += update.delta;
      onLiveUpdate?.(update);
    });
  };

  // Normalize line endings — Monaco on Windows uses \r\n, models always output \n
  const normalizedSvg = currentSvg.replace(/\r\n/g, '\n');

  // Build budgeted context on the client
  const svgContext = buildSvgContext(normalizedSvg, selectedElement, selectedLineRange);

  // Build input: previous history + svgContext (refreshed each turn) + new user message
  const input: unknown[] = [
    ...sanitizeHistory(conversationHistory),
    // When there is prior history, warn the model that line numbers may have shifted
    ...(conversationHistory.length > 0
      ? [{ role: 'developer', content: 'The SVG document has been updated since the earlier messages. Line numbers from previous tool calls and search results are now stale — do NOT reuse them. Attribute VALUES from earlier turns are stale in the same way: anything you changed no longer carries the value it had then, so a selector written around that old value now matches nothing, and one written around the NEW value may also match elements that already had it and were never part of your change. Always rely on the current SVG context below, and re-run search_svg or read_svg_lines if you need line numbers.' }]
      : []),
    // When a previously generated image exists, tell the model so it knows modify_image is available.
    // An attached picture takes its place: modify_image then edits that one.
    ...(lastPngDataUrl && !picture
      ? [{ role: 'developer', content: 'IMPORTANT: The current SVG was traced from a picture (made with generate_image or modify_image earlier in this conversation, or attached by the user and traced), and its source PNG is available for further editing. Two different kinds of request, two different tools. (1) To change WHAT THE PICTURE SHOWS — add a hat, change the pose, put it somewhere else — prefer modify_image: the traced paths are machine-generated and hopeless to redraw by hand. (2) To change a PROPERTY OF THE MARKUP — above all COLOUR, and also size, opacity or position — edit the SVG directly with set_attribute, and do NOT regenerate the image for it. Every traced element is a <path> with no id and no class, carrying its colour in a style attribute: <path d="M0 0 C5 3 ..." transform="translate(364,94)" style="fill: #1C1817;"/>. So address them by that value — selector `path[style="fill: #1C1817;"]`, name "style", value "fill: #0E0C0B;" — and one edit recolours every path wearing that colour. Copy each hex EXACTLY as it appears, upper-case included; a lower-cased or reformatted value matches nothing. SCOPE THIS BY WHAT WAS ASKED. Addressing by value is right for the picture as a whole — "make it darker", "change the colours". If instead the user points at one path — "this one", "the selected shape" — take the address from the Selected element block below and change that path alone: recolouring every path of its shade would repaint parts of the picture nobody mentioned, and once two shades are merged nothing can tell them apart again. Setting "fill" instead of "style" is reported as applied but changes nothing on screen, because the inline style wins. Do NOT use replace_lines here: the path data fills the line, so re-emitting it to change six characters of colour will exhaust the response long before the drawing is done.' }]
      : []),
    ...(picture ? [{ role: 'developer', content: ATTACHED_PICTURE_NOTE }] : []),
    ...(!picture && reference ? [{ role: 'developer', content: REFERENCE_PICTURE_NOTE }] : []),
    { role: 'developer', content: svgContext },
    picture || reference
      ? { role: 'user', content: [{ type: 'input_text', text: userText }, { type: 'input_image', image_url: await pictureForModel((picture ?? reference)!) }] }
      : { role: 'user', content: userText },
  ];

  // First call
  onProgress?.('thinking');
  let response = await callModel({ input });

  // Collect all raw output items across agentic rounds for the caller to store
  const allRawOutput: unknown[] = [];
  // Pictures from get_png_image: sent with each continuation, never stored (see chat-pictures).
  const pictures: TurnPicture[] = [];

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
  let outOfToolRounds = false; // the loop ran out of rounds rather than finishing
  for (let round = 0; ; round++) {
    const readCalls = response.output.filter(
      item => item.type === 'function_call' && (item.name === 'read_svg_lines' || item.name === 'search_svg' || item.name === 'query' || item.name === 'search_icons' || item.name === 'get_element_bounds' || item.name === 'list_path_parts' || item.name === 'get_png_image')
    );

    if (readCalls.length === 0) {
      // No read tools — check for a generate_image or modify_image call that needs confirmation
      const genImageCall = response.output.find(
        item => item.type === 'function_call' && (item.name === 'generate_image' || item.name === 'modify_image')
      );
      if (genImageCall && onImageConfirm) {
        const genArgs = JSON.parse(genImageCall.arguments!);
        // With a picture attached, both image tools start from it (see the execution below), and
        // modify_image starts from the reference picture when nothing was generated yet.
        const fromPicture = !!picture || (genImageCall.name === 'modify_image' && !lastPngDataUrl && !!reference);
        const kind: ImageConfirmKind = fromPicture ? 'picture' : genImageCall.name === 'modify_image' ? 'modify' : 'generate';
        imageApproved = await onImageConfirm(genArgs.summary || genArgs.prompt, kind);
        if (!imageApproved) {
          // User declined — send rejection back and ask model to use SVG tools
          allRawOutput.push(...withoutReasoningSummaries(response.output));
          const rejectionMsg = fromPicture
            ? 'User declined having the image model redraw the attached picture. Draw it yourself as SVG with replace_svg instead, following the attached picture as closely as simple shapes allow.'
            : genImageCall.name === 'modify_image'
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
            outOfToolRounds = true;
            response = { output: [], credits: response.credits };
            break;
          }
          onProgress?.('thinking');
          const continuationInput = [...input, ...withPictures(allRawOutput, pictures)];
          response = await callModel({ input: continuationInput, skipCredits: true });
          continue;
        }
      }
      break;
    }

    // Out of continuation budget — stop querying; the sweep below answers the
    // read calls left in this response.
    if (round >= MAX_TOOL_ROUNDS) {
      outOfToolRounds = true;
      break;
    }

    // Report which tools are being called this round
    for (const call of readCalls) {
      onProgress?.({ tool: call.name!, round: round + 1 });
    }

    // Accumulate intermediate output + tool results into input for next round
    allRawOutput.push(...withoutReasoningSummaries(response.output));
    const toolResults: unknown[] = [];
    const roundPictures: unknown[] = [];
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
                result = formatIconForModel(selected, normalizedSvg);
                picked = true;
              }
            } else {
              result = formatIconForModel(icons[0], normalizedSvg);
              picked = true;
            }
          }
        }
      } else if (call.name === 'get_element_bounds') {
        result = getElementBounds(normalizedSvg, args.selector);
      } else if (call.name === 'get_png_image') {
        // The real document, not the text the model reads: that one has embedded images
        // replaced by tokens. The picture follows the round's results as its own item.
        const shot = await renderSnapshot(normalizedSvg, args);
        result = shot.text;
        if (shot.dataUrl) roundPictures.push(pictureItem(shot.text, shot.dataUrl));
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
    for (const item of roundPictures) pictures.push({ at: allRawOutput.length, item });

    // Send continuation: full input so far + intermediate outputs + tool results
    onProgress?.('thinking');
    const continuationInput = [...input, ...withPictures(allRawOutput, pictures)];
    response = await callModel({ input: continuationInput, skipCredits: true });
  }

  // Final output
  allRawOutput.push(...withoutReasoningSummaries(response.output));

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
  const { plans: editPlan, refusals: editRefusals } = planResponseEdits(normalizedSvg, response.output);
  // Whether the whole document has actually been rewritten this response. The
  // planner stops at calls that COULD rewrite it; only this says one DID, and
  // the difference decides whether later line numbers are stale or fine.
  let documentReplaced = false;

  // Track running SVG state so multiple tool calls chain correctly
  let runningSvg = normalizedSvg;
  // Track the latest generated PNG for modify_image chaining within a single turn
  let currentPngDataUrl = picture ?? lastPngDataUrl ?? reference;

  for (const item of response.output) {
    if (item.type === 'message') {
      for (const part of item.content ?? []) {
        if (part.type === 'output_text' && part.text) {
          message += part.text;
        }
      }
    } else if (item.type === 'function_call' && (item.name === 'replace_svg' || item.name === 'replace_lines' || isStructuralEditTool(item.name!) || item.name === 'generate_image' || item.name === 'modify_image')) {
      const toolName = item.name!;
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
        onToolCall?.({ name: toolName, args: { truncated: true }, result: explanation });
        continue;
      }
      let toolOutput = 'OK';
      if (item.name === 'replace_lines' || isStructuralEditTool(item.name!)) {
        const planned = editPlan.get(item.call_id!);
        const refusal = editRefusals.get(item.call_id!);
        if (refusal) {
          // The document does not parse, so nothing could be addressed by
          // element. Say which tools still work rather than reporting a change
          // that never happened.
          args.notExecuted = true;
          args.failedOperations = [refusal];
          toolOutput = refusal;
        } else if (documentReplaced || !planned) {
          // Either the document really was rewritten earlier in this response,
          // so these addresses describe nothing — or this call sits past a
          // replace_svg and was never planned. Both mean: do not guess.
          args.notExecuted = true;
          args.failedOperations = ['the document was replaced earlier in this response'];
          toolOutput = 'Not executed: the document was replaced earlier in this response, so these addresses are stale. Re-read it and re-issue.';
        } else {
          const problems = planned.outcomes.filter((o) => o.status !== 'applied');
          if (problems.length) args.failedOperations = problems.map((o) => `${o.label}: ${o.detail}`);
          // Applied-but-ineffective is not a failure and not a success; it is
          // the case where the markup changed and the drawing did not, and the
          // user is the one who will otherwise wonder why nothing happened.
          const notes = planned.outcomes.filter((o) => o.status === 'applied' && o.detail);
          // Only an edit the drawing will not show is a warning. The other notes say how an edit
          // was applied — every match removed, lines kept — and were shown under the same "no
          // visible effect" heading over changes that had plainly worked.
          const ineffective = notes.filter((o) => o.ineffective);
          const informative = notes.filter((o) => !o.ineffective);
          if (ineffective.length) args.warnings = ineffective.map((o) => `${o.label}: ${o.detail}`);
          if (informative.length) args.editNotes = informative.map((o) => `${o.label}: ${o.detail}`);
          toolOutput = summarizeEdits(planned.outcomes, emptyCallHint(item.name!));

          // Compared against the document as of the PREVIOUS call, so a break is
          // attributed to the call that caused it rather than to the response.
          const broke = validityRegression(runningSvg, planned.svg);
          if (broke) {
            // Its OWN field, not `warnings`. That one means "applied, but you
            // will see no change on screen", and a document that stopped
            // parsing is the opposite of harmless — putting it there labelled a
            // broken drawing as a no-op.
            args.documentBroken = broke;
            toolOutput = `${toolOutput}\nWARNING: ${broke}`;
          }
          // Deleting the box behind white lettering leaves a drawing that looks empty, and the
          // user only finds out by rejecting it. Said on the proposal, and to the model.
          const faded = broke ? null : await fadedOutWarning(runningSvg, planned.svg);
          if (faded) {
            args.fadedOut = faded;
            toolOutput = `${toolOutput}\nWARNING: ${faded}`;
          }
          args.svg = planned.svg;
          runningSvg = planned.svg;
        }
      } else if (item.name === 'replace_svg') {
        // Tokens for embedded images go back to their data first. One the document does not
        // hold would replace an image with a label, so the whole rewrite is refused instead.
        const refusal = editRefusals.get(item.call_id!);
        const restored = restoreEmbeddedData(String(args.svg ?? ''), normalizedSvg);
        if (refusal || restored.unknown.length > 0) {
          toolOutput = refusal ?? unknownEmbeddedRefusal(restored.unknown);
          args.notExecuted = true;
          args.failedOperations = [toolOutput];
          delete args.svg;
        } else {
          args.svg = restored.text;
          // The largest blast radius of any tool: the model hand-writes the whole
          // document, and until now nothing looked at what came back.
          const broke = validityRegression(runningSvg, args.svg);
          if (broke) {
            args.documentBroken = broke;
            toolOutput = `WARNING: ${broke}`;
          }
          const faded = broke ? null : await fadedOutWarning(runningSvg, args.svg);
          if (faded) {
            args.fadedOut = faded;
            toolOutput = toolOutput === 'OK' ? `WARNING: ${faded}` : `${toolOutput}\nWARNING: ${faded}`;
          }
          runningSvg = args.svg;
          documentReplaced = true;
        }
      } else if (item.name === 'generate_image') {
        onProgress?.(picture ? 'modifying-image' : 'generating-image');
        let result;
        try {
          // generate_image takes words alone. With a picture attached, the model reaches for it
          // to redraw that picture — the prompt says so, and the server prompt sends detailed
          // pictures there — and a picture made from a description of an anime drawing came
          // back as a different anime girl. So the picture goes to the image model as the
          // starting point, the way modify_image sends one.
          result = picture
            ? await modifyImage(args.prompt, picture, imageModel, signal, (s) => onProgress?.(s), getImageStyle?.())
            : await generateImage(args.prompt, imageModel, signal, (s) => onProgress?.(s), getImageStyle?.());
        } catch (err) {
          if (isCreditsError(err)) throw err;
          throw err instanceof Error ? err : new Error(String(err));
        }
        args.svg = result.svg;
        args.pngDataUrl = result.pngDataUrl;
        args.vectorizerParams = result.params;
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
            result = await modifyImage(args.prompt, currentPngDataUrl, imageModel, signal, (s) => onProgress?.(s), getImageStyle?.());
          } catch (err) {
            if (isCreditsError(err)) throw err;
            throw err instanceof Error ? err : new Error(String(err));
          }
          args.svg = result.svg;
          args.pngDataUrl = result.pngDataUrl;
          args.vectorizerParams = result.params;
          runningSvg = result.svg;
          documentReplaced = true;
          latestCredits = result.credits;
          currentPngDataUrl = result.pngDataUrl;
        }
      }
      toolCalls.push({ name: toolName, arguments: args });
      // Surface the edit alongside the read calls, so the tool list shows the
      // whole turn rather than only the lookups. Deliberately a SUMMARY, never
      // the arguments: this list is persisted with the chat, and one
      // replace_lines call can carry hundreds of full lines — storing those
      // would duplicate the document into every message.
      onToolCall?.({ name: toolName, args: describeEditArgs(toolName, args), result: toolOutput });
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
    // Some models (Qwen) emit a whitespace-only text item beside each tool call; untrimmed,
    // a reply that is only edits would count as having something to say.
    message: message.trim(),
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    credits: latestCredits,
    rawOutput: allRawOutput,
    outOfToolRounds: outOfToolRounds || undefined,
    reasoning: reasoning.trim() || undefined,
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
