/**
 * `numora/internal` - low-level wiring shared with `numora-react`.
 *
 * These are the DOM-event and undo-preserving-write primitives the React component reuses
 * to drive an `<input>`. They are NOT a stable consumer-facing API and are not meant for
 * app code - build a `NumoraInput` (vanilla or React) instead. Anything here may change
 * between minor versions without a breaking-change note.
 *
 * Pure utilities that ARE part of the public surface (sanitizeNumoraInput, the expand/remove
 * pipeline functions, locale helpers, formatValueForDisplay, validateNumoraInputOptions, ...)
 * stay on the package root, `'numora'`.
 */
export {
  handleOnBeforeInputNumoraInput,
  handleOnPasteNumoraInput,
  handleOnKeyDownNumoraInput,
} from './utils/event-handlers';
export {
  writeValuePreservingUndo,
  writeStripPreservingUndo,
  computeStripSeparatorsResult,
  type StripSeparatorsResult,
} from './features/formatting';
// Default separators so the React adapter resolves options identically to the vanilla
// class before validation (single source of truth for the defaults).
export {
  DEFAULT_THOUSAND_SEPARATOR,
  DEFAULT_DECIMAL_SEPARATOR,
} from './config';
