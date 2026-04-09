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
      name: 'numora',
      fileName: 'index',
      formats: ['es', 'cjs'],
    },
    emptyOutDir: false,
  },
  test: {
    environment: 'jsdom',
  },
});
