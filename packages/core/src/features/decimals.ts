import { DEFAULT_DECIMAL_SEPARATOR } from "@/config";
import type { SeparatorOptions, Separators, FormattingOptions } from '@/types';
import { getCachedRegex } from '@/utils/regex-cache';
import { escapeRegExp } from '@/utils/escape-reg-exp';

// Pre-compiled regex for the common case: decimal separator is '.' or ','.
// The character class [.,] covers both hardcoded removals in a single pass.
const TAIL_CLEAN_REGEX = /[.,]/g;


/**
 * Normalizes separator configuration with defaults.
 */
export function getSeparators(options: SeparatorOptions | FormattingOptions | undefined): Separators {
  return {
    decimalSeparator: options?.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
    thousandSeparator: options?.thousandSeparator,
  };
}

interface NumberParts {
  sign: string;
  integer: string;
  decimal: string;
}

/**
 * Splits a numeric string into sign, integer and decimal parts.
 */
function splitNumber(value: string, decimalSeparator: string): NumberParts {
  const isNegative = value.startsWith('-');
  const absoluteValue = isNegative ? value.slice(1) : value;
  const [integer = '', decimal = ''] = absoluteValue.split(decimalSeparator);

  return {
    sign: isNegative ? '-' : '',
    integer,
    decimal,
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
  const { sign, integer, decimal } = splitNumber(value, decimalSeparator);
  if (!decimal) return value;

  const trimmedDecimal = decimal.slice(0, decimalMaxLength);
  return `${sign}${integer}${decimalSeparator}${trimmedDecimal}`;
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
  // Early exit: tail is empty (e.g. "123."), nothing to clean
  if (firstIdx === value.length - 1) return value;

  const head = value.slice(0, firstIdx + 1);
  const tail = value.slice(firstIdx + 1);

  // Single-pass removal of all three characters (',', '.', decimalSeparator).
  // For standard separators use the pre-compiled constant; for custom separators
  // build and cache a character-class regex that covers all three.
  const isStandardSeparator = decimalSeparator === '.' || decimalSeparator === ',';
  const cleanRegex = isStandardSeparator
    ? TAIL_CLEAN_REGEX
    : getCachedRegex('[,\\.' + escapeRegExp(decimalSeparator) + ']', 'g');

  return head + tail.replace(cleanRegex, '');
};

/**
 * Ensures a numeric string has at least the specified minimum number of decimal places.
 */
export const ensureMinDecimals = (
  value: string,
  minDecimals: number = 0,
  decimalSeparator: string = DEFAULT_DECIMAL_SEPARATOR
): string => {
  if (minDecimals <= 0) return value;

  const { sign, integer, decimal } = splitNumber(value, decimalSeparator);

  if (decimal.length >= minDecimals) {
    return value;
  }

  const paddedDecimal = decimal.padEnd(minDecimals, '0');
  return `${sign}${integer}${decimalSeparator}${paddedDecimal}`;
};
