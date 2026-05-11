import { describe, it, expect } from 'vitest';
import { calculateCursorPositionAfterFormatting, getCaretBoundary } from '../src/features/formatting';
import { formatWithSeparators } from '../src/features/formatting/thousand-grouping';

const sep = ',';
const decimalSep = '.';

// Production-like options: always include boundary (as updateCursorPosition does)
function makeOpts(formatted: string) {
  const boundary = getCaretBoundary(formatted, { thousandSeparator: sep, decimalSeparator: decimalSep });
  return {
    isCharacterEquivalent: (c1: string, c2: string) => (c1 === sep ? false : c1 === c2),
    thousandSeparator: sep,
    boundary,
  };
}

const call = (oldVal: string, newVal: string, cursor: number, changeRange?: any) =>
  calculateCursorPositionAfterFormatting(oldVal, newVal, cursor, sep, 'thousand', changeRange, decimalSep, makeOpts(newVal));

// Helper: count non-separator chars before a position
function digitsBeforePos(str: string, pos: number): number {
  let count = 0;
  for (let i = 0; i < pos && i < str.length; i++) {
    if (str[i] !== sep) count++;
  }
  return count;
}

describe('Systematic 3+ group insertion: all positions', () => {
  // "1,234,567,890" → type digit '5' at every non-separator position
  const base = '1,234,567,890';
  // Non-separator cursor positions only (separators are at 1, 5, 9)
  const validPositions = [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 13];

  validPositions.forEach(pos => {
    it(`type '5' at position ${pos} in "${base}"`, () => {
      // Build intermediate: insert '5' at pos
      const intermediate = base.slice(0, pos) + '5' + base.slice(pos);
      const cursorInIntermediate = pos + 1; // after the typed char

      // Format the intermediate (remove seps, re-add)
      const raw = intermediate.replace(/,/g, '');
      const formatted = formatWithSeparators(raw, sep, 'thousand');

      const result = call(intermediate, formatted, cursorInIntermediate);

      // The digits before cursor in intermediate = digits before typed '5' + 1 (for the '5' itself)
      const digitsBeforeCursor = digitsBeforePos(intermediate, cursorInIntermediate);
      const expectedDigitsBeforePos = digitsBeforeCursor;

      // Find the expected position: the position after `expectedDigitsBeforePos` non-sep chars
      let expectedPos = 0;
      let count = 0;
      for (let i = 0; i <= formatted.length; i++) {
        if (count === expectedDigitsBeforePos) { expectedPos = i; break; }
        if (i < formatted.length && formatted[i] !== sep) count++;
        if (i === formatted.length) expectedPos = formatted.length;
      }
      // Skip over separator if we land on one (move right) - production boundary does this
      if (expectedPos < formatted.length && formatted[expectedPos] === sep) expectedPos++;

      expect(result).toBe(expectedPos);
    });
  });
});

describe('Systematic 3+ group deletion: backspace at all positions', () => {
  const base = '1,234,567,890';
  // Non-separator digit positions (so backspace deletes a real digit)
  const digitPositions = [1, 3, 4, 5, 7, 8, 9, 11, 12, 13];

  digitPositions.forEach(pos => {
    it(`backspace at position ${pos} in "${base}"`, () => {
      // Cursor at pos, backspace deletes char at pos-1
      const charToDelete = base[pos - 1];
      if (charToDelete === sep) return; // separator itself - skip

      const intermediate = base.slice(0, pos - 1) + base.slice(pos);
      const cursorInIntermediate = pos - 1; // moved back 1

      const raw = intermediate.replace(/,/g, '');
      const formatted = raw ? formatWithSeparators(raw, sep, 'thousand') : '';

      // Backspace changeRange: isDelete=false
      const changeRange = {
        start: cursorInIntermediate,
        end: cursorInIntermediate,
        deletedLength: 1,
        isDelete: false,
      };

      const result = call(intermediate, formatted, cursorInIntermediate, changeRange);

      // After backspace, cursor at pos-1 in intermediate = that many digits before it
      const digitsBeforeCursor = digitsBeforePos(intermediate, cursorInIntermediate);

      let expectedPos = 0;
      let count = 0;
      if (!formatted) {
        expectedPos = 0;
      } else {
        for (let i = 0; i <= formatted.length; i++) {
          if (count === digitsBeforeCursor) { expectedPos = i; break; }
          if (i < formatted.length && formatted[i] !== sep) count++;
          if (i === formatted.length) expectedPos = formatted.length;
        }
      }

      expect(result).toBe(expectedPos);
    });
  });
});
