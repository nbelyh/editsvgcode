import { useRef, useEffect } from 'react';
import MonacoEditor, { type OnMount } from '@monaco-editor/react';
import type { editor as monacoEditor } from 'monaco-editor';
import { registerSvgProviders } from '../lib/completion-provider';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
}

export function Editor({ value, onChange, readOnly }: EditorProps) {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const providersRegistered = useRef(false);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    if (!providersRegistered.current) {
      registerSvgProviders(monaco);
      providersRegistered.current = true;
    }
  };

  // Keep editor readOnly in sync
  useEffect(() => {
    editorRef.current?.updateOptions({ readOnly });
  }, [readOnly]);

  return (
    <MonacoEditor
      height="100%"
      language="xml"
      theme="vs-dark"
      value={value}
      onChange={(v) => onChange(v ?? '')}
      onMount={handleMount}
      options={{
        automaticLayout: true,
        tabSize: 2,
        readOnly,
        minimap: { enabled: false },
      }}
    />
  );
}
