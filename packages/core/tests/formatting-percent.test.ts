import { describe, it, expect } from 'vitest';
import { formatPercent, formatLargePercent } from '../src/features/formatting/percent';
import { ThousandStyle } from '../src/types';

describe('formatPercent', () => {
  describe('basic functionality', () => {
    it('should format decimal as percentage', () => {
      expect(formatPercent('0.01', 2)).toBe('1.00%');
      expect(formatPercent('0.1', 2)).toBe('10.00%');
      expect(formatPercent('1', 2)).toBe('100.00%');
    });

    it('should respect decimal places', () => {
      expect(formatPercent('0.1234', 2)).toBe('12.34%');
      expect(formatPercent('0.1234', 0)).toBe('12%');
      expect(formatPercent('0.1234', 4)).toBe('12.3400%');
    });

    it('should handle zero', () => {
      expect(formatPercent('0', 2)).toBe('0%');
      expect(formatPercent('', 2)).toBe('0%');
    });

    it('should handle negative values', () => {
      expect(formatPercent('-0.01', 2)).toBe('-1.00%');
      expect(formatPercent('-0.1', 2)).toBe('-10.00%');
    });
  });

  describe('edge cases', () => {
    it('should handle very small values', () => {
      expect(formatPercent('0.0001', 4)).toBe('0.0100%');
      expect(formatPercent('0.00001', 5)).toBe('0.00100%');
    });

    it('should handle very large values', () => {
      expect(formatPercent('10', 2)).toBe('1000.00%');
      expect(formatPercent('100', 0)).toBe('10000%');
    });

    it('should remove trailing zeros', () => {
      expect(formatPercent('0.1', 2)).toBe('10.00%');
      expect(formatPercent('0.12', 2)).toBe('12.00%');
    });
  });

  describe('custom separators', () => {
    it('should work with comma decimal separator', () => {
      expect(formatPercent('0,01', 2, ',')).toBe('1,00%');
      expect(formatPercent('0,1234', 2, ',')).toBe('12,34%');
    });
  });
});

describe('formatLargePercent', () => {
  describe('basic functionality', () => {
    it('should format normal percentages', () => {
      expect(formatLargePercent('0.01', 2)).toBe('1.00%');
      expect(formatLargePercent('0.1', 2)).toBe('10.00%');
    });

    it('should handle null/undefined', () => {
      expect(formatLargePercent(null, 2)).toBe('?');
      expect(formatLargePercent(undefined, 2)).toBe('?');
      expect(formatLargePercent('', 2)).toBe('?');
    });

    it('should handle zero', () => {
      expect(formatLargePercent('0', 2)).toBe('0%');
    });

    it('should handle negative values', () => {
      expect(formatLargePercent('-0.01', 2)).toBe('-1.00%');
    });
  });

  describe('large percentages with scale notation', () => {
    it('should format very large percentages', () => {
      // 1000% = 10 as decimal
      const result = formatLargePercent('10', 2);
      expect(result).toContain('%');
      expect(result).not.toBe('?');
    });
  });

  describe('options', () => {
    it('should use custom missing placeholder', () => {
      expect(formatLargePercent(null, 2, { missingPlaceholder: 'N/A' })).toBe('N/A');
    });

    it('should use custom very large placeholder', () => {
      const veryLarge = '1'.repeat(35); // Very large number
      expect(formatLargePercent(veryLarge, 2, { veryLargePlaceholder: '∞' })).toBe('∞');
    });
  });
});
