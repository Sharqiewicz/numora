/**
 * Advanced cursor position calculation for formatted numeric inputs.
 * Handles cursor preservation during formatting changes, insertion, and deletion operations.
 */

import type { ChangeRange, ThousandsGroupStyle } from './constants';
import {
  countMeaningfulDigitsBeforePosition,
  findPositionForDigitIndex,
  findPositionWithMeaningfulDigitCount,
  isPositionOnSeparator,
} from './digit-counting';

/**
 * Calculates the new cursor position after formatting is applied.
 * Uses digit index mapping to preserve cursor position relative to actual digits,
 * handling insertion and deletion differently.
 *
 * @param oldFormattedValue - The formatted value before the change
 * @param newFormattedValue - The formatted value after formatting
 * @param oldCursorPosition - The cursor position in the old formatted value
 * @param separator - The separator character used in formatting
 * @param _groupStyle - The grouping style used (unused but kept for API compatibility)
 * @param changeRange - Optional change range info to distinguish Delete vs Backspace
 * @returns The new cursor position in the new formatted value
 *
 * @example
 * // Typing that adds a comma
 * calculateCursorPositionAfterFormatting("100", "1,000", 3, ",")
 * // Returns: 5 (cursor after last zero)
 */
export function calculateCursorPositionAfterFormatting(
  oldFormattedValue: string,
  newFormattedValue: string,
  oldCursorPosition: number,
  separator: string,
  _groupStyle: ThousandsGroupStyle = 'thousand',
  changeRange?: ChangeRange
): number {
  // === GUARD CLAUSES: Handle edge cases ===
  if (oldCursorPosition < 0) {
    return 0;
  }

  if (oldCursorPosition > oldFormattedValue.length) {
    return newFormattedValue.length;
  }

  if (oldFormattedValue === '' || newFormattedValue === '') {
    return newFormattedValue.length;
  }

  // === DETERMINE: Operation type (insertion vs deletion) ===
  const isDeletion = newFormattedValue.length < oldFormattedValue.length;

  // === CAPTURE: Cursor state before change ===
  const wasOnSeparator = isPositionOnSeparator(
    oldFormattedValue,
    oldCursorPosition,
    separator
  );

  const oldDecimalIndex = oldFormattedValue.indexOf('.');
  const newDecimalIndex = newFormattedValue.indexOf('.');

  // === ROUTE: to appropriate handler ===
  if (isDeletion) {
    return handleDeletion(
      oldFormattedValue,
      newFormattedValue,
      oldCursorPosition,
      separator,
      wasOnSeparator,
      oldDecimalIndex,
      newDecimalIndex,
      changeRange
    );
  }

  return handleInsertion(
    oldFormattedValue,
    newFormattedValue,
    oldCursorPosition,
    separator,
    wasOnSeparator,
  );
}

/**
 * Handles cursor positioning when characters are deleted.
 * More complex due to separator handling and Delete vs Backspace distinction.
 */
function handleDeletion(
  oldFormattedValue: string,
  newFormattedValue: string,
  oldCursorPosition: number,
  separator: string,
  wasOnSeparator: boolean,
  oldDecimalIndex: number,
  newDecimalIndex: number,
  changeRange?: ChangeRange
): number {
  // === SPECIAL CASE: Cursor was on separator ===
  if (wasOnSeparator) {
    return handleSeparatorDeletion(
      oldFormattedValue,
      newFormattedValue,
      oldCursorPosition,
      separator,
      newDecimalIndex
    );
  }

  // === CALCULATE: Digit counts before and after ===
  const meaningfulDigitsBeforeCursor = countMeaningfulDigitsBeforePosition(
    oldFormattedValue,
    oldCursorPosition,
    separator
  );

  const totalDigitsInOld = countMeaningfulDigitsBeforePosition(
    oldFormattedValue,
    oldFormattedValue.length,
    separator
  );

  const totalDigitsInNew = countMeaningfulDigitsBeforePosition(
    newFormattedValue,
    newFormattedValue.length,
    separator
  );

  const digitsRemoved = totalDigitsInOld - totalDigitsInNew;

  // === DETERMINE: Target digit count ===
  const targetDigitCount = calculateTargetDigitCountForDeletion(
    oldFormattedValue,
    oldCursorPosition,
    separator,
    meaningfulDigitsBeforeCursor,
    digitsRemoved,
    oldDecimalIndex,
    changeRange
  );

  // === FIND: New cursor position ===
  return findCursorPositionAfterDeletion(
    newFormattedValue,
    targetDigitCount,
    separator,
    digitsRemoved,
    changeRange
  );
}

/**
 * Handles deletion when cursor was positioned on a separator character.
 */
