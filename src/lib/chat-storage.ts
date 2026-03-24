/**
 * IndexedDB-backed storage for AI chat messages.
 * IndexedDB has no practical size limit (~hundreds of MB),
 * so full SVG payloads in tool calls are safe to store.
 */

const DB_NAME = 'editsvgcode';
const STORE_NAME = 'chat';
const KEY = 'messages';
const SVG_KEY = 'svgCode';
const CHECKPOINTS_KEY = 'svgCheckpoints';

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

export async function loadChatMessages<T>(): Promise<T[]> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY);
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function saveChatMessages<T>(messages: T[]): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(messages, KEY);
  } catch {
    // Silently ignore write failures
  }
}

export async function clearChatMessages(): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(KEY);
    tx.objectStore(STORE_NAME).delete(SVG_KEY);
    tx.objectStore(STORE_NAME).delete(CHECKPOINTS_KEY);
  } catch {
    // Silently ignore
  }
}

export async function saveSvgCode(svg: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(svg, SVG_KEY);
  } catch {
    // Silently ignore
  }
}

export async function loadSvgCode(): Promise<string | null> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(SVG_KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function pushCheckpoint(svg: string): Promise<void> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existing: string[] = await new Promise((resolve) => {
      const req = store.get(CHECKPOINTS_KEY);
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => resolve([]);
    });
    existing.push(svg);
    store.put(existing, CHECKPOINTS_KEY);
  } catch {
    // Silently ignore
  }
}

export async function popCheckpoints(count: number): Promise<string | null> {
  try {
    const db = await openDb();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const existing: string[] = await new Promise((resolve) => {
      const req = store.get(CHECKPOINTS_KEY);
      req.onsuccess = () => resolve(req.result ?? []);
      req.onerror = () => resolve([]);
    });
    if (existing.length === 0) return null;
    const toPop = Math.min(count, existing.length);
    const restored = existing[existing.length - toPop];
    existing.splice(existing.length - toPop, toPop);
    store.put(existing, CHECKPOINTS_KEY);
    return restored;
  } catch {
    return null;
  }
}

export async function hasCheckpoints(): Promise<boolean> {
  try {
    const db = await openDb();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(CHECKPOINTS_KEY);
      req.onsuccess = () => resolve(Array.isArray(req.result) && req.result.length > 0);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}
