/**
 * Subscript notation utilities for condensing leading decimal zeros.
 * Converts very small numbers like 0.000001 to 0₆1 for better readability.
 */

import { DEFAULT_DECIMAL_SEPARATOR } from '@/config';

/**
 * Converts numeric digits to subscript Unicode characters.
 *
 * @param input - String containing digits to convert
 * @returns String with digits converted to subscript
 *
 * @example
 * toSubString("6")  // "₆"
 * toSubString("123") // "₁₂₃"
 */
function toSubString(input: string): string {
  const subchars = '₀₁₂₃₄₅₆₇₈₉';
  return input.replace(/[0-9]/g, (m) => subchars[+m]);
}

/**
 * Condenses leading decimal zeros in a numeric string to subscript notation.
 * For example: 0.000001 → 0₆1 (meaning 6 leading zeros)
 *
 * @param value - The numeric string value to condense
 * @param maxDecimalDigits - Maximum number of decimal digits to show after condensation
 * @param decimalSeparator - The decimal separator character (default: '.')
 * @returns The condensed string with subscript notation for leading zeros
 *
 * @example
 * condenseDecimalZeros("0.000001", 8)     // "0₆1"
 * condenseDecimalZeros("0.000123", 8)     // "0₃123"
 * condenseDecimalZeros("1.000001", 8)     // "1.000001" (no leading zeros to condense)
 * condenseDecimalZeros("0.123", 8)        // "0.123" (not enough zeros to condense)
 */
export function condenseDecimalZeros(
  value: string,
  maxDecimalDigits: number = 8,
  decimalSeparator: string = DEFAULT_DECIMAL_SEPARATOR
): string {
  if (!value || !value.includes(decimalSeparator)) {
    return value;
  }

  const isNegative = value.startsWith('-');
  const absoluteValue = isNegative ? value.slice(1) : value;
  const [whole, decimal] = absoluteValue.split(decimalSeparator);

  // No decimal part
  if (!decimal || !decimal.length) {
    return value;
  }

  // Find leading zeros (3 or more to condense)
  const leadingZerosMatch = decimal.match(/^(0{3,})/);
  if (!leadingZerosMatch) {
    // Not enough leading zeros to condense (need at least 3)
    return value;
  }

  const leadingZeros = leadingZerosMatch[1];
  const zerosCount = leadingZeros.length;
  const remainingDecimal = decimal.slice(zerosCount);

  // Convert zero count to subscript
  const subscript = toSubString(zerosCount.toString());

  // Build the condensed decimal part
  // Format: 0{subscript}{remaining digits}
  let condensedDecimal = `0${subscript}${remainingDecimal}`;

  // Trim to maxDecimalDigits (accounting for the subscript length)
  // Subscript characters are single Unicode characters, so we need to be careful
  const subscriptLength = subscript.length;
  const maxRemainingDigits = Math.max(0, maxDecimalDigits - subscriptLength - 1); // -1 for the "0"

  if (remainingDecimal.length > maxRemainingDigits) {
    condensedDecimal = `0${subscript}${remainingDecimal.slice(0, maxRemainingDigits)}`;
  }

  // Remove trailing zeros
  condensedDecimal = condensedDecimal.replace(/0+$/, '');

  // Reconstruct the value
  const result = `${whole}${decimalSeparator}${condensedDecimal}`;
  return isNegative ? `-${result}` : result;
}
