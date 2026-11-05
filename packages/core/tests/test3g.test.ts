import { describe, it, expect } from 'vitest';
import { handleOnBeforeInputNumoraInput } from '../src/utils/event-handlers';
import { GroupingStyle, FormatOn, InputType } from '../src/types';
import type { FormattingOptions } from '../src/types';

/**
 * Systematic all-positions caret regression, driven through the REAL `beforeinput`
 * handler (the runtime path). Replaces an earlier version that called the now-deleted
 * `calculateCursorPositionAfterFormatting` directly with synthetic args.
 *
 * Invariant (grouping-agnostic): after typing a digit the caret has exactly one more
 * significant (non-thousand-separator) char before it than the edit position did; after
 * backspacing a digit it has exactly as many as the pre-delete position. This is the
 * digit-count-preservation property the cursor engine exists to guarantee, asserted
 * without hardcoding positions.
 */

const sep = ',';
const opts: FormattingOptions = {
  thousandSeparator: sep,
  groupingStyle: GroupingStyle.Thousand,
  formatOn: FormatOn.Change,
  decimalSeparator: '.',
};

function significantBefore(str: string, pos: number): number {
  let count = 0;
  for (let i = 0; i < pos && i < str.length; i++) {
    if (str[i] !== sep) count++;
  }
  return count;
}

function beforeInput(
  value: string,
  selStart: number,
  selEnd: number,
  data: string,
  inputType: string
) {
  const input = document.createElement('input');
  input.value = value;
  document.body.appendChild(input);
  input.setSelectionRange(selStart, selEnd);
  const e = { inputType, data, target: input, preventDefault() {} } as unknown as InputEvent;
  const res = handleOnBeforeInputNumoraInput(e, 8, opts) as {
    type: string;
    formatted?: string;
    cursorPos?: number;
  };
  document.body.removeChild(input);
  return res;
}

describe('Systematic 3+ group insertion: all positions (real beforeinput flow)', () => {
  const base = '1,234,567,890';
  // Caret can sit at any position 0..length; typing a digit is valid everywhere.
  const positions = Array.from({ length: base.length + 1 }, (_, i) => i);

  positions.forEach((pos) => {
    it(`type '5' at position ${pos} in "${base}"`, () => {
      const res = beforeInput(base, pos, pos, '5', InputType.InsertText);
      if (res.type !== 'handled' || res.formatted == null || res.cursorPos == null) {
        throw new Error(`expected handled, got ${res.type}`);
      }
      // The typed digit becomes the (significantBefore(pos)+1)-th significant char;
      // the caret must rest immediately after it.
      const expectedSignificant = significantBefore(base, pos) + 1;
      expect(significantBefore(res.formatted, res.cursorPos)).toBe(expectedSignificant);
    });
  });
});

describe('Systematic 3+ group deletion: backspace at all digit positions (real beforeinput flow)', () => {
  const base = '1,234,567,890';
  const digitPositions = Array.from({ length: base.length + 1 }, (_, i) => i).filter(
    (pos) => pos > 0 && base[pos - 1] !== sep
  );

  digitPositions.forEach((pos) => {
    it(`backspace at position ${pos} in "${base}"`, () => {
      const res = beforeInput(base, pos, pos, '', InputType.DeleteContentBackward);
      if (res.type !== 'handled' || res.formatted == null || res.cursorPos == null) {
        throw new Error(`expected handled, got ${res.type}`);
      }
      // Deleting the digit at pos-1 leaves significantBefore(pos-1) significant chars
      // before the caret.
      const expectedSignificant = significantBefore(base, pos - 1);
      expect(significantBefore(res.formatted, res.cursorPos)).toBe(expectedSignificant);
    });
  });
});
