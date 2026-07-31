import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  connectFirestoreEmulator,
  increment,
  type Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithRedirect,
  signInWithCredential,
  getRedirectResult,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  linkWithRedirect,
  updateProfile,
  onAuthStateChanged,
  connectAuthEmulator,
  type AuthProvider,
  type User,
} from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics';
import { visibilityOf, type Visibility } from './visibility';
import { config } from './config';
import { getConsent } from './cookie-consent';
import { trackSignIn } from './analytics';
import { notifications } from '@mantine/notifications';

const firebaseConfig = {
  apiKey: config.FIREBASE_API_KEY,
  authDomain: config.FIREBASE_AUTH_DOMAIN,
  databaseURL: config.FIREBASE_DATABASE_URL,
  projectId: config.FIREBASE_PROJECT_ID,
  storageBucket: config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.FIREBASE_MESSAGING_SENDER_ID,
  appId: config.FIREBASE_APP_ID,
  measurementId: config.FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase eagerly at module level so getAuth() works from any module
const firebaseApp = initializeApp(firebaseConfig);
const firebaseDb = getFirestore(firebaseApp);
const firebaseStorage = getStorage(firebaseApp);
export { firebaseDb, firebaseStorage };
const firebaseAuth = getAuth(firebaseApp);

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

let firebaseAnalytics: Analytics | null = null;

if (isLocalhost) {
  console.log('Running on localhost - using Firebase Emulators');
  connectFirestoreEmulator(firebaseDb, 'localhost', 8080);
  connectAuthEmulator(firebaseAuth, 'http://localhost:9099', { disableWarnings: true });
  connectStorageEmulator(firebaseStorage, 'localhost', 9199);
} else if (getConsent() === 'accepted') {
  firebaseAnalytics = getAnalytics(firebaseApp);
}

/** Enable analytics after user gives consent. */
export function enableAnalytics(): void {
  if (!firebaseAnalytics && !isLocalhost) {
    firebaseAnalytics = getAnalytics(firebaseApp);
  }
}

/** Log an error to the console and Firebase Analytics. */
export function logError(context: string, err: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  const auth = getAuth();
  const uid = auth.currentUser?.uid ?? 'unknown';
  const isAnon = auth.currentUser?.isAnonymous ?? true;
  console.error(`[${context}] uid=${uid} anon=${isAnon}`, err);

  if (firebaseAnalytics) {
    logEvent(firebaseAnalytics, 'exception', {
      description: `${context}: ${message}`.slice(0, 150),
      fatal: false,
    });
  }
}

/** Return a human-readable message for common Firebase errors. */
export function friendlyError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('PERMISSION_DENIED') || msg.includes('permission-denied'))
    return 'Permission denied. You may not own this file.';
  if (msg.includes('NOT_FOUND') || msg.includes('not-found'))
    return 'File not found.';
  if (msg.includes('UNAUTHENTICATED') || msg.includes('unauthenticated'))
    return 'You are not signed in.';
  if (msg.includes('UNAVAILABLE') || msg.includes('unavailable'))
    return 'Service temporarily unavailable. Please try again.';
  if (msg.includes('revoked') || msg.includes('user-disabled'))
    return 'Your session has expired. Please sign in again.';
  return msg;
}

onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    document.dispatchEvent(new Event('dbinit'));
  } else {
    signInAnonymously(firebaseAuth).catch((error) => {
      logError('auth', error);
    });
  }
});

export { visibilityOf };
export type { Visibility };

/** Gallery card text, entered/confirmed by the owner in the publish dialog. */
export interface GalleryMeta {
  title: string;
  description: string;
}

/**
 * Denormalized author identity for gallery cards — a snapshot taken whenever
 * the file is written as public. Cards can't resolve it at view time because
 * users/{uid} is owner-read-only and Auth profiles aren't client-queryable.
 */
function authorStamp(): { authorName: string | null; authorPhoto: string | null } {
  const user = getAuth().currentUser;
  return {
    authorName: user?.displayName ?? null,
    authorPhoto: user?.photoURL ?? null,
  };
}

