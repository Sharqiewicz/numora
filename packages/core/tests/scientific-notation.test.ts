import { describe, it, expect } from 'vitest';
import { expandScientificNotation } from '../src/features/scientific-notation';
import { sanitizeNumoraInput } from '../src/features/sanitization';

describe('expandScientificNotation', () => {
  describe('Negative exponents (small numbers)', () => {
    it('should expand 1.5e-7 to 0.00000015', () => {
      expect(expandScientificNotation('1.5e-7')).toBe('0.00000015');
    });

    it('should expand 1.5e-1 to 0.15', () => {
      expect(expandScientificNotation('1.5e-1')).toBe('0.15');
    });

    it('should expand 1.23e-4 to 0.000123', () => {
      expect(expandScientificNotation('1.23e-4')).toBe('0.000123');
    });

    it('should expand 2e-3 to 0.002', () => {
      expect(expandScientificNotation('2e-3')).toBe('0.002');
    });

    it('should expand 0.5e-2 to 0.005', () => {
      expect(expandScientificNotation('0.5e-2')).toBe('0.005');
    });

    it('should expand 1e-10 to 0.0000000001', () => {
      expect(expandScientificNotation('1e-10')).toBe('0.0000000001');
    });

    it('should expand 123.456e-2 to 1.23456', () => {
      expect(expandScientificNotation('123.456e-2')).toBe('1.23456');
    });

    it('should expand 1e-1 to 0.1', () => {
      expect(expandScientificNotation('1e-1')).toBe('0.1');
    });

    it('should expand 10e-2 to 0.1', () => {
      expect(expandScientificNotation('10e-2')).toBe('0.1');
    });

    it('should expand 100e-3 to 0.1', () => {
      expect(expandScientificNotation('100e-3')).toBe('0.1');
    });
  });

  describe('Positive exponents (large numbers)', () => {
    it('should expand 2e+5 to 200000', () => {
      expect(expandScientificNotation('2e+5')).toBe('200000');
    });

    it('should expand 1.5e+2 to 150', () => {
      expect(expandScientificNotation('1.5e+2')).toBe('150');
    });

    it('should expand 1.5e+1 to 15', () => {
      expect(expandScientificNotation('1.5e+1')).toBe('15');
    });

    it('should expand 12.34e+1 to 123.4', () => {
      expect(expandScientificNotation('12.34e+1')).toBe('123.4');
    });

    it('should expand 12.34e+2 to 1234', () => {
      expect(expandScientificNotation('12.34e+2')).toBe('1234');
    });

    it('should expand 1e+3 to 1000', () => {
      expect(expandScientificNotation('1e+3')).toBe('1000');
    });

    it('should expand 1.23e+2 to 123', () => {
      expect(expandScientificNotation('1.23e+2')).toBe('123');
    });

    it('should expand 5e+4 to 50000', () => {
      expect(expandScientificNotation('5e+4')).toBe('50000');
    });
  });

  describe('Edge cases', () => {
    it('should handle exponent of 0', () => {
      expect(expandScientificNotation('1.5e0')).toBe('1.5');
    });

    it('should handle uppercase E', () => {
      expect(expandScientificNotation('1.5E-7')).toBe('0.00000015');
    });

    it('should handle integer base without decimal point', () => {
      expect(expandScientificNotation('5e-3')).toBe('0.005');
    });

    it('should not expand non-scientific notation', () => {
      expect(expandScientificNotation('123.45')).toBe('123.45');
    });

    it('should not expand invalid scientific notation', () => {
      expect(expandScientificNotation('1.5e')).toBe('1.5e');
      expect(expandScientificNotation('e-7')).toBe('e-7');
      expect(expandScientificNotation('1.5e-')).toBe('1.5e-');
    });

    it('should handle multiple scientific notations in string', () => {
      expect(expandScientificNotation('1.5e-7 and 2e+5')).toBe('0.00000015 and 200000');
    });

    it('should handle very large exponents', () => {
      expect(expandScientificNotation('1e-20')).toBe('0.00000000000000000001');
      expect(expandScientificNotation('1e+10')).toBe('10000000000');
    });

    it('should handle zero base', () => {
      expect(expandScientificNotation('0e-5')).toBe('0');
      expect(expandScientificNotation('0e+5')).toBe('0');
    });

    it('should handle negative base', () => {
      expect(expandScientificNotation('-1.5e-2')).toBe('-0.015');
      expect(expandScientificNotation('-2e+3')).toBe('-2000');
    });

    it('should handle positive sign in exponent', () => {
      expect(expandScientificNotation('1.5e+7')).toBe('15000000');
    });

    it('should handle no sign in exponent (assumes positive)', () => {
      expect(expandScientificNotation('1.5e7')).toBe('15000000');
    });
  });

  describe('Integration with sanitization', () => {
    it('should work with values that have extra characters', () => {
      const result = expandScientificNotation('value 1.5e-7 here');
      expect(result).toBe('value 0.00000015 here');
    });
  });

  describe('Custom decimal separator', () => {
    it('should expand 1,5e-7 to 0,00000015 when comma is the decimal separator', () => {
      expect(expandScientificNotation('1,5e-7', ',')).toBe('0,00000015');
    });

    it('should expand 1,5e3 to 1500 with comma separator', () => {
      expect(expandScientificNotation('1,5e3', ',')).toBe('1500');
    });

    it('should expand 1,23e-4 to 0,000123 with comma separator', () => {
      expect(expandScientificNotation('1,23e-4', ',')).toBe('0,000123');
    });

    it('should expand 2e-3 to 0,002 with comma separator', () => {
      expect(expandScientificNotation('2e-3', ',')).toBe('0,002');
    });

    it('should leave the input unchanged when no e/E present', () => {
      expect(expandScientificNotation('1,5', ',')).toBe('1,5');
    });

    it('should preserve negative sign with comma separator', () => {
      expect(expandScientificNotation('-1,5e3', ',')).toBe('-1500');
    });
  });

  describe('Regression: bare leading decimal mantissa (#2)', () => {
    it('should expand ".5e3" to "500" (not ".5000")', () => {
      expect(expandScientificNotation('.5e3')).toBe('500');
    });

    it('should expand "-.5e3" to "-500"', () => {
      expect(expandScientificNotation('-.5e3')).toBe('-500');
    });

    it('should expand ".5e-1" to "0.05"', () => {
      expect(expandScientificNotation('.5e-1')).toBe('0.05');
    });

    it('should handle a bare leading decimal with a comma separator', () => {
      expect(expandScientificNotation(',5e3', ',')).toBe('500');
    });
  });

  describe('Regression: negative-zero magnitude (#9)', () => {
    it('should expand "-0e5" to "0" (not "-0")', () => {
      expect(expandScientificNotation('-0e5')).toBe('0');
    });

    it('should expand "-0.0e5" to "0"', () => {
      expect(expandScientificNotation('-0.0e5')).toBe('0');
    });
  });

  describe('Regression: unbounded exponent is bounded (#1)', () => {
    it('should not throw or allocate a huge string for a massive positive exponent', () => {
      // Rejected (dropped) rather than crashing or allocating ~600MB.
      expect(expandScientificNotation('1e600000000')).toBe('');
    });

    it('should not throw for a massive negative exponent', () => {
      expect(expandScientificNotation('1e-600000000')).toBe('');
    });

    it('should still expand exponents within the bound', () => {
      expect(expandScientificNotation('1e3')).toBe('1000');
    });

    it('should expand at the bound and reject one past it', () => {
      expect(expandScientificNotation('1e1000')).toHaveLength(1001);
      expect(expandScientificNotation('1e1001')).toBe('');
      expect(expandScientificNotation('1e-1000')).toHaveLength(1002);
      expect(expandScientificNotation('1e-1001')).toBe('');
    });

    it('should drop the sign along with a rejected token', () => {
      expect(expandScientificNotation('-1e999999')).toBe('');
    });
  });

  describe('Regression: over-range exponent must not fabricate a magnitude (#2)', () => {
    it('should not concatenate the digits of a rejected token through sanitization', () => {
      // Before the fix the token was returned untouched, `removeNonNumericCharacters`
      // stripped the stray 'e', and the user saw a fabricated 1,600,000,000.
      expect(sanitizeNumoraInput('1e600000000')).not.toBe('1600000000');
      expect(sanitizeNumoraInput('1e600000000')).toBe('');
      expect(sanitizeNumoraInput('1e1001')).toBe('');
      expect(sanitizeNumoraInput('1e-1001')).toBe('');
    });

    it('should still sanitize in-range scientific notation normally', () => {
      expect(sanitizeNumoraInput('1.5e-7')).toBe('0.00000015');
      expect(sanitizeNumoraInput('2e5')).toBe('200000');
    });
  });

  describe('Regression: exponent immediately followed by a fractional tail is rejected (audit #12)', () => {
    it('should reject "1e3.5" instead of fabricating "1000.5"', () => {
      // The exponent grammar is digits-only, so ".5" is not part of the match. Before the
      // fix the "1e3" portion silently expanded to "1000" and the unmatched ".5" was
      // concatenated by the pipeline, producing "1000.5" - a fabricated magnitude.
      expect(expandScientificNotation('1e3.5')).not.toBe('1000.5');
      expect(expandScientificNotation('1e3.5')).toBe('.5');
    });

    it('should reject a negative-exponent token followed by a fractional tail', () => {
      expect(expandScientificNotation('1e-3.5')).toBe('.5');
    });

    it('should reject a signed base followed by a fractional tail', () => {
      expect(expandScientificNotation('-1e3.5')).toBe('.5');
    });

    it('should still expand a token where the tail digit is not adjacent to a decimal separator', () => {
      // Sanity check: only "exponent digits immediately followed by sep+digit" is rejected.
      expect(expandScientificNotation('1e3x5')).toBe('1000x5');
    });

    it('should not fabricate a magnitude through sanitizeNumoraInput either', () => {
      expect(sanitizeNumoraInput('1e3.5')).not.toBe('1000.5');
    });
  });

  describe('Regression: a second decimal separator can start a different valid match (audit #01 follow-up)', () => {
    // Same class of bug as the compact-notation follow-up: the linear-scan rewrite skips
    // a failed mantissa's whole span in one jump, which is only safe when the character
    // right after the failed span isn't itself a decimal separator. These pin the scan to
    // the same result the old backtracking regex gave.
    it('should expand ".0.5e3" using the second "0." as the real mantissa', () => {
      // The bare-decimal ".0" at position 0 fails (next char is "." not "e"/"E"), but
      // re-anchoring right after that first "." finds "0.5" as a mantissa with "e3" after it.
      expect(expandScientificNotation('.0.5e3')).toBe('.0500');
    });

    it('should expand "1.2.5e3" the same way with a leading digit', () => {
      expect(expandScientificNotation('1.2.5e3')).toBe('1.2500');
    });

    it('should preserve a leading sign on the dead prefix', () => {
      expect(expandScientificNotation('-.0.5e3')).toBe('-.0500');
    });
  });
});
