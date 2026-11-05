import { describe, expect, it } from 'vitest';
import {
  normalizeDecimalSeparators,
  NON_ASCII_DECIMAL_SEPARATOR_GLYPHS,
} from '../src/features/decimal-separators';

describe('✅ normalizeDecimalSeparators (A2-05)', () => {
  it('maps the Arabic decimal separator (٫) to the configured decimalSeparator', () => {
    expect(normalizeDecimalSeparators('١٢٣٫٤٥', '.')).toBe('١٢٣.٤٥');
  });

  it('maps the Arabic comma (،) to the configured decimalSeparator', () => {
    expect(normalizeDecimalSeparators('12،5', '.')).toBe('12.5');
  });

  it('maps the fullwidth comma (，) to the configured decimalSeparator', () => {
    expect(normalizeDecimalSeparators('12，5', '.')).toBe('12.5');
  });

  it('maps the fullwidth full stop (．) to the configured decimalSeparator', () => {
    expect(normalizeDecimalSeparators('12．5', '.')).toBe('12.5');
  });

  it('maps the ideographic full stop (。) to the configured decimalSeparator', () => {
    expect(normalizeDecimalSeparators('12。5', '.')).toBe('12.5');
  });

  it('leaves the value unchanged when none of the glyphs are present', () => {
    expect(normalizeDecimalSeparators('123.45', '.')).toBe('123.45');
  });

  it('maps a glyph to itself as a no-op when it is already the configured decimalSeparator (ar-EG/fa-IR)', () => {
    expect(normalizeDecimalSeparators('123٫45', '٫')).toBe('123٫45');
  });

  it('never remaps the Arabic thousands separator (٬) - it is not in the glyph table', () => {
    expect(normalizeDecimalSeparators('١٬٢٣٤', '.')).toBe('١٬٢٣٤');
  });

  it('does not remap a glyph that equals the configured thousandSeparator', () => {
    // A config that (unusually) reuses the fullwidth comma as its grouping mark must keep
    // that glyph untouched rather than have it silently promoted to a decimal point.
    expect(normalizeDecimalSeparators('1，234，5', '.', '，')).toBe('1，234，5');
  });

  it('defaults decimalSeparator to "." when omitted', () => {
    expect(normalizeDecimalSeparators('12٫5')).toBe('12.5');
  });

  it('handles multiple different glyphs in the same string', () => {
    expect(normalizeDecimalSeparators('1٫2،3', '.')).toBe('1.2.3');
  });

  it('the glyph table has the expected five entries', () => {
    expect(NON_ASCII_DECIMAL_SEPARATOR_GLYPHS).toEqual(['٫', '،', '，', '．', '。']);
  });
});
