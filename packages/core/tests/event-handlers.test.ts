/**
 * Behavioral tests for `handleOnBeforeInputNumoraInput` covering the audit-fixes pass:
 *
 * - 05: single-char deletion extends over a thousand separator when there is no
 *   preceding `keydown` (mobile fallback).
 * - 06: `{ type: 'reject' }` is returned when the formatted result equals the current
 *   value (no spurious `onChange`).
 * - 09: `maxLength` is enforced against the *sanitized* value, not the raw intended one.
 * - 08 (step 2 only): typing `,`/`.` is rejected outright when `decimalMaxLength === 0`.
 * - 12 (last bullet): `deleteWordBackward` / `deleteWordForward` are treated like
 *   soft/hard line deletion (a numeric field is one word).
 */
import { describe, expect, it } from 'vitest';
import { handleOnBeforeInputNumoraInput } from '@/utils/event-handlers';
import { FormatOn, GroupingStyle, InputType } from '@/types';
import type { NumoraOptions } from '@/types';

function makeInput(
  value = '',
  selectionStart = 0,
  selectionEnd = selectionStart
): HTMLInputElement {
  const el = document.createElement('input');
  el.value = value;
  document.body.appendChild(el);
  el.focus();
  el.setSelectionRange(selectionStart, selectionEnd);
  return el;
}

function makeBeforeInput(
  input: HTMLInputElement,
  inputType: string,
  data: string | null = null
): InputEvent {
  const e = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType,
    data,
  });
  Object.defineProperty(e, 'target', { value: input });
  return e;
}

const GROUPED: NumoraOptions = {
  thousandSeparator: ',',
  groupingStyle: GroupingStyle.Thousand,
  formatOn: FormatOn.Change,
  decimalSeparator: '.',
};

describe('issue 05 — separator delete without keydown', () => {
  it('deleteContentBackward over the separator ("1,|234") extends to delete the digit before it too', () => {
    const input = makeInput('1,234', 2, 2);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.DeleteContentBackward),
      8,
      GROUPED
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(result.formatted).toBe('234');
      expect(result.cursorPos).toBe(0);
    }
  });

  it('deleteContentForward over the separator ("1,|234" at caret 1) extends to delete the digit past it too', () => {
    const input = makeInput('1,234', 1, 1);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.DeleteContentForward),
      8,
      GROUPED
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(result.formatted).toBe('134');
      expect(result.cursorPos).toBe(1);
    }
  });

  it('does not extend deletion when a selection is present (backward)', () => {
    // Selecting exactly the separator and deleting it removes only that one char - all
    // digits survive, so re-grouping produces the identical string and issue 06's
    // unchanged-value guard rejects it. If the separator-skip extension incorrectly fired
    // despite the selection, a digit would be lost and the result would differ (handled),
    // not reject.
    const input = makeInput('1,234', 1, 2); // selects the separator only
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.DeleteContentBackward),
      8,
      GROUPED
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('does not extend deletion when a selection is present (forward)', () => {
    const input = makeInput('1,234', 1, 2); // selects the separator only
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.DeleteContentForward),
      8,
      GROUPED
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('does not extend deletion when no thousandSeparator is configured (blur-mode typing)', () => {
    const input = makeInput('1,234', 2, 2);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.DeleteContentBackward),
      8,
      { formatOn: FormatOn.Blur }
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      // No thousandSeparator configured: plain single-char backspace at pos 2 of "1,234".
      expect(result.formatted).toBe('1234');
    }
  });

  it('regular backspace away from a separator is unaffected', () => {
    const input = makeInput('1,234', 5, 5);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.DeleteContentBackward),
      8,
      GROUPED
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(result.formatted).toBe('123');
    }
  });
});

describe('issue 06 — no onChange when the result is unchanged', () => {
  it('rejects a letter typed after a numeric value', () => {
    const input = makeInput('12', 2, 2);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, 'a'),
      8
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('rejects Backspace at position 0', () => {
    const input = makeInput('123', 0, 0);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.DeleteContentBackward),
      8
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('rejects Delete at the end of the value', () => {
    const input = makeInput('123', 3, 3);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.DeleteContentForward),
      8
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('rejects Backspace on an empty field', () => {
    const input = makeInput('', 0, 0);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.DeleteContentBackward),
      8
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('rejects a leading-zero keystroke that sanitizes back to the same value ("|5" + "0")', () => {
    const input = makeInput('5', 0, 0);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '0'),
      8
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('still handles a keystroke that actually changes the value', () => {
    const input = makeInput('1', 1, 1);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '2'),
      8
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(result.formatted).toBe('12');
    }
  });
});

describe('issue 09 — maxLength enforced on the sanitized value', () => {
  it('allows a keystroke whose sanitized result fits, even if the pre-sanitization intended value would not have', () => {
    // value "0", type "5" at position 1 -> intended "05" (2 chars) but sanitizes to "5" (1 char).
    const input = makeInput('0', 1, 1);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '5'),
      8,
      { maxLength: 1 }
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(result.raw).toBe('5');
    }
  });

  it('rejects a keystroke whose sanitized result still exceeds maxLength', () => {
    const input = makeInput('9', 1, 1);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '5'),
      8,
      { maxLength: 1 }
    );
    expect(result).toEqual({ type: 'reject' });
  });
});

describe('issue 08 (step 2) — decimalMaxLength: 0 rejects the decimal-separator keystroke', () => {
  it('rejects typing "." when decimalMaxLength is 0', () => {
    const input = makeInput('1', 1, 1);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '.'),
      0
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('rejects typing "," (converted to decimal separator) when decimalMaxLength is 0', () => {
    const input = makeInput('1', 1, 1);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, ','),
      0,
      { decimalSeparator: '.' }
    );
    expect(result).toEqual({ type: 'reject' });
  });

  it('still allows the decimal separator when decimalMaxLength is greater than 0', () => {
    const input = makeInput('1', 1, 1);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.InsertText, '.'),
      2
    );
    expect(result.type).toBe('handled');
  });
});

describe('issue 12 — deleteWordBackward / deleteWordForward routed through the caret mapper', () => {
  it('deleteWordBackward with no selection deletes from the start of the value', () => {
    const input = makeInput('123.45', 4, 4);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.DeleteWordBackward),
      8
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(result.formatted).toBe('45');
      expect(result.cursorPos).toBe(0);
    }
  });

  it('deleteWordForward with no selection deletes to the end of the value', () => {
    const input = makeInput('123.45', 3, 3);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.DeleteWordForward),
      8
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(result.formatted).toBe('123');
      expect(result.cursorPos).toBe(3);
    }
  });

  it('deleteWordBackward with a selection only removes the selection', () => {
    const input = makeInput('123.45', 1, 3);
    const result = handleOnBeforeInputNumoraInput(
      makeBeforeInput(input, InputType.DeleteWordBackward),
      8
    );
    expect(result.type).toBe('handled');
    if (result.type === 'handled') {
      expect(result.formatted).toBe('1.45');
      expect(result.cursorPos).toBe(1);
    }
  });
});
