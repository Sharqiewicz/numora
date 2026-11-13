/**
 * Public API surface for `numora`: the `NumoraInput` class, its option types and enums,
 * the locale lookup, and the two headless functions (`formatValue`, `parseValue`).
 *
 * The individual sanitization steps live at `'numora/pipeline'`. The DOM-event and
 * DOM-write plumbing shared with `numora-react` lives at `'numora/internal'`,
 * which is not a stable contract.
 */
export * from './NumoraInput';
export { GroupingStyle, FormatOn } from './types';
export type { NumoraOptions, LocaleTag, NumoraValues } from './types';
export { getSeparatorsFromLocale } from './utils/locale';
export { formatValue, parseValue } from './headless';
