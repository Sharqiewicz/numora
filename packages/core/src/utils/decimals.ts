import { DEFAULT_DECIMAL_SEPARATOR, DEFAULT_THOUSAND_SEPARATOR } from "@/config";

export interface SeparatorOptions {
  decimalSeparator?: string;
  thousandSeparator?: string | boolean;
}

export interface Separators {
  decimalSeparator: string;
  thousandSeparator: string | undefined;
}

/**
 * Normalizes separator configuration with defaults.
 *
 * @param options - Separator configuration options
 * @returns Normalized separator configuration
 */
export function getSeparators(options: SeparatorOptions = {}): Separators {
  const { decimalSeparator = DEFAULT_DECIMAL_SEPARATOR } = options;
  let { thousandSeparator } = options;

  if (thousandSeparator === true) {
    thousandSeparator = DEFAULT_THOUSAND_SEPARATOR;
  }

  return {
    decimalSeparator,
    thousandSeparator: thousandSeparator as string | undefined,
  };
}


/**
 * Escapes special regex characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
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
  decimalSeparator: string = '.'
): string => {
  const [integer, decimal] = value.split(decimalSeparator);
  return decimal ? `${integer}${decimalSeparator}${decimal.slice(0, decimalMaxLength)}` : value;
};

/**
 * Removes extra decimal separators, keeping only the first one.
 *
 * @param value - The string value
 * @param decimalSeparator - The decimal separator character
 * @returns The string with only the first decimal separator
 */
export const removeExtraDecimalSeparators = (
  value: string,
  decimalSeparator: string = '.'
): string => {
  const escaped = escapeRegExp(decimalSeparator);
  const regex = new RegExp(`(${escaped}.*?)${escaped}`, 'g');
  return value.replace(regex, `$1${decimalSeparator}`);
};