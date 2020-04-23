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

firebase.auth().signInAnonymously().catch(function(error) {
  // Handle Errors here.
  var errorCode = error.code;
  var errorMessage = error.message;
  // ...
});

function load(uniqueId) {
  var ref = firebase.storage().ref();
  let file = ref.child(uniqueId);

  file.getString()
}

function save() {
 
  var ref  = firebase.storage().ref();

  let uniqueId = Math.random().toString(36).substring(2) + Date.now().toString(36);
  let file = ref.child(uniqueId);

  let text = window.editor.getValue();
  file.putString(text).then(function(r) {
    alert('done');
  })
}
