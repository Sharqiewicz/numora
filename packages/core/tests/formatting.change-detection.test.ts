import { describe, it, expect } from 'vitest';
import { findChangeRange, type ChangeRange } from '../src/utils/formatting';

/**
 * Testing module: formatting/change-detection.ts
 *
 * Tests for findChangeRange function which detects what changed between two values.
 * Adapted from react-number-format reference tests.
 */

describe('findChangeRange', () => {
  describe('negative floats', () => {
    it('should detect deletion from end (0.0345 -> 0.034)', () => {
      const result = findChangeRange('0.0345', '0.034');
      expect(result).toBeDefined();
      // The change is at position 5 (after '0.034'), deleting 1 character
      expect(result?.start).toBe(5);
      expect(result?.end).toBe(6);
      expect(result?.deletedLength).toBe(1);
    });

    it('should detect insertion in middle (0.0345 -> 0.03456789)', () => {
      const result = findChangeRange('0.0345', '0.03456789');
      expect(result).toBeDefined();
      // Insertion starts at position 6 (after '0.0345')
      expect(result?.start).toBe(6);
      expect(result?.end).toBe(6);
      expect(result?.deletedLength).toBe(0);
    });

    it('should detect insertion from empty string', () => {
      const result = findChangeRange('', '100-1000 USD');
      expect(result).toBeDefined();
      expect(result?.start).toBe(0);
      expect(result?.end).toBe(0);
      expect(result?.deletedLength).toBe(0);
    });

    it('should detect partial change (100-1000 USD -> 100-10000 USD)', () => {
      const result = findChangeRange('100-1000 USD', '100-10000 USD');
      expect(result).toBeDefined();
      // Change is at position 8 (after '100-100'), inserting '0'
      expect(result?.start).toBe(8);
      expect(result?.end).toBe(8);
      expect(result?.deletedLength).toBe(0);
    });
  });

  describe('edge cases', () => {
    it('should return undefined for identical values', () => {
      const result = findChangeRange('123', '123');
      expect(result).toBeUndefined();
    });

    it('should detect change at beginning', () => {
      const result = findChangeRange('123', '023');
      expect(result).toBeDefined();
      expect(result?.start).toBe(0);
      expect(result?.end).toBe(1);
    });

    it('should detect change at end', () => {
      const result = findChangeRange('123', '124');
      expect(result).toBeDefined();
      expect(result?.start).toBe(2);
      expect(result?.end).toBe(3);
    });

    it('should detect multiple character deletion', () => {
      const result = findChangeRange('12345', '123');
      expect(result).toBeDefined();
      expect(result?.start).toBe(3);
      expect(result?.end).toBe(5);
      expect(result?.deletedLength).toBe(2);
    });

    it('should detect multiple character insertion', () => {
      const result = findChangeRange('123', '12345');
      expect(result).toBeDefined();
      expect(result?.start).toBe(3);
      expect(result?.end).toBe(3);
      expect(result?.deletedLength).toBe(0);
    });
  });
});

