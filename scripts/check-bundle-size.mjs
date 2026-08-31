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
 * Run after `pnpm build`. Exits non-zero if any budget is exceeded.
 */
import { gzipSync } from 'node:zlib';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

// Budgets in KB (gzip). Set with modest headroom over the 2026-08-05 measurements so
// ordinary maintenance does not trip the gate, but a new dependency or a large feature does.
const BUDGETS = [
  { name: 'numora', file: 'packages/core/dist/index.mjs', budgetKb: 6.0 },
  { name: 'numora-react', file: 'packages/react/dist/index.mjs', budgetKb: 6.0 },
];

// A React consumer ships core + react. Budget the sum explicitly.
const CONSUMER_TOTAL_BUDGET_KB = 12.0;

const gzipKb = (path) => gzipSync(readFileSync(join(root, path))).length / 1024;

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
  console.log(`  ${r.over ? '✗' : '✓'} ${pad(r.name, 14)} ${pad(fmt(r.kb), 10)} budget ${fmt(r.budgetKb)}`);
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
