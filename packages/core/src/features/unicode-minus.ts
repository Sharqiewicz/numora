/**
 * Normalizes non-ASCII minus/hyphen characters to the ASCII hyphen-minus (U+002D).
 *
 * Numeric values copied from other applications frequently carry a typographic minus that
 * is NOT U+002D: macOS Calculator and many spreadsheet/PDF exports use U+2212 (MINUS SIGN),
 * CJK IMEs produce U+FF0D (FULLWIDTH HYPHEN-MINUS), and some sources emit U+FE63 (SMALL
 * HYPHEN-MINUS). Without normalization these are treated as ordinary non-numeric characters
 * and stripped, so a pasted `−1234.56` silently becomes a positive `1234.56` — a sign flip,
 * which is exactly the class of silent corruption this library exists to prevent.
 *
 * Runs before the sign-preservation logic in `removeNonNumericCharacters`, which only
 * recognizes a leading U+002D.
 */

// U+2212 MINUS SIGN, U+FF0D FULLWIDTH HYPHEN-MINUS, U+FE63 SMALL HYPHEN-MINUS.
// Deliberately NOT included: the dash family (en/em dash, figure dash) — those are
// punctuation, not a numeric sign, and normalizing them would over-reach.
const UNICODE_MINUS = /[−－﹣]/g;

/**
 * @param value - Input value potentially containing a non-ASCII minus
 * @returns Value with recognized minus variants converted to ASCII `-`
 *
 * @example
 * normalizeUnicodeMinus("−5") // Returns: "-5"
 */
export function normalizeUnicodeMinus(value: string): string {
  return value.replace(UNICODE_MINUS, '-');
}
