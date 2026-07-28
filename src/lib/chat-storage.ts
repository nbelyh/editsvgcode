/**
 * IndexedDB-backed local store for the anonymous editor's working SVG draft.
 * Signed-in state lives server-side: chat messages and undo snapshots in
 * Firestore (chat-history.ts), the draft SVG inline on files/{id}. This local
 * copy remains the persistence for anonymous users (free, account-less editor)
 * and the fallback for docs that predate the server-side draft sync.
 */

const DB_NAME = 'editsvgcode';
const STORE_NAME = 'chat';

function keyFor(base: string, fileId: string): string {
  return fileId ? `${base}:${fileId}` : base;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveSvgCode(svg: string, fileId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(svg, keyFor('svgCode', fileId));
  } catch {
    // Silently ignore
  }
}

export async function loadSvgCode(fileId: string): Promise<string | null> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(keyFor('svgCode', fileId));
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Legacy chat migration (pre-server-chat)
//
// Chats used to live here under `messages:<fileId>`, with undo checkpoints
// under `svgCheckpoints:<fileId>`. Both moved server-side and nothing else
// reads these keys any more — they survive only so an upgrading user's
// conversation can be lifted to Firestore once, instead of silently
// disappearing. Safe to delete this block once the userbase has cycled through.
// ---------------------------------------------------------------------------

/** Read a pre-server-chat conversation, if this browser still holds one. */
export async function loadLegacyChatMessages<T>(fileId: string): Promise<T[]> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(keyFor('messages', fileId));
      req.onsuccess = () => resolve(Array.isArray(req.result) ? req.result : []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Drop a migrated chat and its now-unread undo checkpoints. `svgCode` is
 * deliberately kept — it is still the live draft store for anonymous users.
 */
export async function clearLegacyChatMessages(fileId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(keyFor('messages', fileId));
    store.delete(keyFor('svgCheckpoints', fileId));
  } catch {
    // Silently ignore
  }
}

/**
 * Move the local draft data from one fileId to another. Used when saving a
 * file with a malformed legacy id assigns a clean permanent one.
 *
 * The draft SVG is copied; a legacy chat is *moved* (copied then dropped), so
 * it lands under the clean id and gets picked up by the one-time server
 * migration on the next load. Leaving it behind would strand it: nothing ever
 * reads the malformed key again.
 */
export async function migrateChatData(oldFileId: string, newFileId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const move = (base: string, drop: boolean) => new Promise<void>((resolve) => {
      const req = store.get(keyFor(base, oldFileId));
      req.onsuccess = () => {
        if (req.result !== undefined) {
          store.put(req.result, keyFor(base, newFileId));
          if (drop) store.delete(keyFor(base, oldFileId));
        }
        resolve();
      };
      req.onerror = () => resolve();
    });
    await move('svgCode', false);
    await move('messages', true);
  } catch {
    // Silently ignore
  }
}
