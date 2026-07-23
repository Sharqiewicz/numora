import { describe, it, expect } from 'vitest';
import { validateNumoraInputOptions } from '../src/validation';

describe('validateNumoraInputOptions — separator constraints', () => {
  it('rejects a digit as thousandSeparator (would be indistinguishable from a real digit)', () => {
    expect(() => validateNumoraInputOptions({ thousandSeparator: '5' })).toThrow(/cannot be a digit/);
  });

  it('rejects a digit as decimalSeparator', () => {
    expect(() => validateNumoraInputOptions({ decimalSeparator: '0' })).toThrow(/cannot be a digit/);
  });

  it('accepts ordinary non-digit separators', () => {
    expect(() => validateNumoraInputOptions({ thousandSeparator: ',', decimalSeparator: '.' })).not.toThrow();
    expect(() => validateNumoraInputOptions({ thousandSeparator: '.', decimalSeparator: ',' })).not.toThrow();
    expect(() => validateNumoraInputOptions({ thousandSeparator: ' ', decimalSeparator: '.' })).not.toThrow();
  });

  it('still rejects thousandSeparator === decimalSeparator', () => {
    expect(() => validateNumoraInputOptions({ thousandSeparator: '.', decimalSeparator: '.' })).toThrow(/cannot equal/);
  });

  it('empty-string thousandSeparator (grouping disabled) is not treated as a digit', () => {
    expect(() => validateNumoraInputOptions({ thousandSeparator: '' })).not.toThrow();
  });
});
