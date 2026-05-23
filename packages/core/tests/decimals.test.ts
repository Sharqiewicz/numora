import { describe, it, expect } from 'vitest';
import {
  ensureMinDecimals,
  trimToDecimalMaxLength,
  removeExtraDecimalSeparators
} from '../src/features/decimals';

describe('ensureMinDecimals', () => {
  describe('basic functionality', () => {
    it('should pad integer to minimum decimals', () => {
      expect(ensureMinDecimals('1', 2, '.')).toBe('1.00');
      expect(ensureMinDecimals('123', 2, '.')).toBe('123.00');
    });

    it('should pad decimal to minimum decimals', () => {
      expect(ensureMinDecimals('1.5', 2, '.')).toBe('1.50');
      expect(ensureMinDecimals('1.1', 3, '.')).toBe('1.100');
    });

    it('should not truncate if decimals exceed minimum', () => {
      expect(ensureMinDecimals('1.123', 2, '.')).toBe('1.123');
      expect(ensureMinDecimals('1.12345', 2, '.')).toBe('1.12345');
    });

    it('should return original value if minDecimals is 0', () => {
      expect(ensureMinDecimals('1', 0, '.')).toBe('1');
      expect(ensureMinDecimals('1.5', 0, '.')).toBe('1.5');
    });
  });

  describe('edge cases', () => {
    it('should handle zero', () => {
      expect(ensureMinDecimals('0', 2, '.')).toBe('0.00');
      expect(ensureMinDecimals('0', 0, '.')).toBe('0');
    });

    it('should handle empty string', () => {
      expect(ensureMinDecimals('', 2, '.')).toBe('.00');
    });

    it('should handle just decimal separator', () => {
      expect(ensureMinDecimals('.', 2, '.')).toBe('.00');
    });

    it('should handle negative numbers', () => {
      expect(ensureMinDecimals('-1', 2, '.')).toBe('-1.00');
      expect(ensureMinDecimals('-1.5', 2, '.')).toBe('-1.50');
    });

    it('should handle negative with just separator', () => {
      expect(ensureMinDecimals('-.', 2, '.')).toBe('-.00');
    });

    it('should handle solo hyphen', () => {
      expect(ensureMinDecimals('-', 2, '.')).toBe('-.00');
    });

    it('should handle negative zero', () => {
      expect(ensureMinDecimals('-0', 2, '.')).toBe('-0.00');
    });
  });

  describe('custom decimal separator', () => {
    it('should work with comma separator', () => {
      expect(ensureMinDecimals('1', 2, ',')).toBe('1,00');
      expect(ensureMinDecimals('1,5', 2, ',')).toBe('1,50');
    });
  });

  describe('real-world scenarios', () => {
    it('should format currency amounts', () => {
      expect(ensureMinDecimals('10', 2, '.')).toBe('10.00');
      expect(ensureMinDecimals('100.5', 2, '.')).toBe('100.50');
    });

    it('should handle large numbers', () => {
      expect(ensureMinDecimals('1234567', 2, '.')).toBe('1234567.00');
      expect(ensureMinDecimals('1234567.8', 2, '.')).toBe('1234567.80');
    });
  });
});

describe('✅ trimToDecimalMaxLength', () => {
  describe('✅ basic trimming', () => {
    it('should trim decimals exceeding max length', () => {
      expect(trimToDecimalMaxLength('1.12345', 2, '.')).toBe('1.12');
      expect(trimToDecimalMaxLength('1.999', 2, '.')).toBe('1.99');
    });

    it('should keep decimals within max length unchanged', () => {
      expect(trimToDecimalMaxLength('1.12', 2, '.')).toBe('1.12');
      expect(trimToDecimalMaxLength('1.1', 2, '.')).toBe('1.1');
    });

    it('should handle values without decimal separator (return as-is)', () => {
      expect(trimToDecimalMaxLength('123', 2, '.')).toBe('123');
      expect(trimToDecimalMaxLength('0', 2, '.')).toBe('0');
    });
  });

  describe('✅ edge cases', () => {
    it('should handle empty string', () => {
      expect(trimToDecimalMaxLength('', 2, '.')).toBe('');
    });

    it('should handle integer only (no decimal separator)', () => {
      expect(trimToDecimalMaxLength('123', 2, '.')).toBe('123');
      expect(trimToDecimalMaxLength('0', 2, '.')).toBe('0');
    });

    it('should handle decimal separator only', () => {
      expect(trimToDecimalMaxLength('.', 2, '.')).toBe('.');
    });

    it('should handle zero max length', () => {
      expect(trimToDecimalMaxLength('1.123', 0, '.')).toBe('1.');
    });

    it('should handle very large max length', () => {
      expect(trimToDecimalMaxLength('1.123', 100, '.')).toBe('1.123');
      expect(trimToDecimalMaxLength('1.123456789', 100, '.')).toBe('1.123456789');
    });

    it('should handle negative numbers', () => {
      expect(trimToDecimalMaxLength('-1.12345', 2, '.')).toBe('-1.12');
      expect(trimToDecimalMaxLength('-1.1', 2, '.')).toBe('-1.1');
    });
  });

  describe('✅ custom decimal separators', () => {
    it('should work with comma as separator', () => {
      expect(trimToDecimalMaxLength('1,12345', 2, ',')).toBe('1,12');
      expect(trimToDecimalMaxLength('1,1', 2, ',')).toBe('1,1');
    });

    it('should work with other custom separators', () => {
      expect(trimToDecimalMaxLength('1|12345', 2, '|')).toBe('1|12');
      expect(trimToDecimalMaxLength('1|1', 2, '|')).toBe('1|1');
    });
  });

  describe('✅ real-world scenarios', () => {
    it('should format currency amounts (2 decimal places)', () => {
      expect(trimToDecimalMaxLength('10.999', 2, '.')).toBe('10.99');
      expect(trimToDecimalMaxLength('100.5', 2, '.')).toBe('100.5');
    });

    it('should format percentage (4 decimal places)', () => {
      expect(trimToDecimalMaxLength('0.123456', 4, '.')).toBe('0.1234');
      expect(trimToDecimalMaxLength('0.12', 4, '.')).toBe('0.12');
    });

    it('should handle scientific precision (many decimal places)', () => {
      expect(trimToDecimalMaxLength('1.123456789012345', 10, '.')).toBe('1.1234567890');
      expect(trimToDecimalMaxLength('1.123456789012345', 15, '.')).toBe('1.123456789012345');
    });
  });
});

