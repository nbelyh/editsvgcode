/**
 * Server-side chat persistence: a document's single conversation lives under
 * its file as `files/{id}/messages` (Firestore). SVG and replay history stay
 * inline (small — median 2.7 KB per PLAN.md); only generated PNGs are
 * externalized to `files/{id}/png/{sha}.png` Storage blobs and rehydrated on load.
 *
 * Mirrors the old chat-storage API (loadChatMessages/saveChatMessages/
 * clearChatMessages) so the chat UI can swap to it with minimal change.
 * Anonymous users have no server chat (AI is sign-in gated).
 */
import {
  doc, getDoc, setDoc, collection, getDocs, query, orderBy, writeBatch, serverTimestamp,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getBytes } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { firebaseDb, firebaseStorage } from './firebase';
import { loadLegacyChatMessages, clearLegacyChatMessages } from './chat-storage';
import { isCleanId } from './svg-utils';
import type { DisplayMessage } from '../components/aichat/types';

/** uid of the signed-in, non-anonymous user, else null. */
function uid(): string | null {
  const u = getAuth().currentUser;
  return u && !u.isAnonymous ? u.uid : null;
}

// ---------------------------------------------------------------------------
// PNG blob IO (content-addressed) — the only thing kept out of Firestore
// ---------------------------------------------------------------------------

const uploadedPaths = new Set<string>();

async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes as unknown as BufferSource);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const b64 = dataUrl.replace(/^data:[^;]+;base64,/, '');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function bytesToDataUrl(bytes: Uint8Array): string {
  let bin = '';
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return `data:image/png;base64,${btoa(bin)}`;
}

async function uploadPng(dataUrl: string): Promise<string> {
  const owner = uid();
  if (!owner) throw new Error('Not signed in');
  const bytes = dataUrlToBytes(dataUrl);
  const sha = await sha256Hex(bytes);
  const path = `blobs/${owner}/${sha}.png`;
  if (uploadedPaths.has(path)) return path;
  // Content-addressed path → upload unconditionally (overwrite is harmless and
  // allowed by the rule); no existence probe, so no 404s on the normal path.
  await uploadBytes(storageRef(firebaseStorage, path), bytes as unknown as Uint8Array<ArrayBuffer>, {
    contentType: 'image/png',
    cacheControl: 'public, max-age=31536000, immutable',
  });
  uploadedPaths.add(path);
  return path;
}

async function fetchPngDataUrl(path: string): Promise<string> {
  return bytesToDataUrl(new Uint8Array(await getBytes(storageRef(firebaseStorage, path))));
}

// ---------------------------------------------------------------------------
// Message <-> Firestore doc
// ---------------------------------------------------------------------------

interface StoredMessage {
  seq: number;
  role: 'user' | 'assistant';
  content: string;       // kept top-level (readable for review)
  payload: string;       // JSON of { toolCalls?, rawItems?, selectedIcon?, readToolCalls? }, png externalized
}

const seqId = (seq: number) => String(seq).padStart(6, '0');

async function toStored(msg: DisplayMessage, seq: number): Promise<StoredMessage> {
  let toolCalls = msg.toolCalls as Array<Record<string, unknown>> | undefined;
  if (toolCalls) {
    toolCalls = await Promise.all(toolCalls.map(async (tc) => {
      const args = tc.arguments as Record<string, unknown>;
      const pngDataUrl = args?.pngDataUrl;
      if (typeof pngDataUrl === 'string' && pngDataUrl) {
        try {
          const pngRef = await uploadPng(pngDataUrl);
          const { pngDataUrl: _omit, ...restArgs } = args;
          return { ...tc, arguments: restArgs, pngRef };
        } catch (err) {
          // Non-fatal: keep the image inline so the message still persists.
          console.warn('[chat-history] PNG upload failed; keeping image inline', err);
          return tc;
        }
      }
      return tc;
    }));
  }
  // JSON.stringify drops `undefined` fields, so the payload is always valid.
  const payload = JSON.stringify({
    toolCalls,
    rawItems: msg.rawItems,
    selectedIcon: msg.selectedIcon,
    readToolCalls: msg.readToolCalls,
  });
  return { seq, role: msg.role, content: msg.content, payload };
}

