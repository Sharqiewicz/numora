import { defineConfig, transformWithEsbuild } from 'vite';
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
        pipeline: 'src/pipeline.ts',
      },
      formats: ['es', 'cjs'],
      // Multiple entries: emit `<name>.mjs` (es) and `<name>.js` (cjs) per entry so the
      // package.json exports map for '.', './internal' and './pipeline' resolves consistently.
      fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'mjs' : 'js'}`,
    },
    // Clear stale hashed `internal-*` chunks between builds: `files: ["dist"]` publishes
    // the whole directory, so leftovers from earlier builds would ship to npm. Safe because
    // `tsc --emitDeclarationOnly` runs after Vite in the build script.
    emptyOutDir: true,
    sourcemap: true,
    // Vite never strips whitespace from ES library output, and its esbuild pass re-prints
    // whatever a normal plugin minified. Output plugins run after it, so minify there.
    minify: false,
    rollupOptions: {
      output: {
        // One shared chunk for everything the three entries have in common. Left to itself
        // Rollup splits it in two (pipeline steps / the rest), which costs ~0.2 KB gzip for
        // a consumer of the root entry, who loads both anyway.
        manualChunks: (id) => (/src\/(index|internal|pipeline)\.ts$/.test(id) ? undefined : 'shared'),
        plugins: [
          {
            name: 'minify-lib',
            renderChunk: (code, chunk) =>
              transformWithEsbuild(code, chunk.fileName, {
                minify: true,
                sourcemap: true,
                legalComments: 'none',
              }),
          },
        ],
      },
    },
  },
  test: {
    environment: 'jsdom',
  },
});
