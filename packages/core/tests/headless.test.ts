import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import * as root from '../src/index';
import * as pipeline from '../src/pipeline';
import { formatValue, parseValue, NumoraInput } from '../src/index';

describe('formatValue', () => {
  it('formats a canonical raw value the way a resting field shows it', () => {
    expect(formatValue('1234.5')).toBe('1,234.5');
    expect(formatValue('1234.5', { locale: 'de-DE', decimalMinLength: 2 })).toBe('1.234,50');
    expect(formatValue('1234567', { groupingStyle: 'lakh' })).toBe('12,34,567');
    expect(formatValue('1234', { groupingStyle: 'none' })).toBe('1234');
  });

  it('reads `.` as the decimal mark in every locale: the input is never detected as locale text', () => {
    expect(formatValue('1.5', { locale: 'de-DE' })).toBe('1,5');
    expect(formatValue('1234.5', { locale: 'fr-FR' })).toBe(
      new NumoraInput(document.createElement('div'), { locale: 'fr-FR', value: '1234.5' }).formattedValue
    );
  });

  it('cuts to decimalMaxLength without rounding, and applies maxLength', () => {
    expect(formatValue('1.999', { decimalMaxLength: 2 })).toBe('1.99');
    expect(formatValue('123456', { maxLength: 4 })).toBe('1,234');
  });

  it('honors allowNegative', () => {
    expect(formatValue('-1234')).toBe('1,234');
    expect(formatValue('-1234', { allowNegative: true })).toBe('-1,234');
  });

  it('ignores isAllowed', () => {
    expect(formatValue('1234', { isAllowed: () => false })).toBe('1,234');
  });

  it('gives an empty string for anything that is not a number', () => {
    for (const text of ['', 'abc', '-', '.', '-.'])
      expect(formatValue(text, { allowNegative: true })).toBe('');
  });

  it('throws on invalid options, like the input', () => {
    expect(() => formatValue('1', { thousandSeparator: '' })).toThrow(/groupingStyle: 'none'/);
  });
});

describe('parseValue', () => {
  it('reads text in the configured format back to the canonical raw value', () => {
    expect(parseValue('1,234.50')).toBe('1234.50');
    expect(parseValue('1.234,50', { locale: 'de-DE' })).toBe('1234.50');
    expect(parseValue('12,34,567', { groupingStyle: 'lakh' })).toBe('1234567');
    expect(parseValue('-1,234', { allowNegative: true })).toBe('-1234');
  });

  it('reads its own format only: no foreign-format detection', () => {
    expect(parseValue('1,5')).toBe('15');
    expect(parseValue('1.5', { locale: 'de-DE' })).toBe('15');
  });

  it('gives an empty string for anything that is not a number', () => {
    for (const text of ['', 'abc', '-', '.', ','])
      expect(parseValue(text, { allowNegative: true })).toBe('');
  });

  it('ignores isAllowed', () => {
    expect(parseValue('1,234', { isAllowed: () => false })).toBe('1234');
  });
});

describe('formatValue / parseValue round trip', () => {
  const raw = fc
    .tuple(fc.boolean(), fc.bigInt({ min: 0n, max: 10n ** 30n }), fc.stringMatching(/^[0-9]{0,18}$/))
    .map(([neg, int, frac]) => `${neg && (int > 0n || /[1-9]/.test(frac)) ? '-' : ''}${int}${frac ? `.${frac}` : ''}`);
  const options = fc.record({
    locale: fc.constantFrom('en-US', 'de-DE', 'fr-FR', 'en-IN', 'de-CH', 'ar-EG'),
    groupingStyle: fc.constantFrom('thousand', 'lakh', 'wan', 'none'),
  });

  it('parseValue(formatValue(raw)) is raw', () => {
    fc.assert(
      fc.property(raw, options, (value, o) => {
        const opts = { ...o, allowNegative: true } as const;
        expect(parseValue(formatValue(value, opts), opts)).toBe(value);
      })
    );
  });
});

describe('entry points', () => {
  it('the root exports the class, the enums, the locale lookup and the two headless functions', () => {
    expect(Object.keys(root).sort()).toEqual([
      'FormatOn',
      'GroupingStyle',
      'NumoraInput',
      'formatValue',
      'getSeparatorsFromLocale',
      'parseValue',
    ]);
  });

  it('numora/pipeline exports the twelve sanitization steps', () => {
    expect(Object.keys(pipeline).sort()).toEqual([
      'expandCompactNotation',
      'expandScientificNotation',
      'filterMobileKeyboardArtifacts',
      'normalizeDigits',
      'normalizeForeignFormat',
      'normalizeUnicodeMinus',
      'prependLeadingZero',
      'removeExtraDecimalSeparators',
      'removeLeadingZeros',
      'removeNonNumericCharacters',
      'removeThousandSeparators',
      'truncateToMaxLength',
    ]);
  });
});
