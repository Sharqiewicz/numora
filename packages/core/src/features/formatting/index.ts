/**
 * Numora Formatting Module
 *
 * Provides comprehensive number formatting with thousand separators and
 * sophisticated cursor position preservation for numeric input fields.
 *
 * @module formatting
 */

// === TYPES & CONSTANTS ===
export type { ChangeRange } from './constants';
export { GROUPING_CONFIG } from './constants';

// === NUMBER FORMATTING ===
export { formatWithSeparators } from './thousand-grouping';

// === CURSOR POSITION CALCULATION ===
export {
  calculateCursorPositionAfterFormatting,
  type CursorPositionOptions,
} from './cursor-position';

// === CHANGE DETECTION ===
export { findChangedRangeFromCaretPositions, findChangeRange } from './change-detection';

// === CARET BOUNDARY SYSTEM ===
export { getCaretBoundary, getCaretPosInBoundary } from './cursor-boundary';

// === CARET POSITION UTILITIES ===
export {
  computeCursorPosition,
  computeStripSeparatorsResult,
  skipOverThousandSeparatorOnDelete,
} from './caret-position-utils';
export type { StripSeparatorsResult } from './caret-position-utils';

// === DOM WRITES (undo-preserving) ===
export {
  writeValuePreservingUndo,
  writeStripPreservingUndo,
} from './dom-writes';
