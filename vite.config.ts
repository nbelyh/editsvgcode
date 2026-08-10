/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { getBuildVersion } from './scripts/version.mjs';

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(getBuildVersion()),
  },
  plugins: [react(), wasm()],
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
