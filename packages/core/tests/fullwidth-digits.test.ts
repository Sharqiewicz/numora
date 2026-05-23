import { describe, it, expect } from 'vitest';
import { normalizeFullWidthDigits } from '../src/features/fullwidth-digits';
import { sanitizeNumoraInput } from '../src/features/sanitization';

describe('normalizeFullWidthDigits', () => {
  it('should convert fullwidth digits to ASCII', () => {
    expect(normalizeFullWidthDigits('１２３')).toBe('123');
  });

  it('should convert all ten fullwidth digits', () => {
    expect(normalizeFullWidthDigits('０１２３４５６７８９')).toBe('0123456789');
  });

  it('should leave ASCII digits unchanged', () => {
    expect(normalizeFullWidthDigits('123')).toBe('123');
  });

  it('should handle mixed fullwidth and ASCII digits', () => {
    expect(normalizeFullWidthDigits('１2３')).toBe('123');
  });

  it('should leave non-digit characters unchanged', () => {
    expect(normalizeFullWidthDigits('１．abc')).toBe('1．abc');
  });
});

describe('sanitizeNumoraInput with fullwidth digits', () => {
  const options = { decimalSeparator: '.' };

  it('should accept fullwidth digit input', () => {
    expect(sanitizeNumoraInput('１２３', options)).toBe('123');
  });

  it('should accept fullwidth decimal values', () => {
    expect(sanitizeNumoraInput('１２３.４５', options)).toBe('123.45');
  });

  it('should expand scientific notation with fullwidth digits', () => {
    expect(sanitizeNumoraInput('１.５e-２', options)).toBe('0.015');
  });

  it('should expand compact notation with fullwidth digits', () => {
    expect(
      sanitizeNumoraInput('１.５k', { ...options, enableCompactNotation: true })
    ).toBe('1500');
  });
});
