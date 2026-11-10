/**
 * Static regex patterns for compact notation processing.
 * Defined at module level to avoid recompilation on each function call.
 */
import {
  failedMantissaResumeIndex,
  isDigit,
  matchMantissaAt,
} from '../utils/mantissa-scan';

// Cheap presence check so the scan below never runs on the dominant case (no k/m/b/t
// anywhere in the value).
const SUFFIX_PRESENT_REGEX = /[kmbtKMBT]/;

// `\s` in a single-character test - matches the same set the old `\s*` regex quantifier did.
const WHITESPACE_REGEX = /\s/;

/**
 * Scale suffix to zero count mapping.
 * Uses lowercase keys - suffixes are normalized before lookup.
 */
const ZERO_COUNTS: Record<string, number> = {
  k: 3, // Thousand
  m: 6, // Million
  b: 9, // Billion
  t: 12, // Trillion
};

/**
 * Expands compact notation (k, m, b, t) to full numbers using string manipulation.
 * Handles formats like: 1k, 1.5m, 2B, 1M, 2.5T (case-insensitive)
 * Uses string arithmetic to avoid precision loss with large numbers.
 *
 * Scans left to right in linear time instead of using a regex (see `utils/mantissa-scan.ts`
 * for why): a digit run not followed by a suffix letter is skipped in one jump.
 *
 * See `utils/mantissa-scan.ts` for the re-anchoring rule applied when a mantissa is
 * followed by neither a valid token nor a plain boundary.
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
 * expandCompactNotation("1k234")  // "1k234" (suffix followed by a digit - not a token, left alone)
 */
export function expandCompactNotation(value: string, decimalSeparator: string = '.'): string {
  // Fast early-exit for the dominant case (no compact-notation suffix present anywhere).
  if (!SUFFIX_PRESENT_REGEX.test(value)) return value;

  const len = value.length;
  let out = '';
  let i = 0;

  while (i < len) {
    const match = matchMantissaAt(value, i, decimalSeparator);

    if (match === null) {
      out += value[i];
      i++;
      continue;
    }

    const mantissaEnd = match.end;

    let s = mantissaEnd;
    while (WHITESPACE_REGEX.test(value.charAt(s))) s++;

    const zerosToAdd = ZERO_COUNTS[value.charAt(s).toLowerCase()];

    // A suffix immediately followed by a digit or another decimal separator is not a
    // standalone compact-notation token - it's a mid-number keystroke (e.g. typing "k" in
    // the middle of "1|234" produces "1k234", which must round-trip unchanged so the
    // beforeinput caller can reject the keystroke) rather than glue onto a longer
    // numeral. End of string, whitespace, or any other non-numeric character right after
    // the suffix is a valid boundary and still expands (e.g. "1k 2m", "1k USD", "1kk").
    const charAfterSuffix = value[s + 1];
    const suffixFollowedByDigitOrSeparator =
      isDigit(charAfterSuffix) || value.startsWith(decimalSeparator, s + 1);

    if (zerosToAdd && !suffixFollowedByDigitOrSeparator) {
      const number = value.slice(i, mantissaEnd);
      out += expandToken(number, zerosToAdd, decimalSeparator);
      i = s + 1;
      continue;
    }

    // Mantissa found but nothing valid follows it. See `failedMantissaResumeIndex` for why
    // this cannot always jump straight to `mantissaEnd`.
    const resume = failedMantissaResumeIndex(value, match, decimalSeparator);
    out += value.slice(i, resume);
    i = resume;
  }

  return out;
}

function expandToken(number: string, zerosToAdd: number, decimalSeparator: string): string {
  const [integerPart, decimalPart = ''] = number.split(decimalSeparator);

  // Shift the decimal point right by `zerosToAdd` places, padding with zeros.
  const shifted = (integerPart + decimalPart.slice(0, zerosToAdd).padEnd(zerosToAdd, '0')).replace(
    /^0+/,
    ''
  );
  // Whatever is left of the fraction, without trailing zeros.
  const remainder = decimalPart.slice(zerosToAdd).replace(/0+$/, '');

  return (shifted || '0') + (remainder ? decimalSeparator + remainder : '');
}
