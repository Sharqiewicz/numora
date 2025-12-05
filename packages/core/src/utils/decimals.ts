import { DEFAULT_DECIMAL_SEPARATOR } from "@/config";
import type { SeparatorOptions, Separators, FormattingOptions } from '@/types';
import { ThousandStyle } from '@/types';


/**
 * Normalizes separator configuration with defaults.
 *
 * @param options - Separator configuration options
 * @returns Normalized separator configuration
 */
export function getSeparators(options: SeparatorOptions): Separators {
  return {
    decimalSeparator: options.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
    thousandSeparator: options.thousandSeparator,
  };
}

/**
 * Gets separators from FormattingOptions.
 *
 * @param formattingOptions - Optional formatting options
 * @returns Normalized separator configuration
 */
export function getSeparatorsFromOptions(formattingOptions?: FormattingOptions) {
  return getSeparators({
    decimalSeparator: formattingOptions?.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
    thousandSeparator: formattingOptions?.thousandSeparator,
  });
}

/**
 * Checks if the input already has a decimal separator and prevents entering another one.
 *
 * @param e - The keyboard event
 * @param decimalSeparator - The decimal separator character
 */
export const alreadyHasDecimal = (
  e: KeyboardEvent,
  decimalSeparator: string
) => {
  if (e.key !== decimalSeparator) {
    return false;
  }

  const target = e.target as HTMLInputElement;
  if (!target) return false;

  return target.value.includes(decimalSeparator);
};

/**
 * Converts comma or dot to the configured decimal separator when thousandStyle is None/undefined.
 * This makes it easier for users to type decimal separators without knowing the exact separator character.
 *
 * @param e - The keyboard event
 * @param inputElement - The input element
 * @param formattingOptions - Optional formatting options
 * @param separators - The separator configuration
 * @returns True if the conversion was handled (event should be prevented), false otherwise
 */
export function convertCommaOrDotToDecimalSeparator(
  e: KeyboardEvent,
  inputElement: HTMLInputElement,
  formattingOptions: FormattingOptions | undefined,
  separators: Separators
): boolean {
  const { selectionStart, selectionEnd, value } = inputElement;
  const { key } = e;

  // Only apply when thousandStyle is None/undefined
  const thousandStyle = formattingOptions?.ThousandStyle;
  if (thousandStyle !== ThousandStyle.None && thousandStyle !== undefined) {
    return false;
  }

  // Only handle comma or dot
  if (key !== ',' && key !== '.') {
    return false;
  }

  // Check if decimal separator already exists
  if (value.includes(separators.decimalSeparator)) {
    e.preventDefault();
    return true;
  }

  // If the typed key is different from the configured decimal separator, convert it
  if (key !== separators.decimalSeparator) {
    e.preventDefault();

    const start = selectionStart ?? 0;
    const end = selectionEnd ?? start;

    // Insert the configured decimal separator at cursor position
    const newValue = value.slice(0, start) + separators.decimalSeparator + value.slice(end);
    inputElement.value = newValue;

    // Set cursor position after the inserted separator
    const newCursorPosition = start + 1;
    inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

    return true;
  }

  return false;
}

/**
 * Trims a string representation of a number to a maximum number of decimal places.
 *
 * @param value - The string to trim.
 * @param decimalMaxLength - The maximum number of decimal places to allow.
 * @param decimalSeparator - The decimal separator character to use.
 * @returns The trimmed string.
 */
export const trimToMaxDecimals = (
  value: string,
  decimalMaxLength: number,
  decimalSeparator: string = DEFAULT_DECIMAL_SEPARATOR
): string => {
  const [integer, decimal] = value.split(decimalSeparator);
  return decimal ? `${integer}${decimalSeparator}${decimal.slice(0, decimalMaxLength)}` : value;
};

/**
 * Escapes special regex characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

/**
 * Removes extra decimal separators, keeping only the first one.
 *
 * @param value - The string value
 * @param decimalSeparator - The decimal separator character
 * @returns The string with only the first decimal separator
 */
export const removeExtraDecimalSeparators = (
  value: string,
  decimalSeparator: string = DEFAULT_DECIMAL_SEPARATOR
): string => {
  const escaped = escapeRegExp(decimalSeparator);
  const regex = new RegExp(`(${escaped}.*?)${escaped}`, 'g');
  return value.replace(regex, `$1${decimalSeparator}`);
};