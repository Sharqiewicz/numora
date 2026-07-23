import { describe, it, expect } from 'vitest';
import { computeCursorPosition } from '../src/features/formatting';
import { GroupingStyle, FormatOn } from '../src/types';
import type { CaretPositionInfo, Separators, FormattingOptions } from '../src/types';

/**
 * ISOLATED unit checks for computeCursorPosition (caret-position-utils.ts).
 *
 * IMPORTANT — calling convention. At runtime computeCursorPosition is ALWAYS called
 * with a *post-change* `oldValue`: the `beforeinput` handler passes `intendedValue`
 * (the current DOM value with the keystroke already applied + stale separators) and a
 * post-edit caret; the programmatic-`input` path passes the already-mutated
 * `target.value`. The paste path does not use this function at all. For pure digit
 * typing this means `strip(oldValue) === strip(newValue)` (no raw-length change) and
 * the job is purely "re-place the caret across separator reflow".
 *
 * The scenarios below that pass a *pre*-keystroke `oldValue` (e.g. "1234" → "12,345")
 * are a synthetic convenience and do NOT reflect how the runtime calls this function.
 * Do not use them to judge product behavior — see `caret.e2e.test.ts`, which drives the
 * real event handlers and is the behavioral source of truth.
 *
 * History: an earlier audit measured this function with the synthetic pre-keystroke
 * convention and reported a "caret-one-left" bug (the deferred CORR-01/CORR-06 / Plan
 * 008 work). Driving the real `beforeinput` path showed the shipping caret is correct
 * for those scenarios, and that the proposed raw-domain rewrite would have *regressed*
 * the real caret. See plans/README.md (row 008) and june_audit.md.
 */

const defaultSeparators: Separators = {
  thousandSeparator: ',',
  decimalSeparator: '.',
};

const defaultOptions: FormattingOptions = {
  thousandSeparator: ',',
  groupingStyle: GroupingStyle.Thousand,
  formatOn: FormatOn.Change,
  decimalSeparator: '.',
};

function caret(selectionStart: number, selectionEnd?: number, endOffset = 0): CaretPositionInfo {
  return {
    selectionStart,
    selectionEnd: selectionEnd ?? selectionStart,
    endOffset,
  };
}

describe('computeCursorPosition (isolated)', () => {
  // Pure reformat: same digits, a separator appears. Caret was at end → stays at end.
  it('insertion at end that adds a separator', () => {
    const result = computeCursorPosition(
      '9991',
      '9,991',
      4,
      caret(4, 4, 0),
      defaultSeparators,
      defaultOptions
    );
    expect(result).toBe(5);
  });

  // Backspace of a digit: "1,234" → "123" (separator dropped), caret at end of "123".
  it('backspace of a digit', () => {
    const result = computeCursorPosition(
      '1,234',
      '123',
      5,
      caret(5, 5, 0),
      defaultSeparators,
      defaultOptions
    );
    expect(result).toBe(3);
  });

  // Forward delete (Delete key, endOffset=1): caret stays put.
  it('delete key (forward delete) keeps the caret', () => {
    const result = computeCursorPosition(
      '1234',
      '134',
      1,
      caret(1, 1, 1),
      defaultSeparators,
      defaultOptions
    );
    expect(result).toBe(1);
  });

  // Compact-notation expansion with a non-dot decimal separator: "15k" → "15.000".
  // The compact guard snaps the caret to the end on expansion.
  it('compact-notation with non-dot decimal separator: caret goes to end on expansion', () => {
    const europeanSeparators: Separators = {
      thousandSeparator: '.',
      decimalSeparator: ',',
    };
    const europeanOptions: FormattingOptions = {
      thousandSeparator: '.',
      groupingStyle: GroupingStyle.Thousand,
      formatOn: FormatOn.Change,
      decimalSeparator: ',',
    };

    const result = computeCursorPosition(
      '15k',
      '15.000',
      3,
      caret(3, 3, 0),
      europeanSeparators,
      europeanOptions
    );

    expect(result).toBe(6);
  });
});
