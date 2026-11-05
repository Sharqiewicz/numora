/**
 * Pure caret-position math: where the caret should land after a value change, and
 * helpers for the focus-strip path. DOM writes live in `./dom-writes.ts`.
 *
 * ## Scope and known limits
 *
 * The caret is resolved by `select(new, rank(old, caret))` over the significant-character
 * bitvector (see `./rank-select.ts`), with a longest-common-prefix test to handle transforms
 * that rewrite the raw value rather than just re-group it. Two things this deliberately does
 * NOT attempt:
 *
 * 1. **General diff-based caret mapping.** The LCP test assumes every value-normalizing
 *    transform edits a contiguous prefix or suffix of the raw string — true for all of them
 *    here (leading-zero add/strip, sign change, decimal trim, compact/scientific expansion).
 *    A transform that rewrote the middle of the raw value would need real anchor mapping.
 * 2. **Caret precision during IME composition.** See the `default` case in
 *    `utils/event-handlers.ts` — composition commits natively and the caret is best-effort.
 *
 * Both operations tolerate multi-character thousand separators, even though
 * `validateNumoraInputOptions` restricts the component API to single-character ones; the
 * functions here are exported as standalone utilities and must not assume the validated path.
 */

import { significantCharRank, positionAfterRank } from './rank-select';
import { removeThousandSeparators } from '../../features/sanitization';
import { FormatOn } from '../../types';
import type { FormattingOptions, CaretPositionInfo, Separators } from '../../types';

/**
 * Result of computing a focus-strip: the raw value with separators removed and the
 * caret positions mapped from the formatted display indices to the raw indices.
 */
export interface StripSeparatorsResult {
  raw: string;
  rawStart: number;
  rawEnd: number;
}

/**
 * Pure compute for the focus-strip path: takes the current formatted value plus the
 * user's display caret/selection, returns the stripped value and the equivalent caret
 * positions in the raw value. Returns `null` when no strip is needed (the value already
 * contains no separators).
 *
 * The mapping rule: the new caret index equals the count of non-separator characters
 * in the formatted prefix up to the display caret. The transformation is bijective on
 * digits, so this exactly preserves which digit the user clicked on.
 *
 * Does NOT mutate the DOM. Callers own the write and any internal-write/broadcast wrapping.
 *
 * @param currentValue - The current (formatted) input value
 * @param displayStart - selectionStart in the formatted value
 * @param displayEnd - selectionEnd in the formatted value
 * @param separator - The thousand separator character to strip
 * @returns Strip result, or null if no separators present
 */
export function computeStripSeparatorsResult(
  currentValue: string,
  displayStart: number,
  displayEnd: number,
  separator: string
): StripSeparatorsResult | null {
  const raw = removeThousandSeparators(currentValue, separator);
  if (raw === currentValue) return null;
  return {
    raw,
    rawStart: removeThousandSeparators(currentValue.slice(0, displayStart), separator).length,
    rawEnd: removeThousandSeparators(currentValue.slice(0, displayEnd), separator).length,
  };
}

/**
 * Skips cursor over thousand separator when deleting/backspacing in 'change' mode.
 * This prevents the cursor from stopping on the separator, making deletion smoother.
 *
 * @param e - The keyboard event
 * @param inputElement - The input element
 * @param formattingOptions - Optional formatting options
 */
export function skipOverThousandSeparatorOnDelete(
  e: KeyboardEvent,
  inputElement: HTMLInputElement,
  formattingOptions?: FormattingOptions
): void {
  if (formattingOptions?.formatOn !== FormatOn.Change || !formattingOptions.thousandSeparator) {
    return;
  }

  const { selectionStart, selectionEnd, value } = inputElement;
  if (selectionStart === null || selectionEnd === null) {
    return;
  }

  if (selectionStart !== selectionEnd) {
    return;
  }

  const { key } = e;
  const separator = formattingOptions.thousandSeparator;

  // Backspace: cursor moves left, skips over separator
  if (key === 'Backspace' && selectionStart > 0 && value[selectionStart - 1] === separator) {
    inputElement.setSelectionRange(selectionStart - 1, selectionStart - 1);
  }

  // Delete: cursor stays, skips over separator
  if (key === 'Delete' && value[selectionStart] === separator) {
    inputElement.setSelectionRange(selectionStart + 1, selectionStart + 1);
  }
}

