/**
 * Numora Formatting Module
 *
 * Provides comprehensive number formatting with thousand separators and
 * sophisticated cursor position preservation for numeric input fields.
 *
 * @module formatting
 */

// === TYPES & CONSTANTS ===

// === NUMBER FORMATTING ===
export { formatWithSeparators } from './thousand-grouping';

// === CARET POSITION UTILITIES ===
export {
  computeStripSeparatorsResult,
  skipOverThousandSeparatorOnDelete,
} from './caret-position-utils';

// === DOM WRITES (undo-preserving) ===
export { writeValuePreservingUndo } from './dom-writes';
