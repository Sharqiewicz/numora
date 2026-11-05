import { getCachedRegex } from '../utils/regex-cache';

/**
 * Normalizes non-ASCII decimal digits (fullwidth, Arabic-Indic, Devanagari, Thai, etc.)
 * to ASCII digits (0-9). `utils/locale.ts` correctly derives separators for locales such
 * as `ar-EG`, `fa-IR`, and `bn-IN`, but their native digit shapes were previously stripped
 * outright by `removeNonNumericCharacters` - meaning users typing on those keyboards could
 * not enter a value at all. This function is the fix: it recognizes every Unicode
 * decimal-digit (Nd) block reachable without a `\p{Nd}` property escape (unsupported on
 * Hermes) and maps each character back to its ASCII equivalent by offset from the block's
 * own zero code point - every Nd block is contiguous from its zero, the same fact
 * `locale.ts` relies on for its probe.
 *
 * Fullwidth digits (U+FF10-U+FF19) are the block Japanese/Chinese IME keyboards commonly
 * produce; they look identical to ASCII digits but were the only block handled before.
 */

/**
 * Zero code points of the supported decimal-digit blocks, in ascending order. Each block
 * spans exactly ten code points (zero..zero+9), so this one number per block is enough to
 * both build the match pattern below and, per matched character, recover its ASCII value.
 *
 * Blocks covered, in order: Arabic-Indic, Extended Arabic-Indic (Persian), NKo, Devanagari,
 * Bengali, Gurmukhi, Gujarati, Oriya, Tamil, Telugu, Kannada, Malayalam, Thai, Lao, Tibetan,
 * Myanmar, Khmer, Mongolian, Fullwidth.
 */
const ZEROS = [
  0x0660, 0x06f0, 0x07c0, 0x0966, 0x09e6, 0x0a66, 0x0ae6, 0x0b66, 0x0be6, 0x0c66, 0x0ce6, 0x0d66,
  0x0e50, 0x0ed0, 0x0f20, 0x1040, 0x17e0, 0x1810, 0xff10,
];

// prettier-ignore
const DIGIT_CLASS =
  '[\\u0660-\\u0669\\u06F0-\\u06F9\\u07C0-\\u07C9\\u0966-\\u096F\\u09E6-\\u09EF' +
  '\\u0A66-\\u0A6F\\u0AE6-\\u0AEF\\u0B66-\\u0B6F\\u0BE6-\\u0BEF\\u0C66-\\u0C6F' +
  '\\u0CE6-\\u0CEF\\u0D66-\\u0D6F\\u0E50-\\u0E59\\u0ED0-\\u0ED9\\u0F20-\\u0F29' +
  '\\u1040-\\u1049\\u17E0-\\u17E9\\u1810-\\u1819\\uFF10-\\uFF19]';

/**
 * @param value - Input value potentially containing non-ASCII decimal digits
 * @returns Value with recognized non-ASCII decimal digits converted to ASCII
 *
 * @example
 * normalizeDigits("１２３") // Returns: "123" (fullwidth)
 * normalizeDigits("١٢٣") // Returns: "123" (Arabic-Indic)
 * normalizeDigits("۱۲۳") // Returns: "123" (Extended Arabic-Indic / Persian)
 * normalizeDigits("१२३") // Returns: "123" (Devanagari)
 */
export function normalizeDigits(value: string): string {
  return value.replace(getCachedRegex(DIGIT_CLASS), (char) => {
    const code = char.charCodeAt(0);
    for (const zero of ZEROS) {
      if (code >= zero && code <= zero + 9) {
        return String(code - zero);
      }
    }
    return char;
  });
}

/**
 * @deprecated Alias of {@link normalizeDigits}, kept for backward compatibility. The
 * function now normalizes every supported Unicode decimal-digit block, not just fullwidth.
 */
export const normalizeFullWidthDigits = normalizeDigits;
