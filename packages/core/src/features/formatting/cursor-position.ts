/**
 * Advanced cursor position calculation for formatted numeric inputs.
 * Handles cursor preservation during formatting changes, insertion, and deletion operations.
 */

import type { ChangeRange } from './constants';
import { ThousandStyle } from '@/types';
import {
  countMeaningfulDigitsBeforePosition,
  findPositionForDigitIndex,
  findPositionWithMeaningfulDigitCount,
  isPositionOnSeparator,
} from './digit-counting';
import { getCaretPosInBoundary } from './cursor-boundary';
import { defaultIsCharacterEquivalent } from './character-equivalence';

/**
 * Type for character equivalence checking.
 * Returns true if two characters should be considered equivalent for cursor mapping.
 */
export type IsCharacterEquivalent = (
  char1: string,
  char2: string,
  context: {
    oldValue: string;
    newValue: string;
    typedRange?: ChangeRange;
    oldIndex: number;
    newIndex: number;
  }
) => boolean;

/**
 * Options for cursor position calculation.
 */
export interface CursorPositionOptions {
  thousandSeparator?: string;
  decimalSeparator?: string;
  isCharacterEquivalent?: IsCharacterEquivalent;
  boundary?: boolean[];
}

/**
 * Calculates the new cursor position after formatting is applied.
 * Uses digit index mapping to preserve cursor position relative to actual digits,
 * handling insertion and deletion differently.
 *
 * Supports character equivalence for cases where characters are transformed
 * (e.g., allowed decimal separators normalized to canonical separator).
 *
 * @param oldFormattedValue - The formatted value before the change
 * @param newFormattedValue - The formatted value after formatting
 * @param oldCursorPosition - The cursor position in the old formatted value
 * @param separator - The thousand separator character used in formatting
 * @param _groupStyle - The grouping style used (unused but kept for API compatibility)
 * @param changeRange - Optional change range info to distinguish Delete vs Backspace
 * @param decimalSeparator - The decimal separator character (default: '.')
 * @param options - Additional options for cursor calculation
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
  _groupStyle: ThousandStyle,
  changeRange?: ChangeRange,
  decimalSeparator: string = '.',
  options: CursorPositionOptions = {}
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

  // === SPECIAL CASE: Compact notation expansion ===
  // When compact notation expands (e.g., "1k" → "1000"), if cursor was at/near end, place at end
  // Only match if old value matches compact notation pattern (number + suffix) and new value is expanded
  const compactNotationPattern = /(\d+\.?\d*)\s*[kmbMTOQaqiSxsxSpOoNn]$/i;
  if (
    compactNotationPattern.test(oldFormattedValue) &&
    !compactNotationPattern.test(newFormattedValue) &&
    newFormattedValue.length > oldFormattedValue.length &&
    oldCursorPosition >= oldFormattedValue.length - 1
  ) {
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

  const oldDecimalIndex = oldFormattedValue.indexOf(decimalSeparator);
  const newDecimalIndex = newFormattedValue.indexOf(decimalSeparator);

  // Use character mapping approach if raw input is available and character equivalence is defined
  const useCharacterMapping =
    options.isCharacterEquivalent &&
    oldFormattedValue !== newFormattedValue;

  if (useCharacterMapping) {
    const mappedPosition = calculateCursorPositionWithCharacterMapping(
      oldFormattedValue,
      newFormattedValue,
      oldCursorPosition,
      options.isCharacterEquivalent || defaultIsCharacterEquivalent,
      changeRange,
      options
    );
    if (mappedPosition !== undefined) {
      return mappedPosition;
    }
  }

  // === ROUTE: to appropriate handler (digit counting approach) ===
  if (isDeletion) {
    return handleDeletion(
      oldFormattedValue,
      newFormattedValue,
      oldCursorPosition,
      separator,
      wasOnSeparator,
      oldDecimalIndex,
      newDecimalIndex,
      changeRange,
      decimalSeparator,
      options
    );
  }

  const position = handleInsertion(
    oldFormattedValue,
    newFormattedValue,
    oldCursorPosition,
    separator,
    wasOnSeparator,
    decimalSeparator
  );

  // Apply boundary correction if boundary is provided
  if (options.boundary) {
    return getCaretPosInBoundary(newFormattedValue, position, options.boundary);
  }

  return position;
}

/**
 * Calculates cursor position using character mapping approach.
 * More robust for character transformations (e.g., decimal separator normalization).
 */
