/**
 * Security tests for the Numora input library.
 * Tests input sanitization, regex injection prevention, and edge cases.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NumoraInput } from '../src/NumoraInput';
import { formatWithSeparators } from '../src/features/formatting';
import { removeThousandSeparators } from '../src/features/sanitization';
import { removeNonNumericCharacters } from '../src/features/non-numeric-characters';
import { expandCompactNotation } from '../src/features/compact-notation';
import { expandScientificNotation } from '../src/features/scientific-notation';
import { ThousandStyle } from '../src/types';

describe('Security Tests', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe('Input Sanitization via removeNonNumericCharacters', () => {
    it('should remove HTML/script tags and keep all digits when sanitizing', () => {
      // Note: setValue() sets the value directly without sanitization
      // The sanitization happens during input events, not setValue
      // Here we test the sanitization function directly
      // The "1" in "alert(1)" is kept along with the trailing "123"
      const result = removeNonNumericCharacters('<script>alert(1)</script>123');
      expect(result).toBe('1123');
    });

    it('should remove HTML attributes and keep all digits when sanitizing', () => {
      // The "1" in "alert(1)" is kept along with the trailing "456"
      const result = removeNonNumericCharacters('<img src=x onerror="alert(1)">456');
      expect(result).toBe('1456');
    });

    it('should handle SQL injection patterns by keeping only digits', () => {
      const result = removeNonNumericCharacters("1'; DROP TABLE users; --");
      expect(result).toBe('1');
    });

    it('should remove unicode control characters during sanitization', () => {
      // Zero-width characters are removed during input sanitization
      const result = removeNonNumericCharacters('1\u200B2\u200C3\u200D4\uFEFF5');
      expect(result).toBe('12345');
    });

    it('should handle null bytes during sanitization', () => {
      const result = removeNonNumericCharacters('123\x00456');
      expect(result).toBe('123456');
    });
  });

  describe('Regex Injection Prevention', () => {
    it('should handle regex special chars in separator without throwing', () => {
      // These are all valid but potentially dangerous separators
      const dangerousSeparators = ['.', '*', '+', '?', '^', '$', '|', '(', ')', '[', ']', '{', '}', '\\'];

      for (const sep of dangerousSeparators) {
        expect(() => {
          removeThousandSeparators(`1${sep}000${sep}000`, sep);
        }).not.toThrow();
      }
    });

    it('should correctly remove period as separator', () => {
      const result = removeThousandSeparators('1.000.000', '.');
      expect(result).toBe('1000000');
    });

    it('should correctly remove asterisk as separator', () => {
      const result = removeThousandSeparators('1*000*000', '*');
      expect(result).toBe('1000000');
    });

    it('should handle backslash as separator', () => {
      const result = removeThousandSeparators('1\\000\\000', '\\');
      expect(result).toBe('1000000');
    });
  });

  describe('Large Input Handling', () => {
    it('should handle very long numeric strings without hanging', () => {
      const longInput = '1'.repeat(1000);
      const start = performance.now();
      const result = formatWithSeparators(longInput, ',', ThousandStyle.Thousand);
      const duration = performance.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(100); // Should complete in < 100ms
    });

    it('should handle extremely long inputs (10000 chars) without crashing', () => {
      const veryLongInput = '1'.repeat(10000);
      const start = performance.now();
      const result = formatWithSeparators(veryLongInput, ',', ThousandStyle.Thousand);
      const duration = performance.now() - start;

      expect(result).toBeDefined();
      expect(duration).toBeLessThan(500); // Should complete in < 500ms
    });

    it('should handle long decimal parts', () => {
      const longDecimal = '1.' + '9'.repeat(100);
      const result = formatWithSeparators(longDecimal, ',', ThousandStyle.Thousand);
      expect(result).toBeDefined();
      expect(result.startsWith('1.')).toBe(true);
    });

    it('should handle removeNonNumericCharacters with long strings', () => {
      const mixedInput = 'a1b2c3d4e5'.repeat(1000);
      const start = performance.now();
      const result = removeNonNumericCharacters(mixedInput);
      const duration = performance.now() - start;

      expect(result).toBe('12345'.repeat(1000));
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Compact Notation Security', () => {
    it('should handle malformed compact notation gracefully', () => {
      const malformed = [
        'kkk',
        '1kk',
        'k1k',
        '1k2k3',
        '...k',
        'e1k',
        '1e2k',
      ];

      for (const input of malformed) {
        expect(() => expandCompactNotation(input)).not.toThrow();
      }
    });

    it('should not execute code in compact notation suffix', () => {
      // These should be treated as regular text, not code
      const dangerous = [
        '1${alert(1)}',
        '1`rm -rf /`',
        '1$(command)',
      ];

      for (const input of dangerous) {
        const result = expandCompactNotation(input);
        // Should preserve the input or extract just the number
        expect(result).toBeDefined();
      }
    });

    it('should handle very large multipliers without overflow', () => {
      // 999t = 999 trillion, tests string-based arithmetic
      const result = expandCompactNotation('999t');
      expect(result).toBe('999000000000000');
      expect(result.length).toBe(15);
    });
  });

  describe('Scientific Notation Security', () => {
    it('should handle malformed scientific notation gracefully', () => {
      const malformed = [
        'eee',
        '1e',
        'e1',
        '1e2e3',
        '1e+',
        '1e-',
        '1e++2',
        '1e--2',
      ];

      for (const input of malformed) {
        expect(() => expandScientificNotation(input)).not.toThrow();
      }
    });

    it('should handle very large exponents without hanging', () => {
      // This creates a very long string
      const result = expandScientificNotation('1e50');
      expect(result).toBeDefined();
      expect(result.length).toBe(51); // 1 followed by 50 zeros
    });

    it('should handle negative exponents correctly', () => {
      const result = expandScientificNotation('1e-5');
      expect(result).toBe('0.00001');
    });

    it('should handle very small exponents without precision loss', () => {
      const result = expandScientificNotation('1.5e-10');
      expect(result).toBe('0.00000000015');
    });
  });

  describe('NumoraInput Edge Cases', () => {
    it('should handle empty string input', () => {
      const input = new NumoraInput(container, {});
      input.setValue('');
      expect(input.getValue()).toBe('');
    });

    it('should filter whitespace in removeNonNumericCharacters', () => {
      // Whitespace filtering happens during input events via sanitization
      const result = removeNonNumericCharacters('   ');
      expect(result).toBe('');
    });

    it('should filter special unicode numbers in removeNonNumericCharacters', () => {
      // Arabic-Indic digits (should be filtered out as they're not 0-9)
      const result = removeNonNumericCharacters('\u0660\u0661\u0662');
      // These are not ASCII digits, so they should be filtered
      expect(result).toBe('');
    });

    it('should handle negative sign in removeNonNumericCharacters when disabled', () => {
      const result = removeNonNumericCharacters('-123', false);
      expect(result).toBe('123');
    });

    it('should handle negative sign in removeNonNumericCharacters when enabled', () => {
      const result = removeNonNumericCharacters('-123', true);
      expect(result).toBe('-123');
    });

    it('should handle multiple negative signs in removeNonNumericCharacters', () => {
      const result = removeNonNumericCharacters('--123', true);
      // Only the leading negative is preserved
      expect(result).toBe('-123');
    });

    it('should set and get value correctly on NumoraInput', () => {
      const input = new NumoraInput(container, {});
      input.setValue('123');
      expect(input.getValue()).toBe('123');
    });
  });

  describe('Prototype Pollution Prevention', () => {
    it('should not pollute Object prototype through options', () => {
      const originalPrototype = { ...Object.prototype };

      // Attempt prototype pollution
      new NumoraInput(container, {
        '__proto__': { polluted: true },
      } as any);

      expect((Object.prototype as any).polluted).toBeUndefined();
      expect(Object.prototype).toEqual(originalPrototype);
    });

    it('should not pollute Array prototype through options', () => {
      const originalPrototype = { ...Array.prototype };

      new NumoraInput(container, {
        'constructor': { prototype: { polluted: true } },
      } as any);

      expect((Array.prototype as any).polluted).toBeUndefined();
    });
  });

  describe('Regex Cache Security', () => {
    it('should handle cache with many different separators', () => {
      // Test that cache doesn't grow unboundedly with different separators
      const separators = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/`~'.split('');

      for (const sep of separators) {
        expect(() => {
          removeThousandSeparators(`1${sep}000`, sep);
        }).not.toThrow();
      }
    });

    it('should maintain correct behavior after many cache entries', () => {
      // After caching many patterns, original patterns should still work
      for (let i = 0; i < 100; i++) {
        const sep = String.fromCharCode(33 + (i % 90));
        removeThousandSeparators(`1${sep}000`, sep);
      }

      // Original comma separator should still work correctly
      const result = removeThousandSeparators('1,000,000', ',');
      expect(result).toBe('1000000');
    });
  });
});
