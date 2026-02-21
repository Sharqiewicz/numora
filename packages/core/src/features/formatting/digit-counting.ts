/**
 * Utilities for counting and locating meaningful digits in formatted numbers.
 *
 * ## Core Concept
 *
 * "Meaningful digits" are the actual numeric characters (0-9) in a formatted string,
 * excluding formatting characters like thousand separators and decimal points.
 *
 * For example, in "1,234.56":
 * - Meaningful digits: 1, 2, 3, 4, 5, 6 (count = 6)
 * - Non-meaningful: comma (,) and period (.)
 *
 * ## Usage in Cursor Positioning
 *
 * These utilities enable cursor preservation during formatting by:
 * 1. Counting digits before cursor in OLD value
 * 2. Finding position with same digit count in NEW value
 *
 * Example: Typing "0" in "99|" (cursor at end)
 * - Old value: "99" → 2 digits before cursor
 * - User types: "0" → becomes "990"
 * - Formatting: "990" → "990" (no separator yet)
 * - New cursor: position after 3rd digit = position 3
 *
 * Example: Typing "9" in "99|9" → "9,999"
 * - Old value: "999" → 3 digits before cursor at position 2
 * - After formatting: "9,999"
 * - Find position with 3 digits before it → position 4 (after "9,99")
 *
 * @module digit-counting
 */

/**
 * Counts meaningful non-thousand-separator characters (digits and decimal separator) before a position.
 * This is the core digit counting logic used throughout cursor positioning.
 *
 * @param value - The formatted string value
 * @param position - The position to count up to
 * @param separator - The thousand separator character
 * @returns The count of meaningful digits before the position
 *
 * @example
 * countMeaningfulDigitsBeforePosition("1,234", 3, ",") // Returns: 2 (digits "1" and "2")
 * countMeaningfulDigitsBeforePosition("1,234.56", 8, ",") // Returns: 7
 */
export function countMeaningfulDigitsBeforePosition(
  value: string,
  position: number,
  separator: string
): number {
  // Decimal separator is a non-digit character and is naturally skipped by the digit scan.
  let digitCount = 0;
  for (let i = 0; i < position && i < value.length; i++) {
    const char = value[i];
    if (char !== separator) {
      digitCount++;
    }
  }
  return digitCount;
}

/**
 * Finds the position in the string for a specific digit index.
 * Returns the position AFTER the digit at targetDigitIndex.
 *
 * @param value - The formatted string value
 * @param targetDigitIndex - The zero-based index of the target digit
 * @param separator - The thousand separator character
 * @returns The position after the target digit
 *
 * @example
 * findPositionForDigitIndex("1,234", 3, ",") // Returns: 4 (after digit "3")
 */
export function findPositionForDigitIndex(
  value: string,
  targetDigitIndex: number,
  separator: string
): number {
  // Decimal separator is a non-digit character and is naturally skipped by the digit scan.
  if (targetDigitIndex === 0) {
    return 0;
  }

  let digitCount = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char !== separator) {
      if (digitCount === targetDigitIndex - 1) {
        return i + 1;
      }
      digitCount++;
    }
  }
  return value.length;
}

/**
 * Finds the position in the string where the digit count equals targetDigitCount.
 * Returns the position after reaching the target count.
 *
 * @param value - The formatted string value
 * @param targetDigitCount - The target number of digits
 * @param separator - The thousand separator character
 * @returns The position where digit count equals target
 *
 * @example
 * findPositionWithMeaningfulDigitCount("1,234", 3, ",") // Returns: 4 (after "2,3")
 */
export function findPositionWithMeaningfulDigitCount(
  value: string,
  targetDigitCount: number,
  separator: string
): number {
  // Decimal separator is a non-digit character and is naturally skipped by the digit scan.
  if (targetDigitCount === 0) {
    return 0;
  }

  let digitCount = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char !== separator) {
      digitCount++;
      if (digitCount === targetDigitCount) {
        return i + 1;
      }
      if (digitCount > targetDigitCount) {
        return i;
      }
    }
  }
  return value.length;
}

/**
 * Checks if a position in the string is on a separator character.
 *
 * @param value - The formatted string value
 * @param position - The position to check
 * @param separator - The thousand separator character
 * @returns True if the position is on a separator character
 *
 * @example
 * isPositionOnSeparator("1,234", 1, ",") // Returns: true
 * isPositionOnSeparator("1,234", 2, ",") // Returns: false
 */
export function isPositionOnSeparator(
  value: string,
  position: number,
  separator: string
): boolean {
  if (position < 0 || position >= value.length) {
    return false;
  }
  return value[position] === separator;
}