async function fromStored(s: StoredMessage): Promise<DisplayMessage> {
  const parsed = JSON.parse(s.payload) as {
    toolCalls?: Array<Record<string, unknown>>;
    rawItems?: unknown[];
    selectedIcon?: unknown;
    readToolCalls?: unknown;
  };
  let toolCalls = parsed.toolCalls;
  if (toolCalls) {
    toolCalls = await Promise.all(toolCalls.map(async (tc) => {
      if (typeof tc.pngRef === 'string') {
        uploadedPaths.add(tc.pngRef); // already on the server — don't re-upload on the next save
        try {
          const { pngRef, ...rest } = tc;
          const args = (rest.arguments ?? {}) as Record<string, unknown>;
          return { ...rest, arguments: { ...args, pngDataUrl: await fetchPngDataUrl(pngRef as string) } };
        } catch (err) {
          // An unreachable blob (bucket CORS, revoked access, deleted object)
          // must cost the image only — never the conversation around it.
          // Returning `tc` untouched keeps `pngRef`, so toStored round-trips the
          // reference instead of orphaning the object on the next save.
          console.warn('[chat-history] blob fetch failed; keeping message without its image', err);
          return tc;
        }
      }
      return tc;
    }));
  }
  const msg: DisplayMessage = { role: s.role, content: s.content };
  if (toolCalls) msg.toolCalls = toolCalls as unknown as DisplayMessage['toolCalls'];
  if (parsed.rawItems !== undefined) msg.rawItems = parsed.rawItems;
  if (parsed.selectedIcon !== undefined) msg.selectedIcon = parsed.selectedIcon as DisplayMessage['selectedIcon'];
  if (parsed.readToolCalls !== undefined) msg.readToolCalls = parsed.readToolCalls as DisplayMessage['readToolCalls'];
  return msg;
}

// ---------------------------------------------------------------------------
// prevSvg dedupe — an accepted call's undo snapshot usually equals the SVG of
// the previous accept, so storing it would double every message. Drop it when
// redundant on save and reconstruct it on load by the same in-order walk; it
// is only stored when the user hand-edited between accepts (plus the first
// accept's baseline, which has no prior accept to reconstruct from).
// ---------------------------------------------------------------------------

type ToolCallLike = { status?: string; prevSvg?: string; arguments?: { svg?: unknown } };

function walkAcceptedSvgs(
  messages: DisplayMessage[],
  visit: (tc: ToolCallLike, lastAccepted: string | undefined) => ToolCallLike,
): DisplayMessage[] {
  let last: string | undefined;
  return messages.map((m) => {
    if (!m.toolCalls) return m;
    const toolCalls = m.toolCalls.map((raw) => {
      const tc = raw as ToolCallLike;
      if (tc.status !== 'accepted' || typeof tc.arguments?.svg !== 'string') return raw;
      const out = visit(tc, last);
      last = tc.arguments.svg as string;
      return out as typeof raw;
    });
    return { ...m, toolCalls };
  });
}

const stripRedundantPrevSvg = (messages: DisplayMessage[]) =>
  walkAcceptedSvgs(messages, (tc, last) => {
    if (tc.prevSvg !== undefined && tc.prevSvg === last) {
      const { prevSvg: _omit, ...rest } = tc;
      return rest;
    }
    return tc;
  });

const rehydratePrevSvg = (messages: DisplayMessage[]) =>
  walkAcceptedSvgs(messages, (tc, last) =>
    tc.prevSvg === undefined && last !== undefined ? { ...tc, prevSvg: last } : tc);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

// Ownership cache for files/{id} docs, keyed by the (anonymous or real) auth
// uid so switching accounts re-probes instead of inheriting the previous
// session's verdict. Only definitive verdicts are cached — a document that
// doesn't exist yet may be created by the very next save.
const ownedFileDocs = new Set<string>();
const foreignFileDocs = new Set<string>();
const cacheKey = (owner: string, fileId: string) => `${owner}:${fileId}`;

/**
 * Who the current session is to this document:
 *  - 'own'      the document exists and belongs to us (or is a legacy doc with
 *               no uid, which the rules treat as adoptable)
 *  - 'missing'  no server document yet — a fresh local draft
 *  - 'foreign'  somebody else's document: read-only, offer a fork instead
 *  - 'unknown'  auth not restored yet
 *
 * Ownership uses the raw auth uid, NOT `uid()`: anonymous users can save
 * documents of their own, and reopening one must not look "foreign" to them.
 */
type ChatAccess = 'own' | 'missing' | 'foreign' | 'unknown';

async function resolveAccess(fileId: string): Promise<ChatAccess> {
  const owner = getAuth().currentUser?.uid ?? null;
  if (!owner) return 'unknown';
  const key = cacheKey(owner, fileId);
  if (ownedFileDocs.has(key)) return 'own';
  if (foreignFileDocs.has(key)) return 'foreign';
  let snap;
  try {
    snap = await getDoc(doc(firebaseDb, 'files', fileId));
  } catch {
    // Read denied → somebody else's private document.
    foreignFileDocs.add(key);
    return 'foreign';
  }
  if (!snap.exists()) return 'missing';
  // Legacy docs may carry no uid; the security rules treat those as writable.
  const docUid = snap.data().uid;
  if (docUid != null && docUid !== owner) {
    foreignFileDocs.add(key);
    return 'foreign';
  }
  ownedFileDocs.add(key);
  return 'own';
}

