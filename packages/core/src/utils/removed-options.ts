import { isProduction } from './locale';

// Options renamed or removed since v4, with what replaces each. Not aliased (deliberate
// break): each is ignored, kept off the DOM and warned about in development.
const REMOVED: Record<string, string> = {
  enableNegative: 'allowNegative',
  enableLeadingZeros: 'allowLeadingZeros',
  enableCompactNotation: 'allowCompactNotation',
  enableScientificNotation: 'allowScientificNotation',
  autoAddLeadingZero: 'padLeadingZero',
  thousandStyle: 'groupingStyle',
  maxDecimals: 'decimalMaxLength',
  rawValueMode: 'e.target.value',
  emitRawValue: 'the onChange `value`',
  defaultValue: 'value',
};

/** Deletes every removed option from `options` (mutating it) and returns their names. */
export function takeRemovedOptions(options: object): string[] {
  const bag = options as Record<string, unknown>;
  return Object.keys(REMOVED).filter((k) => k in bag && delete bag[k]);
}

/** Development-only: names the replacement for each removed option. */
export function warnRemovedOptions(names: string[]): void {
  if (!isProduction())
    for (const k of names) console.warn(`[numora] ${k} is removed in v5; use ${REMOVED[k]}`);
}
