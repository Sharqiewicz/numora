/**
 * Static regex patterns for compact notation processing.
 * Defined at module level to avoid recompilation on each function call.
 */
import { escapeRegExp } from '../utils/escape-reg-exp';
import { getCachedRegex } from '../utils/regex-cache';

// Remove leading zeros from integer part
const LEADING_ZEROS_REGEX = /^0+/;

// Remove leading zeros after sign, preserving at least one non-zero digit
const LEADING_ZERO_REPLACE_REGEX = /^(-?)0+([1-9])/;

// Match strings that are all zeros (with optional sign)
const ALL_ZEROS_REGEX = /^-?0+$/;

/**
 * Scale suffix to zero count mapping.
 * Uses lowercase keys - suffixes are normalized before lookup.
 */
const ZERO_COUNTS: Record<string, number> = {
  k: 3,   // Thousand
  m: 6,   // Million
  b: 9,   // Billion
  t: 12,  // Trillion
};

/**
 * Expands compact notation (k, m, b, t) to full numbers using string manipulation.
 * Handles formats like: 1k, 1.5m, 2B, 1M, 2.5T (case-insensitive)
 * Uses string arithmetic to avoid precision loss with large numbers.
 *
 * @param value - The string value that may contain compact notation
 * @returns The expanded numeric string
 *
 * @example
 * expandCompactNotation("1k")     // "1000"
 * expandCompactNotation("1.5m")   // "1500000"
 * expandCompactNotation("2B")     // "2000000000"
 * expandCompactNotation("1M")     // "1000000"
 * expandCompactNotation("2.5T")   // "2500000000000"
 * expandCompactNotation("0.5k")   // "500"
 * expandCompactNotation(".5k")    // "500"
 */
export function expandCompactNotation(value: string, decimalSeparator: string = '.'): string {
  const escapedSep = escapeRegExp(decimalSeparator);
  // The mantissa alternation accepts both a normal number (`\d+sep?\d*`) and a bare
  // leading-decimal number (`sep\d+`, e.g. ".5"), mirroring `scientific-notation.ts`.
  // Without the second branch, ".5k" matched only "5k" and left the "." dangling,
  // silently yielding ".5000" (a 1000x error) instead of "500".
  const compactRegex = getCachedRegex(
    `((?:\\d+${escapedSep}?\\d*|${escapedSep}\\d+))\\s*([kmbt])`,
    'gi'
  );
  const trailingZerosRegex = getCachedRegex(`${escapedSep}?0+$`, '');

  return value.replace(compactRegex, (match, number, suffix) => {
    // Normalize suffix to lowercase for lookup
    const suffixLower = suffix.toLowerCase();
    const zerosToAdd = ZERO_COUNTS[suffixLower];

    if (!zerosToAdd) {
      return match;
    }

    const [integerPart, decimalPart = ''] = number.split(decimalSeparator);

    // Remove leading zeros from integer part (but keep at least one digit if it's all zeros)
    const cleanedInteger = integerPart.replace(LEADING_ZEROS_REGEX, '') || '0';

    // Multiply by adding zeros: move decimal point right by zeroCount positions
    let result: string;
    if (decimalPart.length === 0) {
      // No decimal part: just append zeros
      result = cleanedInteger + '0'.repeat(zerosToAdd);
    } else if (decimalPart.length <= zerosToAdd) {
      // Decimal part fits within zeros to add: move all decimals to integer part
      const zerosNeeded = zerosToAdd - decimalPart.length;
      result = cleanedInteger + decimalPart + '0'.repeat(zerosNeeded);
    } else {
      // Decimal part is longer: split it
      const decimalToMove = decimalPart.slice(0, zerosToAdd);
      const remainingDecimal = decimalPart.slice(zerosToAdd);
      result = cleanedInteger + decimalToMove + decimalSeparator + remainingDecimal;
    }

    // Remove leading zeros from the final result (but keep at least one digit)
    result = result.replace(LEADING_ZERO_REPLACE_REGEX, '$1$2');

    // If result is all zeros, keep one zero
    if (ALL_ZEROS_REGEX.test(result)) {
      result = '0';
    }

    // Trim trailing zeros from decimal part only (if decimal separator exists)
    if (result.includes(decimalSeparator)) {
      result = result.replace(trailingZerosRegex, '');
    }

    return result;
  });
}