import { trimToMaxDecimals } from './trimToMaxDecimals';

const removeNonNumericCharacters = (value: string): string => value.replace(/[^0-9.]/g, '');

const removeExtraDots = (value: string): string => value.replace(/(\..*?)\./g, '$1');

const sanitizeNumericInput = (value: string): string => removeExtraDots(removeNonNumericCharacters(value));

const replaceCommasWithDots = (value: string): string => value.replace(/,/g, '.');

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
 * Checks if the input already has a decimal point and prevents the user from entering another one.
 */
function alreadyHasDecimal(e: KeyboardEvent) {
  const decimalChars = ['.', ','];
  return decimalChars.some((char) => e.key === char && e.target && (e.target as HTMLInputElement).value.includes('.'));
}

/**
 * Handles keydown events for numeric input
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

  const combinedValue = value.slice(0, selectionStart || 0) + clipboardData + value.slice(selectionEnd || 0);

  const [integerPart, ...decimalParts] = combinedValue.split('.');
  const sanitizedValue = integerPart + (decimalParts.length > 0 ? '.' + decimalParts.join('') : '');

  e.preventDefault();
  inputElement.value = trimToMaxDecimals(sanitizedValue, maxDecimals);

  const newCursorPosition =
    (selectionStart || 0) + clipboardData.length - (combinedValue.length - sanitizedValue.length);
  inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

  return trimToMaxDecimals(sanitizedValue, maxDecimals);
}