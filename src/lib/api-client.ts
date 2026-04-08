import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { buildSvgContext, executeReadTool, applyEditSvg, applyReplaceLines } from './svg-ai';
import { generateImage } from './image-gen';
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
}

export interface ChatResponse {
  message: string;
  toolCalls?: ChatToolCall[];
  credits: Credits;
}

export interface ChatErrorResponse {
  error: string;
  remaining?: number;
  limit?: number;
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

/** Fetch current credit balance (read-only). */
export async function fetchCredits(): Promise<Credits | null> {
  const auth = getAuth();

  // Wait for auth to be ready — anonymous sign-in may not have completed yet.
  // Listen until we get a non-null user (skip the initial null event).
  const user = await new Promise<import('firebase/auth').User | null>((resolve) => {
    if (auth.currentUser) return resolve(auth.currentUser);
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) { unsub(); resolve(u); }
    });
    // Timeout: if no user arrives in 5s, give up
    setTimeout(() => resolve(null), 5000);
  });
  if (!user) return null;

  const idToken = await user.getIdToken();
  const res = await fetch(`${API_URL}/api/usage`, {
    headers: { 'Authorization': `Bearer ${idToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.credits as Credits;
}

/** Provision credits for a newly signed-up user. Resets to full allowance if exhausted. */
export async function provisionCredits(): Promise<Credits | null> {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return null;

  const idToken = await user.getIdToken();
  const res = await fetch(`${API_URL}/api/usage`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${idToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.credits as Credits;
}

async function callServer(
  body: { svgContext: string; messages: ChatMessage[]; model?: string; continuation?: unknown[] },
  idToken: string,
  signal?: AbortSignal,
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

  const data = await res.json();

  if (!res.ok) {
    const err = data as ChatErrorResponse;
    const error = new Error(err.error ?? `Request failed (${res.status})`);
    if (res.status === 402 || res.status === 403) {
      (error as Error & { remaining?: number; limit?: number }).remaining = err.remaining;
      (error as Error & { remaining?: number; limit?: number }).limit = err.limit;
    }
    throw error;
  }

  return data as ServerResponse;
}

export type ProgressStatus = 'thinking' | 'generating-image' | 'vectorizing';

export async function sendChatRequest(
  inputMessages: ChatMessage[],
  currentSvg: string,
  selectedElement?: string,
  selectedLineRange?: { start: number; end: number },
  model?: string,
  imageModel?: string,
  signal?: AbortSignal,
  onProgress?: (status: ProgressStatus) => void,
): Promise<ChatResponse> {
  let messages = inputMessages;
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }

  const idToken = await user.getIdToken();

  // Normalize line endings — Monaco on Windows uses \r\n, models always output \n
  const normalizedSvg = currentSvg.replace(/\r\n/g, '\n');

  // Build budgeted context on the client — only this small string goes to the server
  const svgContext = buildSvgContext(normalizedSvg, selectedElement, selectedLineRange);

  // Append current selection to the last user message so the model sees it in context
  if (selectedElement && messages.length > 0) {
    const lastIdx = messages.length - 1;
    if (messages[lastIdx].role === 'user') {
      const selectionNote = selectedLineRange
        ? `\n\n[Currently selected element (lines ${selectedLineRange.start}-${selectedLineRange.end}):\n\`\`\`svg\n${selectedElement}\n\`\`\`]`
        : `\n\n[Currently selected element:\n\`\`\`svg\n${selectedElement}\n\`\`\`]`;
      messages = messages.map((m, i) =>
        i === lastIdx ? { ...m, content: m.content + selectionNote } : m
      );
    }
  }

  // First call
  onProgress?.('thinking');
  let response = await callServer({ svgContext, messages, model }, idToken, signal);



  // Agentic loop — execute read-only tools locally, send results back
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const readCalls = response.output.filter(
      item => item.type === 'function_call' && (item.name === 'read_svg_lines' || item.name === 'search_svg')
    );

    if (readCalls.length === 0) break;

    // Build continuation: previous AI output + local tool results
    const continuation: unknown[] = [...response.output];
    for (const call of readCalls) {
      const args = JSON.parse(call.arguments!);
      const result = executeReadTool(call.name!, args, normalizedSvg);
      continuation.push({ type: 'function_call_output', call_id: call.call_id, output: result ?? '' });
    }

    response = await callServer({ svgContext, messages, model, continuation }, idToken, signal);
  }

  // Extract message + tool calls from final response
  let message = '';
  const toolCalls: ChatToolCall[] = [];
  let latestCredits: Credits = response.credits;

  // Track running SVG state so multiple tool calls chain correctly
  let runningSvg = normalizedSvg;

  for (const item of response.output) {
    if (item.type === 'message') {
      for (const part of item.content ?? []) {
        if (part.type === 'output_text' && part.text) {
          message += part.text;
        }
      }
    } else if (item.type === 'function_call' && (item.name === 'find_replace' || item.name === 'replace_svg' || item.name === 'replace_lines' || item.name === 'generate_image')) {
      const args = JSON.parse(item.arguments!);
      // Apply find_replace operations locally, chaining from previous tool call result
      if (item.name === 'find_replace') {
        const { svg, failed } = applyEditSvg(runningSvg, args.operations);
        args.svg = svg;
        runningSvg = svg;
        if (failed.length) args.failedOperations = failed;
      } else if (item.name === 'replace_lines') {
        args.svg = applyReplaceLines(runningSvg, args.start, args.end, args.content);
        runningSvg = args.svg;
      } else if (item.name === 'replace_svg') {
        runningSvg = args.svg;
      } else if (item.name === 'generate_image') {
        // Call server to generate raster image and vectorize to SVG
        onProgress?.('generating-image');
        const result = await generateImage(args.prompt, imageModel, signal, (s) => onProgress?.(s));
        args.svg = result.svg;
        args.pngDataUrl = result.pngDataUrl;
        runningSvg = result.svg;
        // Image gen deducts credits separately — use its updated count
        latestCredits = result.credits;
      }
      toolCalls.push({ name: item.name, arguments: args });
    }
  }

  return {
    message,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    credits: latestCredits,
  };
}
