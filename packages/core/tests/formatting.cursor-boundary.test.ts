import { describe, it, expect } from 'vitest';
import { getCaretBoundary, getCaretPosInBoundary } from '../src/features/formatting';

/**
 * Testing module: formatting/cursor-boundary.ts
 *
 * Tests for getCaretBoundary and getCaretPosInBoundary functions.
 */

describe('getCaretBoundary', () => {
  describe('No prefix or suffix', () => {
    it('should return all positions as editable for "1000"', () => {
      const result = getCaretBoundary('1000', { prefix: '', suffix: '' });
      expect(result).toEqual([true, true, true, true, true]);
    });
  });

  describe('Only prefix', () => {
    it('should mark prefix positions as non-editable for "$1000"', () => {
      const result = getCaretBoundary('$1000', { prefix: '$', suffix: '' });
      expect(result).toEqual([false, true, true, true, true, true]);
    });
  });

  describe('Only suffix', () => {
    it('should mark suffix positions as non-editable for "1000 USD"', () => {
      const result = getCaretBoundary('1000 USD', { prefix: '', suffix: ' USD' });
      expect(result).toEqual([true, true, true, true, true, false, false, false, false]);
    });

    it('should mark suffix positions as non-editable for "-1000 USD"', () => {
      const result = getCaretBoundary('-1000 USD', { prefix: '', suffix: ' USD' });
      // Note: numora treats minus sign as editable (part of number), not as prefix
      // Position 0 (before '-') is editable, positions 6-9 (suffix) are non-editable
      expect(result).toEqual([true, true, true, true, true, true, false, false, false, false]);
    });
  });

  describe('With prefix and suffix', () => {
    it('should mark prefix and suffix as non-editable for "100-10000 USD"', () => {
      const result = getCaretBoundary('100-10000 USD', {
        prefix: '100-',
        suffix: ' USD',
      });
      expect(result).toEqual([
        false, // before '1'
        false, // before '0'
        false, // before '0'
        false, // before '-'
        true, // before '1' (editable)
        true, // before '0'
        true, // before '0'
        true, // before '0'
        true, // before '0'
        true, // before '0'
        false, // before ' ' (suffix)
        false, // before 'U'
        false, // before 'S'
        false, // before 'D'
      ]);
    });

    it('should handle overlapping suffix pattern', () => {
      const result = getCaretBoundary('100-10000 USD', {
        prefix: '100-',
        suffix: '000 USD',
      });
      expect(result).toEqual([
        false, // before '1'
        false, // before '0'
        false, // before '0'
        false, // before '-'
        true, // before '1' (editable)
        true, // before '0'
        true, // before '0'
        false, // before '0' (part of suffix)
        false, // before '0' (part of suffix)
        false, // before '0' (part of suffix)
        false, // before ' ' (suffix)
        false, // before 'U'
        false, // before 'S'
        false, // before 'D'
      ]);
    });
  });

  describe('With thousand separator', () => {
    it('should mark separator positions as non-editable', () => {
      const result = getCaretBoundary('1,234', {
        thousandSeparator: ',',
        decimalSeparator: '.',
      });
      // Separator at position 1 should be non-editable
      expect(result[1]).toBe(false);
      expect(result[2]).toBe(true); // After separator, before '2'
    });
  });

  describe('With decimal separator', () => {
    it('should mark decimal separator as non-editable', () => {
      const result = getCaretBoundary('123.45', {
        decimalSeparator: '.',
      });
      // Decimal separator at position 3 should be non-editable
      expect(result[3]).toBe(false);
      expect(result[4]).toBe(true); // After separator, before '4'
    });
  });
});

describe('getCaretPosInBoundary', () => {
  describe('Basic functionality', () => {
    it('should return same position if already in boundary', () => {
      const boundary = getCaretBoundary('1000', { prefix: '', suffix: '' });
      const result = getCaretPosInBoundary('1000', 4, boundary);
      expect(result).toBe(4);
    });

    it('should return same position if already in boundary (position 2)', () => {
      const boundary = getCaretBoundary('1000', { prefix: '', suffix: '' });
      const result = getCaretPosInBoundary('1000', 2, boundary);
      expect(result).toBe(2);
    });
  });

  describe('With prefix', () => {
    it('should return correct position for "$1000" with forward direction', () => {
      const boundary = getCaretBoundary('$1000', { prefix: '$', suffix: '' });
      const result = getCaretPosInBoundary('$1000', 5, boundary, 'right');
      expect(result).toBe(5);
    });
  });

  describe('With prefix and suffix', () => {
    it('should return correct position for "100-10000 USD" with backward direction', () => {
      const boundary = getCaretBoundary('100-10000 USD', {
        prefix: '100-',
        suffix: ' USD',
      });
      const result = getCaretPosInBoundary('100-10000 USD', 6, boundary, 'left');
      expect(result).toBe(6);
    });

    it('should return correct position without direction specified', () => {
      const boundary = getCaretBoundary('100-10000 USD', {
        prefix: '100-',
        suffix: ' USD',
      });
      const result = getCaretPosInBoundary('100-10000 USD', 6, boundary);
      expect(result).toBe(6);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty value with prefix and suffix', () => {
      const boundary = getCaretBoundary('', { prefix: '100-', suffix: ' USD' });
      const result = getCaretPosInBoundary('', 4, boundary, 'right');
      expect(result).toBe(0);
    });

    it('should handle position at separator', () => {
      const boundary = getCaretBoundary('1,234', {
        thousandSeparator: ',',
        decimalSeparator: '.',
      });
      // Position 1 is at the separator, should move to next valid position
      const result = getCaretPosInBoundary('1,234', 1, boundary, 'right');
      expect(result).toBe(2);
    });

    it('should handle position at separator with left direction', () => {
      const boundary = getCaretBoundary('1,234', {
        thousandSeparator: ',',
        decimalSeparator: '.',
      });
      // Position 1 is at the separator (boundary[1] is false), should move to previous valid position
      // Position 0 (before '1') is valid, so it should move there
      const result = getCaretPosInBoundary('1,234', 1, boundary, 'left');
      expect(result).toBe(0); // Position 0 (before '1') is the previous valid position
    });
  });
});