function calculateCursorPositionWithCharacterMapping(
  oldFormattedValue: string,
  newFormattedValue: string,
  oldCursorPosition: number,
  isCharacterEquivalent: IsCharacterEquivalent,
  changeRange: ChangeRange | undefined,
  options: CursorPositionOptions
): number | undefined {
  const curValLn = oldFormattedValue.length;
  const formattedValueLn = newFormattedValue.length;

  // Create index map: oldFormattedValue[i] -> newFormattedValue[j]
  const addedIndexMap: { [key: number]: boolean } = {};
  const indexMap = new Array(curValLn);

  for (let i = 0; i < curValLn; i++) {
    indexMap[i] = -1;
    for (let j = 0; j < formattedValueLn; j++) {
      if (addedIndexMap[j]) continue;

      const isCharSame = isCharacterEquivalent(
        oldFormattedValue[i],
        newFormattedValue[j],
        {
          oldValue: oldFormattedValue,
          newValue: newFormattedValue,
          typedRange: changeRange,
          oldIndex: i,
          newIndex: j,
        }
      );

      if (isCharSame) {
        indexMap[i] = j;
        addedIndexMap[j] = true;
        break;
      }
    }
  }

  // Find closest mapped characters on left and right of cursor
  let pos = oldCursorPosition;
  while (pos < curValLn && (indexMap[pos] === -1 || !/\d/.test(oldFormattedValue[pos]))) {
    pos++;
  }
  const endIndex =
    pos === curValLn || indexMap[pos] === -1 ? formattedValueLn : indexMap[pos];

  pos = oldCursorPosition - 1;
  while (pos >= 0 && indexMap[pos] === -1) pos--;
  const startIndex = pos === -1 || indexMap[pos] === -1 ? 0 : indexMap[pos] + 1;

  if (startIndex > endIndex) return endIndex;

  // Choose position closer to original cursor
  const newPosition =
    oldCursorPosition - startIndex < endIndex - oldCursorPosition
      ? startIndex
      : endIndex;

  // Apply boundary correction if available
  if (options.boundary) {
    return getCaretPosInBoundary(newFormattedValue, newPosition, options.boundary);
  }

  return newPosition;
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
  changeRange: ChangeRange | undefined,
  decimalSeparator: string,
  options: CursorPositionOptions = {}
): number {
  // === SPECIAL CASE: Cursor was on separator ===
  if (wasOnSeparator) {
    return handleSeparatorDeletion(
      oldFormattedValue,
      newFormattedValue,
      oldCursorPosition,
      separator,
      newDecimalIndex,
      decimalSeparator
    );
  }

  // === CALCULATE: Digit counts before and after ===
  const meaningfulDigitsBeforeCursor = countMeaningfulDigitsBeforePosition(
    oldFormattedValue,
    oldCursorPosition,
    separator,
    decimalSeparator
  );

  const totalDigitsInOld = countMeaningfulDigitsBeforePosition(
    oldFormattedValue,
    oldFormattedValue.length,
    separator,
    decimalSeparator
  );

  const totalDigitsInNew = countMeaningfulDigitsBeforePosition(
    newFormattedValue,
    newFormattedValue.length,
    separator,
    decimalSeparator
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
    changeRange,
    decimalSeparator
  );

  // === FIND: New cursor position ===
  const wasInIntegerPart = oldDecimalIndex === -1 || oldCursorPosition <= oldDecimalIndex;
  const position = findCursorPositionAfterDeletion(
    newFormattedValue,
    targetDigitCount,
    separator,
    digitsRemoved,
    changeRange,
    decimalSeparator,
    wasInIntegerPart,
    newDecimalIndex
  );

  // Apply boundary correction if available
  if (options.boundary) {
    return getCaretPosInBoundary(newFormattedValue, position, options.boundary);
  }

  return position;
}

/**
 * Handles deletion when cursor was positioned on a separator character.
 */
