import type { StoredToolCall } from '../ToolCallProposal';
import type { ProgressStatus, Credits, IconResult, ReadToolCall } from '../../lib/api-client';
import type { ReasoningEffort } from '../../lib/models';
import type { DocOrigin } from '../../lib/doc-origin';

export interface DisplayMessage {
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: StoredToolCall[];
  /** User ran out of credits — show the upgrade ladder ($5 pack / Pro). */
  buyCredits?: true;
  /** The request failed in a way sending it again may fix — show Retry. */
  retry?: true;
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
  /** What the model reasoned during this turn, as it streamed in — so the finished message
   * can show how it arrived at the answer. Session only, never saved: a shared document's
   * chat is readable by anyone with the link, and reasoning can restate the server's
   * instructions (see chat-history's toStored). */
  reasoning?: string;
  /** The turn as it was sent, for failure records only and never saved: an id so a turn is
   * recorded once however the user reacts to it, and the model and effort the request actually
   * used — the picker may have moved since, and image-like prompts go out at low effort.
   * Absent on messages loaded from storage.
   * `firstTurn`, `doc` and `imageDeclined` say what the turn started from — the chat's first
   * request, on the starter, an empty or the user's own drawing — and whether the user turned
   * down a picture offer during it. Without them a hand drawing after a declined offer looked
   * the same as one the model chose, and "first request on the starter" was guessed from the
   * size of the stored document. */
  turn?: { id: string; model: string; effort?: string; firstTurn?: boolean; doc?: DocOrigin; imageDeclined?: boolean };
}

export interface AiChatProps {
  svgCode: string;
  fileId: string;
  /** False while useDocument is still loading — svgCode holds a placeholder until then. */
  documentReady: boolean;
  selectedElement?: string;
  selectedLineRange?: { start: number; end: number };
  /**
   * Whether the panel is on screen. It is hidden with CSS rather than
   * unmounted, so that the chat survives a trip to the Info tab — which means
   * everything it computes keeps being computed behind a `display: none`.
   * Deriving the selection's address parses the whole document, so it is worth
   * knowing nobody is looking. Defaults to true: a layout that always shows the
   * panel should not have to say so.
   */
  visible?: boolean;
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
