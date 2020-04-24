(function() {

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

var db = firebase.firestore();

function getUniqueId() {
  const pathname = document.location.pathname;
  return pathname.split('/')[1];
}

function loadDocument(uniqueId) {

  let ref = db.collection("files").doc(uniqueId);

  ref.get().then( function(ref) {
    if (ref.exists) {
      let doc = ref.data();
      window.editor.setValue(doc.text);
    } else {
      console.log('invalid id');
    }
  }).catch(function(error) {
    console.error("Error reading document: ", error);
  });
}

function saveDocument(uniqueId, text) {

  let ref = db.collection("files").doc(uniqueId);

  document.getElementById('save').disabled = true;

  ref.set({
    text: text,
    modified: new Date()
  })
  .then(function(ref) {
    history.pushState({}, "Saved", "/" + uniqueId);
  })
  .catch(function(error) {
    console.error("Error adding document: ", error);
  })
  .finally(function() {
    document.getElementById('save').disabled = false;
  })
}

firebase.auth().onAuthStateChanged(function(user) {
  if (user) {
    const uniqueId = getUniqueId();
    if (uniqueId) {
      loadDocument(uniqueId);
    } else {
        window.editor.setValue(`<!-- sample rectangle -->\n<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">\n  <rect width="100" height="100" x="50" y="50" />\n</svg>`)
    }
  } else {
    firebase.auth().signInAnonymously().catch(function(error) {
      console.error("Unable to authenticate: " + error.message);
    });
  }
});

document.getElementById("save").addEventListener('click', function() {
  let uniqueId = getUniqueId() || Math.random().toString(36).substring(2) + Date.now().toString(36);
  let text = window.editor.getValue();
  saveDocument(uniqueId, text);
});

document.getElementById("file_upload").addEventListener('change', function () {
  var reader = new FileReader();
  reader.onload = function (e) {
    var data = e.target.result;
    data = data.replace("data:image/svg+xml;base64,", "");
    window.editor.setValue(window.atob(data));
  };
  reader.readAsDataURL(this.files[0]);
});

document.getElementById("download").addEventListener('click', function() {
  const text = window.editor.getValue();
  var uniqueId = getUniqueId() || Math.random().toString(36).substring(2) + Date.now().toString(36);
  var element = document.createElement('a');
  element.setAttribute('href', 'data:image/svg+xml;base64,' + window.btoa(text));
  element.setAttribute('download', uniqueId + ".svg");
  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
});


document.getElementById("upload").addEventListener('click', function() {

  document.getElementById("file_upload").click();
});

})();