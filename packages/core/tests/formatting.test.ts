import { describe, it, expect } from 'vitest';

/**
 * Testing module: formatting/thousands-grouping.ts
 *
 * The formatting module has been reorganized into focused sub-modules:
 * - formatting/thousands-grouping.ts - Number formatting with separators
 * - formatting/cursor-position.ts - Cursor position calculation
 * - formatting/digit-counting.ts - Digit counting utilities
 * - formatting/change-detection.ts - Change detection utilities
 * - formatting/constants.ts - Type definitions and constants
 *
 * Imports from 'utils/formatting' use the re-export from formatting/index.ts
 * for backward compatibility.
 */
import { formatWithSeparators } from '../src/utils/formatting';

describe('formatWithSeparators', () => {
  describe('thousand style (standard Western)', () => {
    it('should format 1234567 to 1,234,567', () => {
      expect(formatWithSeparators('1234567', ',', 'thousand')).toBe('1,234,567');
    });

    it('should format 123456 to 123,456', () => {
      expect(formatWithSeparators('123456', ',', 'thousand')).toBe('123,456');
    });

    it('should format 12345 to 12,345', () => {
      expect(formatWithSeparators('12345', ',', 'thousand')).toBe('12,345');
    });

    it('should format 1234 to 1,234', () => {
      expect(formatWithSeparators('1234', ',', 'thousand')).toBe('1,234');
    });

    it('should format 123 to 123 (no separator needed)', () => {
      expect(formatWithSeparators('123', ',', 'thousand')).toBe('123');
    });

    it('should format 12 to 12 (no separator needed)', () => {
      expect(formatWithSeparators('12', ',', 'thousand')).toBe('12');
    });

    it('should format 1 to 1 (no separator needed)', () => {
      expect(formatWithSeparators('1', ',', 'thousand')).toBe('1');
    });

    it('should format 1000000 to 1,000,000', () => {
      expect(formatWithSeparators('1000000', ',', 'thousand')).toBe('1,000,000');
    });

    it('should format 1234567890 to 1,234,567,890', () => {
      expect(formatWithSeparators('1234567890', ',', 'thousand')).toBe('1,234,567,890');
    });

    it('should handle decimal values', () => {
      expect(formatWithSeparators('1234567.89', ',', 'thousand')).toBe('1,234,567.89');
    });

    it('should handle values starting with decimal point', () => {
      expect(formatWithSeparators('.89', ',', 'thousand')).toBe('.89');
    });

    it('should handle empty string', () => {
      expect(formatWithSeparators('', ',', 'thousand')).toBe('');
    });

    it('should handle zero', () => {
      expect(formatWithSeparators('0', ',', 'thousand')).toBe('0');
    });

    it('should handle single decimal point', () => {
      expect(formatWithSeparators('.', ',', 'thousand')).toBe('.');
    });

    it('should use custom separator', () => {
      expect(formatWithSeparators('1234567', ' ', 'thousand')).toBe('1 234 567');
    });

    it('should handle very large numbers', () => {
      expect(formatWithSeparators('123456789012345', ',', 'thousand')).toBe('123,456,789,012,345');
    });
  });

  describe('lakh style (Indian numbering)', () => {
    it('should format 1234567 to 12,34,567', () => {
      expect(formatWithSeparators('1234567', ',', 'lakh')).toBe('12,34,567');
    });

    it('should format 123456 to 1,23,456', () => {
      expect(formatWithSeparators('123456', ',', 'lakh')).toBe('1,23,456');
    });

    it('should format 12345 to 12,345', () => {
      expect(formatWithSeparators('12345', ',', 'lakh')).toBe('12,345');
    });

    it('should format 1234 to 1,234', () => {
      expect(formatWithSeparators('1234', ',', 'lakh')).toBe('1,234');
    });

    it('should format 123 to 123 (no separator needed)', () => {
      expect(formatWithSeparators('123', ',', 'lakh')).toBe('123');
    });

    it('should format 100000 to 1,00,000', () => {
      expect(formatWithSeparators('100000', ',', 'lakh')).toBe('1,00,000');
    });

    it('should format 1000000 to 10,00,000', () => {
      expect(formatWithSeparators('1000000', ',', 'lakh')).toBe('10,00,000');
    });

    it('should format 12345678 to 1,23,45,678', () => {
      expect(formatWithSeparators('12345678', ',', 'lakh')).toBe('1,23,45,678');
    });

    it('should handle decimal values', () => {
      expect(formatWithSeparators('1234567.89', ',', 'lakh')).toBe('12,34,567.89');
    });

    it('should use custom separator', () => {
      expect(formatWithSeparators('1234567', ' ', 'lakh')).toBe('12 34 567');
    });
  });

  describe('wan style (Chinese numbering)', () => {
    it('should format 1234567 to 123,4567', () => {
      expect(formatWithSeparators('1234567', ',', 'wan')).toBe('123,4567');
    });

    it('should format 123456 to 12,3456', () => {
      expect(formatWithSeparators('123456', ',', 'wan')).toBe('12,3456');
    });

    it('should format 12345 to 1,2345', () => {
      expect(formatWithSeparators('12345', ',', 'wan')).toBe('1,2345');
    });

    it('should format 1234 to 1234 (no separator needed)', () => {
      expect(formatWithSeparators('1234', ',', 'wan')).toBe('1234');
    });

    it('should format 123 to 123 (no separator needed)', () => {
      expect(formatWithSeparators('123', ',', 'wan')).toBe('123');
    });

    it('should format 10000 to 1,0000', () => {
      expect(formatWithSeparators('10000', ',', 'wan')).toBe('1,0000');
    });

    it('should format 100000 to 10,0000', () => {
      expect(formatWithSeparators('100000', ',', 'wan')).toBe('10,0000');
    });

    it('should format 12345678 to 1234,5678', () => {
      expect(formatWithSeparators('12345678', ',', 'wan')).toBe('1234,5678');
    });

    it('should format 123456789 to 1,2345,6789', () => {
      expect(formatWithSeparators('123456789', ',', 'wan')).toBe('1,2345,6789');
    });

    it('should handle decimal values', () => {
      expect(formatWithSeparators('1234567.89', ',', 'wan')).toBe('123,4567.89');
    });

    it('should use custom separator', () => {
      expect(formatWithSeparators('1234567', ' ', 'wan')).toBe('123 4567');
    });
  });

  describe('default behavior', () => {
    it('should default to thousand style when groupStyle is not specified', () => {
      expect(formatWithSeparators('1234567', ',')).toBe('1,234,567');
    });
  });

  describe('edge cases', () => {
    it('should handle leading zeros', () => {
      expect(formatWithSeparators('001234567', ',', 'thousand')).toBe('001,234,567');
    });

    it('should handle very small numbers', () => {
      expect(formatWithSeparators('1', ',', 'thousand')).toBe('1');
      expect(formatWithSeparators('12', ',', 'thousand')).toBe('12');
      expect(formatWithSeparators('123', ',', 'thousand')).toBe('123');
    });

    it('should handle numbers with only decimal part', () => {
      expect(formatWithSeparators('.123', ',', 'thousand')).toBe('.123');
    });

    it('should handle numbers ending with decimal point', () => {
      expect(formatWithSeparators('123.', ',', 'thousand')).toBe('123.');
    });
  });
});