/**
 * Pure compute version of cursor-position resolution. Returns the cursor position the
 * caret should land at after a value change, or null when the inputs don't provide enough
 * signal to compute one. Does NOT mutate the DOM. Callers own the setSelectionRange call.
 *
 * ## Algorithm: caret preservation through masking (rank/select in the raw domain)
 *
 * At runtime `oldValue` is the post-edit value (the keystroke already applied, with stale
 * thousand separators) and `oldCursorPosition` is the post-edit caret. The caret is
 * preserved by anchoring on the separator-free ("raw") value: compute the caret's index in
 * `rawOld` (count of significant, i.e. non-thousand-separator, chars before it), map it to a
 * raw index in `rawNew`, then `select` — the index just after that many significant chars in
 * `newValue`. Two linear passes, O(n).
 *
 * The raw→raw mapping depends on where the raw value changed relative to the caret:
 *  - **Pure separator reflow** (`rawOld === rawNew`): raw content is unchanged, so the
 *    significant-char count before the caret (rank) is preserved directly.
 *  - **Value-normalizing transform** (`rawOld !== rawNew`: leading-zero add/remove, sign
 *    change, decimal trim, compact/scientific expansion): if everything before the caret is
 *    unchanged (the caret is within the common prefix of `rawOld`/`rawNew`), its index from
 *    the start is preserved; otherwise a change occurred before the caret, so its distance
 *    from the end is preserved (which also yields end-snapping when the caret was at the end).
 */
export function computeCursorPosition(
  oldValue: string,
  newValue: string,
  oldCursorPosition: number,
  caretPositionBeforeChange: CaretPositionInfo | undefined,
  separators: Separators,
  formattingOptions?: FormattingOptions
): number | null {
  if (!caretPositionBeforeChange) return null;

  // Bounds guards (preserve prior behavior).
  if (oldCursorPosition < 0) return 0;
  if (oldCursorPosition > oldValue.length) return newValue.length;
  if (oldValue === '' || newValue === '') return newValue.length;

  const thousandSeparator =
    formattingOptions?.thousandSeparator ?? separators.thousandSeparator ?? '';

  const rawOld = thousandSeparator
    ? removeThousandSeparators(oldValue, thousandSeparator)
    : oldValue;
  const rawNew = thousandSeparator
    ? removeThousandSeparators(newValue, thousandSeparator)
    : newValue;

  // rank: caret index in the separator-free ("raw") old value.
  const rawCaret = significantCharRank(oldValue, oldCursorPosition, thousandSeparator);

  // Map the raw caret from rawOld into rawNew.
  let targetRawCaret: number;
  if (rawOld === rawNew) {
    // Pure separator reflow: rank preserved.
    targetRawCaret = rawCaret;
  } else if (rawCaret <= commonPrefixLength(rawOld, rawNew)) {
    // Change is entirely at/after the caret (e.g. decimal trim): index-from-start preserved.
    targetRawCaret = rawCaret;
  } else {
    // A change occurred before the caret (e.g. leading-zero add/remove, sign): distance-from-end preserved.
    targetRawCaret = Math.max(0, rawNew.length - (rawOld.length - rawCaret));
  }

  // select: the index just after `targetRawCaret` significant chars in the new value.
  return positionAfterRank(newValue, targetRawCaret, thousandSeparator);
}

/**
 * Longest common prefix length — the anchor test for value-normalizing transforms.
 *
 * Used as a two-way oracle: if the raw caret lies within the common prefix of `rawOld` and
 * `rawNew`, nothing before it moved, so its index from the START is the invariant; otherwise
 * the rewrite happened before the caret and its distance from the END is the invariant.
 * Every value-normalizing transform in this library (leading-zero add/strip, sign change,
 * decimal trim, compact/scientific expansion) edits a contiguous prefix or suffix of the raw
 * string, which is exactly the precondition that makes this two-branch test sufficient.
 */
function commonPrefixLength(a: string, b: string): number {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  return i;
}
