import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import MonacoEditor, { type OnMount } from '@monaco-editor/react';
import type { editor as monacoEditor } from 'monaco-editor';
import { registerSvgProviders } from '../lib/completion-provider';
import { formatXml, findElementAtOffset } from '../lib/svg-utils';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  onCursorElement?: (element: string | undefined, lineRange: { start: number; end: number } | undefined, xpath: string | undefined) => void;
}

export interface EditorHandle {
  selectRange: (startLine: number, startCol: number, endLine: number, endCol: number) => void;
  clearSelection: () => void;
  openCommandPalette: () => void;
  undo: () => void;
  redo: () => void;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor({ value, onChange, readOnly, onCursorElement }, ref) {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const onCursorElementRef = useRef(onCursorElement);
  onCursorElementRef.current = onCursorElement;

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
    undo() {
      const ed = editorRef.current;
      if (!ed) return;
      ed.focus();
      ed.trigger('preview', 'undo', null);
    },
    redo() {
      const ed = editorRef.current;
      if (!ed) return;
      ed.focus();
      ed.trigger('preview', 'redo', null);
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

    editor.onDidChangeCursorPosition((e) => {
      const cb = onCursorElementRef.current;
      if (!cb) return;
      const model = editor.getModel();
      if (!model) return;
      const offset = model.getOffsetAt(e.position);
      const text = model.getValue();
      const result = findElementAtOffset(text, offset);
      if (result) {
        cb(result.element, { start: result.startLine, end: result.endLine }, result.xpath);
      } else {
        cb(undefined, undefined, undefined);
      }
    });
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
