import { describe, it, expect } from 'vitest';
import { validateNumoraInputOptions } from '../src/validation';

describe('validateNumoraInputOptions — separator constraints', () => {
  it('rejects a digit as thousandSeparator (would be indistinguishable from a real digit)', () => {
    expect(() => validateNumoraInputOptions({ thousandSeparator: '5' })).toThrow(
      /cannot be a digit/
    );
  });

  it('rejects a digit as decimalSeparator', () => {
    expect(() => validateNumoraInputOptions({ decimalSeparator: '0' })).toThrow(
      /cannot be a digit/
    );
  });

  it('accepts ordinary non-digit separators', () => {
    expect(() =>
      validateNumoraInputOptions({ thousandSeparator: ',', decimalSeparator: '.' })
    ).not.toThrow();
    expect(() =>
      validateNumoraInputOptions({ thousandSeparator: '.', decimalSeparator: ',' })
    ).not.toThrow();
    expect(() =>
      validateNumoraInputOptions({ thousandSeparator: ' ', decimalSeparator: '.' })
    ).not.toThrow();
  });

  it('still rejects thousandSeparator === decimalSeparator', () => {
    expect(() =>
      validateNumoraInputOptions({ thousandSeparator: '.', decimalSeparator: '.' })
    ).toThrow(/cannot equal/);
  });

  it('empty-string thousandSeparator (grouping disabled) is not treated as a digit', () => {
    expect(() => validateNumoraInputOptions({ thousandSeparator: '' })).not.toThrow();
  });
});

describe('validateNumoraInputOptions — reserved-character separator constraints', () => {
  const RESERVED_CHARS = ['-', '+', 'e', 'E', 'k', 'K', 'm', 'M', 'b', 'B', 't', 'T'];

  it.each(RESERVED_CHARS)('rejects %s as thousandSeparator', (char) => {
    expect(() => validateNumoraInputOptions({ thousandSeparator: char })).toThrow(
      /thousandSeparator.*reserved/
    );
  });

  it.each(RESERVED_CHARS)('rejects %s as decimalSeparator', (char) => {
    expect(() => validateNumoraInputOptions({ decimalSeparator: char })).toThrow(
      /decimalSeparator.*reserved/
    );
  });

  it('accepts regular space as thousandSeparator', () => {
    expect(() =>
      validateNumoraInputOptions({ thousandSeparator: ' ', decimalSeparator: '.' })
    ).not.toThrow();
  });

  it('accepts U+00A0 (non-breaking space) as a separator', () => {
    expect(() =>
      validateNumoraInputOptions({ thousandSeparator: ' ', decimalSeparator: '.' })
    ).not.toThrow();
  });

  it('accepts U+202F (narrow no-break space, e.g. fr-FR) as a separator', () => {
    expect(() =>
      validateNumoraInputOptions({ thousandSeparator: ' ', decimalSeparator: '.' })
    ).not.toThrow();
  });
});

describe('validateNumoraInputOptions — maxLength constraints', () => {
  it('rejects maxLength: 0', () => {
    expect(() => validateNumoraInputOptions({ maxLength: 0 })).toThrow(
      /maxLength must be a positive integer/
    );
  });

  it('accepts maxLength: 1', () => {
    expect(() => validateNumoraInputOptions({ maxLength: 1 })).not.toThrow();
  });

  it('rejects a negative maxLength', () => {
    expect(() => validateNumoraInputOptions({ maxLength: -1 })).toThrow(
      /maxLength must be a positive integer/
    );
  });

  it('rejects a non-integer maxLength', () => {
    expect(() => validateNumoraInputOptions({ maxLength: 1.5 })).toThrow(
      /maxLength must be a positive integer/
    );
  });

  it('still accepts decimalMaxLength: 0', () => {
    expect(() => validateNumoraInputOptions({ decimalMaxLength: 0 })).not.toThrow();
  });

  it('still accepts decimalMinLength: 0', () => {
    expect(() => validateNumoraInputOptions({ decimalMinLength: 0 })).not.toThrow();
  });
});
