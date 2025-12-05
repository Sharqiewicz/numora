/**
 * Utilities for counting and locating meaningful digits in formatted numbers.
 * "Meaningful digits" are actual numeric digits, excluding separators and decimal points.
 */

/**
 * Counts meaningful digits (non-separator, non-decimal) before a position.
 * This is the core digit counting logic used throughout cursor positioning.
 *
 * @param value - The formatted string value
 * @param position - The position to count up to
 * @param separator - The thousands separator character
 * @param decimalSeparator - The decimal separator character (default: '.')
 * @returns The count of meaningful digits before the position
 *
 * @example
 * countMeaningfulDigitsBeforePosition("1,234", 3, ",") // Returns: 2 (digits "1" and "2")
 * countMeaningfulDigitsBeforePosition("1,234.56", 8, ",") // Returns: 6
 * countMeaningfulDigitsBeforePosition("1.234,56", 8, ".", ",") // Returns: 6
 */
export function countMeaningfulDigitsBeforePosition(
  value: string,
  position: number,
  separator: string,
  decimalSeparator: string = '.'
): number {
  let digitCount = 0;
  for (let i = 0; i < position && i < value.length; i++) {
    const char = value[i];
    if (char !== separator && char !== decimalSeparator) {
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
 * @param separator - The thousands separator character
 * @param decimalSeparator - The decimal separator character (default: '.')
 * @returns The position after the target digit
 *
 * @example
 * findPositionForDigitIndex("1,234", 2, ",") // Returns: 4 (after digit "3")
 */
export function findPositionForDigitIndex(
  value: string,
  targetDigitIndex: number,
  separator: string,
  decimalSeparator: string = '.'
): number {
  if (targetDigitIndex === 0) {
    return 0;
  }

  let digitCount = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char !== separator && char !== decimalSeparator) {
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
 * @param separator - The thousands separator character
 * @param decimalSeparator - The decimal separator character (default: '.')
 * @returns The position where digit count equals target
 *
 * @example
 * findPositionWithMeaningfulDigitCount("1,234", 3, ",") // Returns: 5 (after "2,3")
 */
export function findPositionWithMeaningfulDigitCount(
  value: string,
  targetDigitCount: number,
  separator: string,
  decimalSeparator: string = '.'
): number {
  if (targetDigitCount === 0) {
    return 0;
  }

  let digitCount = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char !== separator && char !== decimalSeparator) {
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
 * @param separator - The thousands separator character
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
