/**
 * Pure caret-position math: where the caret should land after a value change, and
 * helpers for the focus-strip path. DOM writes live in `./dom-writes.ts`.
 */

import {
  findChangedRangeFromCaretPositions,
  findChangeRange,
} from './change-detection';
import {
  calculateCursorPositionAfterFormatting,
  type CursorPositionOptions,
} from './cursor-position';
import { getCaretBoundary } from './cursor-boundary';
import { removeThousandSeparators } from '@/features/sanitization';
import {ThousandStyle, FormatOn} from '@/types';
import type { FormattingOptions, CaretPositionInfo, Separators } from '@/types';

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
  separator: string,
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

  const { selectionStart = 0, selectionEnd = 0, endOffset = 0 } = caretPositionBeforeChange;

  let changeRange = findChangedRangeFromCaretPositions(
    { selectionStart, selectionEnd, endOffset },
    oldValue,
    newValue
  );

  if (!changeRange) {
    changeRange = findChangeRange(oldValue, newValue);
  }

  if (!changeRange) return null;

  const boundary = getCaretBoundary(newValue, {
    thousandSeparator: formattingOptions?.thousandSeparator ?? separators.thousandSeparator,
    decimalSeparator: separators.decimalSeparator,
  });

  const cursorOptions: CursorPositionOptions = {
    thousandSeparator: formattingOptions?.thousandSeparator ?? separators.thousandSeparator,
    decimalSeparator: separators.decimalSeparator,
    isCharacterEquivalent: (char1: string, char2: string) => {
      const sep = formattingOptions?.thousandSeparator ?? separators.thousandSeparator;
      if (sep && char1 === sep) return false;
      return char1 === char2;
    },
    boundary,
  };

  const thousandSeparator = formattingOptions?.thousandSeparator ?? separators.thousandSeparator ?? ',';
  const thousandStyle = formattingOptions?.thousandStyle ?? ThousandStyle.None;

  return calculateCursorPositionAfterFormatting(
    oldValue,
    newValue,
    oldCursorPosition,
    thousandSeparator,
    thousandStyle,
    changeRange,
    separators.decimalSeparator,
    cursorOptions
  );
}


