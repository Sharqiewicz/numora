import {
  ARABIC_DECIMAL_SEPARATOR as ARABIC_DECIMAL,
  COMMA_LIKE_GLYPHS,
  DOT_LIKE_GLYPHS,
} from './decimal-separators';
import { normalizeDigits } from './fullwidth-digits';
import type { GroupingStyle } from '../types';

export interface ForeignFormatOptions {
  decimalSeparator?: string;
  thousandSeparator?: string;
  groupingStyle?: GroupingStyle;
}

// ARABIC_DECIMAL is a decimal mark wherever it appears. The field's own decimal separator
// joins it when that separator is not '.' or ','.

const isDigit = (c: string): boolean => c >= '0' && c <= '9';

function mapGlyphs(value: string, glyphs: readonly string[], to: string, keep: Array<string | undefined>) {
  let out = value;
  for (const g of glyphs) {
    if (keep.indexOf(g) !== -1 || out.indexOf(g) === -1) continue;
    out = out.split(g).join(to);
  }
  return out;
}

/**
 * A single mark splits the digits into `head` and `tail`. It reads as grouping only when
 * both sides form valid digit groups: Thousand `1,234` / `123,456` (first group 1-3
 * digits, no leading zero, one group of exactly 3) or, for a Wan field, `123,4567`.
 * Multiple marks are always grouping (decided by the caller), so Lakh `12,34,567` needs
 * no special case here.
 */
function formsValidGroups(head: string, tail: string, style?: GroupingStyle): boolean {
  if (head.length === 0 || head.charAt(0) === '0') return false;
  if (head.length <= 3 && tail.length === 3) return true;
  return style === 'wan' && head.length <= 4 && tail.length === 4;
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
  const keep = [decimalSeparator, thousandSeparator];

  let v = normalizeDigits(value).replace(/[\s​]/g, '');
  v = mapGlyphs(v, COMMA_LIKE_GLYPHS, ',', keep);
  v = mapGlyphs(v, DOT_LIKE_GLYPHS, '.', keep);

  if (thousandSeparator && thousandSeparator !== '.' && thousandSeparator !== ',') {
    v = v.split(thousandSeparator).join('');
  }

  const customDecimal =
    decimalSeparator !== '.' && decimalSeparator !== ',' ? decimalSeparator : undefined;
  const isMark = (c: string): boolean =>
    c === '.' || c === ',' || c === ARABIC_DECIMAL || (customDecimal !== undefined && c === customDecimal);
  const isDefiniteDecimal = (c: string): boolean =>
    c === ARABIC_DECIMAL || (customDecimal !== undefined && c === customDecimal);

  // Locate the first number: a run of digits and marks.
  let start = 0;
  while (start < v.length && !isDigit(v.charAt(start)) && !isMark(v.charAt(start))) start++;
  if (start === v.length) return v;
  let end = start;
  while (end < v.length && (isDigit(v.charAt(end)) || isMark(v.charAt(end)))) end++;

  const token = v.slice(start, end);
  // Marks without a single digit ("....") carry no number to interpret; leave them for
  // the rest of the pipeline.
  if (!/[0-9]/.test(token)) return v;
  let decimalIdx = -1; // index in `token` of the decimal mark, -1 when there is none

  let lastDefinite = -1;
  let dots = 0;
  let commas = 0;
  let lastDot = -1;
  let lastComma = -1;
  for (let i = 0; i < token.length; i++) {
    const c = token.charAt(i);
    if (isDefiniteDecimal(c)) lastDefinite = i;
    else if (c === '.') {
      dots++;
      lastDot = i;
    } else if (c === ',') {
      commas++;
      lastComma = i;
    }
  }

  if (lastDefinite !== -1) {
    decimalIdx = lastDefinite;
  } else if (dots > 0 && commas > 0) {
    decimalIdx = Math.max(lastDot, lastComma);
  } else if (dots + commas === 1) {
    const idx = dots === 1 ? lastDot : lastComma;
    const mark = token.charAt(idx);
    if (mark === decimalSeparator) decimalIdx = idx;
    else if (formsValidGroups(token.slice(0, idx), token.slice(idx + 1), options?.groupingStyle)) {
      decimalIdx = -1;
    } else decimalIdx = idx;
  }
  // dots + commas > 1 of one kind: grouping, decimalIdx stays -1.

  let canonical = '';
  for (let i = 0; i < token.length; i++) {
    const c = token.charAt(i);
    if (isDigit(c)) canonical += c;
    else if (i === decimalIdx) canonical += '.';
  }

  return v.slice(0, start) + canonical + v.slice(end);
}

/** Canonical text (`.` decimal) to the field's decimal separator. */
export function canonicalToDisplayText(value: string, decimalSeparator: string = '.'): string {
  return decimalSeparator === '.' ? value : value.split('.').join(decimalSeparator);
}
