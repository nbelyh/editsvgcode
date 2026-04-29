import type { StoredToolCall } from '../ToolCallProposal';
import type { ProgressStatus, Credits, IconResult, ReadToolCall } from '../../lib/api-client';
import type { ReasoningEffort } from '../../lib/models';

export interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: StoredToolCall[];
  /** Signed-in free/pro user ran out of credits — show "Buy Credits" link. */
  buyCredits?: true;
  /** Anonymous user ran out of trial credits — show sign-in buttons instead of buy link. */
  signIn?: true;
  /** Raw API input/output items for this turn — replayed on subsequent requests. */
  rawItems?: unknown[];
  /** Icon selected from the icon picker (search_icons tool). */
  selectedIcon?: IconResult;
  /** Intermediate read-only tool calls executed during the agentic loop. */
  readToolCalls?: ReadToolCall[];
}

export interface AiChatProps {
  svgCode: string;
  fileId: string;
  selectedElement?: string;
  selectedLineRange?: { start: number; end: number };
  onPreviewSvg: (svg: string | null) => void;
  onAcceptSvg: (svg: string) => void;
  onRestore: (popCount: number) => void;
  canUndo: boolean;
}

export type { StoredToolCall, ProgressStatus, Credits, ReasoningEffort };
