#!/usr/bin/env node
/**
 * Bundle-size gate (gzip, ESM). Run after `pnpm build`; exits non-zero over budget.
 *
 * `numora-react` externalizes `numora` (a peerDependency), so a React consumer installs
 * both bundles: the consumer total is budgeted as a first-class number. Each core entry
 * also imports a hashed `internal-*.mjs` chunk Vite hoists shared code into, so every
 * entry is measured together with the chunks it imports.
 *
 * Both bundles ship minified without comments, so these are close to what a consumer's
 * bundler ends up with.
 */
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Budgets in KB (gzip, entry + the local chunks it imports).
const BUDGETS = [
  { name: 'numora', file: 'packages/core/dist/index.mjs', budgetKb: 14.1 },
  { name: 'numora-react', file: 'packages/react/dist/index.mjs', budgetKb: 8.1 },
];

// A React consumer ships core + core/internal + react. Budget the sum explicitly.
const CONSUMER_TOTAL_BUDGET_KB = 22.2;

// The files an entry loads: itself plus every sibling chunk it imports
// (`from "./internal-XXXX.mjs"`), one level deep - Vite emits a flat chunk graph for
// this lib, so that is the full closure.
const closure = (path) => {
  const abs = join(root, path);
  const source = readFileSync(abs, 'utf8');
  const chunks = [...source.matchAll(/from\s*["'](\.\/[^"']+)["']/g)].map((m) => m[1]);
  return [...new Set([abs, ...chunks.map((c) => join(dirname(abs), c))])];
};
const gzipFilesKb = (files) =>
  files.reduce((sum, f) => sum + gzipSync(readFileSync(f, 'utf8')).length / 1024, 0);
const gzipKb = (path) => gzipFilesKb(closure(path));

// react imports 'numora/internal', so a React consumer also loads core's internal entry.
// It shares a hashed chunk with index.mjs, so count the union of files once.
const REACT_EXTRA_ENTRIES = ['packages/core/dist/internal.mjs'];

let failed = false;
const rows = [];

for (const { name, file, budgetKb } of BUDGETS) {
  let kb;
  try {
    kb = gzipKb(file);
  } catch {
    console.error(`✗ ${name}: ${file} not found. Run \`pnpm build\` first.`);
    process.exit(1);
  }
  const over = kb > budgetKb;
  failed ||= over;
  rows.push({ name, kb, budgetKb, over });
}

let total;
try {
  total = gzipFilesKb([
    ...new Set([...BUDGETS.map((b) => b.file), ...REACT_EXTRA_ENTRIES].flatMap(closure)),
  ]);
} catch {
  console.error('✗ React total: dist files not found. Run `pnpm build` first.');
  process.exit(1);
}
const totalOver = total > CONSUMER_TOTAL_BUDGET_KB;
failed ||= totalOver;

const fmt = (n) => `${n.toFixed(2)} KB`;
const pad = (s, n) => String(s).padEnd(n);

console.log('Bundle sizes (gzip, ESM):\n');
for (const r of rows) {
  console.log(
    `  ${r.over ? '✗' : '✓'} ${pad(r.name, 14)} ${pad(fmt(r.kb), 10)} budget ${fmt(r.budgetKb)}`
  );
}
console.log(
  `  ${totalOver ? '✗' : '✓'} ${pad('React total', 14)} ${pad(fmt(total), 10)} budget ${fmt(CONSUMER_TOTAL_BUDGET_KB)}` +
    '   <- what a React consumer actually installs'
);

if (failed) {
  console.error('\nBundle size budget exceeded. Either justify the growth and raise the');
  console.error('budget in scripts/check-bundle-size.mjs, or reduce the bundle.');
  process.exit(1);
}
console.log('\nAll bundle budgets met.');
