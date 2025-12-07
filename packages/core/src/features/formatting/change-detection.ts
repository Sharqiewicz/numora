/**
 * Utilities for detecting changes in input values.
 * Used to distinguish between different editing operations (Delete vs Backspace, etc.)
 */

import type { ChangeRange } from './constants';

/**
 * Determines what changed based on caret positions before and after the change.
 * This is used to distinguish Delete (cursor stays) vs Backspace (cursor moves left).
 *
 * @param caretBefore - The caret position info before the change
 * @param inputValueBefore - The input value before the change
 * @param inputValueAfter - The input value after the change
 * @returns Change range information, or undefined if unable to determine
 *
 * @example
 * // Delete key: cursor at 2, endOffset: 1
 * findChangedRangeFromCaretPositions(
 *   { selectionStart: 2, selectionEnd: 2, endOffset: 1 },
 *   "1,234",
 *   "1,34"
 * ) // Returns: { start: 2, end: 3, deletedLength: 1, isDelete: true }
 */
export function findChangedRangeFromCaretPositions(
  caretBefore: { selectionStart: number; selectionEnd: number; endOffset?: number },
  inputValueBefore: string,
  inputValueAfter: string
): ChangeRange | undefined {
  const { selectionStart, selectionEnd, endOffset = 0 } = caretBefore;
  const hasSelection = selectionStart !== selectionEnd;

  // Handle selection range deletion
  if (hasSelection) {
    const deletedLength = selectionEnd - selectionStart;
    return {
      start: selectionStart,
      end: selectionEnd,
      deletedLength,
      isDelete: false,
    };
  }

  // Handle Delete key (endOffset > 0 means Delete key was pressed)
  if (endOffset > 0) {
    const deletedLength = endOffset;
    return {
      start: selectionStart,
      end: selectionStart + deletedLength,
      deletedLength,
      isDelete: true,
    };
  }

  // Handle Backspace or other single-character deletion
  const oldLength = inputValueBefore.length;
  const newLength = inputValueAfter.length;
  const lengthDiff = oldLength - newLength;

  if (lengthDiff <= 0) {
    return undefined;
  }

  return {
    start: selectionStart,
    end: selectionStart + lengthDiff,
    deletedLength: lengthDiff,
    isDelete: false,
  };
}

/**
 * Finds the change range by comparing old and new values.
 * This is a fallback when caret position info is not available.
 *
 * @param oldValue - The value before the change
 * @param newValue - The value after the change
 * @returns Change range information, or undefined if unable to determine
 *
 * @example
 * findChangeRange("1,234", "1,34")
 * // Returns: { start: 2, end: 3, deletedLength: 1, isDelete: true }
 */
export function findChangeRange(
  oldValue: string,
  newValue: string
): ChangeRange | undefined {
  if (oldValue === newValue) {
    return undefined;
  }

  let start = 0;

  // Find where the strings start differing from the beginning
  while (start < oldValue.length && start < newValue.length && oldValue[start] === newValue[start]) {
    start++;
  }

  // Find where the strings start differing from the end
  let oldEnd = oldValue.length - 1;
  let newEnd = newValue.length - 1;

  while (oldEnd >= start && newEnd >= start && oldValue[oldEnd] === newValue[newEnd]) {
    oldEnd--;
    newEnd--;
  }

  const deletedLength = oldEnd - start + 1;
  const insertedLength = newEnd - start + 1;

  if (deletedLength === 0 && insertedLength === 0) {
    return undefined;
  }

  return {
    start,
    end: oldEnd + 1,
    deletedLength,
    isDelete: deletedLength > insertedLength,
  };
}
