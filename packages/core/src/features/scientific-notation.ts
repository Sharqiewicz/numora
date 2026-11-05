/**
 * Static regex patterns for scientific notation processing.
 * Defined at module level to avoid recompilation on each function call.
 */
import {
  failedMantissaResumeIndex,
  isDigit,
  matchMantissaAt,
  trimTrailingZeroRun,
} from '../utils/mantissa-scan';

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
 * Implementation note: this used to be a single `String.replace` with a mantissa
 * alternation of the form `\d+sep?\d*|sep\d+`. That pattern lets the engine split a
 * digit run between `\d+` and `\d*` at every position, so a run of N digits with no
 * trailing `e` cost O(N^2) - a pasted string of a few thousand digits froze the main
 * thread for seconds. Tightening the alternation to `\d+(?:sep\d*)?|sep\d+` (the
 * optional group can only be entered by matching the separator literal first) removes
 * the ambiguity, but a hand-rolled single-pass scan is still meaningfully safer at
 * 10k+ digit inputs: when a maximal digit run isn't followed by `e`/`E`, no shorter
 * mantissa starting inside that same run can succeed either (the digit-run boundary is
 * a deterministic function of the start position, not something worth re-deriving one
 * character at a time), so the whole run is skipped in one jump instead of retried at
 * every offset.
 *
 * See `utils/mantissa-scan.ts` for the re-anchoring rule applied when a mantissa is
 * followed by neither a valid token nor a plain boundary.
 *
 * @param value - The string value that may contain scientific notation
 * @returns The expanded decimal string, or original value if not scientific notation
 */
export function expandScientificNotation(value: string, decimalSeparator: string = '.'): string {
  // Fast early-exit for the dominant case (no scientific notation present)
  if (!value.includes('e') && !value.includes('E')) return value;

  const len = value.length;
  let out = '';
  let i = 0;

  while (i < len) {
    const ch = value[i];
    const hasSign = ch === '+' || ch === '-';
    const mantissaStart = hasSign ? i + 1 : i;
    const match = matchMantissaAt(value, mantissaStart, decimalSeparator);

    if (match === null) {
      out += ch;
      i++;
      continue;
    }

    const mantissaEnd = match.end;

    if (mantissaEnd < len && (value[mantissaEnd] === 'e' || value[mantissaEnd] === 'E')) {
      let e = mantissaEnd + 1;
      const expSignChar = value[e];
      if (expSignChar === '+' || expSignChar === '-') e++;
      const expDigitsStart = e;
      while (e < len && isDigit(value[e])) e++;

      if (e > expDigitsStart) {
        // Reject a token like "1e3.5": the exponent grammar is digits-only, so a decimal
        // separator immediately followed by a digit right after the exponent digits would
        // otherwise leak through untouched and get silently concatenated by
        // `removeNonNumericCharacters` downstream, fabricating a magnitude
        // ("1e3.5" -> "1000.5"). Treat it the same as an over-range exponent: drop the
        // base+exponent token (the leftover ".5" is untouched here and handled, or not,
        // by later pipeline steps - same as the huge-exponent path below).
        if (value[e] === decimalSeparator && isDigit(value[e + 1])) {
          i = e;
          continue;
        }

        const base = value.slice(i, mantissaEnd);
        const expStr = value.slice(mantissaEnd + 1, e);
        out += expandToken(base, expStr, decimalSeparator);
        i = e;
        continue;
      }
    }

    // Mantissa found but nothing valid follows it. See `failedMantissaResumeIndex` for why
    // this cannot always jump straight to `mantissaEnd`.
    const resume = failedMantissaResumeIndex(value, match, decimalSeparator);
    out += value.slice(i, resume);
    i = resume;
  }

  return out;
}

function expandToken(
  base: string,
  expStr: string,
  decimalSeparator: string
): string {
  const exponent = parseInt(expStr, 10);

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

  const expanded =
    exponent > 0
      ? expandPositiveExponent(integerPart, decimalPart, exponent, decimalSeparator)
      : expandNegativeExponent(
          integerPart,
          decimalPart,
          Math.abs(exponent),
          decimalSeparator
        );

  // Don't carry the sign onto a magnitude that collapsed to zero: "-0e5" is 0, not "-0".
  return isNegative && expanded !== '0' ? '-' + expanded : expanded;
}

function expandPositiveExponent(
  integerPart: string,
  decimalPart: string,
  exponent: number,
  decimalSeparator: string
): string {
  const allDigits = integerPart + decimalPart;

  if (allDigits === '0' || ALL_ZEROS_REGEX.test(allDigits)) {
    return '0';
  }

  const currentDecimalPosition = decimalPart.length;

  if (exponent <= currentDecimalPosition) {
    const newIntegerPart = allDigits.slice(0, integerPart.length + exponent);
    const newDecimalPart = allDigits.slice(integerPart.length + exponent);
    return newDecimalPart
      ? `${newIntegerPart}${decimalSeparator}${newDecimalPart}`
      : newIntegerPart;
  }

  const zerosToAdd = exponent - currentDecimalPosition;
  return allDigits + '0'.repeat(zerosToAdd);
}

function expandNegativeExponent(
  integerPart: string,
  decimalPart: string,
  exponent: number,
  decimalSeparator: string
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
    return trimTrailingZeros(result, decimalSeparator);
  }

  if (newDecimalPosition < integerPart.length) {
    const newIntegerPart = allDigits.slice(0, newDecimalPosition);
    const newDecimalPart = allDigits.slice(newDecimalPosition);
    const result = `${newIntegerPart}${decimalSeparator}${newDecimalPart}`;
    return trimTrailingZeros(result, decimalSeparator);
  }

  return trimTrailingZeros(allDigits, decimalSeparator);
}

function trimTrailingZeros(
  value: string,
  decimalSeparator: string
): string {
  if (!value.includes(decimalSeparator)) {
    return value;
  }

  const zeroSep = '0' + decimalSeparator;
  const negZeroSep = '-0' + decimalSeparator;

  if (value === zeroSep) {
    return '0';
  }

  if (value.startsWith(zeroSep)) {
    const trimmed = trimTrailingZeroRun(value, decimalSeparator);
    return trimmed === '0' ? '0' : trimmed || '0';
  }

  if (value.startsWith(negZeroSep)) {
    const trimmed = trimTrailingZeroRun(value, decimalSeparator);
    if (trimmed === '-0' || trimmed === '0') {
      return '0';
    }
    return trimmed || '0';
  }

  return trimTrailingZeroRun(value, decimalSeparator) || value;
}
