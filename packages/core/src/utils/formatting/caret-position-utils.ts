/**
 * Utility functions for setting and managing caret position.
 * Includes mobile browser workarounds and retry mechanisms.
 */

/**
 * Sets the caret position in an input element.
 * Includes workaround for Chrome/Safari mobile browser bugs.
 *
 * @param el - The input element
 * @param caretPos - The desired caret position
 * @returns True if successful, false otherwise
 */
export function setCaretPosition(el: HTMLInputElement, caretPos: number): boolean {
  // This assignment is used to ensure focus and deselect any existing selection
  // (fixes Chrome issue where selection interferes with caret positioning)
  el.value = el.value;

  if (el === null) {
    return false;
  }

  // IE/Edge support
  if ((el as any).createTextRange) {
    const range = (el as any).createTextRange();
    range.move('character', caretPos);
    range.select();
    return true;
  }

  // Modern browsers (selectionStart === 0 check is for Firefox bug)
  if (el.selectionStart !== null || el.selectionStart === 0) {
    el.focus();
    el.setSelectionRange(caretPos, caretPos);
    return true;
  }

  // Fallback
  el.focus();
  return false;
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

  // Retry for mobile Chrome (required because browser resets caret position)
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