export class EditSvgCodeDb {
  private db: Firestore;

  constructor() {
    this.db = firebaseDb;
  }

  async loadDocument(uniqueId: string, opts?: { quiet?: boolean }): Promise<{ text: string; visibility: Visibility; uid: string | null; title: string; description: string } | null> {
    const ref = doc(this.db, 'files', uniqueId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return {
        text: data.text ?? '',
        visibility: visibilityOf(data),
        uid: data.uid ?? null,
        title: data.title ?? '',
        description: data.description ?? '',
      };
    }
    // quiet: probing for an optional draft copy — absence is the normal case.
    if (!opts?.quiet) logError('loadDocument', 'file id does not exist: ' + uniqueId);
    return null;
  }

  async saveDocument(uniqueId: string, text: string, visibility: Visibility): Promise<void> {
    const ref = doc(this.db, 'files', uniqueId);
    const auth = getAuth();
    const uid = auth.currentUser?.uid ?? null;
    // Merge: the doc may already exist as a chat draft (saved:false) — keep its
    // createdAt/views/downloads and promote it to a saved file. The legacy
    // `private` boolean is kept in sync for older readers/rules paths.
    await setDoc(ref, {
      text, modified: new Date(), uid, saved: true,
      visibility, private: visibility === 'private',
      // Re-saving a public file refreshes the author snapshot too.
      ...(visibility === 'public' ? authorStamp() : {}),
    }, { merge: true });
  }

  async setVisibility(uniqueId: string, visibility: Visibility, meta?: GalleryMeta): Promise<void> {
    const { updateDoc } = await import('firebase/firestore');
    const ref = doc(this.db, 'files', uniqueId);
    await updateDoc(ref, {
      visibility,
      private: visibility === 'private',
      // Publishing bumps `modified` — the gallery sorts by it, so an old file
      // must surface as newly listed rather than buried at its last-edit date.
      ...(visibility === 'public' ? { ...authorStamp(), ...meta, modified: new Date() } : {}),
    });
  }

  async setDocumentMeta(uniqueId: string, meta: GalleryMeta): Promise<void> {
    const { updateDoc } = await import('firebase/firestore');
    const ref = doc(this.db, 'files', uniqueId);
    await updateDoc(ref, { ...meta });
  }

  async incrementViews(uniqueId: string): Promise<void> {
    const { updateDoc } = await import('firebase/firestore');
    const ref = doc(this.db, 'files', uniqueId);
    await updateDoc(ref, { views: increment(1) });
  }

  async incrementDownloads(uniqueId: string): Promise<void> {
    const { updateDoc } = await import('firebase/firestore');
    const ref = doc(this.db, 'files', uniqueId);
    await updateDoc(ref, { downloads: increment(1) });
  }

  async deleteDocument(uniqueId: string): Promise<void> {
    // Delete the chat first: subcollections are not removed with their parent,
    // and the messages rules require the parent doc to resolve ownership.
    const { clearChatMessages } = await import('./chat-history');
    await clearChatMessages(uniqueId);
    const ref = doc(this.db, 'files', uniqueId);
    await deleteDoc(ref);
  }

