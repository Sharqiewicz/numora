/**
 * `numora/internal` - low-level wiring shared with `numora-react`.
 *
 * These are the DOM-event and DOM-write primitives the React component reuses
 * to drive an `<input>`. They are NOT a stable consumer-facing API and are not meant for
 * app code - build a `NumoraInput` (vanilla or React) instead. Anything here may change
 * between minor versions without a breaking-change note.
 *
 * The public surface is the package root, `'numora'`, plus `'numora/pipeline'`.
 */
export { handleOnKeyDownNumoraInput } from './utils/event-handlers';
export { writeValue } from './features/formatting';
export {
  applyBeforeInput,
  applyBlur,
  applyInputFallback,
  applyPaste,
  applySetValue,
  attachFocusStrip,
  formatForDisplay,
  type ResolvedNumoraOptions,
} from './utils/dom-events';
// Locale + defaults + validation in one call, so the React adapter resolves options
// identically to the vanilla class.
export { resolveOptions } from './utils/resolve-options';
export { takeRemovedOptions, warnRemovedOptions } from './utils/removed-options';
// Whole-pipeline helpers and option plumbing the adapters and the test suites reach for.
export { InputType } from './types';
export { validateNumoraInputOptions } from './validation';
export { applyLocale, isProduction } from './utils/locale';
export { appValue, warnServerLocale } from './utils/app-value';
export { sanitizeNumoraInput, type ValueSource } from './features/sanitization';
export {
  formatValueForDisplay,
  displayToRawValue,
  normalizeNegativeZero,
} from './utils/format-utils';
