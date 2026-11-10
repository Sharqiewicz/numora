/**
 * Focus-strip mapping and separator-skipping on delete. DOM writes live in `./dom-writes.ts`;
 * caret placement after an edit lives in `utils/caret.ts` (`computeCaretFromEdit`).
 *
 * Separators are exactly one character (enforced by `validateNumoraInputOptions`), so every
 * comparison here is a single-character comparison.
 */

import { removeThousandSeparators } from '../../features/sanitization';
import { FormatOn } from '../../types';
import type { FormattingOptions } from '../../types';

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
  if (selectionStart === null || selectionStart !== selectionEnd) {
    return;
  }

  const separator = formattingOptions.thousandSeparator;

  // Backspace: caret moves left past the separator.
  if (e.key === 'Backspace' && value[selectionStart - 1] === separator) {
    inputElement.setSelectionRange(selectionStart - 1, selectionStart - 1);
  }

  // Delete: caret moves right past the separator.
  if (e.key === 'Delete' && value[selectionStart] === separator) {
    inputElement.setSelectionRange(selectionStart + 1, selectionStart + 1);
  }
}
