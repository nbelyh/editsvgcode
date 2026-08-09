import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * A save must never be the thing that orphans a document.
 *
 * For a moment after a reload the Firebase session has not been restored and
 * `currentUser` is still null, while the Save button is already live. Reading
 * the uid in that window and persisting it wrote `uid: null` over the real
 * owner — and since the read rule grants a private document only to its own
 * uid, the file then belonged to nobody: unreadable by everyone, its author
 * included, with no error raised anywhere.
 *
 * The window is a race, so an end-to-end test only catches it when the machine
 * happens to be slow. These drive the two halves of the contract directly and
 * fail the same way every time.
 */

const setDoc = vi.fn((..._args: unknown[]) => Promise.resolve());

/** The auth instance the module under test sees. `ready` is what resolves the
 *  session, so a test decides whether (and when) a user appears. */
const session: {
  currentUser: { uid: string; isAnonymous: boolean; displayName: string | null; photoURL: string | null } | null;
  ready: () => Promise<void>;
} = { currentUser: null, ready: async () => {} };

vi.mock('firebase/app', () => ({ initializeApp: () => ({}) }));
vi.mock('firebase/firestore', () => ({
  getFirestore: () => ({}),
  initializeFirestore: () => ({}),
  connectFirestoreEmulator: vi.fn(),
  doc: (_db: unknown, collectionName: string, id: string) => ({ collectionName, id }),
  getDoc: vi.fn(),
  setDoc,
  deleteDoc: vi.fn(),
  collection: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  getDocs: vi.fn(),
  increment: vi.fn(),
}));
/** Subscribers to onAuthStateChanged, so a test can land an account late. */
const authListeners: Array<(u: unknown) => void> = [];

vi.mock('firebase/auth', () => ({
  getAuth: () => ({
    get currentUser() { return session.currentUser; },
    authStateReady: () => session.ready(),
  }),
  connectAuthEmulator: vi.fn(),
  onAuthStateChanged: (_auth: unknown, cb: (u: unknown) => void) => {
    authListeners.push(cb);
    return () => {
      const i = authListeners.indexOf(cb);
      if (i >= 0) authListeners.splice(i, 1);
    };
  },
  signInAnonymously: vi.fn(),
  signInWithRedirect: vi.fn(),
  signInWithCredential: vi.fn(),
  getRedirectResult: () => Promise.resolve(null),
  GoogleAuthProvider: class {},
  GithubAuthProvider: class {},
  OAuthProvider: class {},
  linkWithRedirect: vi.fn(),
  updateProfile: vi.fn(),
}));
vi.mock('firebase/storage', () => ({ getStorage: () => ({}), connectStorageEmulator: vi.fn() }));
vi.mock('firebase/analytics', () => ({ getAnalytics: () => ({}), logEvent: vi.fn() }));
vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));
vi.mock('../analytics', () => ({ trackSignIn: vi.fn() }));
vi.mock('../cookie-consent', () => ({ getConsent: () => 'declined' }));

const { EditSvgCodeDb } = await import('../firebase');

/** The document body handed to setDoc. */
function written() {
  return setDoc.mock.calls[0][1] as Record<string, unknown>;
}

describe('saveDocument ownership', () => {
  beforeEach(() => {
    setDoc.mockClear();
    session.currentUser = null;
    session.ready = async () => {};
  });

  it('waits for the session instead of reading it too early', async () => {
    // Precisely the post-reload window: no user yet, one arrives when the
    // session resolves. Reading currentUser before awaiting sees null.
    session.ready = async () => {
      session.currentUser = { uid: 'owner-1', isAnonymous: false, displayName: null, photoURL: null };
    };

    await new EditSvgCodeDb().saveDocument('doc1', '<svg/>', 'private');

    expect(written().uid).toBe('owner-1');
  });

  it('waits for the anonymous account the app is already creating', async () => {
    // A first visit: nothing is persisted, so the lookup finishes on nobody
    // while this module's own signInAnonymously is still in flight. Saving on
    // that null means a create with no uid, which the rules refuse — so the
    // visitor got "Permission denied" for a file that was theirs to make.
    session.currentUser = null;
    session.ready = async () => {};

    // Against a baseline: the module installs its own listener at import, so
    // "any listener exists" would be satisfied before saveDocument subscribes.
    const before = authListeners.length;
    const saving = new EditSvgCodeDb().saveDocument('doc3', '<svg/>', 'private');
    const anon = { uid: 'anon-1', isAnonymous: true, displayName: null, photoURL: null };
    await vi.waitFor(() => expect(authListeners.length).toBeGreaterThan(before));
    session.currentUser = anon;
    for (const cb of [...authListeners]) cb(anon);
    await saving;

    expect(written().uid).toBe('anon-1');
  });

  it('leaves the stored owner alone when there is no session at all', async () => {
    // Nobody arrives at all — anonymous sign-in can fail outright, so the wait
    // gives up rather than hanging Save forever. Even then the write merges, so
    // omitting the field keeps whatever owner is on the document; writing null
    // is what destroyed it.
    vi.useFakeTimers();
    try {
      const saving = new EditSvgCodeDb().saveDocument('doc1', '<svg/>', 'private');
      await vi.advanceTimersByTimeAsync(10_001);
      await saving;
    } finally {
      vi.useRealTimers();
    }

    expect(written()).not.toHaveProperty('uid');
    expect(written().uid).toBeUndefined();
  });

  it('still records the owner in the ordinary case', async () => {
    session.currentUser = { uid: 'owner-2', isAnonymous: false, displayName: null, photoURL: null };

    await new EditSvgCodeDb().saveDocument('doc2', '<svg/>', 'unlisted');

    expect(written().uid).toBe('owner-2');
  });
});
