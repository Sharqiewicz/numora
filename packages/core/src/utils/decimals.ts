import { DEFAULT_DECIMAL_SEPARATOR } from "@/config";
import type { SeparatorOptions, Separators, FormattingOptions } from '@/types';


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