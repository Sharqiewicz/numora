import { describe, expect, it } from 'vitest';
import { normalizeForeignFormat } from '@/features/foreign-format';
import { sanitizeNumoraInput } from '@/features/sanitization';
import type { FormattingOptions } from '@/types';

const de: FormattingOptions = { decimalSeparator: ',', thousandSeparator: '.' };
const en: FormattingOptions = { decimalSeparator: '.', thousandSeparator: ',' };
const fr: FormattingOptions = { decimalSeparator: ',', thousandSeparator: ' ' };
const enIn: FormattingOptions = { ...en, groupingStyle: 'lakh' };

const table: Array<[string, FormattingOptions, string, string]> = [
  ['de-DE', de, '1.234', '1234'],
  ['de-DE', de, '1.234.567', '1234567'],
  ['de-DE', de, '1.5', '1.5'],
  ['de-DE', de, '12.34', '12.34'],
  ['de-DE', de, '1,5', '1.5'],
  ['de-DE', de, '1,234', '1.234'],
  ['de-DE', de, '1.234,56', '1234.56'],
  ['de-DE', de, '1,234,567.89', '1234567.89'],
  ['de-DE', de, '0.123', '0.123'],
  ['en-US', en, '1.234', '1.234'],
  ['en-US', en, '1,234', '1234'],
  ['en-US', en, '1,5', '1.5'],
  ['en-US', en, '1.234,56', '1234.56'],
  ['fr-FR', fr, '1 234,5', '1234.5'],
  ['fr-FR', fr, '1.234,5', '1234.5'],
  ['fr-FR', fr, '1.234', '1234'],
  ['en-IN', enIn, '12,34,567.5', '1234567.5'],
  ['de-DE', de, '1,5e3', '1.5e3'],
  ['de-DE', de, '1.5k', '1.5k'],
  ['de-DE', de, '-1.234,5', '-1234.5'],
  ['en-US', en, '$1,234.50', '$1234.50'],
];

describe('normalizeForeignFormat (ADR 0006)', () => {
  it.each(table)('%s: %s -> %s', (_l, opts, input, expected) => {
    expect(normalizeForeignFormat(input, opts)).toBe(expected);
  });

  it('removes a custom single-char grouping mark (apostrophe, Arabic thousands)', () => {
    expect(normalizeForeignFormat("1'234'567.5", { decimalSeparator: '.', thousandSeparator: "'" })).toBe(
      '1234567.5'
    );
    expect(normalizeForeignFormat('١٬٢٣٤٫٥', { decimalSeparator: '٫', thousandSeparator: '٬' })).toBe(
      '1234.5'
    );
  });

  it('accepts Wan grouping for a single mark', () => {
    expect(normalizeForeignFormat('123,4567', { ...en, groupingStyle: 'wan' })).toBe('1234567');
    expect(normalizeForeignFormat('123,4567', en)).toBe('123.4567');
  });

  it('leaves text without digits alone', () => {
    expect(normalizeForeignFormat('abc', en)).toBe('abc');
    expect(normalizeForeignFormat('', en)).toBe('');
  });
});

describe('sanitizeNumoraInput with foreign source', () => {
  it('de-DE paste 1.5 is 1,5 not 15', () => {
    expect(sanitizeNumoraInput('1.5', de, 'foreign')).toBe('1,5');
    expect(sanitizeNumoraInput('1,234,567.89', de, 'foreign')).toBe('1234567,89');
  });
  it('de-DE 1,5e3 and 1.5k expand to 1500', () => {
    expect(sanitizeNumoraInput('1,5e3', de, 'foreign')).toBe('1500');
    expect(sanitizeNumoraInput('1.5k', { ...de, enableCompactNotation: true }, 'foreign')).toBe(
      '1500'
    );
  });
});

describe('sanitizeNumoraInput with canonical source', () => {
  it('"." is always the decimal, never detected', () => {
    expect(sanitizeNumoraInput('1.234', de, 'canonical')).toBe('1,234');
    expect(sanitizeNumoraInput('1234.5', de, 'canonical')).toBe('1234,5');
    expect(sanitizeNumoraInput('1.234', en, 'canonical')).toBe('1.234');
  });
});
