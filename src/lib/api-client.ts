import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { buildSvgContext, executeReadTool, applyEditSvg, applyReplaceLines } from './svg-ai';
import { generateImage } from './image-gen';
import type { TokenUsage } from './pricing';

export type { TokenUsage } from './pricing';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface DailyTokenUsage {
  input_tokens: number;
  output_tokens: number;
  cached_tokens: number;
  requests: number;
  by_model: Record<string, { input_tokens: number; output_tokens: number; cached_tokens: number; requests: number }>;
}

export interface ChatResponse {
  message: string;
  toolCalls?: ChatToolCall[];
  usage: { used: number; limit: number };
  tokens: TokenUsage[];
  dailyTokens?: DailyTokenUsage;
}

export interface ChatErrorResponse {
  error: string;
  used?: number;
  limit?: number;
}

const API_URL = import.meta.env.VITE_API_URL ?? '';

/** Raw response shape from the server (thin AI proxy) */
interface ServerResponse {
  output: Array<{
    type: string;
    name?: string;
    call_id?: string;
    arguments?: string;
    content?: Array<{ type: string; text?: string }>;
  }>;
  usage: { used: number; limit: number };
  tokens?: {
    model: string;
    input_tokens: number;
    output_tokens: number;
    cached_tokens: number;
  };
  daily_tokens?: DailyTokenUsage;
}

const MAX_TOOL_ROUNDS = 10;

/** Fetch current usage and daily token totals (read-only, no increment). */
export async function fetchUsage(): Promise<{ usage: { used: number; limit: number }; dailyTokens: DailyTokenUsage } | null> {
  const auth = getAuth();

  // Wait for auth to be ready (anonymous sign-in may not have completed yet)
  const user = await new Promise<import('firebase/auth').User | null>((resolve) => {
    if (auth.currentUser) return resolve(auth.currentUser);
    const unsub = onAuthStateChanged(auth, (u) => { unsub(); resolve(u); });
  });
  if (!user) return null;

  const idToken = await user.getIdToken();
  const res = await fetch(`${API_URL}/api/usage`, {
    headers: { 'Authorization': `Bearer ${idToken}` },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return { usage: data.usage, dailyTokens: data.daily_tokens };
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
    if (res.status === 429) {
      (error as Error & { used?: number; limit?: number }).used = err.used;
      (error as Error & { used?: number; limit?: number }).limit = err.limit;
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

  // Accumulate token usage across all server round-trips
  const allTokens: TokenUsage[] = [];
  if (response.tokens) {
    allTokens.push({
      model: response.tokens.model,
      inputTokens: response.tokens.input_tokens,
      outputTokens: response.tokens.output_tokens,
      cachedTokens: response.tokens.cached_tokens,
    });
  }

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
    if (response.tokens) {
      allTokens.push({
        model: response.tokens.model,
        inputTokens: response.tokens.input_tokens,
        outputTokens: response.tokens.output_tokens,
        cachedTokens: response.tokens.cached_tokens,
      });
    }
  }

  // Extract message + tool calls from final response
  let message = '';
  const toolCalls: ChatToolCall[] = [];

  // Track running SVG state so multiple tool calls chain correctly
  let runningSvg = normalizedSvg;

  for (const item of response.output) {
    if (item.type === 'message') {
      for (const part of item.content ?? []) {
        if (part.type === 'output_text' && part.text) {
          message += part.text;
        }
      }
    } else if (item.type === 'function_call' && (item.name === 'edit_svg' || item.name === 'replace_svg' || item.name === 'replace_lines' || item.name === 'generate_image')) {
      const args = JSON.parse(item.arguments!);
      // Apply edit_svg operations locally, chaining from previous tool call result
      if (item.name === 'edit_svg') {
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
        const result = await generateImage(args.prompt, signal, (s) => onProgress?.(s));
        args.svg = result.svg;
        runningSvg = result.svg;
        if (result.tokens) allTokens.push(result.tokens);
      }
      toolCalls.push({ name: item.name, arguments: args });
    }
  }

  return {
    message,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    usage: response.usage,
    tokens: allTokens,
    dailyTokens: response.daily_tokens,
  };
}