  async listUserDocuments(): Promise<Array<{ id: string; modified: Date; text: string; visibility: Visibility; views: number; downloads: number; saved: boolean; title: string; description: string }>> {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (!uid) return [];

    const q = query(
      collection(this.db, 'files'),
      where('uid', '==', uid),
      orderBy('modified', 'desc'),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      modified: d.data().modified?.toDate?.() ?? new Date(),
      text: d.data().text ?? '',
      visibility: visibilityOf(d.data()),
      views: d.data().views ?? 0,
      downloads: d.data().downloads ?? 0,
      // Legacy docs predate the `saved` field — treat missing as saved.
      saved: d.data().saved !== false,
      title: d.data().title ?? '',
      description: d.data().description ?? '',
    }));
  }

  /** Gallery: files whose owners explicitly listed them (visibility 'public'). */
  async listPublicDocuments(max = 60): Promise<Array<{ id: string; modified: Date; text: string; views: number; title: string; description: string; authorName: string; authorPhoto: string }>> {
    const { limit } = await import('firebase/firestore');
    const q = query(
      collection(this.db, 'files'),
      where('visibility', '==', 'public'),
      orderBy('modified', 'desc'),
      limit(max),
    );
    const snap = await getDocs(q);
    return snap.docs
      .filter((d) => d.data().saved !== false) // drafts never show, even if marked public
      .map((d) => ({
        id: d.id,
        modified: d.data().modified?.toDate?.() ?? new Date(),
        text: d.data().text ?? '',
        views: d.data().views ?? 0,
        title: d.data().title ?? '',
        description: d.data().description ?? '',
        authorName: d.data().authorName ?? '',
        authorPhoto: d.data().authorPhoto ?? '',
      }));
  }
}

/** Refresh token and initialize credits for a newly signed-in user. */
async function finalizeSignIn(user: User): Promise<void> {
  await user.getIdToken(true);
  try {
    const idToken = await user.getIdToken();
    await fetch(`${config.API_URL}/api/init-credits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
    });
  } catch {
    // Non-critical — ensureCurrentPeriod will catch up on first API call
  }
}

/** Handle redirect result on page load (after OAuth redirect back). */
getRedirectResult(getAuth()).then(async (result) => {
  if (result) {
    const user = result.user;
    await user.reload();
    const linked = user.providerData[0];
    if (linked && (!user.displayName || !user.photoURL)) {
      await updateProfile(user, {
        displayName: linked.displayName || user.displayName || undefined,
        photoURL: linked.photoURL || user.photoURL || undefined,
      });
    }
    await finalizeSignIn(user);
    trackSignIn(user.providerData[0]?.providerId ?? 'unknown');
    notifications.show({ title: 'Signed in', message: `Welcome, ${user.displayName || 'user'}!`, color: 'green' });
    return true;
  }
  return false;
}).catch(async (err: unknown) => {
  const code = (err as { code?: string }).code;
  if (code === 'auth/credential-already-in-use') {
    const credential = OAuthProvider.credentialFromError(err as Parameters<typeof OAuthProvider.credentialFromError>[0]);
    if (credential) {
      const result = await signInWithCredential(getAuth(), credential);
      await finalizeSignIn(result.user);
      trackSignIn(result.user.providerData[0]?.providerId ?? 'unknown');
      notifications.show({ title: 'Signed in', message: `Welcome, ${result.user.displayName || 'user'}!`, color: 'green' });
      return true;
    }
  }
  if (code === 'auth/email-already-in-use' || code === 'auth/account-exists-with-different-credential') {
    notifications.show({ title: 'Sign-in failed', message: 'An account with this email already exists. Please sign in with your original provider.', color: 'yellow' });
  } else if (code) {
    notifications.show({ title: 'Sign-in failed', message: (err as Error).message || 'Please try again.', color: 'red' });
    logError('auth-redirect', err);
  }
  return false;
});

/** Sign in with a provider via redirect. */
function signInWithProvider(provider: AuthProvider): void {
  const auth = getAuth();
  if (auth.currentUser?.isAnonymous) {
    linkWithRedirect(auth.currentUser, provider);
  } else {
    signInWithRedirect(auth, provider);
  }
}

export function signInWithGoogle(): void {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  signInWithProvider(provider);
}

export function signInWithGithub(): void {
  const provider = new GithubAuthProvider();
  provider.setCustomParameters({ allow_signup: 'true' });
  signInWithProvider(provider);
}

export function signInWithMicrosoft(): void {
  const provider = new OAuthProvider('microsoft.com');
  provider.setCustomParameters({ prompt: 'select_account' });
  signInWithProvider(provider);
}

/** Sign out and fall back to anonymous auth. */
export async function signOutUser(): Promise<void> {
  const auth = getAuth();
  await auth.signOut();
  // The onAuthStateChanged handler will trigger anonymous sign-in
}
