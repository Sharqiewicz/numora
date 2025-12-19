import { DEFAULT_DECIMAL_SEPARATOR } from "@/config";
import type { SeparatorOptions, Separators, FormattingOptions } from '@/types';
import { ThousandStyle } from '@/types';


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
  formattingOptions: FormattingOptions | undefined,
  decimalSeparator: string
): boolean {
  const { key } = e;

  // Only handle comma or dot
  if (key !== ',' && key !== '.') return false;

  // Only apply conversion when thousandStyle is None/undefined to avoid conflicts with thousand separators
  const thousandStyle = formattingOptions?.ThousandStyle;
  if (thousandStyle !== ThousandStyle.None && thousandStyle !== undefined) {
    return false;
  }

  if (shouldPreventMultipleDecimals(inputElement, decimalSeparator)) {
    return true;
  }

  // If typed key differs from configured separator, convert it
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
  const hasSeparator = value.includes(decimalSeparator);

  if (!hasSeparator) return value;

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

  const head = value.slice(0, firstIdx + 1);
  const tail = value.slice(firstIdx + 1);

  // Remove any occurrences of decimal separator, comma or dot from the tail
  const cleanedTail = tail.split(',').join('').split('.').join('').split(decimalSeparator).join('');

  return head + cleanedTail;
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
    // Already has enough decimals, but we must ensure the separator is present if it wasn't
    // (though splitNumber might have "swallowed" it)
    return value.includes(decimalSeparator) ? value : `${sign}${integer}${decimalSeparator}${decimal}`;
  }

  const paddedDecimal = decimal.padEnd(minDecimals, '0');
  return `${sign}${integer}${decimalSeparator}${paddedDecimal}`;
};
