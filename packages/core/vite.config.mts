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
      entry: {
        index: 'src/index.ts',
        internal: 'src/internal.ts',
      },
      formats: ['es', 'cjs'],
      // Multiple entries: emit `<name>.mjs` (es) and `<name>.js` (cjs) per entry so the
      // package.json exports map for both '.' and './internal' resolves consistently.
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'js'}`,
    },
    emptyOutDir: false,
  },
  test: {
    environment: 'jsdom',
  },
});
