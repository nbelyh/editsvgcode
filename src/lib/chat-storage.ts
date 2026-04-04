/**
 * IndexedDB-backed storage for AI chat messages.
 * IndexedDB has no practical size limit (~hundreds of MB),
 * so full SVG payloads in tool calls are safe to store.
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

export async function loadChatMessages<T>(fileId: string): Promise<T[]> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(keyFor('messages', fileId));
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function saveChatMessages<T>(messages: T[], fileId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(messages, keyFor('messages', fileId));
  } catch {
    // Silently ignore write failures
  }
}

export async function clearChatMessages(fileId: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(keyFor('messages', fileId));
    tx.objectStore(STORE_NAME).delete(keyFor('svgCode', fileId));
    tx.objectStore(STORE_NAME).delete(keyFor('svgCheckpoints', fileId));
  } catch {
    // Silently ignore
  }
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
