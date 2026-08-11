import { loader } from '@monaco-editor/react';

/**
 * The element @monaco-editor/react hands to editor.create(). Styled in App.css
 * to stay measurable — the library creates the editor while that element still
 * carries an inline display:none, and without the override Monaco measures 0x0.
 *
 * Only ever put this on the library's own container, via the `className` prop
 * of <Editor>/<DiffEditor>. On a wrapper the repo owns it would pull that
 * element out of flow and stretch it across the pane instead.
 */
export const MONACO_HOST_CLASS = 'esvg-monaco-host';

/**
 * Point the loader at the monaco-editor version this repo installs, rather than
 * the one @monaco-editor/loader hardcodes — see scripts/monaco.mjs.
 *
 * Called once from main.tsx, before any route renders. Deliberately not a
 * module-scope side effect of the editor component: the loader reads this when
 * the first editor mounts, and a screen that renders <DiffEditor> without
 * importing <Editor> would otherwise silently fall back to the library default.
 */
export function configureMonacoLoader() {
  loader.config({ paths: { vs: __MONACO_VS_PATH__ } });
}
