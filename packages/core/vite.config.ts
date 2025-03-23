import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'numora/core',
      fileName: 'index',
      formats: ['es'],
    },
    outDir: 'dist',
  },
  test: {
    environment: 'jsdom',
  },
});
