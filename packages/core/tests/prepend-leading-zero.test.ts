import { describe, it, expect } from 'vitest';
import { prependLeadingZero } from '../src/features/prepend-leading-zero';
import { sanitizeNumoraInput } from '../src/features/sanitization';

describe('prependLeadingZero', () => {
  describe('default decimal separator (.)', () => {
    it('prepends 0 before bare leading dot', () => {
      expect(prependLeadingZero('.5')).toBe('0.5');
    });

    it('prepends 0 after minus for negative leading dot', () => {
      expect(prependLeadingZero('-.5')).toBe('-0.5');
    });

    it('handles bare dot', () => {
      expect(prependLeadingZero('.')).toBe('0.');
    });

    it('handles bare negative dot', () => {
      expect(prependLeadingZero('-.')).toBe('-0.');
    });

    it('leaves values starting with a digit untouched', () => {
      expect(prependLeadingZero('1.5')).toBe('1.5');
    });

    it('leaves already-prefixed leading zero untouched', () => {
      expect(prependLeadingZero('0.5')).toBe('0.5');
    });

    it('leaves negative digit values untouched', () => {
      expect(prependLeadingZero('-1.5')).toBe('-1.5');
    });

    it('handles empty string', () => {
      expect(prependLeadingZero('')).toBe('');
    });

    it('handles bare minus', () => {
      expect(prependLeadingZero('-')).toBe('-');
    });
  });

  describe('custom decimal separator (,)', () => {
    it('prepends 0 before bare leading comma', () => {
      expect(prependLeadingZero(',5', ',')).toBe('0,5');
    });

    it('handles negative leading comma', () => {
      expect(prependLeadingZero('-,5', ',')).toBe('-0,5');
    });

    it('does not treat a dot as the decimal in this mode', () => {
      // With ',' as decimal, '.5' is just garbage - function leaves it alone.
      expect(prependLeadingZero('.5', ',')).toBe('.5');
    });
  });
});

describe('autoAddLeadingZero option (pipeline integration)', () => {
  it('is off by default - sanitization leaves .5 alone', () => {
    expect(sanitizeNumoraInput('.5')).toBe('.5');
  });

  it('prepends 0 when enabled', () => {
    expect(sanitizeNumoraInput('.5', { autoAddLeadingZero: true })).toBe('0.5');
  });

  it('prepends 0 to negative leading decimal', () => {
    expect(sanitizeNumoraInput('-.5', { autoAddLeadingZero: true, enableNegative: true }))
      .toBe('-0.5');
  });

  it('runs after removeLeadingZeros so 00.5 → 0.5 (not 00.5)', () => {
    expect(sanitizeNumoraInput('00.5', { autoAddLeadingZero: true })).toBe('0.5');
  });

  it('respects custom decimal separator', () => {
    expect(sanitizeNumoraInput(',5', { autoAddLeadingZero: true, decimalSeparator: ',' }))
      .toBe('0,5');
  });
});
