import { ChangeEvent, ClipboardEvent } from 'react';

const removeNonNumericCharacters = (value: string): string => value.replace(/[^0-9.]/g, '');

const removeExtraDots = (value: string): string => value.replace(/(\..*?)\./g, '$1');

function sanitizeNumericInput(value: string): string {
  return removeExtraDots(removeNonNumericCharacters(value));
}

export function trimToMaxDecimals(value: string, maxDecimals: number): string {
  const [integer, decimal] = value.split('.');
  return decimal ? `${integer}.${decimal.slice(0, maxDecimals)}` : value;
}

const replaceCommasWithDots = (value: string): string => value.replace(/,/g, '.');

/**
 * Handles the input change event to ensure the value does not exceed the maximum number of decimal places,
 * replaces commas with dots, and removes invalid non-numeric characters.
 *
 * @param e - The keyboard event triggered by the input.
 * @param maxDecimals - The maximum number of decimal places allowed.
 */
export function handleOnChangeNumericInput(e: ChangeEvent, maxDecimals: number): void {
  const target = e.target as HTMLInputElement;

  target.value = replaceCommasWithDots(target.value);

  target.value = sanitizeNumericInput(target.value);

  target.value = trimToMaxDecimals(target.value, maxDecimals);

  target.value = handleLeadingZeros(target.value);

  target.value = replaceInvalidOrEmptyString(target.value);
}

function replaceInvalidOrEmptyString(value: string): string {
  if (value === '' || value === '.') {
    return '0';
  }
  return value;
}

function handleLeadingZeros(value: string): string {
  if (Number(value) >= 1) {
    return value.replace(/^0+/, '');
  }

  // Add leading zeros for numbers < 1 that don't start with '0'
  if (Number(value) < 1 && value[0] !== '0') {
    return '0' + value;
  }

  // No more than one leading zero
  return value.replace(/^0+/, '0');
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

  const combinedValue = value.slice(0, selectionStart || 0) + clipboardData + value.slice(selectionEnd || 0);

  const [integerPart, ...decimalParts] = combinedValue.split('.');
  const sanitizedValue = integerPart + (decimalParts.length > 0 ? '.' + decimalParts.join('') : '');

  e.preventDefault();
  inputElement.value = trimToMaxDecimals(sanitizedValue, maxDecimals);
  inputElement.value = handleLeadingZeros(inputElement.value);

  const newCursorPosition =
    (selectionStart || 0) + clipboardData.length - (combinedValue.length - sanitizedValue.length);
  inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

  return trimToMaxDecimals(sanitizedValue, maxDecimals);
}
