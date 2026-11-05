import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { normalizeDigits, normalizeFullWidthDigits } from '../src/features/fullwidth-digits';
import { sanitizeNumoraInput } from '../src/features/sanitization';

// Zero code point of each block covered by normalizeDigits, named for readability in the
// per-block assertions below. Building the "123" fixtures from these via String.fromCharCode
// (rather than pasting the glyphs directly) keeps the test immune to copy/paste transcription
// errors in scripts most contributors can't visually verify.
const BLOCKS: Record<string, number> = {
  'Arabic-Indic': 0x0660,
  'Extended Arabic-Indic (Persian)': 0x06f0,
  NKo: 0x07c0,
  Devanagari: 0x0966,
  Bengali: 0x09e6,
  Gurmukhi: 0x0a66,
  Gujarati: 0x0ae6,
  Oriya: 0x0b66,
  Tamil: 0x0be6,
  Telugu: 0x0c66,
  Kannada: 0x0ce6,
  Malayalam: 0x0d66,
  Thai: 0x0e50,
  Lao: 0x0ed0,
  Tibetan: 0x0f20,
  Myanmar: 0x1040,
  Khmer: 0x17e0,
  Mongolian: 0x1810,
  Fullwidth: 0xff10,
};

/** Builds the native-script string for `digits` (an ASCII digit string) in the given block. */
function nativeDigits(zero: number, digits: string): string {
  return digits
    .split('')
    .map((d) => String.fromCharCode(zero + Number(d)))
    .join('');
}

describe('normalizeDigits', () => {
  it.each(Object.entries(BLOCKS))('converts %s digits to ASCII', (_name, zero) => {
    expect(normalizeDigits(nativeDigits(zero, '123'))).toBe('123');
    expect(normalizeDigits(nativeDigits(zero, '0123456789'))).toBe('0123456789');
  });

  it('handles mixed-block input (each block normalized independently)', () => {
    const arabicIndic123 = nativeDigits(BLOCKS['Arabic-Indic'], '123');
    const devanagari456 = nativeDigits(BLOCKS.Devanagari, '456');
    expect(normalizeDigits(`${arabicIndic123}${devanagari456}`)).toBe('123456');
  });

  it('leaves ASCII digits unchanged', () => {
    expect(normalizeDigits('1234567890')).toBe('1234567890');
  });

  it('leaves non-digit characters unchanged', () => {
    const arabicIndic1 = nativeDigits(BLOCKS['Arabic-Indic'], '1');
    expect(normalizeDigits(`${arabicIndic1}abc`)).toBe('1abc');
  });

  it('normalizeFullWidthDigits is an alias of normalizeDigits', () => {
    expect(normalizeFullWidthDigits).toBe(normalizeDigits);
    expect(normalizeFullWidthDigits(nativeDigits(BLOCKS.Fullwidth, '789'))).toBe('789');
  });
});

describe('sanitizeNumoraInput accepts non-ASCII decimal digits', () => {
  it('Arabic-Indic ١٢٣.٤٥ style input sanitizes to 123.45 under ar-EG-like options', () => {
    // The Arabic decimal separator (٫, U+066B) is a separate concern from digit
    // normalization; this test uses the ASCII '.' decimal separator, as ar-EG apps
    // that configure Numora explicitly (rather than relying on auto-detected native
    // separators) would. See ticket follow-up note on U+066B.
    const zero = BLOCKS['Arabic-Indic'];
    const input = `${nativeDigits(zero, '123')}.${nativeDigits(zero, '45')}`;
    expect(sanitizeNumoraInput(input, { decimalSeparator: '.' } as never)).toBe('123.45');
  });

  it('Devanagari digits sanitize the same as ASCII', () => {
    const zero = BLOCKS.Devanagari;
    const input = nativeDigits(zero, '123');
    expect(sanitizeNumoraInput(input, { decimalSeparator: '.' } as never)).toBe('123');
  });

  it('Persian (Extended Arabic-Indic) digits sanitize the same as ASCII', () => {
    const zero = BLOCKS['Extended Arabic-Indic (Persian)'];
    const input = nativeDigits(zero, '123');
    expect(sanitizeNumoraInput(input, { decimalSeparator: '.' } as never)).toBe('123');
  });
});

describe('normalizeDigits property: round-trips to the same ASCII length', () => {
  it('any digit string from a random supported block maps to an equal-length ASCII string', () => {
    const zeros = Object.values(BLOCKS);
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom(...zeros), { minLength: 1, maxLength: 40 }),
        fc.array(fc.integer({ min: 0, max: 9 }), { minLength: 1, maxLength: 40 }),
        (blockZeros, digitValues) => {
          const length = Math.min(blockZeros.length, digitValues.length);
          let native = '';
          let expected = '';
          for (let i = 0; i < length; i++) {
            const zero = blockZeros[i];
            const d = digitValues[i];
            native += String.fromCharCode(zero + d);
            expected += String(d);
          }
          const result = normalizeDigits(native);
          expect(result).toBe(expected);
          expect(result.length).toBe(native.length);
        }
      )
    );
  });
});
