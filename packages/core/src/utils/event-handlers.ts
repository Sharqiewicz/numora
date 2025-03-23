import { sanitizeNumericInput } from '@/utils/sanitization';

import { trimToMaxDecimals, alreadyHasDecimal, replaceCommasWithDots } from '@/utils/decimals';

/**
 * Handles the input change event to ensure the value does not exceed the maximum number of decimal places,
 * replaces commas with dots, and removes invalid non-numeric characters.
 *
 * @param e - The event triggered by the input.
 * @param maxDecimals - The maximum number of decimal places allowed.
 */
export function handleOnChangeNumericInput(e: Event, maxDecimals: number): void {
  const target = e.target as HTMLInputElement;

  target.value = replaceCommasWithDots(target.value);
  target.value = sanitizeNumericInput(target.value);
  target.value = trimToMaxDecimals(target.value, maxDecimals);
}

/**
 * Handles the keydown event to prevent the user from entering a second decimal point.
 *
 * @param e - The keyboard event triggered by the input.
 */
export function handleOnKeyDownNumericInput(e: KeyboardEvent): void {
  if (alreadyHasDecimal(e)) {
    e.preventDefault();
  }
}

/**
 * Handles the paste event to ensure the value does not exceed the maximum number of decimal places,
 * replaces commas with dots, and removes invalid non-numeric characters.
 *
 * @param e - The clipboard event triggered by the input.
 * @param maxDecimals - The maximum number of decimal places allowed.
 * @returns The sanitized value after the paste event.
 */
export function handleOnPasteNumericInput(e: ClipboardEvent, maxDecimals: number): string {
  const inputElement = e.target as HTMLInputElement;
  const { value, selectionStart, selectionEnd } = inputElement;

  const clipboardData = sanitizeNumericInput(e.clipboardData?.getData('text/plain') || '');

  const combinedValue =
    value.slice(0, selectionStart || 0) + clipboardData + value.slice(selectionEnd || 0);

  const [integerPart, ...decimalParts] = combinedValue.split('.');
  const sanitizedValue = integerPart + (decimalParts.length > 0 ? '.' + decimalParts.join('') : '');

  e.preventDefault();
  inputElement.value = trimToMaxDecimals(sanitizedValue, maxDecimals);

  const newCursorPosition =
    (selectionStart || 0) + clipboardData.length - (combinedValue.length - sanitizedValue.length);
  inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

  return trimToMaxDecimals(sanitizedValue, maxDecimals);
}
