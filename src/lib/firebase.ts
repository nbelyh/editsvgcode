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
  GoogleAuthProvider,
  GithubAuthProvider,
  linkWithPopup,
  updateProfile,
  onAuthStateChanged,
  connectAuthEmulator,
  type AuthProvider,
  type User,
} from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDFV9DY9TO1wKlKa4JNlG-J3XPh162X6tk',
  authDomain: 'editsvgcode-db.firebaseapp.com',
  databaseURL: 'https://editsvgcode-db.firebaseio.com',
  projectId: 'editsvgcode-db',
  storageBucket: 'editsvgcode-db.appspot.com',
  messagingSenderId: '112195396800',
  appId: '1:112195396800:web:2d89974b60aacf6ac3b925',
  measurementId: 'G-EZ58N4GC8Z',
};

// Initialize Firebase eagerly at module level so getAuth() works from any module
const firebaseApp = initializeApp(firebaseConfig);
const firebaseDb = getFirestore(firebaseApp);
const firebaseAuth = getAuth(firebaseApp);

const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

if (isLocalhost) {
  console.log('Running on localhost - using Firebase Emulators');
  connectFirestoreEmulator(firebaseDb, 'localhost', 8080);
  connectAuthEmulator(firebaseAuth, 'http://localhost:9099');
} else {
  getAnalytics(firebaseApp);
}

onAuthStateChanged(firebaseAuth, (user) => {
  if (user) {
    document.dispatchEvent(new Event('dbinit'));
  } else {
    signInAnonymously(firebaseAuth).catch((error) => {
      console.error('Unable to authenticate: ' + error.message);
    });
  }
});

export class EditSvgCodeDb {
  private db: Firestore;

  constructor() {
    this.db = firebaseDb;
  }

  async loadDocument(uniqueId: string): Promise<string> {
    const ref = doc(this.db, 'files', uniqueId);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data().text;
    }
    console.warn('file id does not exist: ' + uniqueId);
    return '';
  }

  async saveDocument(uniqueId: string, text: string): Promise<void> {
    const ref = doc(this.db, 'files', uniqueId);
    const auth = getAuth();
    const uid = auth.currentUser?.uid ?? null;
    await setDoc(ref, { text, modified: new Date(), uid });
  }

  async deleteDocument(uniqueId: string): Promise<void> {
    const ref = doc(this.db, 'files', uniqueId);
    await deleteDoc(ref);
  }

  async listUserDocuments(): Promise<Array<{ id: string; modified: Date; text: string }>> {
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
      user = (await signInWithPopup(auth, provider)).user;
    }
  } else {
    user = (await signInWithPopup(auth, provider)).user;
  }

  // Refresh token so onIdTokenChanged fires in UI components
  await user.getIdToken(true);
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
