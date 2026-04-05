import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import MonacoEditor, { type OnMount } from '@monaco-editor/react';
import type { editor as monacoEditor } from 'monaco-editor';
import { registerSvgProviders } from '../lib/completion-provider';
import { formatXml } from '../lib/svg-utils';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
}

export interface EditorHandle {
  selectRange: (startLine: number, startCol: number, endLine: number, endCol: number) => void;
  clearSelection: () => void;
  openCommandPalette: () => void;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor({ value, onChange, readOnly }, ref) {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);

  useImperativeHandle(ref, () => ({
    selectRange(startLine: number, startCol: number, endLine: number, endCol: number) {
      const ed = editorRef.current;
      if (!ed) return;
      ed.revealRangeInCenter({ startLineNumber: startLine, startColumn: startCol, endLineNumber: endLine, endColumn: endCol });
      ed.setSelection({ startLineNumber: startLine, startColumn: startCol, endLineNumber: endLine, endColumn: endCol });
    },
    clearSelection() {
      const ed = editorRef.current;
      if (!ed) return;
      const pos = ed.getPosition();
      if (pos) ed.setSelection({ startLineNumber: pos.lineNumber, startColumn: pos.column, endLineNumber: pos.lineNumber, endColumn: pos.column });
    },
    openCommandPalette() {
      const ed = editorRef.current;
      if (!ed) return;
      ed.focus();
      // Delay trigger until after focus lands
      setTimeout(() => ed.trigger('sidebar', 'editor.action.quickCommand', null), 0);
    },
  }), []);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;

    // Expose for E2E tests (stripped from production builds by Vite)
    if (import.meta.env.DEV) {
      (window as any).__test_monaco_editor = editor;
      (window as any).__test_formatXml = formatXml;
    }

    if (!(monaco as any).__svgProvidersRegistered) {
      registerSvgProviders(monaco);
      (monaco as any).__svgProvidersRegistered = true;
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
        fixedOverflowWidgets: true,
      }}
    />
  );
});
