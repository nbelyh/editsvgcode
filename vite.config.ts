import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ filename: 'stats.html', gzipSize: true }),
  ],
  build: {
    outDir: 'dist',
  },
  server: {
    port: 3000,
  },
});
