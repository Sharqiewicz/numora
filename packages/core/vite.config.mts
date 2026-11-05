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
    // Clear stale hashed `internal-*` chunks between builds: `files: ["dist"]` publishes
    // the whole directory, so leftovers from earlier builds would ship to npm. Safe because
    // `tsc --emitDeclarationOnly` runs after Vite in the build script.
    emptyOutDir: true,
  },
  test: {
    environment: 'jsdom',
  },
});
