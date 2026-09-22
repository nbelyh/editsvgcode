/**
 * Keeping the AI's failures, so they can be studied and fixed.
 *
 * Analytics can count rejected edits but not say why: a reject deletes the turn from the chat,
 * and the event carries no prompt. So when a free-tier turn goes wrong — the edit rejected, an
 * error in place of an answer, an edit refused or breaking the drawing, a turn that ran out of
 * tool calls — the request is copied here together with the drawing and the conversation it was
 * made in, as the privacy policy says. On any tier a turn is also kept when the user shares it
 * from the thumbs-down prompt, and only then: the prompt asks, so Skip has to mean no.
 *
 * Copied rather than referenced: the drawing and the chat both move on as the user keeps
 * working, and a rejected turn is removed from the chat outright, so a pointer would show a
 * later state than the one that failed.
 *
 * Nothing here may break the chat. A record that cannot be written is logged and dropped.
 */
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { firebaseDb } from './firebase-app';
import type { DisplayMessage } from '../components/aichat/types';

export type FeedbackKind = 'reject' | 'error' | 'refused' | 'broken' | 'out_of_rounds' | 'thumbs_down';

/** How long a record is kept, as the privacy policy states. Firestore's TTL policy on `expireAt`
 *  (firestore.indexes.json) deletes a record once that date has passed, usually within a day. */
export const FEEDBACK_RETENTION_DAYS = 90;

/**
 * Firestore holds at most 1 MiB per document, and the drawing takes most of it. What does not
 * fit is cut and flagged rather than failing the write and keeping nothing. The same numbers
 * are enforced in firestore.rules.
 */
export const FEEDBACK_LIMITS = {
  prompt: 4_000,
  response: 4_000,
  /** The drawing and the proposed result together. */
  svg: 600_000,
  chat: 200_000,
  notes: 40,
  note: 500,
} as const;

export interface FeedbackInput {
  kind: FeedbackKind;
  fileId: string;
  prompt: string;
  response?: string;
  error?: string;
  model: string;
  effort?: string;
  /** null while the account's tier is not yet known — nothing is kept on a guess. */
  tier: 'free' | 'pro' | null;
  /** The user chose to share this turn (thumbs-down → Share). */
  shared?: boolean;
  /** The drawing the model was shown. */
  svg: string;
  /** What the model proposed, when there is a proposal. */
  proposedSvg?: string;
  /** The assistant message the failure is about. */
  message?: DisplayMessage;
  /** The conversation before this turn. */
  history: DisplayMessage[];
}

/** Whether a turn is kept at all: always when the user shared it, otherwise only for an account
 *  known to be on the free tier. Until the credits listener has answered, a Pro account reads as
 *  free by default — so an unknown tier keeps nothing rather than break the policy's promise. */
export function shouldRecordFeedback(tier: 'free' | 'pro' | null, shared = false): boolean {
  return shared || tier === 'free';
}

/**
 * The drawing the model was shown for this turn. Once one of its edits has been accepted the
 * document on screen is already the edited one; the accepted call's undo snapshot is the state
 * from before the turn touched it.
 */
export function drawingShownFor(message: DisplayMessage | undefined, current: string): string {
  return message?.toolCalls?.find((tc) => tc.status === 'accepted' && tc.prevSvg)?.prevSvg ?? current;
}

/** What went wrong in a finished turn without the user having to say so, most serious first —
 *  or null when it went as planned. */
export function failureOf(message: DisplayMessage): FeedbackKind | null {
  const calls = message.toolCalls ?? [];
  if (calls.some((tc) => tc.arguments.documentBroken)) return 'broken';
  if (calls.some((tc) => tc.arguments.notExecuted
    || (Array.isArray(tc.arguments.failedOperations) && tc.arguments.failedOperations.length > 0))) {
    return 'refused';
  }
  if (message.outOfToolRounds) return 'out_of_rounds';
  return null;
}

/**
 * The conversation before the failed turn, as JSON: each message's role, text and what its
 * tool calls came to. Not the raw replay items, which repeat the drawing in every edit. When it
 * does not fit, the oldest messages go first — the ones nearest the failure matter most.
 */