function handleSeparatorDeletion(
  oldFormattedValue: string,
  newFormattedValue: string,
  oldCursorPosition: number,
  separator: string,
  newDecimalIndex: number
): number {
  const positionAfterSeparator = oldCursorPosition + 1;

  if (positionAfterSeparator < oldFormattedValue.length) {
    const digitIndexAfter = countMeaningfulDigitsBeforePosition(
      oldFormattedValue,
      positionAfterSeparator,
      separator
    );

    const pos = findPositionForDigitIndex(
      newFormattedValue,
      digitIndexAfter,
      separator
    );

    if (pos < newFormattedValue.length && newFormattedValue[pos] !== separator) {
      return pos + 1;
    }
    return pos;
  }

  return oldCursorPosition;
}

/**
 * Calculates the target digit count for cursor positioning after deletion.
 */
function calculateTargetDigitCountForDeletion(
  oldFormattedValue: string,
  oldCursorPosition: number,
  separator: string,
  meaningfulDigitsBeforeCursor: number,
  digitsRemoved: number,
  oldDecimalIndex: number,
  changeRange?: ChangeRange
): number {
  if (changeRange) {
    const { start, isDelete } = changeRange;

    if (isDelete) {
      // Delete key: cursor stays at same position
      return countMeaningfulDigitsBeforePosition(
        oldFormattedValue,
        start,
        separator
      );
    } else {
      // Backspace key or selection: cursor moves backward
      return Math.max(0, countMeaningfulDigitsBeforePosition(
        oldFormattedValue,
        start,
        separator
      ));
    }
  }

  // Fallback: no change range info
  const wasCursorDirectlyAfterSeparator =
    oldCursorPosition > 0 &&
    oldFormattedValue[oldCursorPosition - 1] === separator;

  if (wasCursorDirectlyAfterSeparator && digitsRemoved > 0) {
    return meaningfulDigitsBeforeCursor + 1;
  }

  return meaningfulDigitsBeforeCursor;
}

/**
 * Finds the final cursor position after deletion is complete.
 */
function findCursorPositionAfterDeletion(
  newFormattedValue: string,
  targetDigitCount: number,
  separator: string,
  digitsRemoved: number,
  changeRange?: ChangeRange
): number {
  const newPosition = findPositionWithMeaningfulDigitCount(
    newFormattedValue,
    targetDigitCount,
    separator
  );

  // === ADJUSTMENT: Fine-tune position if needed ===
  if (!changeRange && digitsRemoved > 0 && newPosition < newFormattedValue.length) {
    const digitsAtNewPosition = countMeaningfulDigitsBeforePosition(
      newFormattedValue,
      newPosition,
      separator
    );

    if (digitsAtNewPosition === targetDigitCount && newPosition < newFormattedValue.length - 1) {
      return Math.min(newPosition + 1, newFormattedValue.length);
    }
  }

  return newPosition;
}

/**
 * Handles cursor positioning when characters are inserted.
 * Simpler than deletion since cursor typically moves forward.
 */
function handleInsertion(
  oldFormattedValue: string,
  newFormattedValue: string,
  oldCursorPosition: number,
  separator: string,
  wasOnSeparator: boolean,
): number {
  // === SPECIAL CASE: Cursor at end of input ===
  const wasAtEnd = oldCursorPosition >= oldFormattedValue.length;

  const meaningfulDigitsBeforeCursor = countMeaningfulDigitsBeforePosition(
    oldFormattedValue,
    oldCursorPosition,
    separator
  );

  const totalDigitsInOld = countMeaningfulDigitsBeforePosition(
    oldFormattedValue,
    oldFormattedValue.length,
    separator
  );

  const totalDigitsInNew = countMeaningfulDigitsBeforePosition(
    newFormattedValue,
    newFormattedValue.length,
    separator
  );

  // Cursor was at end or at last digit position
  if (wasAtEnd || meaningfulDigitsBeforeCursor === totalDigitsInOld) {
    return newFormattedValue.length;
  }

  // === CALCULATE: Target digit count after insertion ===
  const digitsAdded = totalDigitsInNew - totalDigitsInOld;
  let targetDigitCount = meaningfulDigitsBeforeCursor;

  if (digitsAdded > 0 && !wasAtEnd && meaningfulDigitsBeforeCursor < totalDigitsInOld) {
    targetDigitCount = meaningfulDigitsBeforeCursor + 1;
  }

  // === FIND: New cursor position ===
  const newPosition = findPositionWithMeaningfulDigitCount(
    newFormattedValue,
    targetDigitCount,
    separator
  );

  // === ADJUSTMENT: Handle separator edge case ===
  if (wasOnSeparator && !isPositionOnSeparator(newFormattedValue, newPosition, separator)) {
    return Math.max(0, newPosition - 1);
  }

  return newPosition;
}
