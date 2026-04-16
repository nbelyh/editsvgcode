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
  type Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  GithubAuthProvider,
  OAuthProvider,
  linkWithPopup,
  updateProfile,
  onAuthStateChanged,
  connectAuthEmulator,
  type AuthProvider,
  type User,
} from 'firebase/auth';
import { getAnalytics, logEvent, type Analytics } from 'firebase/analytics';
import { config } from './config';

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
export { firebaseDb };
const firebaseAuth = getAuth(firebaseApp);

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

let firebaseAnalytics: Analytics | null = null;

if (isLocalhost) {
  console.log('Running on localhost - using Firebase Emulators');
  connectFirestoreEmulator(firebaseDb, 'localhost', 8080);
  connectAuthEmulator(firebaseAuth, 'http://localhost:9099');
} else {
  firebaseAnalytics = getAnalytics(firebaseApp);
}

/** Log an error to Firebase Analytics (production) and console. */
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
      uid,
      anonymous: isAnon,
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

export class EditSvgCodeDb {
  private db: Firestore;

  constructor() {
    this.db = firebaseDb;
  }

  async loadDocument(uniqueId: string): Promise<{ text: string; private: boolean } | null> {
    const ref = doc(this.db, 'files', uniqueId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const data = snap.data();
      return { text: data.text ?? '', private: data.private ?? false };
    }
    logError('loadDocument', 'file id does not exist: ' + uniqueId);
    return null;
  }

  async saveDocument(uniqueId: string, text: string, isPrivate: boolean): Promise<void> {
    const ref = doc(this.db, 'files', uniqueId);
    const auth = getAuth();
    const uid = auth.currentUser?.uid ?? null;
    await setDoc(ref, { text, modified: new Date(), uid, private: isPrivate });
  }

  async setPrivate(uniqueId: string, isPrivate: boolean): Promise<void> {
    const { updateDoc } = await import('firebase/firestore');
    const ref = doc(this.db, 'files', uniqueId);
    await updateDoc(ref, { private: isPrivate });
  }

  async deleteDocument(uniqueId: string): Promise<void> {
    const ref = doc(this.db, 'files', uniqueId);
    await deleteDoc(ref);
  }

  async listUserDocuments(): Promise<Array<{ id: string; modified: Date; text: string; public: boolean }>> {
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
      public: !(d.data().private ?? false),
    }));
  }
}

/** Sign in with a provider. If anonymous, link the account to preserve data. */
async function signInWithProvider(provider: AuthProvider): Promise<User> {
  const auth = getAuth();
  let user: User;

  if (auth.currentUser?.isAnonymous) {
    try {
      const result = await linkWithPopup(auth.currentUser, provider);
      await result.user.reload();
      const linked = result.user.providerData[0];
      if (linked && (!result.user.displayName || !result.user.photoURL)) {
        await updateProfile(result.user, {
          displayName: linked.displayName || result.user.displayName || undefined,
          photoURL: linked.photoURL || result.user.photoURL || undefined,
        });
      }
      user = result.user;
    } catch (err: unknown) {
      if ((err as { code?: string }).code !== 'auth/credential-already-in-use') throw err;
      const credential = OAuthProvider.credentialFromError(err as Parameters<typeof OAuthProvider.credentialFromError>[0]);
      if (!credential) throw err;
      user = (await signInWithCredential(auth, credential)).user;
    }
  } else {
    user = (await signInWithPopup(auth, provider)).user;
  }

  // Refresh token so onIdTokenChanged fires in UI components
  await user.getIdToken(true);

  // Initialize usage doc with proper credits for the signed-in tier
  try {
    const idToken = await user.getIdToken();
    await fetch(`${config.API_URL}/api/init-credits`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${idToken}` },
    });
  } catch {
    // Non-critical — ensureCurrentPeriod will catch up on first API call
  }

  return user;
}

export function signInWithGoogle(): Promise<User> {
  return signInWithProvider(new GoogleAuthProvider());
}

export function signInWithGithub(): Promise<User> {
  return signInWithProvider(new GithubAuthProvider());
}

/** Sign out and fall back to anonymous auth. */
export async function signOutUser(): Promise<void> {
  const auth = getAuth();
  await auth.signOut();
  // The onAuthStateChanged handler will trigger anonymous sign-in
}
