import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  connectFirestoreEmulator,
  type Firestore,
} from 'firebase/firestore';
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  connectAuthEmulator,
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

export class EditSvgCodeDb {
  private db: Firestore;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
    const auth = getAuth(app);

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';

    if (isLocalhost) {
      console.log('Running on localhost - using Firebase Emulators');
      connectFirestoreEmulator(this.db, 'localhost', 8080);
      connectAuthEmulator(auth, 'http://localhost:9099');
    } else {
      getAnalytics(app);
    }

    onAuthStateChanged(auth, (user) => {
      if (user) {
        document.dispatchEvent(new Event('dbinit'));
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error('Unable to authenticate: ' + error.message);
        });
      }
    });
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
    await setDoc(ref, { text, modified: new Date() });
  }
}
