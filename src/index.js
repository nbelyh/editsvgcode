
require('file-loader?name=[name].[ext]!../index.html');
require('file-loader?name=[name].[ext]!../readme-picture.png');

import * as monaco from 'monaco-editor';

import tippy from 'tippy.js';

import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'tippy.js/dist/tippy.css'
import './main.css'

import Split from 'split.js';

import { getXmlCompletionProvider, getXmlHoverProvider } from './completion-provider';
import { EditSvgCodeDb }  from './firebase';

Split(['#editor', '#output'], {
  gutterSize: 5
});

const editor = monaco.editor.create(document.getElementById('editor'), {
  theme: 'vs-dark', // dark theme
  language: 'xml',
  automaticLayout: true,
  tabSize: 2,
  value: "Loading please wait...",
  readOnly: true
  // suggestOnTriggerCharacters: true,
})

// register a completion item provider for xml language
monaco.languages.registerCompletionItemProvider('xml', getXmlCompletionProvider(monaco));
monaco.languages.registerHoverProvider('xml', getXmlHoverProvider(monaco));

function render() {
  document.getElementById('output').innerHTML = editor.getValue()
}

editor.onDidChangeModelContent((event) => {
  render();
});

var db = new EditSvgCodeDb();

function getUniqueId() {
  return document.location.pathname.split('/')[1];
}

function getNewUniqueId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

const btnSave = document.getElementById("save");
btnSave.addEventListener('click', function () {
  let uniqueId = getUniqueId() || getNewUniqueId();
  let text = editor.getValue();

  btnSave.disabled = true;
  db.saveDocument(uniqueId, text)
    .then(function () {
      history.pushState({}, "Saved", "/" + uniqueId);
    })
    .finally(function () {
      btnSave.disabled = false;
    })

});

document.getElementById("file_upload").addEventListener('change', function () {
  var reader = new FileReader();
  reader.onload = function (e) {
    var data = e.target.result;
    data = data.replace("data:image/svg+xml;base64,", "");
    editor.setValue(window.atob(data));
  };
  reader.readAsDataURL(this.files[0]);
});

document.getElementById("download").addEventListener('click', function () {
  const text = editor.getValue();
  var uniqueId = getUniqueId() || getNewUniqueId();
  var element = document.createElement('a');
  element.setAttribute('href', 'data:image/svg+xml;base64,' + window.btoa(text));
  element.setAttribute('download', uniqueId + ".svg");
  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
});

document.getElementById("upload").addEventListener('click', function () {
  document.getElementById("file_upload").click();
});

document.addEventListener('dbinit', function () {
  const uniqueId = getUniqueId();
  if (uniqueId) {
    db.loadDocument(uniqueId)
      .then(function (text) {
        editor.setValue(text);
        editor.updateOptions({ readOnly: false })
      })
  } else {
    editor.setValue(`<!-- sample rectangle -->\n<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">\n  <rect width="100" height="100" x="50" y="50" />\n</svg>`);
    editor.updateOptions({ readOnly: false })
  }
})

tippy('#upload', {
  content: 'Upload a SVG file from local computer to edit',
  theme: 'editsvgcode'
});

tippy('#download', {
  content: 'Download the file to the local computer',
  theme: 'editsvgcode'
});

tippy('#save', {
  content: 'Save the contents of the file in the cloud',
  theme: 'editsvgcode'
})
