#!/usr/bin/env node
/**
 * Docs-drift gate.
 *
 * `handleOnChangeNumoraInput` appeared in three documents describing an API that does not
 * exist, and survived a full v5 rename sweep. So did `maxDecimals` (renamed to
 * `decimalMaxLength`) and `onRawValueChange` (renamed to `onValueChange`).
 *
 * Deliberately a denylist, not a general "every identifier in a code fence must exist"
 * heuristic. The broad version drowns in false positives - `useState`, `console`, every
 * local variable in every example - and a gate that cries wolf gets disabled within a
 * month. This one only fires on identifiers we have already had to purge once.
 *
 * To retire an entry: delete it here, in the same commit that legitimately reintroduces
 * the name. That makes the reintroduction a deliberate, reviewable act.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Allowlist, not "every .md in the repo". The repo carries ~20 root-level analysis
 * documents (ARTICLE.md, DX_V5.md, WHY_NUMORA.md, june_audit.md, plans/*, ...) that are
 * point-in-time records - several of them are literally the write-ups OF the v5 rename,
 * so they must name the old identifiers to make sense. Scanning everything produced 55
 * "violations", none of them real. These are the documents a user or contributor is
 * actually pointed at; they are the ones that must stay true.
 *
 * `docs/adr/` is excluded for the same reason as the analysis docs: ADRs record decisions
 * as they were made.
 */
const GATED_FILES = [
  'README.md',
  'CLAUDE.md',
  'CONTEXT.md',
  'DEVELOPER_GUIDE.md',
  'packages/core/README.md',
  'packages/core/INPUT_EVENTS.md',
  'packages/react/README.md',
  'docs/README.md',
  'docs/agents/domain.md',
  'docs/agents/issue-tracker.md',
  'docs/agents/triage-labels.md',
];

// Identifiers purged from the source but previously documented. Each entry records why,
// so a future reader can tell a stale doc from a deliberate revival.
const DENYLIST = [
  {
    token: 'handleOnChangeNumoraInput',
    reason: 'never existed; the real handler is handleOnBeforeInputNumoraInput',
  },
  { token: 'handleNumoraOnBeforeInput', reason: 'renamed to handleOnBeforeInputNumoraInput' },
  { token: 'onRawValueChange', reason: 'renamed to onValueChange in v5' },
  { token: 'maxDecimals', reason: 'renamed to decimalMaxLength in v5' },
  { token: 'ThousandStyle', reason: 'renamed to GroupingStyle in v5' },
  {
    token: 'input-pattern',
    reason:
      'utils/input-pattern.ts never existed; the pattern attribute is built inline in NumoraInput.createInputElement',
  },
  {
    token: 'getNumoraPattern',
    reason:
      'never existed; the pattern attribute is built inline in NumoraInput.createInputElement',
  },
  {
    token: 'handleNumoraOnPaste',
    reason: 'never existed; the real handler is handleOnPasteNumoraInput',
  },
];

const violations = [];

for (const file of GATED_FILES) {
  const full = join(root, file);
  // A gated file that has been deleted or moved is itself drift - fail rather than
  // silently shrink the gate's coverage.
  if (!existsSync(full)) {
    console.error(`✗ Gated doc missing: ${file}`);
    console.error('  If it was intentionally removed or renamed, update GATED_FILES.');
    process.exit(1);
  }

  readFileSync(full, 'utf8')
    .split('\n')
    .forEach((line, i) => {
      for (const { token, reason } of DENYLIST) {
        // Word-boundary match, so `decimalMaxLength` does not trip the `maxDecimals` rule.
        if (new RegExp(`\\b${token}\\b`).test(line)) {
          violations.push({ file, line: i + 1, token, reason, text: line.trim() });
        }
      }
    });
}

if (violations.length > 0) {
  console.error(
    `✗ Docs drift: ${violations.length} reference(s) to removed/renamed identifiers.\n`
  );
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}  ${v.token}`);
    console.error(`    ${v.reason}`);
    console.error(`    > ${v.text.slice(0, 100)}\n`);
  }
  console.error(
    'Update the doc, or move the reference into docs/adr/ if it is a historical record.'
  );
  process.exit(1);
}

console.log('✓ Docs drift: no references to removed/renamed identifiers.');
