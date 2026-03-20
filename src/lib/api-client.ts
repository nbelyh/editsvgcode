import { getAuth } from 'firebase/auth';

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

  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`,
    },
    body: JSON.stringify({ messages, currentSvg, selectedElement, selectedLineRange, model }),
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

  return data as ChatResponse;
}
