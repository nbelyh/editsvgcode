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

/**
 * Copy the local draft SVG from one fileId to another. Used when saving a
 * file with a malformed legacy id assigns a clean permanent one.
 */
export async function migrateChatData(oldFileId: string, newFileId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    await new Promise<void>((resolve) => {
      const req = store.get(keyFor('svgCode', oldFileId));
      req.onsuccess = () => {
        if (req.result !== undefined) {
          store.put(req.result, keyFor('svgCode', newFileId));
        }
        resolve();
      };
      req.onerror = () => resolve();
    });
  } catch {
    // Silently ignore
  }
}
