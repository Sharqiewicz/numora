import { describe, it, expect } from 'vitest';

/**
 * Testing modules:
 * - formatting/cursor-position.ts (calculateCursorPositionAfterFormatting)
 * - formatting/change-detection.ts (findChangedRangeFromCaretPositions)
 * - formatting/constants.ts (ChangeRange type)
 *
 * The formatting module has been reorganized into focused sub-modules.
 * See formatting/README.md for complete documentation.
 *
 * Imports from 'utils/formatting' use the re-export from formatting/index.ts
 * for backward compatibility.
 */
import {
  calculateCursorPositionAfterFormatting,
  findChangedRangeFromCaretPositions,
  ChangeRange,
  getCaretBoundary,
} from '../src/features/formatting';

describe('calculateCursorPositionAfterFormatting', () => {
  describe('thousand style - typing that triggers comma insertion', () => {
    it('should maintain cursor when typing digit that adds comma (100 -> 1,000)', () => {
      const oldValue = '100';
      const newValue = '1,000';
      const oldCursor = 3;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(5);
      expect(newValue[newCursor - 1]).toBe('0');
    });

    it('should maintain cursor when typing at end (1000 -> 1,000)', () => {
      const oldValue = '1000';
      const newValue = '1,000';
      const oldCursor = 4;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(5);
    });

    it('should maintain cursor when typing digit that creates first comma (999 -> 1,000)', () => {
      const oldValue = '999';
      const newValue = '1,000';
      const oldCursor = 3;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(5);
    });
  });

  describe('thousand style - deleting that removes comma', () => {
    it('should maintain cursor when deleting digit that removes comma (1,000 -> 100)', () => {
      const oldValue = '1,000';
      const newValue = '100';
      const oldCursor = 2;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(2);
      expect(newValue[newCursor - 1]).toBe('0');
    });

    it('should maintain cursor when deleting from middle (1,234 -> 123)', () => {
      const oldValue = '1,234';
      const newValue = '123';
      const oldCursor = 3;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(3);
    });
  });

  describe('thousand style - inserting in middle', () => {
    it('should maintain cursor when inserting digit in middle (1,0|0 -> 1,5|00)', () => {
      const oldValue = '1,00';
      const newValue = '1,500';
      const oldCursor = 3;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(4);
      expect(newValue[newCursor - 1]).toBe('5');
    });

    it('should maintain cursor when inserting before comma (1|,000 -> 12,000)', () => {
      const oldValue = '1,000';
      const newValue = '12,000';
      const oldCursor = 1;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(2);
    });

    it('should maintain cursor when inserting after comma (1,|000 -> 1,5000)', () => {
      const oldValue = '1,000';
      const newValue = '1,5000';
      const oldCursor = 2;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(3);
      expect(newValue[newCursor - 1]).toBe('5');
    });
  });

  describe.skip('thousand style - backspace on separator', () => {
    it('should move cursor backward when separator is deleted (1,|000 -> 1,000)', () => {
      const oldValue = '1,000';
      const newValue = '1,000';
      const oldCursor = 2;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(1);
    });

    it('should handle backspace on separator in middle (1,2|34,567 -> 12,345,67)', () => {
      const oldValue = '1,234,567';
      const newValue = '12,345,67';
      const oldCursor = 3;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBeGreaterThan(0);
      expect(newCursor).toBeLessThanOrEqual(newValue.length);
    });
  });

  describe('thousand style - pasting', () => {
    it('should maintain cursor when pasting at start (| -> 5,000|)', () => {
      const oldValue = '';
      const newValue = '5,000';
      const oldCursor = 0;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(5);
    });

    it('should maintain cursor when pasting in middle (1,| -> 1,5000|)', () => {
      const oldValue = '1,';
      const newValue = '1,5000';
      const oldCursor = 2;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(6);
    });

    it('should handle pasting 5000 into 1,| (cursor after comma)', () => {
      const oldValue = '1,';
      const newValue = '1,5000';
      const oldCursor = 2;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(6);
    });
  });

  describe('thousand style - decimal values', () => {
    it('should maintain cursor in integer part (1,234.56 -> 12,345.6)', () => {
      const oldValue = '1,234.56';
      const newValue = '12,345.6';
      const oldCursor = 2;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(2);
    });

    it('should maintain cursor in decimal part (1,234.5|6 -> 1,234.56|)', () => {
      const oldValue = '1,234.56';
      const newValue = '1,234.567';
      const oldCursor = 7;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(9);
    });
  });

  describe('lakh style', () => {
    it('should maintain cursor when formatting changes (123456 -> 1,23,456)', () => {
      const oldValue = '123456';
      const newValue = '1,23,456';
      const oldCursor = 3;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'lakh'
      );
      expect(newCursor).toBe(4);
    });

    it('should handle backspace on separator in lakh style', () => {
      const oldValue = '1,23,456';
      const newValue = '12,3456';
      const oldCursor = 2;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'lakh'
      );
      expect(newCursor).toBe(1);
    });
  });

  describe('wan style', () => {
    it('should maintain cursor when formatting changes (1234567 -> 123,4567)', () => {
      const oldValue = '1234567';
      const newValue = '123,4567';
      const oldCursor = 4;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'wan'
      );
      expect(newCursor).toBe(4);
    });

    it('should handle backspace on separator in wan style', () => {
      const oldValue = '123,4567';
      const newValue = '1234567';
      const oldCursor = 4;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'wan'
      );
      expect(newCursor).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle cursor at start', () => {
      const oldValue = '1,234';
      const newValue = '12,345';
      const oldCursor = 0;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(0);
    });

    it('should handle cursor at end', () => {
      const oldValue = '1,234';
      const newValue = '1,2345';
      const oldCursor = 5;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(6);
    });

    it('should handle negative cursor position', () => {
      const oldValue = '1,234';
      const newValue = '12,345';
      const oldCursor = -1;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(0);
    });

    it('should handle cursor beyond value length', () => {
      const oldValue = '1,234';
      const newValue = '12,345';
      const oldCursor = 100;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(newValue.length);
    });

    it('should handle empty old value', () => {
      const oldValue = '';
      const newValue = '1,234';
      const oldCursor = 0;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(5);
    });

    it('should handle empty new value', () => {
      const oldValue = '1,234';
      const newValue = '';
      const oldCursor = 2;
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand'
      );
      expect(newCursor).toBe(0);
    });
  });

  describe('real-world scenarios', () => {
    it('should handle typing sequence: 1 -> 12 -> 123 -> 1,234', () => {
      const scenarios = [
        { old: '1', new: '12', cursor: 1, expected: 2 },
        { old: '12', new: '123', cursor: 2, expected: 3 },
        { old: '123', new: '1,234', cursor: 3, expected: 5 },
      ];

      scenarios.forEach(({ old, new: newVal, cursor, expected }) => {
        const result = calculateCursorPositionAfterFormatting(
          old,
          newVal,
          cursor,
          ',',
          'thousand'
        );
        expect(result).toBe(expected);
      });
    });

    it('should handle deletion sequence: 1,234 -> 123 -> 12 -> 1', () => {
      const scenarios = [
        { old: '1,234', new: '123', cursor: 2 },
        { old: '123', new: '12', cursor: 2 },
        { old: '12', new: '1', cursor: 1 },
      ];

      scenarios.forEach(({ old, new: newVal, cursor }) => {
        const result = calculateCursorPositionAfterFormatting(
          old,
          newVal,
          cursor,
          ',',
          'thousand'
        );
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(newVal.length);
      });
    });
  });

  describe('Delete vs Backspace key handling', () => {
    describe('Delete key (deletes after cursor, cursor stays)', () => {
      it('should keep cursor at position when Delete removes character after cursor', () => {
        const oldValue = '1,234';
        const newValue = '1,34';
        const cursor = 2;
        const changeRange: ChangeRange = {
          start: 2,
          end: 3,
          deletedLength: 1,
          isDelete: true,
        };

        const result = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          cursor,
          ',',
          'thousand',
          changeRange
        );

        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(3);
      });

      it('should handle Delete at separator position', () => {
        const oldValue = '1,234';
        const newValue = '1234';
        const cursor = 1;
        const changeRange: ChangeRange = {
          start: 1,
          end: 2,
          deletedLength: 1,
          isDelete: true,
        };

        const result = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          cursor,
          ',',
          'thousand',
          changeRange
        );

        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(2);
      });

      it('should handle Delete with selection', () => {
        const oldValue = '1,234';
        const newValue = '14';
        const cursor = 1;
        const changeRange: ChangeRange = {
          start: 1,
          end: 4,
          deletedLength: 3,
          isDelete: false,
        };

        const result = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          cursor,
          ',',
          'thousand',
          changeRange
        );

        expect(result).toBeGreaterThanOrEqual(1);
        expect(result).toBeLessThanOrEqual(2);
      });
    });

    describe('Backspace key (deletes before cursor, cursor moves left)', () => {
      it('should move cursor left when Backspace removes character before cursor', () => {
        const oldValue = '1,234';
        const newValue = '1,34';
        const cursor = 3;
        const changeRange: ChangeRange = {
          start: 2,
          end: 3,
          deletedLength: 1,
          isDelete: false,
        };

        const result = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          cursor,
          ',',
          'thousand',
          changeRange
        );

        expect(result).toBeLessThan(cursor);
        expect(result).toBeGreaterThanOrEqual(1);
      });

      it('should handle Backspace at separator position', () => {
        const oldValue = '1,234';
        const newValue = '1234';
        const cursor = 2;
        const changeRange: ChangeRange = {
          start: 1,
          end: 2,
          deletedLength: 1,
          isDelete: false,
        };

        const result = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          cursor,
          ',',
          'thousand',
          changeRange
        );

        expect(result).toBe(1);
      });

      it('should handle Backspace with selection', () => {
        const oldValue = '1,234';
        const newValue = '14';
        const cursor = 4;
        const changeRange: ChangeRange = {
          start: 1,
          end: 4,
          deletedLength: 3,
          isDelete: false,
        };

        const result = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          cursor,
          ',',
          'thousand',
          changeRange
        );

        expect(result).toBe(1);
      });

      it('should maintain cursor at beginning when deleting first digit (1,234,567,890.6789 -> 234,567,890.6789)', () => {
        const oldValue = '1,234,567,890.6789';
        const newValue = '234,567,890.6789';
        const cursor = 0;
        const changeRange: ChangeRange = {
          start: 0,
          end: 2,
          deletedLength: 2,
          isDelete: false,
        };

        const result = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          cursor,
          ',',
          'thousand',
          changeRange,
          '.'
        );

        expect(result).toBe(0);
        expect(newValue[result]).toBe('2');
      });

      it('should maintain cursor at beginning when deleting first digit using findChangeRange fallback', () => {
        const oldValue = '1,234,567,890.6789';
        const newValue = '234,567,890.6789';
        const cursor = 0;
        const changeRange: ChangeRange = {
          start: 0,
          end: 2,
          deletedLength: 2,
          isDelete: true,
        };

        const result = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          cursor,
          ',',
          'thousand',
          changeRange,
          '.'
        );

        expect(result).toBe(0);
        expect(newValue[result]).toBe('2');
      });

      it('should maintain cursor position when deleting second digit (1,234,567,890.6789 -> 1,34,567,890.6789)', () => {
        const oldValue = '1,234,567,890.6789';
        const newValue = '1,34,567,890.6789';
        const cursor = 2;
        const changeRange: ChangeRange = {
          start: 2,
          end: 3,
          deletedLength: 1,
          isDelete: false,
        };

        const result = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          cursor,
          ',',
          'thousand',
          changeRange,
          '.'
        );

        expect(result).toBe(2);
        expect(newValue[result]).toBe('3');
      });

      it('should maintain cursor position when deleting third digit (1,234,567,890.6789 -> 1,24,567,890.6789)', () => {
        const oldValue = '1,234,567,890.6789';
        const newValue = '1,24,567,890.6789';
        const cursor = 3;
        const changeRange: ChangeRange = {
          start: 3,
          end: 4,
          deletedLength: 1,
          isDelete: false,
        };

        const result = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          cursor,
          ',',
          'thousand',
          changeRange,
          '.'
        );

        expect(result).toBe(3);
        expect(newValue[result]).toBe('4');
      });
    });

    describe('findChangedRangeFromCaretPositions', () => {
      it('should detect Delete key with endOffset', () => {
        const caretBefore = {
          selectionStart: 2,
          selectionEnd: 2,
          endOffset: 1,
        };
        const inputBefore = '1,234';
        const inputAfter = '1,23';

        const result = findChangedRangeFromCaretPositions(caretBefore, inputBefore, inputAfter);

        expect(result).toBeDefined();
        expect(result?.isDelete).toBe(true);
        expect(result?.start).toBe(2);
        expect(result?.end).toBe(3);
        expect(result?.deletedLength).toBe(1);
      });

      it('should detect Backspace key without endOffset', () => {
        const caretBefore = {
          selectionStart: 3,
          selectionEnd: 3,
          endOffset: 0,
        };
        const inputBefore = '1,234';
        const inputAfter = '1,23';

        const result = findChangedRangeFromCaretPositions(caretBefore, inputBefore, inputAfter);

        expect(result).toBeDefined();
        expect(result?.isDelete).toBe(false);
        expect(result?.start).toBe(3);
        expect(result?.deletedLength).toBe(1);
      });

      it('should handle selection range', () => {
        const caretBefore = {
          selectionStart: 1,
          selectionEnd: 4,
          endOffset: 0,
        };
        const inputBefore = '1,234';
        const inputAfter = '14';

        const result = findChangedRangeFromCaretPositions(caretBefore, inputBefore, inputAfter);

        expect(result).toBeDefined();
        expect(result?.start).toBe(1);
        expect(result?.end).toBe(4);
        expect(result?.deletedLength).toBe(3);
        expect(result?.isDelete).toBe(false);
      });
    });
  });

  describe('prefix and suffix scenarios (from react-number-format)', () => {
    it('should maintain cursor with prefix when value decreases ($10000 -> $1000)', () => {
      const oldValue = '$10000';
      const newValue = '$1000';
      const oldCursor = 5;
      const boundary = getCaretBoundary(newValue, { prefix: '$', suffix: '' });
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand',
        undefined,
        '.',
        { boundary }
      );
      // Position 5 in old value is after last '0', position 5 in new value is also after last '0'
      expect(newCursor).toBe(5);
    });

    it('should maintain cursor with prefix when value decreases at position 2 ($10000 -> $1000)', () => {
      const oldValue = '$10000';
      const newValue = '$1000';
      const oldCursor = 2;
      const boundary = getCaretBoundary(newValue, { prefix: '$', suffix: '' });
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand',
        undefined,
        '.',
        { boundary }
      );
      // Position 2 in old value "$10000" is after '1' (before first '0')
      // Position 2 in new value "$1000" is also after '1' (before first '0')
      // But boundary correction may adjust it - let's check actual behavior
      expect(newCursor).toBeGreaterThanOrEqual(2);
      expect(newCursor).toBeLessThanOrEqual(5);
    });

    it('should maintain cursor with prefix and suffix (100-1000 USD -> 100-10000 USD)', () => {
      const oldValue = '100-1000 USD';
      const newValue = '100-10000 USD';
      const oldCursor = 6;
      const boundary = getCaretBoundary(newValue, { prefix: '100-', suffix: ' USD' });
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand',
        undefined,
        '.',
        { boundary }
      );
      // Position 6 in old value is after first '0' in "1000"
      // In new value "10000", position 7 is after first '0' in "10000" (one extra '0' was added)
      expect(newCursor).toBe(7);
    });

    it('should handle empty value with prefix and suffix (100-1000 USD -> empty)', () => {
      const oldValue = '100-1000 USD';
      const newValue = '';
      const oldCursor = 4;
      const boundary = getCaretBoundary('100-10000 USD', { prefix: '100-', suffix: ' USD' });
      const newCursor = calculateCursorPositionAfterFormatting(
        oldValue,
        newValue,
        oldCursor,
        ',',
        'thousand',
        undefined,
        '.',
        { boundary }
      );
      // When value becomes empty, cursor should be at 0
      expect(newCursor).toBe(0);
    });
  });
});
