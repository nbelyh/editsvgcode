import type { StoredToolCall } from '../ToolCallProposal';
import type { ProgressStatus, Credits, IconResult, ReadToolCall } from '../../lib/api-client';
import type { ReasoningEffort } from '../../lib/models';

export interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: StoredToolCall[];
  /** User ran out of credits — show the upgrade ladder ($5 pack / Pro). */
  buyCredits?: true;
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
  /** False while useDocument is still loading — svgCode holds a placeholder until then. */
  documentReady: boolean;
  selectedElement?: string;
  selectedLineRange?: { start: number; end: number };
  onPreviewSvg: (svg: string | null) => void;
  onAcceptSvg: (svg: string) => void;
  /** Roll the document back to this SVG (an accepted call's prevSvg). */
  onRestore: (svg: string) => void;
}

export type { StoredToolCall, ProgressStatus, Credits, ReasoningEffort };
