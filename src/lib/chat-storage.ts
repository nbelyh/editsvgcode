/**
 * IndexedDB-backed local store for the editor's working SVG + undo checkpoints.
 * (Chat messages now persist to Firestore via chat-history.ts.)
 *
 * NOTE: slated for removal — svgCode/checkpoints are being moved off IndexedDB
 * so the app keeps nothing client-side.
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

export async function pushCheckpoint(svg: string, fileId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existing: string[] = await new Promise((resolve) => {
      const req = store.get(keyFor('svgCheckpoints', fileId));
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => resolve([]);
    });
    existing.push(svg);
    store.put(existing, keyFor('svgCheckpoints', fileId));
  } catch {
    // Silently ignore
  }
}

export async function popCheckpoints(count: number, fileId: string): Promise<string | null> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existing: string[] = await new Promise((resolve) => {
      const req = store.get(keyFor('svgCheckpoints', fileId));
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => resolve([]);
    });
    if (existing.length === 0) return null;
    const toPop = Math.min(count, existing.length);
    const restored = existing[existing.length - toPop];
    existing.splice(existing.length - toPop, toPop);
    store.put(existing, keyFor('svgCheckpoints', fileId));
    return restored;
  } catch {
    return null;
  }
}

/**
 * Copy all chat data (messages, svgCode, checkpoints) from one fileId to another.
 * Used when saving a new file assigns a permanent ID.
 */
export async function migrateChatData(oldFileId: string, newFileId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const keys = ['messages', 'svgCode', 'svgCheckpoints'] as const;
    await Promise.all(keys.map(base =>
      new Promise<void>((resolve) => {
        const req = store.get(keyFor(base, oldFileId));
        req.onsuccess = () => {
          if (req.result !== undefined) {
            store.put(req.result, keyFor(base, newFileId));
          }
          resolve();
        };
        req.onerror = () => resolve();
      })
    ));
  } catch {
    // Silently ignore
  }
}

export async function hasCheckpoints(fileId: string): Promise<boolean> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(keyFor('svgCheckpoints', fileId));
      req.onsuccess = () => resolve(Array.isArray(req.result) && req.result.length > 0);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}
