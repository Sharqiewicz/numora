import { describe, it, expect } from 'vitest';
import { expandCompactNotation } from '../src/features/compact-notation';

describe('✅ expandCompactNotation', () => {
  describe('✅ thousand (k)', () => {
    it('should expand 1k to 1000', () => {
      expect(expandCompactNotation('1k')).toBe('1000');
    });

    it('should expand 1.5k to 1500', () => {
      expect(expandCompactNotation('1.5k')).toBe('1500');
    });

    it('should be case-insensitive (K)', () => {
      expect(expandCompactNotation('1K')).toBe('1000');
      expect(expandCompactNotation('2.5K')).toBe('2500');
    });

    it('should handle decimals (0.5k)', () => {
      expect(expandCompactNotation('0.5k')).toBe('500');
    });

    it('should handle 100k', () => {
      expect(expandCompactNotation('100k')).toBe('100000');
    });
  });

  describe('✅ millions (m)', () => {
    it('should expand 1m to 1000000', () => {
      expect(expandCompactNotation('1m')).toBe('1000000');
    });

    it('should expand 2.5m to 2500000', () => {
      expect(expandCompactNotation('2.5m')).toBe('2500000');
    });

    it('should be case-insensitive (M)', () => {
      expect(expandCompactNotation('1M')).toBe('1000000');
      expect(expandCompactNotation('3.5M')).toBe('3500000');
    });

    it('should handle 0.5m', () => {
      expect(expandCompactNotation('0.5m')).toBe('500000');
    });
  });

  describe('✅ billions (b)', () => {
    it('should expand 1b to 1000000000', () => {
      expect(expandCompactNotation('1b')).toBe('1000000000');
    });

    it('should expand 3.5b to 3500000000', () => {
      expect(expandCompactNotation('3.5b')).toBe('3500000000');
    });

    it('should be case-insensitive (B)', () => {
      expect(expandCompactNotation('1B')).toBe('1000000000');
      expect(expandCompactNotation('2B')).toBe('2000000000');
    });

    it('should handle 0.1b', () => {
      expect(expandCompactNotation('0.1b')).toBe('100000000');
    });
  });

  describe('✅ edge cases', () => {
    it('should handle no compact notation', () => {
      expect(expandCompactNotation('1234')).toBe('1234');
    });

    it('should handle empty string', () => {
      expect(expandCompactNotation('')).toBe('');
    });

    it('should handle leading zeros (01k)', () => {
      expect(expandCompactNotation('01k')).toBe('1000');
    });

    it('should handle very small decimals (0.001k)', () => {
      expect(expandCompactNotation('0.001k')).toBe('1');
    });

    it('should handle large numbers (999b)', () => {
      expect(expandCompactNotation('999b')).toBe('999000000000');
    });

    it('should not expand invalid patterns (k1)', () => {
      expect(expandCompactNotation('k1')).toBe('k1');
    });

    it('should not expand non-numeric patterns (abc)', () => {
      expect(expandCompactNotation('abc')).toBe('abc');
    });

    it('should handle whitespace before suffix (1 k)', () => {
      expect(expandCompactNotation('1 k')).toBe('1000');
    });

    it('should handle multiple compact notations', () => {
      expect(expandCompactNotation('1k 2m')).toBe('1000 2000000');
    });
  });

  describe('✅ decimal precision', () => {
    it('should handle 1.234k (returns 1234)', () => {
      expect(expandCompactNotation('1.234k')).toBe('1234');
    });

    it('should handle 2.5678m (returns 2567800)', () => {
      expect(expandCompactNotation('2.5678m')).toBe('2567800');
    });

    it('should trim trailing zeros in decimal results', () => {
      expect(expandCompactNotation('0.123k')).toBe('123');
    });

    it('should handle very precise decimals (1.23456789k)', () => {
      expect(expandCompactNotation('1.23456789k')).toBe('1234.56789');
    });
  });

  describe('✅ integration scenarios', () => {
    it('should work with subsequent decimal trimming', () => {
      const expanded = expandCompactNotation('1.5k');
      expect(expanded).toBe('1500');
    });

    it('should handle decimal expansions that need trimming', () => {
      const expanded = expandCompactNotation('1.234k');
      expect(expanded).toBe('1234');
    });

    it('should work with formatOn: change (thousand separators)', () => {
      const expanded = expandCompactNotation('1k');
      expect(expanded).toBe('1000');
    });

    it('should handle paste with compact notation', () => {
      const expanded = expandCompactNotation('5m');
      expect(expanded).toBe('5000000');
    });

    it('should handle very big number', () => {
      expect(expandCompactNotation('111222333444555666777.8888K')).toBe('111222333444555666777888.8');
    });
  });
});
