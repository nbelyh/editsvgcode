/**
 * Where the editor is loaded from at runtime.
 *
 * Monaco is never bundled — @monaco-editor/loader fetches it from a CDN — so
 * the version that actually ships is a URL rather than a lockfile entry. That
 * URL is derived here from the installed monaco-editor package, which is also
 * where Editor.tsx takes its types from. Upgrading is therefore one command:
 *
 *     npm i -D monaco-editor@<version>
 *
 * and the types can never end up describing a different editor than the one
 * users run.
 *
 * @monaco-editor/loader carries a hardcoded default CDN version of its own.
 * Editor.tsx pins paths.vs so that default is never reached: otherwise bumping
 * the loader would quietly move the editor, and the stylesheet index.html
 * preloads would stop being the one Monaco asks for.
 */
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const CDN_ORIGIN = 'https://cdn.jsdelivr.net';

/**
 * @returns {{ vsPath: string, cssUrl: string }}
 */
export function getMonacoCdn() {
  const { version } = require('monaco-editor/package.json');
  const vsPath = `${CDN_ORIGIN}/npm/monaco-editor@${version}/min/vs`;

  return {
    vsPath,
    /**
     * Monaco appends this stylesheet itself, but only once its ~900 KB of
     * JavaScript has downloaded and parsed — and it does not wait for the
     * result before rendering. On a throttled connection that left the editor
     * painting for a full second with none of its `position: absolute` rules
     * applied: every internal part stacked in normal flow, the hidden IME
     * textarea showed up as a real box, and the code sat ~80px too low until
     * the stylesheet landed and everything snapped into place. Preloading it
     * from the document head starts the download ~12s earlier, so it is already
     * cached when Monaco asks for it.
     */
    cssUrl: `${vsPath}/editor/editor.main.css`,
  };
}
