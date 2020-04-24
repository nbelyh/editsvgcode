(function () {


  require.config({ paths: { 'vs': 'node_modules/monaco-editor/min/vs' } });

  require(['vs/editor/editor.main'], function () {

    Split(['#editor', '#output'], {
      gutterSize: 5
    });

    window.editor = monaco.editor.create(document.getElementById('editor'), {
      theme: 'vs-dark', // dark theme
      language: 'xml',
      automaticLayout: true,
      tabSize: 2,
      // suggestOnTriggerCharacters: true,
    })

    // register a completion item provider for xml language
    monaco.languages.registerCompletionItemProvider('xml', getXmlCompletionProvider(monaco));

    function render() {
      document.getElementById('output').innerHTML = window.editor.getValue()
    }

    window.editor.onDidChangeModelContent((event) => {
      render();
    });

    render();

  });

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

})();
