import { describe, it, expect } from 'vitest';
import { expandShorthand } from '../src/utils/shorthand';

describe('expandShorthand', () => {
  describe('thousands (k)', () => {
    it('should expand 1k to 1000', () => {
      expect(expandShorthand('1k')).toBe('1000');
    });

    it('should expand 1.5k to 1500', () => {
      expect(expandShorthand('1.5k')).toBe('1500');
    });

    it('should be case-insensitive (K)', () => {
      expect(expandShorthand('1K')).toBe('1000');
      expect(expandShorthand('2.5K')).toBe('2500');
    });

    it('should handle decimals (0.5k)', () => {
      expect(expandShorthand('0.5k')).toBe('500');
    });

    it('should handle 100k', () => {
      expect(expandShorthand('100k')).toBe('100000');
    });
  });

  describe('millions (m)', () => {
    it('should expand 1m to 1000000', () => {
      expect(expandShorthand('1m')).toBe('1000000');
    });

    it('should expand 2.5m to 2500000', () => {
      expect(expandShorthand('2.5m')).toBe('2500000');
    });

    it('should be case-insensitive (M)', () => {
      expect(expandShorthand('1M')).toBe('1000000');
      expect(expandShorthand('3.5M')).toBe('3500000');
    });

    it('should handle 0.5m', () => {
      expect(expandShorthand('0.5m')).toBe('500000');
    });
  });

  describe('billions (b)', () => {
    it('should expand 1b to 1000000000', () => {
      expect(expandShorthand('1b')).toBe('1000000000');
    });

    it('should expand 3.5b to 3500000000', () => {
      expect(expandShorthand('3.5b')).toBe('3500000000');
    });

    it('should be case-insensitive (B)', () => {
      expect(expandShorthand('1B')).toBe('1000000000');
      expect(expandShorthand('2B')).toBe('2000000000');
    });

    it('should handle 0.1b', () => {
      expect(expandShorthand('0.1b')).toBe('100000000');
    });
  });

  describe('edge cases', () => {
    it('should handle no shorthand', () => {
      expect(expandShorthand('1234')).toBe('1234');
    });

    it('should handle empty string', () => {
      expect(expandShorthand('')).toBe('');
    });

    it('should handle leading zeros (01k)', () => {
      expect(expandShorthand('01k')).toBe('1000');
    });

    it('should handle very small decimals (0.001k)', () => {
      expect(expandShorthand('0.001k')).toBe('1');
    });

    it('should handle large numbers (999b)', () => {
      expect(expandShorthand('999b')).toBe('999000000000');
    });

    it('should not expand invalid patterns (k1)', () => {
      expect(expandShorthand('k1')).toBe('k1');
    });

    it('should not expand non-numeric patterns (abc)', () => {
      expect(expandShorthand('abc')).toBe('abc');
    });

    it('should handle whitespace before suffix (1 k)', () => {
      expect(expandShorthand('1 k')).toBe('1000');
    });

    it('should handle multiple shorthands', () => {
      // This tests what happens if someone types "1k 2m" - each should expand
      expect(expandShorthand('1k 2m')).toBe('1000 2000000');
    });
  });

  describe('decimal precision', () => {
    it('should handle 1.234k (returns 1234)', () => {
      expect(expandShorthand('1.234k')).toBe('1234');
    });

    it('should handle 2.5678m (returns 2567800)', () => {
      expect(expandShorthand('2.5678m')).toBe('2567800');
    });

    it('should trim trailing zeros in decimal results', () => {
      // 0.123k = 123.0 → should become '123'
      expect(expandShorthand('0.123k')).toBe('123');
    });

    it('should handle very precise decimals (1.23456789k)', () => {
      expect(expandShorthand('1.23456789k')).toBe('1234.56789');
    });
  });

  describe('integration scenarios', () => {
    it('should work with subsequent decimal trimming', () => {
      const expanded = expandShorthand('1.5k'); // "1500"
      expect(expanded).toBe('1500');
      // After trimToMaxDecimals(expanded, 2) → "1500" (no decimals to trim)
    });

    it('should handle decimal expansions that need trimming', () => {
      const expanded = expandShorthand('1.234k'); // "1234"
      expect(expanded).toBe('1234');
    });

    it('should work with formatOn: change (thousands separators)', () => {
      // When used with formatting:
      // User types "1k" → expands to "1000" → formats to "1,000"
      const expanded = expandShorthand('1k');
      expect(expanded).toBe('1000');
    });

    it('should handle paste with shorthand', () => {
      // User pastes "5m"
      const expanded = expandShorthand('5m');
      expect(expanded).toBe('5000000');
    });
  });

  describe('real-world DeFi examples', () => {
    it('should handle typical DeFi amounts', () => {
      expect(expandShorthand('10k')).toBe('10000');  // 10k USDC
      expect(expandShorthand('2.5m')).toBe('2500000');  // 2.5m in TVL
      expect(expandShorthand('1b')).toBe('1000000000');  // 1B market cap
    });

    it('should handle small amounts', () => {
      expect(expandShorthand('0.1k')).toBe('100');  // 100 tokens
      expect(expandShorthand('0.05m')).toBe('50000');  // 50k tokens
    });

    it('should handle mixed case from user input', () => {
      expect(expandShorthand('5K')).toBe('5000');
      expect(expandShorthand('10M')).toBe('10000000');
      expect(expandShorthand('3B')).toBe('3000000000');
    });
  });
});
