import { describe, it, expect } from 'vitest';
import { condenseDecimalZeros } from '../src/features/formatting/subscript-notation';

describe('condenseDecimalZeros', () => {
  describe('basic functionality', () => {
    it('should condense leading zeros to subscript', () => {
      expect(condenseDecimalZeros('0.000001', 8)).toBe('0₆1');
      expect(condenseDecimalZeros('0.000123', 8)).toBe('0₃123');
      expect(condenseDecimalZeros('0.0000001', 8)).toBe('0₇1');
    });

    it('should not condense if less than 3 leading zeros', () => {
      expect(condenseDecimalZeros('0.001', 8)).toBe('0.001');
      expect(condenseDecimalZeros('0.01', 8)).toBe('0.01');
      expect(condenseDecimalZeros('0.1', 8)).toBe('0.1');
    });

    it('should handle values without leading zeros', () => {
      expect(condenseDecimalZeros('0.123', 8)).toBe('0.123');
      expect(condenseDecimalZeros('1.123', 8)).toBe('1.123');
    });
  });

  describe('edge cases', () => {
    it('should handle values without decimal separator', () => {
      expect(condenseDecimalZeros('123', 8)).toBe('123');
      expect(condenseDecimalZeros('0', 8)).toBe('0');
    });

    it('should handle empty string', () => {
      expect(condenseDecimalZeros('', 8)).toBe('');
    });

    it('should handle negative values', () => {
      expect(condenseDecimalZeros('-0.000001', 8)).toBe('-0₆1');
    });

    it('should respect maxDecimalDigits', () => {
      const result = condenseDecimalZeros('0.00000123456789', 5);
      // Should limit to 5 digits after the subscript
      expect(result).toMatch(/0₆\d{1,5}$/);
    });
  });

  describe('custom decimal separator', () => {
    it('should work with comma separator', () => {
      expect(condenseDecimalZeros('0,000001', 8, ',')).toBe('0₆1');
    });
  });

  describe('real-world scenarios', () => {
    it('should handle very small DeFi amounts', () => {
      expect(condenseDecimalZeros('0.0000001', 8)).toBe('0₇1');
      expect(condenseDecimalZeros('0.000000123', 8)).toBe('0₇123');
    });
  });
});
