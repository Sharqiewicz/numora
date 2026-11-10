import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/index.tsx',
  output: [
    {
      file: 'dist/index.cjs',
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      interop: 'auto',
      // Lets Next.js App Router server components import the package without a wrapper.
      banner: "'use client';",
    },
    {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
      banner: "'use client';",
    },
  ],
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    // Minify and drop comments. directives: false keeps the 'use client' banner.
    terser({ compress: { directives: false }, format: { comments: false } }),
  ],
  // Predicate so subpath imports like 'numora/internal' are externalized too (a bare
  // string only matches the exact id, which would bundle the internal entry).
  external: (id) =>
    id === 'react' || id === 'react-dom' || id === 'numora' || id.startsWith('numora/'),
};
