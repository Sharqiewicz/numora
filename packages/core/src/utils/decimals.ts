export interface SeparatorOptions {
  decimalSeparator?: string;
  thousandSeparator?: string | boolean;
  allowedDecimalSeparators?: string[];
}

export interface Separators {
  decimalSeparator: string;
  thousandSeparator: string | undefined;
  allowedDecimalSeparators: string[];
}

/**
 * Normalizes separator configuration with defaults.
 * Similar to getSeparators() in reference implementation.
 *
 * @param options - Separator configuration options
 * @returns Normalized separator configuration
 */
export function getSeparators(options: SeparatorOptions = {}): Separators {
  const { decimalSeparator = '.' } = options;
  let { thousandSeparator, allowedDecimalSeparators } = options;

  if (thousandSeparator === true) {
    thousandSeparator = ',';
  }

  if (!allowedDecimalSeparators) {
    allowedDecimalSeparators = [decimalSeparator, '.'];
  }

  return {
    decimalSeparator,
    thousandSeparator: thousandSeparator as string | undefined,
    allowedDecimalSeparators,
  };
}

/**
 * Normalizes decimal separators in a value to the canonical separator.
 * Replaces replaceCommasWithDots() with a more flexible approach.
 * Based on reference implementation: finds first allowed separator, normalizes all to canonical,
 * keeping only the first occurrence.
 *
 * @param value - The string value to normalize
 * @param allowedSeparators - Array of allowed decimal separator characters
 * @param canonicalSeparator - The canonical separator to normalize to
 * @returns The normalized string with canonical separator
 */
export function normalizeDecimalSeparator(
  value: string,
  allowedSeparators: string[],
  canonicalSeparator: string
): string {
  if (!value) return value;

  let firstIndex = -1;
  
  for (const sep of allowedSeparators) {
    const index = value.indexOf(sep);
    if (index !== -1 && (firstIndex === -1 || index < firstIndex)) {
      firstIndex = index;
    }
  }

  if (firstIndex === -1) return value;

  let normalized = value;
  
  for (const sep of allowedSeparators) {
    const regex = new RegExp(escapeRegExp(sep), 'g');
    normalized = normalized.replace(regex, (match, index) => {
      return index === firstIndex ? canonicalSeparator : '';
    });
  }

  return normalized;
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
 * @param allowedDecimalSeparators - Array of allowed decimal separator characters
 * @param decimalSeparator - The canonical decimal separator
 */
export const alreadyHasDecimal = (
  e: KeyboardEvent,
  allowedDecimalSeparators: string[],
  decimalSeparator: string
) => {
  if (!allowedDecimalSeparators.includes(e.key)) {
    return false;
  }

  const target = e.target as HTMLInputElement;
  if (!target) return false;

  return allowedDecimalSeparators.some((char) => target.value.includes(char));
};

/**
 * Trims a string representation of a number to a maximum number of decimal places.
 *
 * @param value - The string to trim.
 * @param maxDecimals - The maximum number of decimal places to allow.
 * @param decimalSeparator - The decimal separator character to use.
 * @returns The trimmed string.
 */
export const trimToMaxDecimals = (
  value: string,
  maxDecimals: number,
  decimalSeparator: string = '.'
): string => {
  const [integer, decimal] = value.split(decimalSeparator);
  return decimal ? `${integer}${decimalSeparator}${decimal.slice(0, maxDecimals)}` : value;
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