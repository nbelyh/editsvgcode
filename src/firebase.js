import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/analytics';
import 'firebase/compat/auth';

export function EditSvgCodeDb() {

  var firebaseConfig = {
    apiKey: "AIzaSyDFV9DY9TO1wKlKa4JNlG-J3XPh162X6tk",
    authDomain: "editsvgcode-db.firebaseapp.com",
    databaseURL: "https://editsvgcode-db.firebaseio.com",
    projectId: "editsvgcode-db",
    storageBucket: "editsvgcode-db.appspot.com",
    messagingSenderId: "112195396800",
    appId: "1:112195396800:web:2d89974b60aacf6ac3b925",
    measurementId: "G-EZ58N4GC8Z"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  firebase.analytics();

  this.db = firebase.firestore();

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      document.dispatchEvent(new Event('dbinit'));
    } else {
      firebase.auth().signInAnonymously().catch(function (error) {
        console.error("Unable to authenticate: " + error.message);
      });
    }
  });
}

EditSvgCodeDb.prototype.loadDocument = function(uniqueId) {

  let ref = this.db.collection("files").doc(uniqueId);
  return new Promise(function(resolve, reject) {

    ref.get().then(function (ref) {
      if (ref.exists) {
        let doc = ref.data();
        resolve(doc.text);
      } else {
        console.warn('file id does not exist: ' + uniqueId);
        resolve('')
      }
    }).catch(function (error) {
      console.error("Error reading document: ", error);
      reject(error);
    });
  })
}

EditSvgCodeDb.prototype.saveDocument = function(uniqueId, text) {

  let ref = this.db.collection("files").doc(uniqueId);
  return new Promise(function(resolve, reject) {

    ref.set({
      text: text,
      modified: new Date()
    })
    .then(function (ref) {
      resolve(ref);
    })
    .catch(function (error) {
      console.error("Error adding document: ", error);
      reject(error);
    })
  });
}
