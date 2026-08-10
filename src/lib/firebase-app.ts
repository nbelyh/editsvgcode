/**
 * Firebase app/service handles, and nothing else.
 *
 * Split out of firebase.ts so modules that only need a `Firestore` or a
 * `FirebaseStorage` can take one without importing firebase.ts — which also
 * holds the document API, and so imports chat-history.ts, which needs these
 * handles. Kept together they formed a cycle that only stayed upright because
 * chat-history read the handles inside functions rather than at module scope.
 *
 * This module must depend on nothing of ours but ./config, or the cycle grows
 * back.
 */
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  connectFirestoreEmulator,
  type FirestoreSettings,
} from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
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
export const firebaseApp = initializeApp(firebaseConfig);

export const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

// TODO(webkit-longpoll): a workaround for someone else's open bug — WebKit
// 26.4 and 26.5, https://github.com/firebase/firebase-js-sdk/issues/9789.
// Delete the whole block once WebKit is fixed; there is a recipe at the bottom
// for deciding when that is.
//
// WebKit cannot carry Firestore's channel over the Fetch API, so it gets XHR.
//
// The SDK's WebChannel keeps a long-lived response open and reads bytes out of
// it as they arrive, and by default it opens that response with fetch(). On
// WebKit those fetches fail — "Fetch API cannot load … due to access control
// checks" — and the channel jams: the SDK waits, times it out, reconnects, and
// the replacement jams the same way. Nothing throws where the app can see it,
// so reads and writes simply take tens of seconds or never settle. The stalling
// was confirmed on Safari against production Firestore, not only against the
// emulator, where 15 of 30 reads were lost against Chromium's 0 of 30.
//
// useFetchStreams: false puts the same channel back on XMLHttpRequest, which
// WebKit does carry. All 30 land, at a median 436ms — no slower than the
// default was on the reads it did not lose. Chromium is untouched.
//
// This block used to force long polling instead. That fixed the 30-read
// benchmark (0 of 30 lost) but not the underlying transport, because
// experimentalForceLongPolling does NOT turn fetch streams off — the channel is
// still opened with fetch(), so anything that made the SDK rebuild it jammed
// again. Signing a second user in and cloning a gallery document was the case
// that survived: reads landed, then the clone's write never returned and the
// button sat in its loading state forever (e2e "clone creates an owned draft").
// experimentalAutoDetectLongPolling was no better — it measured identically to
// leaving it alone, so whatever it detects, it does not detect this.
//
// Upstream: https://github.com/firebase/firebase-js-sdk/issues/9789 — open, no
// root cause, filed against Safari 26.4 where 26.2 was fine. Keyed off the
// engine rather than a version because 26.5 measured just as broken, so "the
// next release" is not a safe thing to wait for. useFetchStreams is a private
// SDK setting, so it may move without a breaking-change note; if it stops
// having any effect, the measurement below is what says so.
//
// TO RETIRE THIS: swap the ternary below for a plain getFirestore, then point a
// recent playwright-core's webkit at the dev server and time 30 loadDocument
// calls with a 5s ceiling each. Still broken reads as ~15 of 30 never settling;
// fixed reads as 0. Chromium is the control and has always been 0 of 30. A
// newer WebKit than the one on hand comes from installing a newer
// playwright-core in a scratch directory — no need to upgrade this project's.
const isWebKit = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
export const firebaseDb = isWebKit
  // `useFetchStreams` is not in the public FirestoreSettings type — it is one of
  // the SDK's PrivateSettings, hence the cast.
  ? initializeFirestore(firebaseApp, { useFetchStreams: false } as FirestoreSettings)
  : getFirestore(firebaseApp);
export const firebaseStorage = getStorage(firebaseApp);
export const firebaseAuth = getAuth(firebaseApp);

// Emulator wiring belongs with the handles: it has to run before anything uses
// them, and this module is evaluated before any importer's body.
if (isLocalhost) {
  console.log('Running on localhost - using Firebase Emulators');
  connectFirestoreEmulator(firebaseDb, 'localhost', 8080);
  connectAuthEmulator(firebaseAuth, 'http://localhost:9099', { disableWarnings: true });
  connectStorageEmulator(firebaseStorage, 'localhost', 9199);
}
