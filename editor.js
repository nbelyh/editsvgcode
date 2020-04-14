require.config({ paths: { 'vs': '../node_modules/monaco-editor/min/vs' } });

require(['vs/editor/editor.main'], function () {

  var editor = monaco.editor.create(document.getElementById('container'), {
    theme: 'vs-dark', // dark theme
    language: 'xml',
    // suggestOnTriggerCharacters: true,
    value: `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" version="1.1">\n  <rect width="200" height="100" />\n</svg>`
  })

  // register a completion item provider for xml language
  monaco.languages.registerCompletionItemProvider('xml', getXmlCompletionProvider(monaco));
});
