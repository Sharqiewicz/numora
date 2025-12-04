import { describe, it, expect } from 'vitest';
import { expandScientificNotation } from '../src/utils/scientific-notation';

describe('expandScientificNotation', () => {
  describe('Negative exponents (small numbers)', () => {
    it('should expand 1.5e-7 to 0.00000015', () => {
      expect(expandScientificNotation('1.5e-7')).toBe('0.00000015');
    });

    it('should expand 1.5e-1 to 0.15', () => {
      expect(expandScientificNotation('1.5e-1')).toBe('0.15');
    });

    it('should expand 1.23e-4 to 0.000123', () => {
      expect(expandScientificNotation('1.23e-4')).toBe('0.000123');
    });

    it('should expand 2e-3 to 0.002', () => {
      expect(expandScientificNotation('2e-3')).toBe('0.002');
    });

    it('should expand 0.5e-2 to 0.005', () => {
      expect(expandScientificNotation('0.5e-2')).toBe('0.005');
    });

    it('should expand 1e-10 to 0.0000000001', () => {
      expect(expandScientificNotation('1e-10')).toBe('0.0000000001');
    });

    it('should expand 123.456e-2 to 1.23456', () => {
      expect(expandScientificNotation('123.456e-2')).toBe('1.23456');
    });

    it('should expand 1e-1 to 0.1', () => {
      expect(expandScientificNotation('1e-1')).toBe('0.1');
    });

    it('should expand 10e-2 to 0.1', () => {
      expect(expandScientificNotation('10e-2')).toBe('0.1');
    });

    it('should expand 100e-3 to 0.1', () => {
      expect(expandScientificNotation('100e-3')).toBe('0.1');
    });
  });

  describe('Positive exponents (large numbers)', () => {
    it('should expand 2e+5 to 200000', () => {
      expect(expandScientificNotation('2e+5')).toBe('200000');
    });

    it('should expand 1.5e+2 to 150', () => {
      expect(expandScientificNotation('1.5e+2')).toBe('150');
    });

    it('should expand 1.5e+1 to 15', () => {
      expect(expandScientificNotation('1.5e+1')).toBe('15');
    });

    it('should expand 12.34e+1 to 123.4', () => {
      expect(expandScientificNotation('12.34e+1')).toBe('123.4');
    });

    it('should expand 12.34e+2 to 1234', () => {
      expect(expandScientificNotation('12.34e+2')).toBe('1234');
    });

    it('should expand 1e+3 to 1000', () => {
      expect(expandScientificNotation('1e+3')).toBe('1000');
    });

    it('should expand 1.23e+2 to 123', () => {
      expect(expandScientificNotation('1.23e+2')).toBe('123');
    });

    it('should expand 5e+4 to 50000', () => {
      expect(expandScientificNotation('5e+4')).toBe('50000');
    });
  });

  describe('Edge cases', () => {
    it('should handle exponent of 0', () => {
      expect(expandScientificNotation('1.5e0')).toBe('1.5');
    });

    it('should handle uppercase E', () => {
      expect(expandScientificNotation('1.5E-7')).toBe('0.00000015');
    });

    it('should handle integer base without decimal point', () => {
      expect(expandScientificNotation('5e-3')).toBe('0.005');
    });

    it('should not expand non-scientific notation', () => {
      expect(expandScientificNotation('123.45')).toBe('123.45');
    });

    it('should not expand invalid scientific notation', () => {
      expect(expandScientificNotation('1.5e')).toBe('1.5e');
      expect(expandScientificNotation('e-7')).toBe('e-7');
      expect(expandScientificNotation('1.5e-')).toBe('1.5e-');
    });

    it('should handle multiple scientific notations in string', () => {
      expect(expandScientificNotation('1.5e-7 and 2e+5')).toBe('0.00000015 and 200000');
    });

    it('should handle very large exponents', () => {
      expect(expandScientificNotation('1e-20')).toBe('0.00000000000000000001');
      expect(expandScientificNotation('1e+10')).toBe('10000000000');
    });

    it('should handle zero base', () => {
      expect(expandScientificNotation('0e-5')).toBe('0');
      expect(expandScientificNotation('0e+5')).toBe('0');
    });

    it('should handle negative base', () => {
      expect(expandScientificNotation('-1.5e-2')).toBe('-0.015');
      expect(expandScientificNotation('-2e+3')).toBe('-2000');
    });

    it('should handle positive sign in exponent', () => {
      expect(expandScientificNotation('1.5e+7')).toBe('15000000');
    });

    it('should handle no sign in exponent (assumes positive)', () => {
      expect(expandScientificNotation('1.5e7')).toBe('15000000');
    });
  });

  describe('Integration with sanitization', () => {
    it('should work with values that have extra characters', () => {
      const result = expandScientificNotation('value 1.5e-7 here');
      expect(result).toBe('value 0.00000015 here');
    });
  });
});

