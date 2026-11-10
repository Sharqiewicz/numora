import { DEFAULT_DECIMAL_SEPARATOR } from '../config';
import type { SeparatorOptions, Separators, FormattingOptions } from '../types';

/**
 * Normalizes separator configuration with defaults.
 */
export function getSeparators(
  options: SeparatorOptions | FormattingOptions | undefined
): Separators {
  return {
    decimalSeparator: options?.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
    thousandSeparator: options?.thousandSeparator,
  };
}

/**
 * Trims decimals to a maximum length.
 */
export const trimToDecimalMaxLength = (
  value: string,
  decimalMaxLength: number,
  decimalSeparator: string = DEFAULT_DECIMAL_SEPARATOR
): string => {
  const [integer, decimal = ''] = value.split(decimalSeparator);

  // No decimals allowed at all: drop the separator outright, even when the fraction is
  // empty (e.g. "1." -> "1"), instead of only trimming an existing fraction. Reconstructing
  // from the integer is a no-op for values that never had a separator.
  if (decimalMaxLength === 0) return integer;

  if (!decimal) return value;

  return `${integer}${decimalSeparator}${decimal.slice(0, decimalMaxLength)}`;
};

/**
 * Removes extra decimal separators, keeping only the first one.
 */
export const removeExtraDecimalSeparators = (
  value: string,
  decimalSeparator: string = DEFAULT_DECIMAL_SEPARATOR
): string => {
  const firstIdx = value.indexOf(decimalSeparator);
  if (firstIdx === -1) return value;

  // Drop every decimal separator, ',' and '.' after the first separator.
  return (
    value.slice(0, firstIdx + 1) +
    value.slice(firstIdx + 1).split(decimalSeparator).join('').replace(/[,.]/g, '')
  );
};

/**
 * Ensures a numeric string has at least the specified minimum number of decimal places.
 */
export const ensureMinDecimals = (
  value: string,
  minDecimals: number = 0,
  decimalSeparator: string = DEFAULT_DECIMAL_SEPARATOR
): string => {
  // Nothing to pad: '', '-', '.', '-.' carry no digit, so padding them would fabricate a
  // number (e.g. '' -> '.00') out of a field that is actually empty or mid-entry.
  if (!/\d/.test(value)) return value;

  const [integer, decimal = ''] = value.split(decimalSeparator);

  if (decimal.length >= minDecimals) return value;

  return `${integer}${decimalSeparator}${decimal.padEnd(minDecimals, '0')}`;
};
