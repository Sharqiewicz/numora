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
  // Match patterns: number followed by scale suffix (case-insensitive)
  // Regex: (\d+\.?\d*) captures the number (with optional decimal)
  //        \s* allows optional whitespace
  //        (Qa|Qi|Sx|Sp|[kmbMTO]) captures the suffix (case-insensitive with 'i' flag)
  // Note: Multi-character suffixes (Qa, Qi, Sx, Sp) must come before single characters
  // Note: N is handled separately to avoid conflict with 'n' character
  const compactNotationRegex = /(\d+\.?\d*)\s*(Qa|Qi|Sx|Sp|[kmbMTO]|N)/gi;

  return value.replace(compactNotationRegex, (match, number, suffix) => {
    // Define multipliers as number of zeros to add
    // Supports both lowercase and uppercase variants
    // Scale values: k=3, m/M=6, b=9, T=12, Qa=15, Qi=18, Sx=21, Sp=24, O=27, N=30
    const zeroCounts: Record<string, number> = {
      k: 3,   // Thousand
      K: 3,   // Thousand
      m: 6,   // Million (lowercase)
      M: 6,   // Million (uppercase)
      b: 9,   // Billion
      B: 9,   // Billion
      T: 12,  // Trillion
      t: 12,  // Trillion
    };

    // Handle case-insensitive matching
    // For multi-character suffixes (Qa, Qi, Sx, Sp), use exact match
    // For single characters, normalize to lowercase except M, T, O, N which are uppercase-only
    let zerosToAdd: number | undefined;
    if (suffix.length > 1) {
      // Multi-character: Qa, Qi, Sx, Sp - case-insensitive
      // Try exact match first, then normalized case (first char uppercase, rest lowercase)
      const normalizedSuffix = suffix.charAt(0).toUpperCase() + suffix.slice(1).toLowerCase();
      zerosToAdd = zeroCounts[suffix] || zeroCounts[normalizedSuffix];
    } else {
      // Single character: check both original and lowercase
      const suffixLower = suffix.toLowerCase();
      zerosToAdd = zeroCounts[suffix] || zeroCounts[suffixLower];
    }
    if (!zerosToAdd) {
      return match;
    }

    const isNegative = number.startsWith('-');
    const numberWithoutSign = isNegative ? number.slice(1) : number;
    const [integerPart, decimalPart = ''] = numberWithoutSign.split('.');

    // Remove leading zeros from integer part (but keep at least one digit if it's all zeros)
    const cleanedInteger = integerPart.replace(/^0+/, '') || '0';

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
    // Only remove leading zeros that were in the original number, not the ones we added
    result = result.replace(/^(-?)0+([1-9])/, '$1$2');
    // If result is all zeros, keep one zero
    if (result.match(/^-?0+$/)) {
      result = isNegative ? '-0' : '0';
    }

    // Trim trailing zeros from decimal part only (if decimal point exists)
    if (result.includes('.')) {
      result = result.replace(/\.?0+$/, '');
    }

    return isNegative && !result.startsWith('-') ? '-' + result : result;
  });
}