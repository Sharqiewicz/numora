/**
 * Static regex patterns for scientific notation processing.
 * Defined at module level to avoid recompilation on each function call.
 */

// Match scientific notation: number with optional sign, optional decimal, followed by e/E and exponent
const SCIENTIFIC_NOTATION_REGEX = /([+-]?\d+\.?\d*)[eE]([+-]?\d+)/g;

// Match strings that are all zeros
const ALL_ZEROS_REGEX = /^0+$/;

// Trim trailing zeros from decimal part (including optional decimal point)
const TRAILING_ZEROS_REGEX = /\.?0+$/;

/**
 * Expands scientific notation to decimal notation using string manipulation only.
 * Handles formats like: 1.5e-7, 2e+5, 1.23e-4, etc.
 * Finds and expands scientific notation anywhere in the string.
 *
 * @param value - The string value that may contain scientific notation
 * @returns The expanded decimal string, or original value if not scientific notation
 */
export function expandScientificNotation(value: string): string {
  // Fast early-exit for the dominant case (no scientific notation present)
  if (!value.includes('e') && !value.includes('E')) return value;

  // Single-pass replacement: String.replace() with a callback eliminates the
  // per-call new RegExp() compilation and the two-phase collect+replace loop.
  // String.replace() resets lastIndex to 0 before each global replace, so
  // SCIENTIFIC_NOTATION_REGEX can be reused safely as a module-level constant.
  return value.replace(SCIENTIFIC_NOTATION_REGEX, (_full, base, exp) => {
    const exponent = parseInt(exp, 10);

    if (exponent === 0) return base;

    const isNegative = base.startsWith('-');
    const baseWithoutSign = isNegative ? base.slice(1) : base;
    const [integerPart, decimalPart = ''] = baseWithoutSign.split('.');

    const expanded = exponent > 0
      ? expandPositiveExponent(integerPart, decimalPart, exponent)
      : expandNegativeExponent(integerPart, decimalPart, Math.abs(exponent));

    return isNegative ? '-' + expanded : expanded;
  });
}

function expandPositiveExponent(
  integerPart: string,
  decimalPart: string,
  exponent: number,
): string {
  const allDigits = integerPart + decimalPart;

  if (allDigits === '0' || ALL_ZEROS_REGEX.test(allDigits)) {
    return '0';
  }

  const currentDecimalPosition = decimalPart.length;

  if (exponent <= currentDecimalPosition) {
    const newIntegerPart = allDigits.slice(0, integerPart.length + exponent);
    const newDecimalPart = allDigits.slice(integerPart.length + exponent);
    return newDecimalPart ? `${newIntegerPart}.${newDecimalPart}` : newIntegerPart;
  }

  const zerosToAdd = exponent - currentDecimalPosition;
  return allDigits + '0'.repeat(zerosToAdd);
}

function expandNegativeExponent(
  integerPart: string,
  decimalPart: string,
  exponent: number,
): string {
  const allDigits = integerPart + decimalPart;

  if (allDigits === '0' || ALL_ZEROS_REGEX.test(allDigits)) {
    return '0';
  }

  const currentDecimalPosition = integerPart.length;

  const newDecimalPosition = currentDecimalPosition - exponent;

  if (newDecimalPosition <= 0) {
    const leadingZeros = Math.abs(newDecimalPosition);
    const result = `0.${'0'.repeat(leadingZeros)}${allDigits}`;
    return trimTrailingZeros(result);
  }

  if (newDecimalPosition < integerPart.length) {
    const newIntegerPart = allDigits.slice(0, newDecimalPosition);
    const newDecimalPart = allDigits.slice(newDecimalPosition);
    const result = `${newIntegerPart}.${newDecimalPart}`;
    return trimTrailingZeros(result);
  }

  return trimTrailingZeros(allDigits);
}

function trimTrailingZeros(value: string): string {
  if (!value.includes('.')) {
    return value;
  }

  if (value === '0.') {
    return '0';
  }

  if (value.startsWith('0.')) {
    const trimmed = value.replace(TRAILING_ZEROS_REGEX, '');
    return trimmed === '0' ? '0' : trimmed || '0';
  }

  if (value.startsWith('-0.')) {
    const trimmed = value.replace(TRAILING_ZEROS_REGEX, '');
    if (trimmed === '-0' || trimmed === '0') {
      return '0';
    }
    return trimmed || '0';
  }

  return value.replace(TRAILING_ZEROS_REGEX, '') || value;
}
