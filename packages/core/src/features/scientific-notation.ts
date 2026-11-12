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
 * True when `value` holds a number in scientific notation that `expandScientificNotation`
 * would expand: a mantissa (digits, optionally ending in the decimal separator: `1.e5`),
 * `e`/`E`, an optional sign, then a digit (`1.5e-7`, `2E5`, `1,e5` with `,` as decimal
 * separator). Expects ASCII digits; words like `EUR` or `2e` don't match.
 */
export function containsScientificNotation(value: string, decimalSeparator: string = '.'): boolean {
  // `1.e5` is read as `1e5`: a separator between the digits and the `e` changes nothing.
  return /\d[eE][+-]?\d/.test(value.replace(/[eE]/g, 'e').split(`${decimalSeparator}e`).join('e'));
}

/**
 * Expands scientific notation to decimal notation using string manipulation only.
 * Handles formats like: 1.5e-7, 2e+5, 1.23e-4, etc.
 * Finds and expands scientific notation anywhere in the string.
 *
 * Scans left to right in linear time instead of using a regex (see `utils/mantissa-scan.ts`
 * for why): a digit run not followed by `e`/`E` is skipped in one jump.
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

    if (value[mantissaEnd] === 'e' || value[mantissaEnd] === 'E') {
      let e = mantissaEnd + 1;
      const expSignChar = value[e];
      if (expSignChar === '+' || expSignChar === '-') e++;
      const expDigitsStart = e;
      while (isDigit(value[e])) e++;

      if (e > expDigitsStart) {
        // Reject a token like "1e3.5": the exponent grammar is digits-only, so a leftover
        // ".5" would otherwise be concatenated by `removeNonNumericCharacters` downstream
        // ("1e3.5" -> "1000.5"). Drop the whole token, including its separator-plus-digits
        // tail, so the result is visibly wrong rather than a plausible ".5". Like the
        // huge-exponent path below, this is a deliberate rejection.
        if (value[e] === decimalSeparator && isDigit(value[e + 1])) {
          while (value[e] === decimalSeparator && isDigit(value[e + 1])) {
            e++;
            while (isDigit(value[e])) e++;
          }
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

  // A leading '+' is a sign, not a digit: "+1e-3" is 0.001, "+1e3" is 1000.
  if (base.startsWith('+')) base = base.slice(1);

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

  // A zero magnitude stays "0" whatever the exponent or sign: "-0e5" is 0, not "-0".
  if (ALL_ZEROS_REGEX.test(integerPart + decimalPart)) return '0';

  const expanded =
    exponent > 0
      ? expandPositiveExponent(integerPart, decimalPart, exponent, decimalSeparator)
      : expandNegativeExponent(
          integerPart,
          decimalPart,
          Math.abs(exponent),
          decimalSeparator
        );

  return isNegative ? '-' + expanded : expanded;
}

function expandPositiveExponent(
  integerPart: string,
  decimalPart: string,
  exponent: number,
  decimalSeparator: string
): string {
  // Move the point `exponent` places right, padding with zeros when the digits run out.
  const digits = (integerPart + decimalPart).padEnd(integerPart.length + exponent, '0');
  const newIntegerPart = digits.slice(0, integerPart.length + exponent);
  const newDecimalPart = digits.slice(integerPart.length + exponent);
  return newDecimalPart ? `${newIntegerPart}${decimalSeparator}${newDecimalPart}` : newIntegerPart;
}

function expandNegativeExponent(
  integerPart: string,
  decimalPart: string,
  exponent: number,
  decimalSeparator: string
): string {
  // Move the point `exponent` places left, padding with zeros when the digits run out.
  const shortfall = Math.max(0, exponent - integerPart.length);
  const digits = '0'.repeat(shortfall) + integerPart + decimalPart;
  const pointAt = integerPart.length + shortfall - exponent;
  return trimTrailingZeroRun(
    `${digits.slice(0, pointAt) || '0'}${decimalSeparator}${digits.slice(pointAt)}`,
    decimalSeparator
  );
}
