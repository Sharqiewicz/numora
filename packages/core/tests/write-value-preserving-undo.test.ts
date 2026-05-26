/**
 * Invariant tests for `writeValuePreservingUndo`.
 *
 * The flag pattern in `NumoraInput` and the React component relies on these invariants:
 *
 * 1. The DOM value updates *synchronously* during the call. Anything that listens to the
 *    write must see the new value immediately - the flag-set/flag-clear window depends on it.
 * 2. The selection is set synchronously to the requested cursor position.
 * 3. When the value and cursor are already what we want, the helper short-circuits without
 *    calling `setRangeText`. This avoids a spurious undo step on every controlled re-render.
 * 4. Writes go through `setRangeText`, not direct `el.value = ...`. The former preserves the
 *    browser's undo/redo history; the latter wipes it.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { writeValuePreservingUndo } from '@/features/formatting';

describe('writeValuePreservingUndo invariants', () => {
  let input: HTMLInputElement;

  beforeEach(() => {
    input = document.createElement('input');
    document.body.appendChild(input);
    input.focus();
  });

  afterEach(() => {
    input.remove();
  });

  it('updates input.value synchronously', () => {
    input.value = '12';
    input.setSelectionRange(2, 2);

    writeValuePreservingUndo(input, '123', 3);

    // Synchronous - no microtask wait needed
    expect(input.value).toBe('123');
  });

  it('sets selection synchronously to the requested cursor position', () => {
    input.value = '';
    writeValuePreservingUndo(input, 'abc', 1);

    expect(input.selectionStart).toBe(1);
    expect(input.selectionEnd).toBe(1);
  });

  it('uses setRangeText (preserves undo), not direct value assignment', () => {
    input.value = '12';
    input.setSelectionRange(2, 2);

    const setRangeSpy = vi.spyOn(input, 'setRangeText');

    writeValuePreservingUndo(input, '123', 3);

    expect(setRangeSpy).toHaveBeenCalledTimes(1);
    expect(setRangeSpy).toHaveBeenCalledWith('123', 0, 2, 'end');
  });

  it('short-circuits when value and cursor are already correct', () => {
    input.value = '123';
    input.setSelectionRange(3, 3);

    const setRangeSpy = vi.spyOn(input, 'setRangeText');
    const setSelectionSpy = vi.spyOn(input, 'setSelectionRange');

    writeValuePreservingUndo(input, '123', 3);

    expect(setRangeSpy).not.toHaveBeenCalled();
    expect(setSelectionSpy).not.toHaveBeenCalled();
  });

  it('does NOT short-circuit when value matches but cursor differs', () => {
    input.value = '123';
    input.setSelectionRange(0, 0);

    const setRangeSpy = vi.spyOn(input, 'setRangeText');

    writeValuePreservingUndo(input, '123', 3);

    expect(setRangeSpy).toHaveBeenCalled();
    expect(input.selectionStart).toBe(3);
  });

  it('writes value and selection in deterministic order (value first, then selection)', () => {
    input.value = '';
    const observed: string[] = [];

    vi.spyOn(input, 'setRangeText').mockImplementation((replacement) => {
      observed.push(`setRangeText:${replacement}`);
      // Mirror real behavior so subsequent reads see the new value
      Object.defineProperty(input, 'value', { value: replacement, configurable: true, writable: true });
    });
    vi.spyOn(input, 'setSelectionRange').mockImplementation((start) => {
      observed.push(`setSelectionRange:${start}`);
    });

    writeValuePreservingUndo(input, 'abc', 3);

    expect(observed).toEqual(['setRangeText:abc', 'setSelectionRange:3']);
  });

  it('clamps the rendered DOM value to exactly the new value (replaces full range)', () => {
    input.value = 'abcdef';
    input.setSelectionRange(0, 0);

    writeValuePreservingUndo(input, 'X', 1);

    expect(input.value).toBe('X');
  });
});
