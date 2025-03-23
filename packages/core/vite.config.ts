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
      name: 'Numora',
      fileName: 'index',
      formats: ['es'],
    },
    outDir: 'dist',
    rollupOptions: {
      external: ['bignumber.js'],
      output: {
        globals: { 'bignumber.js': 'BigNumber' },
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
