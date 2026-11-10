import { ARABIC_DECIMAL_SEPARATOR as ARABIC_DECIMAL } from './decimal-separators';
import { normalizeDigits } from './fullwidth-digits';
import { isDigit } from '../utils/mantissa-scan';
import type { GroupingStyle } from '../types';

interface ForeignFormatOptions {
  decimalSeparator?: string;
  thousandSeparator?: string;
  groupingStyle?: GroupingStyle;
}

// ARABIC_DECIMAL is a decimal mark wherever it appears. The field's own decimal separator
// joins it when that separator is not '.' or ','.

const digitsOnly = (s: string): string => s.replace(/\D/g, '');

/**
 * A single mark splits the digits into `head` and `tail`. It reads as grouping only when
 * both sides form valid digit groups: Thousand `1,234` / `123,456` (first group 1-3
 * digits, no leading zero, one group of exactly 3) or, for a Wan field, `123,4567`.
 * Multiple marks are always grouping (decided by the caller), so Lakh `12,34,567` needs
 * no special case here.
 */
function formsValidGroups(head: string, tail: string, style?: GroupingStyle): boolean {
  // `head >= '1'` rejects an empty head and a leading zero (head is digits only here).
  return (
    head >= '1' &&
    ((head.length <= 3 && tail.length === 3) ||
      (style === 'wan' && head.length <= 4 && tail.length === 4))
  );
}

/**
 * Foreign-format detection (ADR 0006). Reads the first number in `value` WITHOUT assuming
 * it was written in the field's locale, and returns it in canonical form: `.` decimal, no
 * grouping. Text around the number (sign, currency, `e3`, `k`) is preserved untouched.
 *
 * 1. Digits are folded to ASCII, whitespace dropped, and the field's own thousand
 *    separator removed when it is neither `.` nor `,`.
 * 2. If both `.` and `,` appear, the LAST one is the decimal mark and the rest group.
 * 3. If one kind appears: more than once -> grouping; equals the field's decimal
 *    separator -> decimal; forms valid digit groups -> grouping; otherwise -> decimal.
 *
 * Pure and Hermes-safe (no `Intl.formatToParts`, no Unicode property escapes). Never use
 * it on app-supplied values (canonical already) or on typed text (locale text already).
 */
export function normalizeForeignFormat(value: string, options?: ForeignFormatOptions): string {
  const decimalSeparator = options?.decimalSeparator ?? '.';
  const thousandSeparator = options?.thousandSeparator;

  let v = normalizeDigits(value).replace(/[\s​]/g, '');
  // Strip the field's own grouping mark first, so the glyph remap below never sees it.
  if (thousandSeparator && thousandSeparator !== '.' && thousandSeparator !== ',') {
    v = v.split(thousandSeparator).join('');
  }
  // Comma-like and dot-like glyphs read as ',' and '.', unless the field's own separator.
  v = v.replace(/[،，．。]/g, (g) => (g === decimalSeparator ? g : '،，'.includes(g) ? ',' : '.'));

  // The field's own decimal separator is a definite mark when it is not '.' or ',';
  // otherwise ARABIC_DECIMAL stands in (already definite), so there is always a value.
  const custom = decimalSeparator === '.' || decimalSeparator === ',' ? ARABIC_DECIMAL : decimalSeparator;
  const isMark = (c: string): boolean => c === '.' || c === ',' || c === ARABIC_DECIMAL || c === custom;

  // Locate the first number: a run of digits and marks.
  let start = 0;
  while (start < v.length && !isDigit(v.charAt(start)) && !isMark(v.charAt(start))) start++;
  let end = start;
  while (isDigit(v.charAt(end)) || isMark(v.charAt(end))) end++;

  const token = v.slice(start, end);
  // Marks without a single digit ("....") carry no number to interpret; leave them for
  // the rest of the pipeline.
  if (!/[0-9]/.test(token)) return v;

  // Index in `token` of the decimal mark, -1 when there is none (grouping only).
  let decimalIdx = Math.max(token.lastIndexOf(ARABIC_DECIMAL), token.lastIndexOf(custom));
  if (decimalIdx < 0) {
    const dot = token.lastIndexOf('.');
    const comma = token.lastIndexOf(',');
    const last = Math.max(dot, comma);
    const mark = token.charAt(last);
    if (
      // Both kinds: the last one is the decimal. One kind: several marks are grouping; a
      // single mark is decimal when it is the field's own or does not form valid groups.
      // (No mark at all: last is -1, mark is '' and indexOf('') is 0, so this is false.)
      Math.min(dot, comma) >= 0 ||
      (token.indexOf(mark) === last &&
        (mark === decimalSeparator ||
          !formsValidGroups(token.slice(0, last), token.slice(last + 1), options?.groupingStyle)))
    ) {
      decimalIdx = last;
    }
  }

  const canonical =
    decimalIdx < 0
      ? digitsOnly(token)
      : `${digitsOnly(token.slice(0, decimalIdx))}.${digitsOnly(token.slice(decimalIdx + 1))}`;

  return v.slice(0, start) + canonical + v.slice(end);
}

/** Canonical text (`.` decimal) to the field's decimal separator. */
export function canonicalToDisplayText(value: string, decimalSeparator: string = '.'): string {
  return value.split('.').join(decimalSeparator);
}