describe('✅ removeExtraDecimalSeparators', () => {
  describe('✅ basic functionality', () => {
    it('should remove second decimal separator', () => {
      expect(removeExtraDecimalSeparators('1.23.45', '.')).toBe('1.2345');
      expect(removeExtraDecimalSeparators('1.2.3', '.')).toBe('1.23');
    });

    it('should remove multiple decimal separators (keep first)', () => {
      expect(removeExtraDecimalSeparators('1.2.3.4.5', '.')).toBe('1.2345');
      expect(removeExtraDecimalSeparators('1..2..3', '.')).toBe('1.23');
    });

    it('should keep value unchanged when only one separator exists', () => {
      expect(removeExtraDecimalSeparators('1.23', '.')).toBe('1.23');
      expect(removeExtraDecimalSeparators('1.2', '.')).toBe('1.2');
    });

    it('should keep value unchanged when no separator exists', () => {
      expect(removeExtraDecimalSeparators('123', '.')).toBe('123');
      expect(removeExtraDecimalSeparators('0', '.')).toBe('0');
    });
  });

  describe('✅ edge cases', () => {
    it('should handle multiple separators at start', () => {
      expect(removeExtraDecimalSeparators('.1.2.3', '.')).toBe('.123');
    });

    it('should handle multiple separators in middle', () => {
      expect(removeExtraDecimalSeparators('12.3.4.5', '.')).toBe('12.345');
    });

    it('should handle multiple separators at end', () => {
      expect(removeExtraDecimalSeparators('1.23.', '.')).toBe('1.23');
    }); 

    it('should handle empty string', () => {
      expect(removeExtraDecimalSeparators('', '.')).toBe('');
    });

    it('should handle separator only', () => {
      expect(removeExtraDecimalSeparators('.', '.')).toBe('.');
    });

    it('should handle multiple consecutive separators', () => {
      expect(removeExtraDecimalSeparators('1..2', '.')).toBe('1.2');
      expect(removeExtraDecimalSeparators('1...2', '.')).toBe('1.2');
    });
  });

  describe('✅ custom decimal separators', () => {
    it('should work with comma as separator', () => {
      expect(removeExtraDecimalSeparators('1,23,45', ',')).toBe('1,2345');
      expect(removeExtraDecimalSeparators('1,2,3', ',')).toBe('1,23');
    });

    it('should work with other custom separators', () => {
      expect(removeExtraDecimalSeparators('1|23|45', '|')).toBe('1|2345');
      expect(removeExtraDecimalSeparators('1|2|3', '|')).toBe('1|23');
    });

    it('should handle special regex characters in separator', () => {
      expect(removeExtraDecimalSeparators('1.23.45', '.')).toBe('1.2345');
      expect(removeExtraDecimalSeparators('1+23+45', '+')).toBe('1+2345');
    });
  });

  describe('✅ real-world scenarios', () => {
    it('should handle user pasting malformed numbers', () => {
      expect(removeExtraDecimalSeparators('12.34.56', '.')).toBe('12.3456');
      expect(removeExtraDecimalSeparators('1.2.3.4', '.')).toBe('1.234');
    });

    it('should handle copy-paste errors', () => {
      expect(removeExtraDecimalSeparators('100.50.00', '.')).toBe('100.5000');
      expect(removeExtraDecimalSeparators('0.0.0', '.')).toBe('0.00');
    });

    it('should handle input validation cleanup', () => {
      expect(removeExtraDecimalSeparators('123.45.67.89', '.')).toBe('123.456789');
      expect(removeExtraDecimalSeparators('-1.2.3', '.')).toBe('-1.23');
      expect(removeExtraDecimalSeparators('....,,,,.,.,.,.,....123.45.67.89', '.')).toBe('.123456789');
    });

    it('should purge mixed dot and comma separators from the tail', () => {
      expect(removeExtraDecimalSeparators('1.2,3', '.')).toBe('1.23');
      expect(removeExtraDecimalSeparators('1,2.3', ',')).toBe('1,23');
    });
  });
});
