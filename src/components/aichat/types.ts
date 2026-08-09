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
  /** The turn stopped on its tool-call limit rather than finishing. Shows the
   * notice and the Continue button, since the tool calls alone are indistinguishable
   * from a turn that found nothing to do. */
  outOfToolRounds?: true;
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
  /** Fired once the stored chat is in: true when the document has one, so the
   * page can reveal the chat panel for a shared link instead of the info tab. */
  onChatLoaded?: (hasMessages: boolean) => void;
  /** Fired when chat access resolves: true on somebody else's document. The
   * page mirrors the read-only notice onto the Info tab, so a visitor who never
   * opens the chat still learns the document is not theirs. */
  onAccessResolved?: (isViewer: boolean) => void;
  /** Fork this document. Owned by the page because the Info tab offers the same
   * action — one clone-in-progress state rather than one per panel. */
  onStartFrom: () => void;
  cloning?: boolean;
}

export type { StoredToolCall, ProgressStatus, Credits, ReasoningEffort };
