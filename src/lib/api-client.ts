import { getAuth } from 'firebase/auth';
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
  | 'vectorizing'
  | { tool: string; round: number };

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
    ...conversationHistory,
    { role: 'developer', content: svgContext },
    { role: 'user', content: userText },
  ];

  // First call
  onProgress?.('thinking');
  let response = await callServer({ input, model, effort }, idToken, signal);

  // Collect all raw output items across agentic rounds for the caller to store
  const allRawOutput: unknown[] = [];

  // Agentic loop — execute read-only tools locally, send results back
  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const readCalls = response.output.filter(
      item => item.type === 'function_call' && (item.name === 'read_svg_lines' || item.name === 'search_svg')
    );

    if (readCalls.length === 0) break;

    // Report which tools are being called this round
    for (const call of readCalls) {
      onProgress?.({ tool: call.name!, round: round + 1 });
    }

    // Accumulate intermediate output + tool results into input for next round
    allRawOutput.push(...response.output);
    const toolResults: unknown[] = [];
    for (const call of readCalls) {
      const args = JSON.parse(call.arguments!);
      const result = executeReadTool(call.name!, args, normalizedSvg);
      const output = { type: 'function_call_output', call_id: call.call_id, output: result ?? '' };
      toolResults.push(output);
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
      let toolOutput = 'OK';
      if (item.name === 'find_replace') {
        const { svg, failed } = applyEditSvg(runningSvg, args.operations);
        args.svg = svg;
        runningSvg = svg;
        if (failed.length) {
          args.failedOperations = failed;
          toolOutput = `Applied with ${failed.length} failed operation(s)`;
        }
      } else if (item.name === 'replace_lines') {
        args.svg = applyReplaceLines(runningSvg, args.start, args.end, args.content);
        runningSvg = args.svg;
      } else if (item.name === 'replace_svg') {
        runningSvg = args.svg;
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
        latestCredits = result.credits;
      }
      toolCalls.push({ name: item.name, arguments: args });
      // Add function_call_output so the API sees completed tool calls on replay
      allRawOutput.push({ type: 'function_call_output', call_id: item.call_id, output: toolOutput });
    }
  }

  return {
    message,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    credits: latestCredits,
    rawOutput: allRawOutput,
  };
}
