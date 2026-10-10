import { describe, it, expect, vi, beforeEach } from 'vitest';

const signedIn = { current: true };
const blobReachable = { current: true };
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(), getDoc: vi.fn(), setDoc: vi.fn(), collection: vi.fn(), getDocs: vi.fn(),
  query: vi.fn(), orderBy: vi.fn(), writeBatch: vi.fn(), serverTimestamp: vi.fn(),
}));
vi.mock('firebase/storage', () => ({
  ref: vi.fn((_storage: unknown, path: string) => path),
  uploadBytes: vi.fn(async () => {}),
  getBytes: vi.fn(async () => {
    if (!blobReachable.current) throw new Error('storage/unauthorized');
    return new Uint8Array([1, 2, 3]).buffer;
  }),
}));
vi.mock('firebase/auth', () => ({
  getAuth: () => ({ currentUser: signedIn.current ? { uid: 'u1', isAnonymous: false } : null }),
}));
vi.mock('../firebase-app', () => ({ firebaseDb: {}, firebaseStorage: {} }));
vi.mock('../chat-storage', () => ({ loadLegacyChatMessages: vi.fn(), clearLegacyChatMessages: vi.fn() }));

import { toStored, fromStored } from '../chat-history';

/**
 * A picture attached to a message is saved the way a generated one is: in blob storage, with
 * only a reference in the message, as each message is a Firestore document limited to 1 MiB.
 */
describe('chat history — a picture attached to a message', () => {
  const picture = 'data:image/png;base64,AQID';

  beforeEach(() => { signedIn.current = true; blobReachable.current = true; });

  it('is kept by reference and comes back with the message', async () => {
    const stored = await toStored({ role: 'user', content: 'Match these colours', picture }, 0);
    expect(stored.payload).not.toContain('AQID');
    expect(JSON.parse(stored.payload).pictureRef).toMatch(/^blobs\/u1\/[0-9a-f]{64}\.png$/);
    const loaded = await fromStored(stored);
    expect(loaded.content).toBe('Match these colours');
    expect(loaded.picture).toBe(picture);
  });

  it('is left out when it cannot be uploaded, rather than stored inline past the size limit', async () => {
    signedIn.current = false;
    const stored = await toStored({ role: 'user', content: 'Match these colours', picture }, 0);
    expect(stored.payload).not.toContain('AQID');
    const loaded = await fromStored(stored);
    expect(loaded.content).toBe('Match these colours');
    expect(loaded.picture).toBeUndefined();
  });

  it('keeps its reference when it cannot be loaded, so the next save does not drop it', async () => {
    const stored = await toStored({ role: 'user', content: 'Match these colours', picture }, 0);
    const ref = JSON.parse(stored.payload).pictureRef;
    blobReachable.current = false;
    const loaded = await fromStored(stored);
    expect(loaded.picture).toBeUndefined();
    const saved = await toStored(loaded, 0);
    expect(JSON.parse(saved.payload).pictureRef).toBe(ref);
  });

  it('keeps the picture card button a message stands for', async () => {
    const stored = await toStored({ role: 'user', content: 'Trace this picture to SVG', picture, action: 'trace' }, 0);
    expect((await fromStored(stored)).action).toBe('trace');
  });

  it('leaves a message without one as it was', async () => {
    const stored = await toStored({ role: 'user', content: 'make it blue' }, 0);
    expect(JSON.parse(stored.payload)).not.toHaveProperty('pictureRef');
    expect((await fromStored(stored)).picture).toBeUndefined();
  });
});
