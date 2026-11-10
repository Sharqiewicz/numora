/**
 * DOM write helpers that preserve the browser's undo/redo stack.
 *
 * Direct `element.value = x` wipes the undo history. `setRangeText` registers an undo
 * step instead, so Ctrl+Z keeps working. Every value mutation in NumoraInput should
 * route through one of these helpers (the public `setValue({ undoable: false })`
 * escape hatch is the only intentional exception).
 */

/**
 * Writes a new value to the input and sets the caret (or selection) in one operation,
 * preserving the undo stack. Skips the write if the value and selection are already what we
 * want - that avoids adding a noisy no-op undo step.
 *
 * `selectMode` defaults to `end`. The focus-strip passes `preserve` so setRangeText does not
 * snap the caret to the end of the string before setSelectionRange runs - that snap is what
 * causes the visible left-then-right flicker when external `input` listeners paint between
 * the two calls.
 *
 * @param el - The input element
 * @param value - The value to write
 * @param start - The selection start to set after the write (the caret)
 * @param end - The selection end (defaults to `start`)
 */
export function writeValuePreservingUndo(
  el: HTMLInputElement,
  value: string,
  start: number,
  end: number = start,
  selectMode: SelectionMode = 'end'
): void {
  if (el.value === value && el.selectionStart === start && el.selectionEnd === end) return;
  el.setRangeText(value, 0, el.value.length, selectMode);
  el.setSelectionRange(start, end);
  // Mobile Chrome occasionally resets the caret after setSelectionRange returns. Re-apply
  // the intended selection on next tick if it has drifted and the value is still ours.
  setTimeout(() => {
    if (el.value === value && (el.selectionStart !== start || el.selectionEnd !== end)) {
      el.setSelectionRange(start, end);
    }
  });
}