export interface ChatAccessInfo {
  /** May we append to this chat? Needs a real account AND our own document. */
  canWrite: boolean;
  /** Somebody else's document — show the chat read-only and offer a fork. */
  isViewer: boolean;
}

/** Resolve the current session's relationship to a document's chat. */
export async function getChatAccess(fileId: string): Promise<ChatAccessInfo> {
  const access = await resolveAccess(fileId);
  return {
    canWrite: uid() !== null && (access === 'own' || access === 'missing'),
    isViewer: access === 'foreign',
  };
}

/** Create the files/{id} doc as a draft (saved:false) if it doesn't exist yet.
 * Returns false when the chat isn't ours to write. */
async function ensureFileDoc(fileId: string): Promise<boolean> {
  const owner = uid();
  if (!owner) return false;
  const access = await resolveAccess(fileId);
  if (access === 'own') return true;
  if (access !== 'missing') return false;
  await setDoc(doc(firebaseDb, 'files', fileId), {
    uid: owner,
    visibility: 'private',
    private: true,
    saved: false,
    createdAt: serverTimestamp(),
    modified: serverTimestamp(),
  });
  ownedFileDocs.add(cacheKey(owner, fileId));
  return true;
}

/**
 * Load a document's chat, rehydrating PNG blobs.
 *
 * THROWS on failure — deliberately. Returning [] would make "this read failed"
 * indistinguishable from "this document has no chat", and the difference is
 * destructive: saveChatMessages reconciles the subcollection against what it is
 * given, so persisting over a failed load deletes the stored conversation.
 * Callers must treat a rejection as "unknown", never as "empty".
 * (Individual unreachable blobs are already tolerated inside fromStored.)
 *
 * Deliberately NOT owner-gated: the rules mirror the document's visibility, so
 * a public/unlisted doc's chat is readable by anyone with the link — including
 * signed-out visitors browsing the gallery.
 */
export async function loadChatMessages(fileId: string): Promise<DisplayMessage[]> {
  try {
    const col = collection(firebaseDb, 'files', fileId, 'messages');
    const snap = await getDocs(query(col, orderBy('seq')));
    const msgs = await Promise.all(snap.docs.map((d) => fromStored(d.data() as StoredMessage)));
    return rehydratePrevSvg(msgs);
  } catch (err) {
    console.error('[chat-history] load failed', err);
    throw err;
  }
}

/**
 * One-time lift of a pre-server-chat conversation out of IndexedDB.
 *
 * Chats used to be per-browser local state; after the move to Firestore an
 * upgrading user would otherwise open a familiar document to an empty chat.
 * `DisplayMessage` is unchanged across that move, so the records go up as-is.
 *
 * The caller must only invoke this when the server returned nothing — a real
 * chat must never be overwritten by a stale local copy. The local records are
 * dropped only after the server write lands, so a failure (offline, rules)
 * simply leaves them in place to retry on the next load.
 *
 * Skipped for malformed ids (legacy "_local_…", filenames): those are re-minted
 * to a clean guid on save, and uploading first would strand the chat under the
 * old id — the save writes a different document. migrateChatData carries the
 * local chat across the re-mint instead, and this runs on the next load.
 *
 * Returns the migrated messages, or null when there was nothing to migrate.
 */
export async function migrateLegacyChat(fileId: string): Promise<DisplayMessage[] | null> {
  if (!uid() || !isCleanId(fileId)) return null;
  const legacy = await loadLegacyChatMessages<DisplayMessage>(fileId);
  if (legacy.length === 0) return null;
  try {
    await saveChatMessages(fileId, legacy);
  } catch (err) {
    console.error('[chat-history] legacy chat migration failed', err);
    return null;
  }
  await clearLegacyChatMessages(fileId);
  return legacy;
}

/**
 * The first user prompt's text, or null. Reads `content` straight off the
 * message docs (stored top-level) without fromStored, so it never downloads
 * the chat's PNG blobs — used for cheap gallery title/description suggestions.
 */
export async function loadFirstUserPrompt(fileId: string): Promise<string | null> {
  if (!uid()) return null;
  try {
    const col = collection(firebaseDb, 'files', fileId, 'messages');
    const snap = await getDocs(query(col, orderBy('seq')));
    for (const d of snap.docs) {
      const data = d.data() as StoredMessage;
      if (data.role === 'user' && data.content?.trim()) return data.content;
    }
    return null;
  } catch (err) {
    console.error('[chat-history] first-prompt read failed', err);
    return null;
  }
}

