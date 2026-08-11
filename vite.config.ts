/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { getBuildVersion } from './scripts/version.mjs';
import { getMonacoCdn } from './scripts/monaco.mjs';

const monaco = getMonacoCdn();

/**
 * Monaco does not request its stylesheet until its own JavaScript has parsed,
 * and renders without waiting for it — see getMonacoCdn. Starting the fetch
 * from the document head instead means the file is cached by then.
 *
 * This lands in the one shell, which serves the editor routes (`/` and
 * `/:fileId`) through Firebase's "**" rewrite. scripts/prerender.cjs strips it
 * back out of the static pages it writes for the content routes, none of which
 * ever mounts an editor.
 */
const monacoCssPreload: Plugin = {
  name: 'monaco-css-preload',
  transformIndexHtml: () => [
    // No crossorigin: Monaco appends a plain <link rel="stylesheet">, which is
    // a no-cors fetch, and a preload whose request mode differs is never
    // matched against it — the browser would fetch the ~300 KB twice and warn
    // that the preload went unused. No separate preconnect either: it would sit
    // next to this tag in the same head, so the preload opens the connection
    // just as early on its own.
    //
    // media mirrors EditorPage's isPhone query, inverted: the phone layout
    // mounts no editor at all, deliberately, so that it never pays for Monaco.
    // A preload is skipped outright when its media does not match, which keeps
    // the most constrained client from paying the one part of it that a plain
    // <link> in the shell would otherwise still fetch.
    {
      tag: 'link',
      attrs: { rel: 'preload', as: 'style', href: monaco.cssUrl, media: '(min-width: 36em)' },
      injectTo: 'head',
    },
  ],
};

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(getBuildVersion()),
    __MONACO_VS_PATH__: JSON.stringify(monaco.vsPath),
  },
  plugins: [react(), wasm(), monacoCssPreload],
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: 'hidden',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('svg-schema'))
            return 'svg-schema';
          if (id.includes('node_modules')) {
            if (id.includes('firebase'))
              return 'firebase';
            if (id.includes('@mantine'))
              return 'mantine';
            if (id.includes('@tabler'))
              return 'icons';
            if (id.includes('monaco-editor') || id.includes('@monaco-editor') || id.includes('react-dom') || id.includes('react-router') || id.includes('/react/'))
              return 'react';
          }
        },
      },
    },
  },
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
    exclude: ['e2e/**', '**/node_modules/**', 'api/dist/**'],
  },
});
