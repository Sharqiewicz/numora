import { describe, it, expect } from 'vitest';
import { removeLeadingZeros } from '../src/utils/leading-zeros';

/**
 * Testing module: utils/leading-zeros.ts
 *
 * Tests for removeLeadingZeros function.
 * Note: Tests for double negatives (--10002000) are skipped as numora doesn't handle that case.
 */

describe('removeLeadingZeros', () => {
  describe('Negative numbers with leading zeros', () => {
    it('should remove leading zeros from -0100', () => {
      expect(removeLeadingZeros('-0100')).toBe('-100');
    });
  });

  describe('Multiple leading zeros', () => {
    it('should remove leading zeros from 00100200', () => {
      expect(removeLeadingZeros('00100200')).toBe('100200');
    });

    it('should remove very long leading zeros from 00000000100200', () => {
      expect(removeLeadingZeros('00000000100200')).toBe('100200');
    });
  });

  describe('Decimal values with leading zeros', () => {
    it('should remove leading zeros from integer part of 00100200.000', () => {
      expect(removeLeadingZeros('00100200.000')).toBe('100200.000');
    });

    it('should remove leading zeros from integer part of 00100200.345', () => {
      expect(removeLeadingZeros('00100200.345')).toBe('100200.345');
    });
  });

  describe('Negative decimal values with leading zeros', () => {
    it('should remove leading zeros from -00100200.345', () => {
      expect(removeLeadingZeros('-00100200.345')).toBe('-100200.345');
    });
  });

  describe('Numbers without leading zeros', () => {
    it('should return 10002000 unchanged', () => {
      expect(removeLeadingZeros('10002000')).toBe('10002000');
    });

    it('should return -10002000 unchanged', () => {
      expect(removeLeadingZeros('-10002000')).toBe('-10002000');
    });
  });

  describe('Edge cases', () => {
    it('should preserve single zero', () => {
      expect(removeLeadingZeros('0')).toBe('0');
    });

    it('should preserve negative zero', () => {
      expect(removeLeadingZeros('-0')).toBe('-0');
    });

    it('should preserve minus sign only', () => {
      expect(removeLeadingZeros('-')).toBe('-');
    });

    it('should preserve decimal point only', () => {
      expect(removeLeadingZeros('.')).toBe('.');
    });

    it('should handle zero with decimal part', () => {
      expect(removeLeadingZeros('0.5')).toBe('0.5');
    });

    it('should handle negative zero with decimal part', () => {
      expect(removeLeadingZeros('-0.5')).toBe('-0.5');
    });

    it('should handle leading zeros with decimal part (00.5)', () => {
      expect(removeLeadingZeros('00.5')).toBe('0.5');
    });

    it('should handle negative leading zeros with decimal part (-00.5)', () => {
      expect(removeLeadingZeros('-00.5')).toBe('-0.5');
    });

    it('should handle empty string', () => {
      expect(removeLeadingZeros('')).toBe('');
    });

    it('should handle numbers starting with decimal point', () => {
      expect(removeLeadingZeros('.5')).toBe('.5');
    });
  });
});

