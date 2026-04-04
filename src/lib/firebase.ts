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
  linkWithPopup,
  updateProfile,
  onAuthStateChanged,
  connectAuthEmulator,
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

/** Sign in with Google. If the user is currently anonymous, link the account so data is preserved. */
export async function signInWithGoogle(): Promise<User> {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();

  // If currently signed in anonymously, try to link to preserve data
  if (auth.currentUser?.isAnonymous) {
    try {
      const result = await linkWithPopup(auth.currentUser, provider);
      // After linking, the profile may still have the anonymous user's empty name/photo.
      // Copy from the Google credential so displayName & photoURL are visible.
      const google = result.user.providerData.find((p) => p.providerId === 'google.com');
      if (google && (!result.user.displayName || !result.user.photoURL)) {
        await updateProfile(result.user, {
          displayName: google.displayName ?? result.user.displayName,
          photoURL: google.photoURL ?? result.user.photoURL,
        });
      }
      return result.user;
    } catch (err: unknown) {
      // If linking fails (e.g. account already exists), fall through to regular sign-in
      if ((err as { code?: string }).code !== 'auth/credential-already-in-use') throw err;
    }
  }

  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/** Sign out and fall back to anonymous auth. */
export async function signOutUser(): Promise<void> {
  const auth = getAuth();
  await auth.signOut();
  // The onAuthStateChanged handler will trigger anonymous sign-in
}
