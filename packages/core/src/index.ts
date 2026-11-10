/**
 * Public API surface for `numora`.
 *
 * Exposes the `NumoraInput` class, the option enums/types, and the pure string utilities
 * that make up the sanitization/formatting pipeline (usable standalone). The low-level
 * DOM-event and undo-preserving-write primitives that only the React package needs live
 * at `'numora/internal'` - public for that package's benefit, but not a stable contract.
 */
export * from './NumoraInput';
export { GroupingStyle, FormatOn, InputType } from './types';
export type { FormattingOptions, LocaleTag, NumoraValues } from './types';
export { getSeparatorsFromLocale, applyLocale } from './utils/locale';
export {
  formatValueForDisplay,
  normalizeNegativeZero,
  displayToRawValue,
} from './utils/format-utils';
export { validateNumoraInputOptions } from './validation';

// Pure sanitization/formatting utilities - standalone-usable public API.
export { sanitizeNumoraInput, removeThousandSeparators } from './features/sanitization';
export type { ValueSource } from './features/sanitization';
export { normalizeForeignFormat } from './features/foreign-format';
export { filterMobileKeyboardArtifacts } from './features/mobile-keyboard-filtering';
export { normalizeDigits } from './features/fullwidth-digits';
export { normalizeUnicodeMinus } from './features/unicode-minus';
export { expandCompactNotation } from './features/compact-notation';
export { expandScientificNotation } from './features/scientific-notation';
export { removeNonNumericCharacters } from './features/non-numeric-characters';
export { removeExtraDecimalSeparators } from './features/decimals';
export { removeLeadingZeros } from './features/leading-zeros';
export { prependLeadingZero } from './features/prepend-leading-zero';
export { truncateToMaxLength } from './features/max-length';