export function transcriptOf(history: DisplayMessage[], max: number = FEEDBACK_LIMITS.chat): string {
  const entries = history.map((m) => ({
    role: m.role,
    content: m.content.slice(0, 2_000),
    ...(m.toolCalls?.length ? { tools: m.toolCalls.map((tc) => `${tc.name}:${tc.status}`) } : {}),
  }));
  let json = JSON.stringify(entries);
  while (json.length > max && entries.length > 0) {
    entries.shift();
    json = JSON.stringify(entries);
  }
  return json;
}

const cap = (text: string, max: number) => (text.length > max ? text.slice(0, max) : text);

/** The client's own account of what went wrong: refusals, partial failures, warnings, damage,
 *  and what each tool call reported back. */
function notesOf(message: DisplayMessage | undefined): string[] {
  const notes: string[] = [];
  for (const tc of message?.toolCalls ?? []) {
    const args = tc.arguments;
    for (const note of [
      ...(Array.isArray(args.failedOperations) ? args.failedOperations : []),
      ...(Array.isArray(args.warnings) ? args.warnings : []),
      ...(args.documentBroken ? [args.documentBroken] : []),
    ]) {
      notes.push(`${tc.name}: ${String(note)}`);
    }
  }
  for (const call of message?.readToolCalls ?? []) notes.push(`${call.name} → ${call.result}`);
  return notes.slice(0, FEEDBACK_LIMITS.notes).map((note) => cap(note, FEEDBACK_LIMITS.note));
}

/** The record as written, less its server timestamp. Optional fields are left out rather than
 *  set to null, which is what the size checks in firestore.rules expect. */
export function buildFeedbackRecord(input: FeedbackInput, uid: string): Record<string, unknown> {
  const svgFits = input.svg.length <= FEEDBACK_LIMITS.svg;
  const svg = svgFits ? input.svg : input.svg.slice(0, FEEDBACK_LIMITS.svg);
  const record: Record<string, unknown> = {
    uid,
    fileId: input.fileId,
    kind: input.kind,
    tier: input.tier ?? 'unknown',
    shared: !!input.shared,
    model: input.model,
    prompt: cap(input.prompt, FEEDBACK_LIMITS.prompt),
    response: cap(input.response ?? input.message?.content ?? '', FEEDBACK_LIMITS.response),
    tools: (input.message?.toolCalls ?? []).map((tc) => ({
      name: tc.name,
      status: tc.status,
      ...(tc.arguments.notExecuted ? { notExecuted: true } : {}),
      // The one line the proposal card shows. Without it a rejected turn read as silent, since
      // the model rarely writes a reply alongside an edit.
      ...(typeof tc.arguments.summary === 'string' ? { summary: cap(tc.arguments.summary, 300) } : {}),
    })),
    notes: notesOf(input.message),
    outOfToolRounds: !!input.message?.outOfToolRounds,
    svg,
    svgChars: input.svg.length,
    svgTruncated: !svgFits,
    chat: transcriptOf(input.history),
  };
  if (input.effort) record.effort = input.effort;
  if (input.error) record.error = cap(input.error, FEEDBACK_LIMITS.response);
  if (input.proposedSvg !== undefined) {
    record.proposedSvgChars = input.proposedSvg.length;
    if (svg.length + input.proposedSvg.length <= FEEDBACK_LIMITS.svg) record.proposedSvg = input.proposedSvg;
  }
  return record;
}

/** Keep a failed turn, when its tier and the user's choice allow it. Fire and forget; returns
 *  whether a write was started, so the caller can keep one record per turn. */
export function recordAiFeedback(input: FeedbackInput): boolean {
  if (!shouldRecordFeedback(input.tier, input.shared)) return false;
  const user = getAuth().currentUser;
  if (!user || user.isAnonymous) return false;
  addDoc(collection(firebaseDb, 'ai_feedback'), {
    ...buildFeedbackRecord(input, user.uid),
    createdAt: serverTimestamp(),
    expireAt: Timestamp.fromMillis(Date.now() + FEEDBACK_RETENTION_DAYS * 86_400_000),
  })
    .catch((err) => console.warn('[ai-feedback] not recorded', err));
  return true;
}
