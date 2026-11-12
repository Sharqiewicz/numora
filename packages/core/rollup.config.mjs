// Bundles the declaration tree `tsc` emits into one self-contained file per entry and
// module format. The tree uses extensionless relative imports, which Node16/NodeNext
// resolution rejects in ESM, and a single `.d.ts` cannot describe both the `.mjs` and the
// CommonJS `.js` build. `.d.mts` and `.d.cts` are picked by the `exports` map.
import dts from 'rollup-plugin-dts';

export default ['index', 'internal', 'pipeline'].map((entry) => ({
  input: `dist/${entry}.d.ts`,
  output: [{ file: `dist/${entry}.d.mts` }, { file: `dist/${entry}.d.cts` }],
  plugins: [dts()],
}));
