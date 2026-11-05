/**
 * Pipeline-level tests for `sanitizeNumoraInput`, focused on the A2-05 fix: non-ASCII
 * decimal-separator glyphs (Arabic decimal separator, Arabic comma, fullwidth comma,
 * fullwidth full stop, ideographic full stop) must parse as a decimal point instead of
 * being dropped outright by `removeNonNumericCharacters`.
 */
import { describe, expect, it } from 'vitest';
import { sanitizeNumoraInput } from '../src/features/sanitization';

describe('✅ sanitizeNumoraInput — non-ASCII decimal separators (A2-05)', () => {
  it('"٫٥" under en-US defaults to ".5" (no autoAddLeadingZero)', () => {
    expect(sanitizeNumoraInput('٫٥', { decimalSeparator: '.', thousandSeparator: ',' })).toBe('.5');
  });

  it('"٫٥" becomes "0.5" with autoAddLeadingZero', () => {
    expect(
      sanitizeNumoraInput('٫٥', {
        decimalSeparator: '.',
        thousandSeparator: ',',
        autoAddLeadingZero: true,
      })
    ).toBe('0.5');
  });

  it('"١٢٣٫٤٥" (Arabic-Indic digits + Arabic decimal separator) becomes "123.45" under en-US', () => {
    expect(sanitizeNumoraInput('١٢٣٫٤٥', { decimalSeparator: '.', thousandSeparator: ',' })).toBe(
      '123.45'
    );
  });

  it('ar-EG config (decimal "٫", thousand "٬"): "١٬٢٣٤٫٥" keeps the native separators in the raw value', () => {
    expect(sanitizeNumoraInput('١٬٢٣٤٫٥', { decimalSeparator: '٫', thousandSeparator: '٬' })).toBe(
      '1234٫5'
    );
  });

  it('does not corrupt a value with no non-ASCII separators', () => {
    expect(sanitizeNumoraInput('123.45', { decimalSeparator: '.', thousandSeparator: ',' })).toBe(
      '123.45'
    );
  });

  it('fullwidth comma (，) parses as the decimal separator, not as noise, under en-US', () => {
    expect(sanitizeNumoraInput('12，5', { decimalSeparator: '.', thousandSeparator: ',' })).toBe(
      '12.5'
    );
  });

  it('ideographic full stop (。) parses as the decimal separator under en-US', () => {
    expect(sanitizeNumoraInput('12。5', { decimalSeparator: '.', thousandSeparator: ',' })).toBe(
      '12.5'
    );
  });

  it('a config using the fullwidth comma as its thousandSeparator keeps it as grouping, not decimal', () => {
    expect(
      sanitizeNumoraInput('1，234，5', { decimalSeparator: '.', thousandSeparator: '，' })
    ).toBe('12345');
  });
});
