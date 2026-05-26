/**
 * DOM write helpers that preserve the browser's undo/redo stack.
 *
 * Direct `element.value = x` wipes the undo history. `setRangeText` registers an undo
 * step instead, so Ctrl+Z keeps working. Every value mutation in NumoraInput should
 * route through one of these helpers (the public `setValue({ undoable: false })`
 * escape hatch is the only intentional exception).
 */

/**
 * Mobile Chrome occasionally resets the caret after setSelectionRange returns. Re-apply
 * the intended selection on next tick if it has drifted and the value is still ours.
 */
function scheduleCaretRescue(
  el: HTMLInputElement,
  expectedValue: string,
  start: number,
  end: number
): void {
  setTimeout(() => {
    if (el.value === expectedValue && (el.selectionStart !== start || el.selectionEnd !== end)) {
      el.setSelectionRange(start, end);
    }
  }, 0);
}

/**
 * Writes a new value to the input and sets the caret in one operation, preserving the
 * undo stack. Skips the write if the value and caret are already what we want - that
 * avoids adding a noisy no-op undo step.
 *
 * @param el - The input element
 * @param newValue - The value to write
 * @param cursorPos - The caret position to set after the write
 */
export function writeValuePreservingUndo(
  el: HTMLInputElement,
  newValue: string,
  cursorPos: number
): void {
  const currentValue = el.value;
  if (
    currentValue === newValue &&
    el.selectionStart === cursorPos &&
    el.selectionEnd === cursorPos
  ) {
    return;
  }
  el.setRangeText(newValue, 0, currentValue.length, 'end');
  el.setSelectionRange(cursorPos, cursorPos);
  scheduleCaretRescue(el, newValue, cursorPos, cursorPos);
}

/**
 * Writes a focus-strip result: replaces the formatted value with raw digits and maps
 * the caret/selection in one shot. Uses `preserve` (not `end`) so setRangeText does not
 * snap the caret to the end of the string before setSelectionRange runs - that snap is
 * what causes the visible left-then-right flicker when external `input` listeners paint
 * between the two calls.
 */
export function writeStripPreservingUndo(
  el: HTMLInputElement,
  raw: string,
  rawStart: number,
  rawEnd: number,
): void {
  if (
    el.value === raw &&
    el.selectionStart === rawStart &&
    el.selectionEnd === rawEnd
  ) {
    return;
  }
  el.setRangeText(raw, 0, el.value.length, 'preserve');
  el.setSelectionRange(rawStart, rawEnd);
  scheduleCaretRescue(el, raw, rawStart, rawEnd);
}
