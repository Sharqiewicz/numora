/**
 * Shared harness for caret tests that drive the REAL event handlers (the runtime path).
 * NOT a test file itself (no `.test.` in the name, so vitest does not collect it).
 *
 * All helpers exercise `handleOnBeforeInputNumoraInput` / `handleOnPasteNumoraInput` exactly
 * as the DOM does, so the caret assertions reflect real product behavior, not an isolated
 * calling convention. Delete/Backspace first run `handleOnKeyDownNumoraInput` so the
 * separator-skip that the component applies on keydown is included.
 */
import {
  handleOnBeforeInputNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
} from '../src/utils/event-handlers';
import { formatWithSeparators } from '../src/features/formatting';
import { GroupingStyle, FormatOn, InputType } from '../src/types';
import type { NumoraOptions } from '../src/types';

export const DEC_MAX = 8;

export function makeOptions(over: Partial<NumoraOptions> = {}): NumoraOptions {
  return {
    thousandSeparator: ',',
    groupingStyle: GroupingStyle.Thousand,
    formatOn: FormatOn.Change,
    decimalSeparator: '.',
    ...over,
  };
}

export interface CaretOutcome {
  formatted: string;
  cursorPos: number;
}

function withInput<T>(
  value: string,
  selStart: number,
  selEnd: number,
  fn: (input: HTMLInputElement) => T
): T {
  const input = document.createElement('input');
  input.value = value;
  document.body.appendChild(input);
  input.setSelectionRange(selStart, selEnd);
  try {
    return fn(input);
  } finally {
    document.body.removeChild(input);
  }
}

/** Drive a real `beforeinput` edit, first running keydown separator-skip for delete/backspace. */
export function edit(
  value: string,
  selStart: number,
  selEnd: number,
  data: string,
  inputType: string,
  o: NumoraOptions
): CaretOutcome | null {
  return withInput(value, selStart, selEnd, (input) => {
    if (
      inputType === InputType.DeleteContentBackward ||
      inputType === InputType.DeleteContentForward
    ) {
      const key = inputType === InputType.DeleteContentBackward ? 'Backspace' : 'Delete';
      handleOnKeyDownNumoraInput(
        { key, target: input, preventDefault() {} } as unknown as KeyboardEvent,
        o
      );
    }
    const res = handleOnBeforeInputNumoraInput(
      { inputType, data, target: input, preventDefault() {} } as unknown as InputEvent,
      DEC_MAX,
      o
    );
    if (res.type !== 'handled') return null;
    return { formatted: res.formatted, cursorPos: res.cursorPos };
  });
}

export const typeDigit = (v: string, at: number, ch: string, o: NumoraOptions) =>
  edit(v, at, at, ch, InputType.InsertText, o);
export const selectReplace = (v: string, a: number, b: number, ch: string, o: NumoraOptions) =>
  edit(v, a, b, ch, InputType.InsertText, o);
export const backspace = (v: string, at: number, o: NumoraOptions) =>
  edit(v, at, at, '', InputType.DeleteContentBackward, o);
export const forwardDelete = (v: string, at: number, o: NumoraOptions) =>
  edit(v, at, at, '', InputType.DeleteContentForward, o);

export function paste(
  value: string,
  selStart: number,
  selEnd: number,
  clip: string,
  o: NumoraOptions
): CaretOutcome | null {
  return withInput(value, selStart, selEnd, (input) => {
    const res = handleOnPasteNumoraInput(
      {
        target: input,
        clipboardData: { getData: () => clip },
        preventDefault() {},
      } as unknown as ClipboardEvent,
      DEC_MAX,
      o
    );
    if (res.type !== 'handled') return null;
    return { formatted: res.formatted, cursorPos: res.cursorPos };
  });
}

/** Count significant (non-thousand-separator) chars before `pos`. The caret invariant is
 * expressed in terms of this count so it is independent of grouping style. */
export function significantBefore(str: string, pos: number, thousandSep: string): number {
  let n = 0;
  for (let i = 0; i < pos && i < str.length; i++) if (str[i] !== thousandSep) n++;
  return n;
}

/** Format a raw digit/decimal string the way the component would display it. */
export function format(raw: string, o: NumoraOptions): string {
  return formatWithSeparators(
    raw,
    o.thousandSeparator ?? ',',
    o.groupingStyle ?? GroupingStyle.Thousand,
    false,
    o.decimalSeparator ?? '.'
  );
}
