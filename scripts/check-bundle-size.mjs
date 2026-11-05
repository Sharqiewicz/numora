#!/usr/bin/env node
/**
 * Bundle-size gate.
 *
 * Exists because the published "5.46 KB" figure understated real cost to React consumers
 * by ~2x. `numora-react` externalizes `numora` (it is a peerDependency, and dist/index.mjs
 * imports from 'numora' and 'numora/internal'), so a React consumer installs BOTH bundles.
 * Quoting the per-package number alone is the exact error this gate exists to prevent -
 * so the consumer total is reported and budgeted as a first-class number, not a footnote.
 *
 * The same error hid one level down until 2026-09-05: the core Vite build has two entries
 * (`index`, `internal`), so Vite hoists everything they share into a hashed
 * `internal-*.mjs` chunk that `index.mjs` imports. Measuring `index.mjs` alone reported
 * ~5.8 KB when a consumer actually loads ~10 KB. The gate now follows each entry's local
 * chunk imports and budgets the sum. Budgets were re-based on that honest number.
 *
 * Note that both bundles ship unminified with comments (consumers' bundlers minify), so
 * doc-comment prose counts here. Roughly 40% of each figure is comments.
 *
 * Run after `pnpm build`. Exits non-zero if any budget is exceeded.
 */
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Budgets in KB (gzip, entry + the local chunks it imports). Re-based 2026-09-05 after the
// audit-fix PRs (linear notation scanners, Unicode digit normalization, separator-aware
// deletion, display-path unification) with ~0.4 KB headroom each, so ordinary maintenance
// does not trip the gate but a new dependency or a large feature does.
//   2026-08-05 (index.mjs only):   numora 5.77   numora-react 5.39
//   2026-09-05 (entry + chunk):    numora 11.36  numora-react 6.17
//   2026-09-05 (second audit):     numora 12.25  numora-react 7.71  consumer total 19.96
//     Both re-based after the second-audit fixes (raw-compared controlled echo,
//     readOnly paste guard, stable isAllowed wrapper, resting-display autofill path,
//     -0 normalization, non-ASCII decimal-separator normalization, thousand-key rejection,
//     grouped-value pattern attribute). In numora-react ~0.24 KB of the +1.54 KB is code; the rest is the explanatory
//     comments those fixes carry, which ship because this bundle is unminified. If the
//     budget matters more than shipped comments, strip them at build time instead.
const BUDGETS = [
  { name: 'numora', file: 'packages/core/dist/index.mjs', budgetKb: 12.65 },
  { name: 'numora-react', file: 'packages/react/dist/index.mjs', budgetKb: 8.1 },
];

// A React consumer ships core + react. Budget the sum explicitly.
const CONSUMER_TOTAL_BUDGET_KB = 20.4;

// Entry plus every sibling chunk it imports (`from "./internal-XXXX.mjs"`), one level
// deep - Vite emits a flat chunk graph for this lib, so that is the full closure.
const gzipKb = (path) => {
  const source = readFileSync(join(root, path), 'utf8');
  const chunks = [...source.matchAll(/from\s+["'](\.\/[^"']+)["']/g)].map((m) => m[1]);
  const files = [
    source,
    ...[...new Set(chunks)].map((c) => readFileSync(join(dirname(join(root, path)), c), 'utf8')),
  ];
  return files.reduce((sum, text) => sum + gzipSync(text).length / 1024, 0);
};

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

const total = rows.reduce((sum, r) => sum + r.kb, 0);
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
