/**
 * Static regex patterns for compact notation processing.
 * Defined at module level to avoid recompilation on each function call.
 */

// Match compact notation patterns: number followed by scale suffix (case-insensitive)
// Multi-character suffixes (Qa, Qi, Sx, Sp) must come before single characters
const COMPACT_NOTATION_REGEX = /(\d+\.?\d*)\s*(Qa|Qi|Sx|Sp|[kmbMTO]|N)/gi;

// Remove leading zeros from integer part
const LEADING_ZEROS_REGEX = /^0+/;

// Remove leading zeros after sign, preserving at least one non-zero digit
const LEADING_ZERO_REPLACE_REGEX = /^(-?)0+([1-9])/;

// Match strings that are all zeros (with optional sign)
const ALL_ZEROS_REGEX = /^-?0+$/;

// Trim trailing zeros from decimal part (including optional decimal point)
const TRAILING_ZEROS_REGEX = /\.?0+$/;

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
 * Expands compact notation (k, m, b, M, T, Qa, Qi, Sx, Sp, O, N) to full numbers using string manipulation.
 * Handles formats like: 1k, 1.5m, 2B, 1M, 2.5T, 3Qa (case-insensitive)
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
 */
export function expandCompactNotation(value: string): string {
  return value.replace(COMPACT_NOTATION_REGEX, (match, number, suffix) => {
    // Normalize suffix to lowercase for lookup
    const suffixLower = suffix.toLowerCase();
    const zerosToAdd = ZERO_COUNTS[suffixLower];

    if (!zerosToAdd) {
      return match;
    }

    const isNegative = number.startsWith('-');
    const numberWithoutSign = isNegative ? number.slice(1) : number;
    const [integerPart, decimalPart = ''] = numberWithoutSign.split('.');

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
      result = cleanedInteger + decimalToMove + '.' + remainingDecimal;
    }

    // Remove leading zeros from the final result (but keep at least one digit)
    result = result.replace(LEADING_ZERO_REPLACE_REGEX, '$1$2');

    // If result is all zeros, keep one zero
    if (ALL_ZEROS_REGEX.test(result)) {
      result = isNegative ? '-0' : '0';
    }

    // Trim trailing zeros from decimal part only (if decimal point exists)
    if (result.includes('.')) {
      result = result.replace(TRAILING_ZEROS_REGEX, '');
    }

    return isNegative && !result.startsWith('-') ? '-' + result : result;
  });
}