import { describe, it, expect } from 'vitest';
import { ensureMinDecimals } from '../src/features/decimals';

describe('ensureMinDecimals', () => {
  describe('basic functionality', () => {
    it('should pad integer to minimum decimals', () => {
      expect(ensureMinDecimals('1', 2, '.')).toBe('1.00');
      expect(ensureMinDecimals('123', 2, '.')).toBe('123.00');
    });

    it('should pad decimal to minimum decimals', () => {
      expect(ensureMinDecimals('1.5', 2, '.')).toBe('1.50');
      expect(ensureMinDecimals('1.1', 3, '.')).toBe('1.100');
    });

    it('should not truncate if decimals exceed minimum', () => {
      expect(ensureMinDecimals('1.123', 2, '.')).toBe('1.123');
      expect(ensureMinDecimals('1.12345', 2, '.')).toBe('1.12345');
    });

    it('should return original value if minDecimals is 0', () => {
      expect(ensureMinDecimals('1', 0, '.')).toBe('1');
      expect(ensureMinDecimals('1.5', 0, '.')).toBe('1.5');
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(ensureMinDecimals('0', 2, '.')).toBe('0.00');
      expect(ensureMinDecimals('0', 0, '.')).toBe('0');
    });

    it('should handle empty string', () => {
      expect(ensureMinDecimals('', 2, '.')).toBe('.00');
    });

    it('should handle just decimal separator', () => {
      expect(ensureMinDecimals('.', 2, '.')).toBe('.00');
    });

    it('should handle negative numbers', () => {
      expect(ensureMinDecimals('-1', 2, '.')).toBe('-1.00');
      expect(ensureMinDecimals('-1.5', 2, '.')).toBe('-1.50');
    });

    it('should handle negative with just separator', () => {
      expect(ensureMinDecimals('-.', 2, '.')).toBe('-.00');
    });
  });

  describe('custom decimal separator', () => {
    it('should work with comma separator', () => {
      expect(ensureMinDecimals('1', 2, ',')).toBe('1,00');
      expect(ensureMinDecimals('1,5', 2, ',')).toBe('1,50');
    });
  });

  describe('real-world scenarios', () => {
    it('should format currency amounts', () => {
      expect(ensureMinDecimals('10', 2, '.')).toBe('10.00');
      expect(ensureMinDecimals('100.5', 2, '.')).toBe('100.50');
    });

    it('should handle large numbers', () => {
      expect(ensureMinDecimals('1234567', 2, '.')).toBe('1234567.00');
      expect(ensureMinDecimals('1234567.8', 2, '.')).toBe('1234567.80');
    });
  });
});
