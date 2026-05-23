/**
 * Utility functions for setting and managing caret position.
 * Includes mobile browser workarounds and retry mechanisms.
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
import {ThousandStyle, FormatOn} from '@/types';
import type { FormattingOptions, CaretPositionInfo, Separators } from '@/types';

/**
 * Sets the caret position in an input element.
 * Includes workaround for Chrome/Safari mobile browser bugs.
 *
 * @param el - The input element
 * @param caretPos - The desired caret position
 */
export function setCaretPosition(el: HTMLInputElement, caretPos: number): void {
  // Self-assign forces Chrome/Safari to clear any text selection before we set the caret;
  // without it, an existing selection interferes with setSelectionRange.
  // biome-ignore lint/correctness/noSelfAssign: required to clear selection in WebKit
  el.value = el.value;
  const { scrollX, scrollY } = window;
  el.focus({ preventScroll: true });
  el.setSelectionRange(caretPos, caretPos);
  window.scrollTo(scrollX, scrollY);
}

/**
 * Sets caret position with retry mechanism for mobile browsers.
 * Mobile Chrome sometimes resets the caret position after we set it,
 * so we retry after a short timeout.
 *
 * @param el - The input element
 * @param caretPos - The desired caret position
 * @param currentValue - The current input value (for validation)
 * @returns Timeout ID that can be cleared if needed
 */
export function setCaretPositionWithRetry(
  el: HTMLInputElement,
  caretPos: number,
  currentValue: string
): ReturnType<typeof setTimeout> | null {
  // Don't reset caret position when the whole input is selected
  if (el.selectionStart === 0 && el.selectionEnd === el.value.length) {
    return null;
  }

  // Set immediately (for normal browsers, avoids flickering)
  setCaretPosition(el, caretPos);

  // Mobile Chrome resets the caret after setSelectionRange returns; retry on next tick.
  const timeoutId = setTimeout(() => {
    if (el.value === currentValue && el.selectionStart !== caretPos) {
      setCaretPosition(el, caretPos);
    }
  }, 0);

  return timeoutId;
}

/**
 * Gets the current caret position from an input element.
 * Uses max of selectionStart and selectionEnd to handle mobile browser quirks.
 *
 * @param el - The input element
 * @returns The current caret position
 */
export function getInputCaretPosition(el: HTMLInputElement): number {
  // Max of selectionStart and selectionEnd is taken for mobile device caret bug fix
  return Math.max(el.selectionStart as number, el.selectionEnd as number);
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
 * Updates cursor position after value changes, handling both formatted and unformatted values.
 *
 * @param target - The input element
 * @param oldValue - The value before the change
 * @param newValue - The value after the change
 * @param oldCursorPosition - The cursor position before the change
 * @param caretPositionBeforeChange - Optional caret position info from keydown handler
 * @param separators - Separator configuration
 * @param formattingOptions - Optional formatting options
 */
export function updateCursorPosition(
  target: HTMLInputElement,
  oldValue: string,
  newValue: string,
  oldCursorPosition: number,
  caretPositionBeforeChange: CaretPositionInfo | undefined,
  separators: Separators,
  formattingOptions?: FormattingOptions
): void {
  if (!caretPositionBeforeChange) return;

  const { selectionStart = 0, selectionEnd = 0, endOffset = 0 } = caretPositionBeforeChange;

  let changeRange = findChangedRangeFromCaretPositions(
    { selectionStart, selectionEnd, endOffset },
    oldValue,
    newValue
  );

  if (!changeRange) {
    changeRange = findChangeRange(oldValue, newValue);
  }

  if (!changeRange) return;

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

  const newCursorPosition = calculateCursorPositionAfterFormatting(
    oldValue,
    newValue,
    oldCursorPosition,
    thousandSeparator,
    thousandStyle,
    changeRange,
    separators.decimalSeparator,
    cursorOptions
  );

  setCaretPositionWithRetry(target, newCursorPosition, newValue);
}

