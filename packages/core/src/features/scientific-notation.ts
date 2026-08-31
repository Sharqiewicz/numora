/**
 * Static regex patterns for scientific notation processing.
 * Defined at module level to avoid recompilation on each function call.
 */
import { escapeRegExp } from '../utils/escape-reg-exp';
import { getCachedRegex } from '../utils/regex-cache';

// Match strings that are all zeros
const ALL_ZEROS_REGEX = /^0+$/;

// Upper bound on the number of digits a single exponent may introduce. A larger
// exponent is left unexpanded: `'0'.repeat(n)` allocates ~n bytes and throws a
// RangeError past ~2^28 chars, so an unbounded exponent from paste/typing (e.g.
// "1e600000000") is an uncaught crash / multi-hundred-MB allocation on one keystroke.
// Financial inputs never legitimately need this magnitude.
const MAX_EXPANSION_DIGITS = 1000;

/**
 * Expands scientific notation to decimal notation using string manipulation only.
 * Handles formats like: 1.5e-7, 2e+5, 1.23e-4, etc.
 * Finds and expands scientific notation anywhere in the string.
 *
 * @param value - The string value that may contain scientific notation
 * @returns The expanded decimal string, or original value if not scientific notation
 */
export function expandScientificNotation(value: string, decimalSeparator: string = '.'): string {
  // Fast early-exit for the dominant case (no scientific notation present)
  if (!value.includes('e') && !value.includes('E')) return value;

  const escapedSep = escapeRegExp(decimalSeparator);
  // The mantissa alternation accepts both a normal number (`\d+sep?\d*`) and a bare
  // leading-decimal number (`sep\d+`, e.g. ".5"). Without the second branch, ".5e3"
  // matched only "5e3" and left the "." dangling, silently yielding ".5000" (a 1000x
  // error) instead of "500".
  const scientificRegex = getCachedRegex(
    `([+-]?(?:\\d+${escapedSep}?\\d*|${escapedSep}\\d+))[eE]([+-]?\\d+)`,
    'g'
  );
  const trailingZerosRegex = getCachedRegex(`${escapedSep}?0+$`, '');

  // Single-pass replacement: String.replace() with a callback eliminates the
  // per-call new RegExp() compilation and the two-phase collect+replace loop.
  return value.replace(scientificRegex, (_full, base, exp) => {
    const exponent = parseInt(exp, 10);

    if (exponent === 0) return base;

    // Reject the whole token rather than allocate/crash on a huge exponent. Returning the
    // token untouched is NOT safe: downstream `removeNonNumericCharacters` strips the stray
    // 'e' and concatenates what is left, so "1e600000000" would surface as 1600000000 - a
    // fabricated magnitude the user never typed. Dropping it yields an empty (or shorter)
    // value, which is visibly wrong rather than plausibly wrong.
    if (Math.abs(exponent) > MAX_EXPANSION_DIGITS) return '';

    const isNegative = base.startsWith('-');
    const baseWithoutSign = isNegative ? base.slice(1) : base;
    const [integerPart, decimalPart = ''] = baseWithoutSign.split(decimalSeparator);

    const expanded = exponent > 0
      ? expandPositiveExponent(integerPart, decimalPart, exponent, decimalSeparator)
      : expandNegativeExponent(integerPart, decimalPart, Math.abs(exponent), decimalSeparator, trailingZerosRegex);

    // Don't carry the sign onto a magnitude that collapsed to zero: "-0e5" is 0, not "-0".
    return isNegative && expanded !== '0' ? '-' + expanded : expanded;
  });
}

function expandPositiveExponent(
  integerPart: string,
  decimalPart: string,
  exponent: number,
  decimalSeparator: string,
): string {
  const allDigits = integerPart + decimalPart;

  if (allDigits === '0' || ALL_ZEROS_REGEX.test(allDigits)) {
    return '0';
  }

  const currentDecimalPosition = decimalPart.length;

  if (exponent <= currentDecimalPosition) {
    const newIntegerPart = allDigits.slice(0, integerPart.length + exponent);
    const newDecimalPart = allDigits.slice(integerPart.length + exponent);
    return newDecimalPart ? `${newIntegerPart}${decimalSeparator}${newDecimalPart}` : newIntegerPart;
  }

  const zerosToAdd = exponent - currentDecimalPosition;
  return allDigits + '0'.repeat(zerosToAdd);
}

function expandNegativeExponent(
  integerPart: string,
  decimalPart: string,
  exponent: number,
  decimalSeparator: string,
  trailingZerosRegex: RegExp,
): string {
  const allDigits = integerPart + decimalPart;

  if (allDigits === '0' || ALL_ZEROS_REGEX.test(allDigits)) {
    return '0';
  }

  const currentDecimalPosition = integerPart.length;

  const newDecimalPosition = currentDecimalPosition - exponent;

  if (newDecimalPosition <= 0) {
    const leadingZeros = Math.abs(newDecimalPosition);
    const result = `0${decimalSeparator}${'0'.repeat(leadingZeros)}${allDigits}`;
    return trimTrailingZeros(result, decimalSeparator, trailingZerosRegex);
  }

  if (newDecimalPosition < integerPart.length) {
    const newIntegerPart = allDigits.slice(0, newDecimalPosition);
    const newDecimalPart = allDigits.slice(newDecimalPosition);
    const result = `${newIntegerPart}${decimalSeparator}${newDecimalPart}`;
    return trimTrailingZeros(result, decimalSeparator, trailingZerosRegex);
  }

  return trimTrailingZeros(allDigits, decimalSeparator, trailingZerosRegex);
}

function trimTrailingZeros(value: string, decimalSeparator: string, trailingZerosRegex: RegExp): string {
  if (!value.includes(decimalSeparator)) {
    return value;
  }

  const zeroSep = '0' + decimalSeparator;
  const negZeroSep = '-0' + decimalSeparator;

  if (value === zeroSep) {
    return '0';
  }

  if (value.startsWith(zeroSep)) {
    const trimmed = value.replace(trailingZerosRegex, '');
    return trimmed === '0' ? '0' : trimmed || '0';
  }

  if (value.startsWith(negZeroSep)) {
    const trimmed = value.replace(trailingZerosRegex, '');
    if (trimmed === '-0' || trimmed === '0') {
      return '0';
    }
    return trimmed || '0';
  }

  return value.replace(trailingZerosRegex, '') || value;
}
