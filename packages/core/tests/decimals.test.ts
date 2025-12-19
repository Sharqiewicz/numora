import { describe, it, expect, vi } from 'vitest';
import {
  ensureMinDecimals,
  handleDecimalSeparatorKey,
  trimToDecimalMaxLength,
  removeExtraDecimalSeparators
} from '../src/features/decimals';
import { ThousandStyle } from '../src/types';

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

describe('✅ handleDecimalSeparatorKey', () => {
  function createMockInputElement(value: string, selectionStart: number | null = null, selectionEnd: number | null = null): HTMLInputElement {
    const input = document.createElement('input');
    input.value = value;
    input.selectionStart = selectionStart ?? value.length;
    input.selectionEnd = selectionEnd ?? (selectionStart ?? value.length);
    let currentStart = input.selectionStart;
    let currentEnd = input.selectionEnd;

    input.setSelectionRange = vi.fn((start: number, end: number) => {
      currentStart = start;
      currentEnd = end;
      input.selectionStart = start;
      input.selectionEnd = end;
    });

    Object.defineProperty(input, 'selectionStart', {
      get: () => currentStart,
      set: (val) => { currentStart = val; },
      configurable: true
    });

    Object.defineProperty(input, 'selectionEnd', {
      get: () => currentEnd,
      set: (val) => { currentEnd = val; },
      configurable: true
    });

    return input;
  }

  function createKeyboardEvent(key: string): KeyboardEvent {
    return new KeyboardEvent('keydown', { key });
  }

  describe('✅ basic conversion', () => {
    it('should convert comma to dot when decimal separator is dot', () => {
      const input = createMockInputElement('123', 3);
      const event = createKeyboardEvent(',');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(result).toBe(true);
      expect(input.value).toBe('123.');
      expect(input.setSelectionRange).toHaveBeenCalledWith(4, 4);
    });

    it('should convert dot to comma when decimal separator is comma', () => {
      const input = createMockInputElement('123', 3);
      const event = createKeyboardEvent('.');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        ','
      );

      expect(result).toBe(true);
      expect(input.value).toBe('123,');
      expect(input.setSelectionRange).toHaveBeenCalledWith(4, 4);
    });

    it('should return false when key is not comma or dot', () => {
      const input = createMockInputElement('123', 3);
      const event = createKeyboardEvent('5');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(result).toBe(false);
      expect(input.value).toBe('123');
    });

    it('should return false when key matches decimal separator', () => {
      const input = createMockInputElement('123', 3);
      const event = createKeyboardEvent('.');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(result).toBe(false);
      expect(input.value).toBe('123');
    });
  });

  describe('✅ prevent multiple separators', () => {
    it('should return true when trying to add second decimal separator', () => {
      const input = createMockInputElement('1.23', 4);
      const event = createKeyboardEvent('.');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(result).toBe(true);
      expect(input.value).toBe('1.23');
    });

    it('should return true when trying to add second decimal separator with comma', () => {
      const input = createMockInputElement('1,23', 4);
      const event = createKeyboardEvent(',');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        ','
      );

      expect(result).toBe(true);
      expect(input.value).toBe('1,23');
    });

    it('should handle cursor position correctly when converting separator', () => {
      const input = createMockInputElement('123', 1);
      const event = createKeyboardEvent(',');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(result).toBe(true);
      expect(input.value).toBe('1.23');
      expect(input.setSelectionRange).toHaveBeenCalledWith(2, 2);
    });
  });

  describe('✅ ThousandStyle conditions', () => {
    it('should return false when thousandStyle is Thousand', () => {
      const input = createMockInputElement('123', 3);
      const event = createKeyboardEvent(',');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.Thousand },
        '.'
      );

      expect(result).toBe(false);
      expect(input.value).toBe('123');
    });

    it('should return false when thousandStyle is Lakh', () => {
      const input = createMockInputElement('123', 3);
      const event = createKeyboardEvent(',');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.Lakh },
        '.'
      );

      expect(result).toBe(false);
      expect(input.value).toBe('123');
    });

    it('should return false when thousandStyle is Wan', () => {
      const input = createMockInputElement('123', 3);
      const event = createKeyboardEvent(',');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.Wan },
        '.'
      );

      expect(result).toBe(false);
      expect(input.value).toBe('123');
    });

    it('should work correctly when thousandStyle is None', () => {
      const input = createMockInputElement('123', 3);
      const event = createKeyboardEvent(',');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(result).toBe(true);
      expect(input.value).toBe('123.');
    });

    it('should work correctly when thousandStyle is undefined', () => {
      const input = createMockInputElement('123', 3);
      const event = createKeyboardEvent(',');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        undefined,
        '.'
      );

      expect(result).toBe(true);
      expect(input.value).toBe('123.');
    });
  });

  describe('✅ cursor position handling', () => {
    it('should insert separator at correct cursor position', () => {
      const input = createMockInputElement('123', 2);
      const event = createKeyboardEvent(',');
      handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(input.value).toBe('12.3');
      expect(input.setSelectionRange).toHaveBeenCalledWith(3, 3);
    });

    it('should update cursor position after insertion', () => {
      const input = createMockInputElement('123', 0);
      const event = createKeyboardEvent(',');
      handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(input.value).toBe('.123');
      expect(input.setSelectionRange).toHaveBeenCalledWith(1, 1);
    });

    it('should handle text selection (selectionStart !== selectionEnd)', () => {
      const input = createMockInputElement('123', 0, 3);
      const event = createKeyboardEvent(',');
      handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(input.value).toBe('.');
      expect(input.setSelectionRange).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('✅ edge cases', () => {
    it('should handle empty input', () => {
      const input = createMockInputElement('', 0);
      const event = createKeyboardEvent(',');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(result).toBe(true);
      expect(input.value).toBe('.');
      expect(input.setSelectionRange).toHaveBeenCalledWith(1, 1);
    });

    it('should handle input with existing decimal separator', () => {
      const input = createMockInputElement('1.23', 5);
      const event = createKeyboardEvent(',');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(result).toBe(true);
      expect(input.value).toBe('1.23');
    });

    it('should handle input with text selection at start', () => {
      const input = createMockInputElement('123', 0, 2);
      const event = createKeyboardEvent(',');
      handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(input.value).toBe('.3');
      expect(input.setSelectionRange).toHaveBeenCalledWith(1, 1);
    });

    it('should NOT prevent decimal separator if the existing one is selected', () => {
      // 1.23 with "." selected
      const input = createMockInputElement('1.23', 1, 2);
      const event = createKeyboardEvent('.');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      // result false means "don't prevent default" - let the browser overwrite
      expect(result).toBe(false);
    });

    it('should allow converting comma to dot if dot is selected', () => {
      const input = createMockInputElement('1.23', 1, 2);
      const event = createKeyboardEvent(',');
      const result = handleDecimalSeparatorKey(
        event,
        input,
        { ThousandStyle: ThousandStyle.None },
        '.'
      );

      expect(result).toBe(true);
      expect(input.value).toBe('1.23'); // dot replaced by dot, so looks same
      expect(input.setSelectionRange).toHaveBeenCalledWith(2, 2);
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
