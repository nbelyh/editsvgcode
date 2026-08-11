import { useRef, useEffect, useCallback, useImperativeHandle, forwardRef } from 'react';
import MonacoEditor, { type OnMount } from '@monaco-editor/react';
import type { editor as monacoEditor } from 'monaco-editor';
import { EditorPlaceholder } from './EditorPlaceholder';
import { MONACO_HOST_CLASS } from '../lib/monaco';
import { registerSvgProviders } from '../lib/completion-provider';
import { formatXml, findElementAtOffset } from '../lib/svg-utils';
import { getElementBounds } from '../lib/svg-bounds';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  theme?: string;
  onCursorElement?: (element: string | undefined, lineRange: { start: number; end: number } | undefined, xpath: string | undefined) => void;
}

export interface EditorHandle {
  selectRange: (startLine: number, startCol: number, endLine: number, endCol: number) => void;
  clearSelection: () => void;
  openCommandPalette: () => void;
  undo: () => void;
  redo: () => void;
}

export const Editor = forwardRef<EditorHandle, EditorProps>(function Editor({ value, onChange, readOnly, theme, onCursorElement }, ref) {
  const editorRef = useRef<monacoEditor.IStandaloneCodeEditor | null>(null);
  const onCursorElementRef = useRef(onCursorElement);
  onCursorElementRef.current = onCursorElement;
  const historySettledRef = useRef(false);
  // Read inside settleHistory, which must not be re-created when readOnly moves
  // — it is called from onMount, which only ever sees its first value.
  const readOnlyRef = useRef(readOnly);
  readOnlyRef.current = readOnly;

  /**
   * Make the loaded document the editor's first undoable state.
   *
   * The document arrives after the editor has already mounted holding the
   * "Loading please wait..." stand-in, and @monaco-editor/react applies it with
   * executeEdits plus an undo stop — its own options effect has already turned
   * readOnly off by the time its value effect runs, so it takes the editable
   * path rather than setValue. That left the stand-in one Ctrl+Z beneath the
   * drawing: pressing undo once on a document that had just loaded, before
   * touching anything, replaced it with the stand-in. The autosave below only
   * checks readOnly, so it wrote that over the saved copy — and since the text
   * has no <svg>, the next load rejected it and fell back to the sample. The
   * drawing was gone.
   *
   * setValue is how the edit history is dropped: TextModel throws the command
   * manager away whenever the buffer is replaced wholesale. The text is already
   * correct whenever this runs, so re-seating it changes nothing on screen.
   *
   * Called from both onMount and the effect below because either can be last:
   * a slow document lands after the editor, a slow editor mounts after the
   * document. Whichever it is, this runs at the first moment there is both a
   * model and a loaded document, and the one-shot guard keeps it from ever
   * running again — flushing later would throw away the reader's own history.
   */
  const settleHistory = useCallback(() => {
    if (historySettledRef.current || readOnlyRef.current) return;
    const model = editorRef.current?.getModel();
    if (!model) return;
    historySettledRef.current = true;
    model.setValue(model.getValue());
  }, []);

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

    // The document may already have loaded while Monaco was still downloading,
    // in which case no later render arrives to trigger the effect below.
    settleHistory();

    // Expose for E2E tests (stripped from production builds by Vite)
    if (import.meta.env.DEV) {
      (window as any).__test_monaco_editor = editor;
      (window as any).__test_formatXml = formatXml;
      (window as any).__test_getElementBounds = getElementBounds;
    }

    if (!(monaco as any).__svgProvidersRegistered) {
      registerSvgProviders(monaco);
      (monaco as any).__svgProvidersRegistered = true;
    }

    // Alt+Z: toggle word wrap (not built into standalone Monaco)
    editor.addAction({
      id: 'editor.action.toggleWordWrap',
      label: 'Toggle Word Wrap',
      keybindings: [monaco.KeyMod.Alt | monaco.KeyCode.KeyZ],
      run(ed) {
        const current = ed.getOption(monaco.editor.EditorOption.wordWrap);
        const next = current === 'on' ? 'off' : 'on';
        ed.updateOptions({ wordWrap: next });
        localStorage.setItem('esvg-editor-wordWrap', next);
      },
    });

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

  // Runs after @monaco-editor/react's own effects, which belong to a child and
  // have already put the loaded text in the model by this point.
  useEffect(() => {
    settleHistory();
  }, [readOnly, value, settleHistory]);

  // Resolved once: the placeholder has to default the same way the editor does,
  // or omitting the prop hands you a light stand-in followed by a dark editor —
  // the very flash the placeholder exists to avoid.
  const resolvedTheme = theme || 'vs-dark';

  return (
    <MonacoEditor
      height="100%"
      language="xml"
      theme={resolvedTheme}
      value={value}
      onChange={(v) => onChange(v ?? '')}
      onMount={handleMount}
      className={MONACO_HOST_CLASS}
      // Replaces the default "Loading..." label — see EditorPlaceholder.
      loading={<EditorPlaceholder value={value} theme={resolvedTheme} />}
      options={{
        automaticLayout: true,
        tabSize: 2,
        readOnly,
        minimap: { enabled: localStorage.getItem('esvg-editor-minimap') === 'true' },
        fixedOverflowWidgets: true,
        wordWrap: (localStorage.getItem('esvg-editor-wordWrap') as 'on' | 'off') || 'off',
      }}
    />
  );
});
