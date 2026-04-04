import { getAuth } from 'firebase/auth';
import { buildSvgContext, executeReadTool, applyEditSvg, applyReplaceLines } from './svg-ai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ChatResponse {
  message: string;
  toolCalls?: ChatToolCall[];
  usage: { used: number; limit: number };
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
}

const MAX_TOOL_ROUNDS = 10;

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

export async function sendChatRequest(
  messages: ChatMessage[],
  currentSvg: string,
  selectedElement?: string,
  selectedLineRange?: { start: number; end: number },
  model?: string,
  signal?: AbortSignal,
): Promise<ChatResponse> {
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

  // First call
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

  for (const item of response.output) {
    if (item.type === 'message') {
      for (const part of item.content ?? []) {
        if (part.type === 'output_text' && part.text) {
          message += part.text;
        }
      }
    } else if (item.type === 'function_call' && (item.name === 'edit_svg' || item.name === 'replace_svg' || item.name === 'replace_lines')) {
      const args = JSON.parse(item.arguments!);
      // Apply edit_svg operations locally
      if (item.name === 'edit_svg') {
        const { svg, failed } = applyEditSvg(normalizedSvg, args.operations);
        args.svg = svg;
        if (failed.length) args.failedOperations = failed;
      } else if (item.name === 'replace_lines') {
        args.svg = applyReplaceLines(normalizedSvg, args.start, args.end, args.content);
      }
      toolCalls.push({ name: item.name, arguments: args });
    }
  }

  return {
    message,
    toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
    usage: response.usage,
  };
}
