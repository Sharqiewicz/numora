/**
 * Advanced cursor position calculation for formatted numeric inputs.
 * Handles cursor preservation during formatting changes, insertion, and deletion operations.
 *
 * ## Algorithm Overview
 *
 * The cursor position calculation uses a "meaningful digit" approach:
 * 1. Count the number of actual digits (0-9) before the cursor, ignoring separators
 * 2. After formatting, find the position that has the same number of digits before it
 * 3. Apply adjustments for separator boundaries and special cases
 *
 * ## Processing Flow
 *
 * ```
 * calculateCursorPositionAfterFormatting()
 *   ├── Guard clauses (empty values, out of bounds)
 *   ├── Compact notation detection (1k → 1000)
 *   ├── Character mapping approach (optional, for complex transformations)
 *   └── Route to handler based on operation type:
 *       ├── handleDeletion() - for backspace/delete operations
 *       │   ├── handleSeparatorDeletion() - cursor was on separator
 *       │   ├── Calculate target digit count
 *       │   └── Find new position + fine-tune for separators
 *       └── handleInsertion() - for typing/paste operations
 *           ├── Handle cursor at end
 *           └── Find position maintaining digit-relative position
 * ```
 *
 * ## Key Concepts
 *
 * - **Meaningful digits**: Numeric characters (0-9) that represent actual value
 * - **Separators**: Thousand separators that are formatting-only (not part of value)
 * - **Digit index**: The nth digit from the start (ignoring separators)
 * - **ChangeRange**: Info about what was typed/deleted to distinguish Delete vs Backspace
 *
 * ## Edge Cases Handled
 *
 * - Cursor at start/end of input
 * - Cursor on separator during deletion
 * - Delete key vs Backspace key (different cursor behavior)
 * - Compact notation expansion (1k → 1000)
 * - Integer/decimal part transitions
 * - Boundary constraints (prefix/suffix)
 *
 * @module cursor-position
 */

import type { ChangeRange } from './constants';
import { ThousandStyle } from '@/types';

const COMPACT_NOTATION_CURSOR_RE = /(\d+\.?\d*)\s*[kmbt]$/i;

/**
 * Digit-count function signature — matches countMeaningfulDigitsBeforePosition so the raw
 * function can be used as a drop-in default, and the memoised closure can ignore the sep arg.
 */
type CountFn = (val: string, pos: number, sep: string) => number;
import {
  countMeaningfulDigitsBeforePosition,
  findPositionForDigitIndex,
  findPositionWithMeaningfulDigitCount,
  isPositionOnSeparator,
} from './digit-counting';
import { getCaretPosInBoundary } from './cursor-boundary';

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