/** Externalize PNGs + reconcile the messages subcollection (handles truncation).
 * When `svg` is given it is stored inline on the file doc (`text`) so the draft
 * document travels with its chat. */
export async function saveChatMessages(fileId: string, messages: DisplayMessage[], svg?: string): Promise<void> {
  if (!await ensureFileDoc(fileId)) return;
  const stored = await Promise.all(stripRedundantPrevSvg(messages).map((m, i) => toStored(m, i)));
  const col = collection(firebaseDb, 'files', fileId, 'messages');
  const existing = await getDocs(col);
  const batch = writeBatch(firebaseDb);
  stored.forEach((s) => batch.set(doc(col, seqId(s.seq)), s));
  existing.docs.forEach((d) => { if (Number(d.id) >= stored.length) batch.delete(d.ref); });
  const fileFields: Record<string, unknown> = { modified: serverTimestamp() };
  if (svg !== undefined) fileFields.text = svg;
  batch.set(doc(firebaseDb, 'files', fileId), fileFields, { merge: true });
  await batch.commit();
}

/**
 * Deep-copy a (public) document into a new draft owned by the current user:
 * doc text + chat messages + PNG blobs (loadChatMessages rehydrates them to
 * data URLs; saving re-externalizes under the cloner's own blob space).
 * Returns the new draft's id. Requires a signed-in, non-anonymous user.
 */
export async function cloneDocument(sourceId: string): Promise<string | null> {
  const owner = uid();
  if (!owner) return null;
  const { getNewUniqueId } = await import('./svg-utils');
  const srcSnap = await getDoc(doc(firebaseDb, 'files', sourceId));
  if (!srcSnap.exists()) return null;
  const text: string = srcSnap.data().text ?? '';
  const messages = await loadChatMessages(sourceId);
  const newId = getNewUniqueId();
  await saveChatMessages(newId, messages, text);
  await setDoc(doc(firebaseDb, 'files', newId), { forkedFrom: sourceId }, { merge: true });
  return newId;
}

/** Delete a document's chat (leaves the file doc). */
export async function clearChatMessages(fileId: string): Promise<void> {
  if (!uid()) return;
  if (await resolveAccess(fileId) === 'foreign') return;
  try {
    const col = collection(firebaseDb, 'files', fileId, 'messages');
    const snap = await getDocs(col);
    if (snap.empty) return;
    const batch = writeBatch(firebaseDb);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch {
    // non-fatal
  }
}

/** Debounced save — batches rapid message-state changes. */
const timers = new Map<string, ReturnType<typeof setTimeout>>();
export function scheduleSaveChatMessages(fileId: string, messages: DisplayMessage[], svg?: string): void {
  const prev = timers.get(fileId);
  if (prev) clearTimeout(prev);
  timers.set(fileId, setTimeout(() => {
    timers.delete(fileId);
    saveChatMessages(fileId, messages, svg).catch((err) => console.error('[chat-history] save failed', err));
  }, 600));
}

/**
 * Keep the server copy of a draft's SVG in sync with editor changes. No-op
 * unless signed in AND the file doc already exists and is owned by the user —
 * merely editing must never create a server doc (only chat or Save do).
 */
const lastSyncedSvg = new Map<string, string>();

/** Mark `svg` as already server-synced (call after loading it from the server)
 * so re-rendering the loaded document doesn't count as an edit. */
export function primeDraftSvg(fileId: string, svg: string): void {
  lastSyncedSvg.set(fileId, svg);
}

async function saveDraftSvg(fileId: string, svg: string): Promise<void> {
  if (!uid()) return;
  // 'own' only — 'missing' would mean creating the doc, which editing must not do.
  if (await resolveAccess(fileId) !== 'own') return;
  await setDoc(doc(firebaseDb, 'files', fileId), { text: svg, modified: serverTimestamp() }, { merge: true });
  lastSyncedSvg.set(fileId, svg);
}

const svgTimers = new Map<string, ReturnType<typeof setTimeout>>();
export function scheduleDraftSvgSave(fileId: string, svg: string): void {
  if (lastSyncedSvg.get(fileId) === svg) return;
  const prev = svgTimers.get(fileId);
  if (prev) clearTimeout(prev);
  svgTimers.set(fileId, setTimeout(() => {
    svgTimers.delete(fileId);
    saveDraftSvg(fileId, svg).catch((err) => console.error('[chat-history] svg sync failed', err));
  }, 1000));
}
