/**
 * Numora Formatting Module
 *
 * Provides comprehensive number formatting with thousand separators and
 * sophisticated cursor position preservation for numeric input fields.
 *
 * @module formatting
 */

// === TYPES & CONSTANTS ===
export type { thousandStyle, ChangeRange } from './constants';
export { GROUPING_CONFIG } from './constants';

// === NUMBER FORMATTING ===
export { formatWithSeparators } from './thousand-grouping';

// === CURSOR POSITION CALCULATION ===
export {
  calculateCursorPositionAfterFormatting,
  type CursorPositionOptions,
  type IsCharacterEquivalent,
} from './cursor-position';

// === CHANGE DETECTION ===
export { findChangedRangeFromCaretPositions, findChangeRange } from './change-detection';

// === CARET BOUNDARY SYSTEM ===
export { getCaretBoundary, getCaretPosInBoundary } from './cursor-boundary';

// === CHARACTER EQUIVALENCE ===
export {
  defaultIsCharacterEquivalent,
} from './character-equivalence';

// === CARET POSITION UTILITIES ===
export {
  setCaretPosition,
  setCaretPositionWithRetry,
  getInputCaretPosition,
} from './caret-position-utils';

// === DIGIT COUNTING UTILITIES ===
// These are primarily for internal use but exported for advanced use cases
export {
  countMeaningfulDigitsBeforePosition,
  findPositionForDigitIndex,
  findPositionWithMeaningfulDigitCount,
  isPositionOnSeparator,
} from './digit-counting';
