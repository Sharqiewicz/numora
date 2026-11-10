/**
 * Normalizes non-ASCII decimal digits (fullwidth, Arabic-Indic, Devanagari, Thai, Ol Chiki,
 * Adlam, mathematical digits, etc.) to ASCII digits (0-9), so users typing on those
 * keyboards, or pasting a locale's own formatted number, can enter a value.
 *
 * Deliberately table-driven: no `\p{Nd}` property escape (unsupported on Hermes) and no
 * regex with astral ranges. Every decimal numbering system exposed by
 * `Intl.supportedValuesOf('numberingSystem')` (except hanidec, handled separately below) is
 * contiguous from its zero, so one zero code point per system is enough. The input is walked
 * by code point, so astral-plane sets (Adlam, Osmanya, Brahmi, math digits...) are handled
 * as surrogate pairs correctly.
 */

/** Zero code points of every supported contiguous decimal-digit set, ascending. */
const ZEROS = [
  0x660, 0x6f0, 0x7c0, 0x966, 0x9e6, 0xa66, 0xae6, 0xb66, 0xbe6, 0xc66, 0xce6, 0xd66, 0xde6,
  0xe50, 0xed0, 0xf20, 0x1040, 0x1090, 0x17e0, 0x1810, 0x1946, 0x19d0, 0x1a80, 0x1a90, 0x1b50,
  0x1bb0, 0x1c40, 0x1c50, 0xa620, 0xa8d0, 0xa900, 0xa9d0, 0xa9f0, 0xaa50, 0xabf0, 0xff10,
  0x104a0, 0x10d30, 0x10d40, 0x11066, 0x110f0, 0x11136, 0x111d0, 0x112f0, 0x11450, 0x114d0,
  0x11650, 0x116c0, 0x116d0, 0x116da, 0x11730, 0x118e0, 0x11950, 0x11bf0, 0x11c50, 0x11d50,
  0x11da0, 0x11de0, 0x11f50, 0x16130, 0x16a60, 0x16ac0, 0x16b50, 0x16d70, 0x1ccf0, 0x1d7ce,
  0x1d7d8, 0x1d7e2, 0x1d7ec, 0x1d7f6, 0x1e140, 0x1e2f0, 0x1e4f0, 0x1e5f1, 0x1e950, 0x1fbf0,
];

/** Han decimal digits (numbering system `hanidec`) are NOT contiguous: 〇 一 二 ... 九. */
const HANIDEC: Record<number, string> = {
  0x3007: '0', 0x4e00: '1', 0x4e8c: '2', 0x4e09: '3', 0x56db: '4',
  0x4e94: '5', 0x516d: '6', 0x4e03: '7', 0x516b: '8', 0x4e5d: '9',
};

function digitValue(code: number): string | undefined {
  const han = HANIDEC[code];
  if (han !== undefined) return han;
  // Binary search for the greatest zero <= code.
  let lo = 0;
  let hi = ZEROS.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (ZEROS[mid] <= code) lo = mid + 1;
    else hi = mid - 1;
  }
  if (hi < 0) return undefined;
  const offset = code - ZEROS[hi];
  return offset <= 9 ? String(offset) : undefined;
}

/**
 * @param value - Input value potentially containing non-ASCII decimal digits
 * @returns Value with recognized non-ASCII decimal digits converted to ASCII
 *
 * @example
 * normalizeDigits("１２３") // Returns: "123" (fullwidth)
 * normalizeDigits("١٢٣") // Returns: "123" (Arabic-Indic)
 * normalizeDigits("१२३") // Returns: "123" (Devanagari)
 * normalizeDigits("一二三") // Returns: "123" (Han decimal digits)
 */
export function normalizeDigits(value: string): string {
  // Fast path: nothing at or above the first non-ASCII digit block (U+0660).
  if (!/[^\u0000-\u065f]/.test(value)) return value;

  let out = '';
  // for...of iterates by code point, so surrogate pairs arrive as one character.
  for (const char of value) {
    const code = char.codePointAt(0) as number;
    out += digitValue(code) ?? char;
  }
  return out;
}

