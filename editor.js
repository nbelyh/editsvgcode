require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });

require(['vs/editor/editor.main'], function () {

  Split(['#editor', '#output'], {
    gutterSize: 5
  });

  var editor = monaco.editor.create(document.getElementById('editor'), {
    theme: 'vs-dark', // dark theme
    language: 'xml',
      automaticLayout: true,
      // suggestOnTriggerCharacters: true,
      value: `<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">\n  <rect width="100" height="100" x="50" y="50" />\n</svg>`
  })

  // register a completion item provider for xml language
  monaco.languages.registerCompletionItemProvider('xml', getXmlCompletionProvider(monaco));

  function render() {
    document.getElementById('output').innerHTML = editor.getValue()
  }

  editor.onDidChangeModelContent((event) => {
    render();
  });

  render();

});
