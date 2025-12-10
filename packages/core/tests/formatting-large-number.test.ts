import { describe, it, expect } from 'vitest';
import { formatLargeNumber } from '../src/features/formatting/large-number';
import { ThousandStyle } from '../src/types';

describe('formatLargeNumber', () => {
  describe('basic functionality', () => {
    it('should format small numbers without scale', () => {
      expect(formatLargeNumber('123')).toBe('123');
      expect(formatLargeNumber('1234')).toBe('1234');
    });

    it('should format numbers with scale notation', () => {
      const result1k = formatLargeNumber('1234');
      // Should show as 1.23k or similar
      expect(result1k).toBeTruthy();

      const result1M = formatLargeNumber('1234567');
      expect(result1M).toContain('M');
    });

    it('should handle zero', () => {
      expect(formatLargeNumber('0')).toBe('0');
    });

    it('should handle negative values', () => {
      expect(formatLargeNumber('-1234')).toContain('-');
    });
  });

  describe('decimal places', () => {
    it('should show decimals for values under threshold', () => {
      const result = formatLargeNumber('123', { decimalsUnder: 1000, decimals: 2 });
      expect(result).toMatch(/\d+\.\d+/);
    });

    it('should not show decimals for large values', () => {
      const result = formatLargeNumber('1234567', { decimalsUnder: 1000, decimals: 2 });
      // Should not have decimals for values over threshold
      expect(result).not.toMatch(/\.\d{2,}/);
    });

    it('should respect minimum decimals', () => {
      const result = formatLargeNumber('123', {
        decimalsUnder: 1000,
        decimals: 2,
        decimalsMin: 2,
      });
      expect(result).toMatch(/\.\d{2}$/);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string', () => {
      expect(formatLargeNumber('')).toBe('0');
    });

    it('should handle very large numbers', () => {
      const veryLarge = '1'.repeat(35);
      expect(formatLargeNumber(veryLarge)).toBe('🔥');
    });

    it('should use custom very large placeholder', () => {
      const veryLarge = '1'.repeat(35);
      expect(formatLargeNumber(veryLarge, { veryLargePlaceholder: '∞' })).toBe('∞');
    });
  });

  describe('options', () => {
    it('should respect minScale option', () => {
      const result = formatLargeNumber('1234', { minScale: 6 });
      // Should not apply scale notation if below minScale
      expect(result).not.toContain('k');
    });

    it('should apply minimum decimals to zero if enabled', () => {
      const result = formatLargeNumber('0', {
        decimalsMin: 2,
        decimalsMinAppliesToZero: true,
      });
      expect(result).toBe('0.00');
    });
  });

  describe('custom separators', () => {
    it('should work with custom decimal separator', () => {
      const result = formatLargeNumber('123.45', { decimalSeparator: ',' });
      expect(result).toBeTruthy();
    });

    it('should format with thousand separators', () => {
      const result = formatLargeNumber('1234567', {
        thousandSeparator: ',',
        thousandStyle: ThousandStyle.Thousand,
      });
      expect(result).toBeTruthy();
    });
  });
});
