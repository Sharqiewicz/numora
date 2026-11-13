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

    it('should handle bare-decimal mantissas (.5k)', () => {
      expect(expandCompactNotation('.5k')).toBe('500');
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

    it('should handle bare-decimal mantissas (.5m)', () => {
      expect(expandCompactNotation('.5m')).toBe('500000');
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
      expect(expandCompactNotation('111222333444555666777.8888K')).toBe(
        '111222333444555666777888.8'
      );
    });
  });

  describe('Custom decimal separator', () => {
    it('should expand 1,5k to 1500 when comma is the decimal separator', () => {
      expect(expandCompactNotation('1,5k', ',')).toBe('1500');
    });

    it('should expand a bare-decimal mantissa (,5k) with comma separator', () => {
      expect(expandCompactNotation(',5k', ',')).toBe('500');
    });

    it('should expand 2,5m to 2500000 with comma separator', () => {
      expect(expandCompactNotation('2,5m', ',')).toBe('2500000');
    });

    it('should handle decimal expansions that need trimming with comma separator', () => {
      expect(expandCompactNotation('1,234k', ',')).toBe('1234');
    });

    it('should emit comma in result when overflow happens (1,234567k)', () => {
      expect(expandCompactNotation('1,234567k', ',')).toBe('1234,567');
    });

    it('should leave dot-prefixed scientific-style values alone when comma is decimal', () => {
      // "1.5k" with comma as decimal separator: the literal "." is not the decimal
      // separator, so the regex sees "5k" and expands only that.
      expect(expandCompactNotation('1.5k', ',')).toBe('1.5000');
    });
  });

  describe('Regression: a second decimal separator can start a different valid match (audit #01 follow-up)', () => {
    // The linear-scan rewrite (audit #01) skips a failed mantissa's whole span in one
    // jump for performance. That jump is only safe when the character right after the
    // failed span isn't itself a decimal separator - when it is, a *different* mantissa
    // starting partway through the failed span can still succeed, reusing that second
    // separator. These pin the scan to the same result the old backtracking regex gave.
    it('should expand ".0.b" to ".0" (not leave it unchanged)', () => {
      // The bare-decimal ".0" at position 0 fails (next char is "." not a suffix), but
      // re-anchoring right after that first "." finds "0.b" (mantissa "0." + suffix "b").
      expect(expandCompactNotation('.0.b')).toBe('.0');
    });

    it('should expand "1.2.b" using the second "1." as a dead prefix', () => {
      expect(expandCompactNotation('1.2.b')).toBe('1.2000000000');
    });

    it('should expand "12.34.b" the same way with longer digit runs', () => {
      expect(expandCompactNotation('12.34.b')).toBe('12.34000000000');
    });
  });

  describe('A2-10: a suffix immediately followed by a digit or decimal separator is not a token', () => {
    it('should leave "1k234" unchanged (mid-number keystroke, not a compact-notation token)', () => {
      expect(expandCompactNotation('1k234')).toBe('1k234');
    });

    it('should leave "1.5k234" unchanged the same way', () => {
      expect(expandCompactNotation('1.5k234')).toBe('1.5k234');
    });

    it('should leave a suffix followed by the decimal separator unchanged ("1k.5")', () => {
      expect(expandCompactNotation('1k.5')).toBe('1k.5');
    });

    it('should leave a suffix followed by the decimal separator unchanged with a custom separator ("1k,5" with comma decimal)', () => {
      expect(expandCompactNotation('1k,5', ',')).toBe('1k,5');
    });

    it('should still expand when the suffix is at the end of the string ("1k")', () => {
      expect(expandCompactNotation('1k')).toBe('1000');
    });

    it('should still expand when whitespace follows the suffix ("1k USD")', () => {
      expect(expandCompactNotation('1k USD')).toBe('1000 USD');
    });

    it('should still expand multiple compact notations separated by whitespace ("1k 2m")', () => {
      // The character right after the first suffix is whitespace, not a digit, so this is
      // still a valid boundary even though a digit follows further along.
      expect(expandCompactNotation('1k 2m')).toBe('1000 2000000');
    });

    it('should still expand when another non-numeric, non-separator character follows ("1kk")', () => {
      expect(expandCompactNotation('1kk')).toBe('1000k');
    });

    it('should still expand with whitespace before the suffix and nothing after ("1 k")', () => {
      expect(expandCompactNotation('1 k')).toBe('1000');
    });

    it('leaves the token alone so a subsequent non-numeric-character removal round-trips to the pre-keystroke value', () => {
      // Simulates the Change-mode keystroke from A2-10: typing "k" in the middle of
      // "1|234" produces "1k234" at the sanitizer's compact-notation step. It must survive
      // unchanged here so downstream non-numeric-character removal strips only the "k",
      // yielding back "1234" - i.e. the keystroke is a no-op and beforeinput rejects it.
      const expanded = expandCompactNotation('1k234');
      const withoutLetters = expanded.replace(/[a-zA-Z]/g, '');
      expect(withoutLetters).toBe('1234');
    });
  });
});
