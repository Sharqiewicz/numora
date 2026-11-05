/**
 * Static regex patterns for compact notation processing.
 * Defined at module level to avoid recompilation on each function call.
 */
import { escapeRegExp } from '../utils/escape-reg-exp';
import { getCachedRegex } from '../utils/regex-cache';
import { failedMantissaResumeIndex, isDigit, matchMantissaAt } from '../utils/mantissa-scan';

// Remove leading zeros from integer part
const LEADING_ZEROS_REGEX = /^0+/;

// Remove leading zeros after sign, preserving at least one non-zero digit
const LEADING_ZERO_REPLACE_REGEX = /^(-?)0+([1-9])/;

// Match strings that are all zeros (with optional sign)
const ALL_ZEROS_REGEX = /^-?0+$/;

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
 * Implementation note: this used to be a single `String.replace` with a mantissa
 * alternation of the form `\d+sep?\d*|sep\d+` and no early exit at all, so any long
 * digit string - with `enableCompactNotation` on - cost O(N^2) in the regex engine
 * whether or not a suffix was ever found. This is now a single left-to-right scan (see
 * `matchMantissaAt`): a maximal digit run that isn't followed by (optional whitespace
 * and) a suffix letter is skipped in one jump rather than retried at every offset inside
 * it, which is what keeps this linear instead of quadratic on a pathological paste.
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

  const escapedSep = escapeRegExp(decimalSeparator);
  const trailingZerosRegex = getCachedRegex(`${escapedSep}?0+$`, '');

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
    while (s < len && WHITESPACE_REGEX.test(value[s])) s++;

    const suffixChar = value[s];
    const suffixLower = suffixChar !== undefined ? suffixChar.toLowerCase() : '';
    const zerosToAdd = ZERO_COUNTS[suffixLower];

    // A suffix immediately followed by a digit or another decimal separator is not a
    // standalone compact-notation token - it's a mid-number keystroke (e.g. typing "k" in
    // the middle of "1|234" produces "1k234", which must round-trip unchanged so the
    // beforeinput caller can reject the keystroke - A2-10) rather than glue onto a longer
    // numeral. End of string, whitespace, or any other non-numeric character right after
    // the suffix is a valid boundary and still expands (e.g. "1k 2m", "1k USD", "1kk").
    const charAfterSuffix = value[s + 1];
    const suffixFollowedByDigitOrSeparator =
      isDigit(charAfterSuffix) || value.startsWith(decimalSeparator, s + 1);

    if (zerosToAdd && !suffixFollowedByDigitOrSeparator) {
      const number = value.slice(i, mantissaEnd);
      out += expandToken(number, zerosToAdd, decimalSeparator, trailingZerosRegex);
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

function expandToken(
  number: string,
  zerosToAdd: number,
  decimalSeparator: string,
  trailingZerosRegex: RegExp
): string {
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
}
