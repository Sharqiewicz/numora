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
 * Checks if input already has a decimal separator that isn't currently selected.
 */
function shouldPreventMultipleDecimals(input: HTMLInputElement, decimalSeparator: string): boolean {
  if (!input.value.includes(decimalSeparator)) return false;

  const { selectionStart, selectionEnd, value } = input;
  const selectedText = value.slice(selectionStart ?? 0, selectionEnd ?? 0);

  // If the decimal separator is within the selection, it will be overwritten, so don't prevent.
  return !selectedText.includes(decimalSeparator);
}

/**
 * Handles keyboard events for decimal separators, converting comma/dot and preventing duplicates.
 */
export function handleDecimalSeparatorKey(
  e: KeyboardEvent,
  inputElement: HTMLInputElement,
  decimalSeparator: string
): boolean {
  const { key } = e;

  // Only handle comma or dot
  if (key !== ',' && key !== '.') return false;

  if (shouldPreventMultipleDecimals(inputElement, decimalSeparator)) {
    return true;
  }

  // If typed key differs from configured separator, convert it
  // This works even when thousand separators are enabled because we're handling the keydown
  // event before the value is formatted with thousand separators.
  if (key !== decimalSeparator) {
    const { selectionStart, selectionEnd, value } = inputElement;
    const start = selectionStart ?? 0;
    const end = selectionEnd ?? start;

    inputElement.value = value.slice(0, start) + decimalSeparator + value.slice(end);
    const newPos = start + 1;
    inputElement.setSelectionRange(newPos, newPos);

    return true;
  }

  return false;
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
