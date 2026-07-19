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
        const { pngRef, ...rest } = tc;
        const args = (rest.arguments ?? {}) as Record<string, unknown>;
        return { ...rest, arguments: { ...args, pngDataUrl: await fetchPngDataUrl(pngRef as string) } };
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

/** File docs known to exist and be owned by the current user (avoids re-probing). */
const knownFileDocs = new Set<string>();

/** Create the files/{id} doc as a draft (saved:false) if it doesn't exist yet. */
async function ensureFileDoc(fileId: string): Promise<void> {
  const owner = uid();
  if (!owner) return;
  if (knownFileDocs.has(fileId)) return;
  const ref = doc(firebaseDb, 'files', fileId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid: owner,
      private: true,
      saved: false,
      createdAt: serverTimestamp(),
      modified: serverTimestamp(),
    });
  }
  knownFileDocs.add(fileId);
}

/** Load a document's chat, rehydrating PNG blobs. Never throws (returns []). */
export async function loadChatMessages(fileId: string): Promise<DisplayMessage[]> {
  if (!uid()) return [];
  try {
    const col = collection(firebaseDb, 'files', fileId, 'messages');
    const snap = await getDocs(query(col, orderBy('seq')));
    const msgs = await Promise.all(snap.docs.map((d) => fromStored(d.data() as StoredMessage)));
    return rehydratePrevSvg(msgs);
  } catch (err) {
    console.error('[chat-history] load failed', err);
    return [];
  }
}

/** Externalize PNGs + reconcile the messages subcollection (handles truncation).
 * When `svg` is given it is stored inline on the file doc (`text`) so the draft
 * document travels with its chat. */
export async function saveChatMessages(fileId: string, messages: DisplayMessage[], svg?: string): Promise<void> {
  if (!uid()) return;
  await ensureFileDoc(fileId);
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

/** Delete a document's chat (leaves the file doc). */
export async function clearChatMessages(fileId: string): Promise<void> {
  if (!uid()) return;
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
  const owner = uid();
  if (!owner) return;
  if (!knownFileDocs.has(fileId)) {
    const snap = await getDoc(doc(firebaseDb, 'files', fileId));
    if (!snap.exists() || snap.data().uid !== owner) return;
    knownFileDocs.add(fileId);
  }
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