export const defaultIsCharacterEquivalent: IsCharacterEquivalent = (char1, char2) => char1 === char2;

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
 *   Will be removed in a future major version. Pass any value; it is ignored.
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
  if (
    COMPACT_NOTATION_CURSOR_RE.test(oldFormattedValue) &&
    !COMPACT_NOTATION_CURSOR_RE.test(newFormattedValue) &&
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

  // NOTE: When called via updateCursorPosition (the primary entry point), isCharacterEquivalent
  // is always set, so the character-mapping path above always runs and returns. The digit-counting
  // handlers below (handleDeletion / handleInsertion) are intentionally unreachable from that path.
  // They serve as a fallback for direct callers that do not provide isCharacterEquivalent.

  // === MEMOISATION: shared digit-count cache for the fallback path ===
  // Keyed by "o:pos" (old value) or "n:pos" (new value) to distinguish the two strings while
  // keeping the Map allocation O(1) per keystroke (≤ 5 distinct positions queried).
  const _dcCache = new Map<string, number>();
  // sep arg is ignored — separator is captured from the outer scope
  const cachedCount: CountFn = (val: string, pos: number, _sep: string): number => {
    const key = `${val === oldFormattedValue ? 'o' : 'n'}:${pos}`;
    if (!_dcCache.has(key)) {
      _dcCache.set(key, countMeaningfulDigitsBeforePosition(val, pos, separator));
    }
    return _dcCache.get(key)!;
  };

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
      options,
      cachedCount
    );
  }

  const position = handleInsertion(
    oldFormattedValue,
    newFormattedValue,
    oldCursorPosition,
    separator,
    wasOnSeparator,
    cachedCount
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

  // Two-pointer forward scan: O(n) for order-preserving isCharacterEquivalent.
  // Directly computes startIndex and endIndex without O(n) heap allocations.
  // Precondition: isCharacterEquivalent must be order-preserving — if old[i] maps to
  // new[j], then old[i+1]'s match (if any) is at new[j'] where j' >= j. This holds
  // for defaultIsCharacterEquivalent and all built-in formatting paths.
  let j = 0;                          // next unclaimed position in newFormattedValue
  let startIndex = 0;                 // new-string position after the last pre-cursor match
  let endIndex = formattedValueLn;    // new-string position for first digit-match at/after cursor

  for (let i = 0; i < curValLn; i++) {
    // Find the first unclaimed new-char that matches old[i], starting from j.
    // j advances only when a match is claimed, so the total inner iterations
    // across all outer iterations is O(formattedValueLn).
    let matchJ = -1;
    for (let k = j; k < formattedValueLn; k++) {
      if (isCharacterEquivalent(
        oldFormattedValue[i],
        newFormattedValue[k],
        {
          oldValue: oldFormattedValue,
          newValue: newFormattedValue,
          typedRange: changeRange,
          oldIndex: i,
          newIndex: k,
        }
      )) {
        matchJ = k;
        break;
      }
    }

    if (matchJ === -1) continue;  // old[i] deleted; j stays for next iteration

    j = matchJ + 1;

    if (i < oldCursorPosition) {
      startIndex = matchJ + 1;
    } else if (endIndex === formattedValueLn && /\d/.test(oldFormattedValue[i])) {
      endIndex = matchJ;
    }
  }

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
  options: CursorPositionOptions = {},
  countFn: CountFn = countMeaningfulDigitsBeforePosition
): number {
  // === SPECIAL CASE: Cursor was on separator ===
  if (wasOnSeparator) {
    return handleSeparatorDeletion(
      oldFormattedValue,
      newFormattedValue,
      oldCursorPosition,
      separator,
      newDecimalIndex,
      countFn
    );
  }

  // === CALCULATE: Digit counts before and after ===
  const meaningfulDigitsBeforeCursor = countFn(oldFormattedValue, oldCursorPosition, separator);

  const totalDigitsInOld = countFn(oldFormattedValue, oldFormattedValue.length, separator);

  const totalDigitsInNew = countFn(newFormattedValue, newFormattedValue.length, separator);

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
    countFn
  );

  // === FIND: New cursor position ===
  const wasInIntegerPart = oldDecimalIndex === -1 || oldCursorPosition <= oldDecimalIndex;
  const position = findCursorPositionAfterDeletion(
    newFormattedValue,
    targetDigitCount,
    separator,
    digitsRemoved,
    changeRange,
    wasInIntegerPart,
    newDecimalIndex,
    countFn
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
  countFn: CountFn = countMeaningfulDigitsBeforePosition
): number {
  const positionAfterSeparator = oldCursorPosition + 1;

  if (positionAfterSeparator < oldFormattedValue.length) {
    const digitIndexAfter = countFn(oldFormattedValue, positionAfterSeparator, separator);

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
  _oldDecimalIndex: number,
  changeRange: ChangeRange | undefined,
  countFn: CountFn = countMeaningfulDigitsBeforePosition
): number {
  if (changeRange) {
    const { start, isDelete } = changeRange;

    if (isDelete) {
      // Delete key: cursor stays at same position
      return countFn(oldFormattedValue, start, separator);
    } else {
      // Backspace key or selection: cursor moves backward
      return Math.max(0, countFn(oldFormattedValue, start, separator));
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
 * Fine-tunes a deletion cursor position to skip past a thousand separator when appropriate.
 */
function fineTuneDeletePosition(
  value: string,
  position: number,
  targetDigitCount: number,
  separator: string,
  digitsRemoved: number,
  changeRange: ChangeRange | undefined,
  countFn: CountFn = countMeaningfulDigitsBeforePosition
): number {
  // position > 0 guard: skipping fine-tuning at position 0 prevents the cursor from jumping when deleting from the beginning.
  if (position > 0 && position < value.length) {
    const digitsAtNewPosition = countFn(value, position, separator);

    if (digitsAtNewPosition === targetDigitCount) {
      if (value[position] === separator && changeRange && digitsRemoved > 0 && position < value.length - 1) {
        return position + 1;
      }
      if (!changeRange && digitsRemoved > 0 && position < value.length - 1) {
        return Math.min(position + 1, value.length);
      }
    }
  }

  return position;
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
  wasInIntegerPart: boolean,
  newDecimalIndex: number,
  countFn: CountFn = countMeaningfulDigitsBeforePosition
): number {
  // If cursor was in integer part, constrain search to integer part only
  if (wasInIntegerPart && newDecimalIndex !== -1) {
    const integerPart = newFormattedValue.substring(0, newDecimalIndex);
    const integerDigits = countFn(integerPart, integerPart.length, separator);

    // If target is within integer part, search only in integer part
    if (targetDigitCount <= integerDigits) {
      const newPosition = findPositionWithMeaningfulDigitCount(
        integerPart,
        targetDigitCount,
        separator
      );

      // Fine-tune position if needed
      // Skip fine-tuning when at position 0 to prevent cursor from jumping when deleting from beginning
      return fineTuneDeletePosition(integerPart, newPosition, targetDigitCount, separator, digitsRemoved, changeRange, countFn);
    }
  }

  // Default: search in entire value
  const newPosition = findPositionWithMeaningfulDigitCount(
    newFormattedValue,
    targetDigitCount,
    separator
  );

  // === ADJUSTMENT: Fine-tune position if needed ===
  // Skip fine-tuning when at position 0 to prevent cursor from jumping when deleting from beginning
  return fineTuneDeletePosition(newFormattedValue, newPosition, targetDigitCount, separator, digitsRemoved, changeRange, countFn);
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
  countFn: CountFn = countMeaningfulDigitsBeforePosition
): number {
  // === SPECIAL CASE: Cursor at end of input ===
  const wasAtEnd = oldCursorPosition >= oldFormattedValue.length;

  const meaningfulDigitsBeforeCursor = countFn(oldFormattedValue, oldCursorPosition, separator);

  const totalDigitsInOld = countFn(oldFormattedValue, oldFormattedValue.length, separator);

  const totalDigitsInNew = countFn(newFormattedValue, newFormattedValue.length, separator);

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
