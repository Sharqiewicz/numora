/**
 * Numora Formatting Module
 *
 * Provides comprehensive number formatting with thousands separators and
 * sophisticated cursor position preservation for numeric input fields.
 *
 * @module formatting
 */

// === TYPES & CONSTANTS ===
export type { ThousandsGroupStyle, ChangeRange } from './constants';
export { GROUPING_CONFIG } from './constants';

// === NUMBER FORMATTING ===
export { formatWithSeparators } from './thousands-grouping';

// === CURSOR POSITION CALCULATION ===
export { calculateCursorPositionAfterFormatting } from './cursor-position';

// === CHANGE DETECTION ===
export { findChangedRangeFromCaretPositions, findChangeRange } from './change-detection';

// === DIGIT COUNTING UTILITIES ===
// These are primarily for internal use but exported for advanced use cases
export {
  countMeaningfulDigitsBeforePosition,
  findPositionForDigitIndex,
  findPositionWithMeaningfulDigitCount,
  isPositionOnSeparator,
} from './digit-counting';