function handleSeparatorDeletion(
  oldFormattedValue: string,
  newFormattedValue: string,
  oldCursorPosition: number,
  separator: string,
  _newDecimalIndex: number,
  decimalSeparator: string
): number {
  const positionAfterSeparator = oldCursorPosition + 1;

  if (positionAfterSeparator < oldFormattedValue.length) {
    const digitIndexAfter = countMeaningfulDigitsBeforePosition(
      oldFormattedValue,
      positionAfterSeparator,
      separator,
      decimalSeparator
    );

    const pos = findPositionForDigitIndex(
      newFormattedValue,
      digitIndexAfter,
      separator,
      decimalSeparator
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
  _oldDecimalIndex: number,
  changeRange: ChangeRange | undefined,
  decimalSeparator: string
): number {
  if (changeRange) {
    const { start, isDelete } = changeRange;

    if (isDelete) {
      // Delete key: cursor stays at same position
      return countMeaningfulDigitsBeforePosition(
        oldFormattedValue,
        start,
        separator,
        decimalSeparator
      );
    } else {
      // Backspace key or selection: cursor moves backward
      return Math.max(0, countMeaningfulDigitsBeforePosition(
        oldFormattedValue,
        start,
        separator,
        decimalSeparator
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
  changeRange: ChangeRange | undefined,
  decimalSeparator: string,
  wasInIntegerPart: boolean,
  newDecimalIndex: number
): number {
  // If cursor was in integer part, constrain search to integer part only
  if (wasInIntegerPart && newDecimalIndex !== -1) {
    const integerPart = newFormattedValue.substring(0, newDecimalIndex);
    const integerDigits = countMeaningfulDigitsBeforePosition(
      integerPart,
      integerPart.length,
      separator,
      decimalSeparator
    );

    // If target is within integer part, search only in integer part
    if (targetDigitCount <= integerDigits) {
      const newPosition = findPositionWithMeaningfulDigitCount(
        integerPart,
        targetDigitCount,
        separator,
        decimalSeparator
      );

      // Fine-tune position if needed
      // Skip fine-tuning when at position 0 to prevent cursor from jumping when deleting from beginning
      if (newPosition > 0 && newPosition < integerPart.length) {
        const digitsAtNewPosition = countMeaningfulDigitsBeforePosition(
          integerPart,
          newPosition,
          separator,
          decimalSeparator
        );

        if (digitsAtNewPosition === targetDigitCount) {
          // Move past separator if we're on one, this is a deletion with changeRange, and we removed digits
          if (
            integerPart[newPosition] === separator &&
            changeRange &&
            digitsRemoved > 0 &&
            newPosition < integerPart.length - 1
          ) {
            return newPosition + 1;
          }
          // Original fine-tuning for non-separator cases
          if (!changeRange && digitsRemoved > 0 && newPosition < integerPart.length - 1) {
            return Math.min(newPosition + 1, integerPart.length);
          }
        }
      }

      return newPosition;
    }
  }

  // Default: search in entire value
  const newPosition = findPositionWithMeaningfulDigitCount(
    newFormattedValue,
    targetDigitCount,
    separator,
    decimalSeparator
  );

  // === ADJUSTMENT: Fine-tune position if needed ===
  // Skip fine-tuning when at position 0 to prevent cursor from jumping when deleting from beginning
  if (newPosition > 0 && newPosition < newFormattedValue.length) {
    const digitsAtNewPosition = countMeaningfulDigitsBeforePosition(
      newFormattedValue,
      newPosition,
      separator,
      decimalSeparator
    );

    if (digitsAtNewPosition === targetDigitCount) {
      // Move past separator if we're on one, this is a deletion with changeRange, and we removed digits
      if (
        newFormattedValue[newPosition] === separator &&
        changeRange &&
        digitsRemoved > 0 &&
        newPosition < newFormattedValue.length - 1
      ) {
        return newPosition + 1;
      }
      // Original fine-tuning for non-separator cases
      if (!changeRange && digitsRemoved > 0 && newPosition < newFormattedValue.length - 1) {
        return Math.min(newPosition + 1, newFormattedValue.length);
      }
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
  decimalSeparator: string
): number {
  // === SPECIAL CASE: Cursor at end of input ===
  const wasAtEnd = oldCursorPosition >= oldFormattedValue.length;

  const meaningfulDigitsBeforeCursor = countMeaningfulDigitsBeforePosition(
    oldFormattedValue,
    oldCursorPosition,
    separator,
    decimalSeparator
  );

  const totalDigitsInOld = countMeaningfulDigitsBeforePosition(
    oldFormattedValue,
    oldFormattedValue.length,
    separator,
    decimalSeparator
  );

  const totalDigitsInNew = countMeaningfulDigitsBeforePosition(
    newFormattedValue,
    newFormattedValue.length,
    separator,
    decimalSeparator
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
    separator,
    decimalSeparator
  );

  // === ADJUSTMENT: Handle separator edge case ===
  if (wasOnSeparator && !isPositionOnSeparator(newFormattedValue, newPosition, separator)) {
    return Math.max(0, newPosition - 1);
  }

  return newPosition;
}
