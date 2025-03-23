import { defineConfig } from 'vite';

export default defineConfig({
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
});