/**
 * Number formatting utilities with thousand separators.
 * Supports multiple grouping styles: thousand (Western), lakh (Indian), wan (Chinese)
 */

import { GROUPING_CONFIG  } from './constants';
import { DEFAULT_DECIMAL_SEPARATOR } from '@/config';
import type { FormattingOptions, Separators } from '@/types';
import { ThousandStyle, FormatOn } from '@/types';

const LEADING_ZEROS_CAPTURE_RE = /^(0+)/;



/**
 * Formats a numeric string with thousand separators based on the specified group style.
 *
 * @param value - The numeric string to format (e.g., "1234567")
 * @param separator - The separator character to use (e.g., ",")
 * @param groupStyle - The grouping style: 'none' (no separators), 'thousand' (1,234,567), 'lakh' (12,34,567), or 'wan' (123,4567)
 * @param enableLeadingZeros - Whether to preserve leading zeros
 * @param decimalSeparator - The decimal separator character (default: '.')
 * @returns The formatted string with separators
 *
 * @example
 * formatWithSeparators("1234567", ",", "thousand") // "1,234,567"
 * formatWithSeparators("1234567", ",", "lakh")     // "12,34,567"
 * formatWithSeparators("1234567", ",", "wan")      // "123,4567"
 * formatWithSeparators("1234.56", ",", "thousand", false, '.') // "1,234.56"
 * formatWithSeparators("1234,56", ",", "thousand", false, ',') // "1,234,56"
 */
export function formatWithSeparators(
  value: string,
  separator: string,
  groupStyle: ThousandStyle = ThousandStyle.Thousand,
  enableLeadingZeros = false,
  decimalSeparator: string = '.'
): string {
  // Handle edge cases: empty, zero, or just decimal separator
  if (!value || value === '0' || value === decimalSeparator || value === '-' || value === `-${decimalSeparator}`) {
    return value;
  }

  const hasDecimalSeparator = value.includes(decimalSeparator);
  const isNegative = value.startsWith('-');
  const absoluteValue = isNegative ? value.slice(1) : value;
  const [integerPart, decimalPart] = absoluteValue.split(decimalSeparator);

  // Handle edge case: value starts with decimal separator (e.g., ".5" or ",5")
  if (!integerPart) {
    const result = decimalPart ? `${decimalSeparator}${decimalPart}` : absoluteValue;
    return isNegative ? `-${result}` : result;
  }

  // Preserve leading zeros if allowed
  if (enableLeadingZeros && integerPart.startsWith('0') && integerPart.length > 1) {
    const leadingZerosMatch = integerPart.match(LEADING_ZEROS_CAPTURE_RE);
    if (leadingZerosMatch) {
      const leadingZeros = leadingZerosMatch[1];
      const significantPart = integerPart.slice(leadingZeros.length);
      if (significantPart) {
        const formattedSignificant = formatIntegerPart(significantPart, separator, groupStyle);
        const formattedInteger = leadingZeros + formattedSignificant;
        const prefix = isNegative ? '-' : '';

        if (hasDecimalSeparator) {
          return decimalPart ? `${prefix}${formattedInteger}${decimalSeparator}${decimalPart}` : `${prefix}${formattedInteger}${decimalSeparator}`;
        }
        return `${prefix}${formattedInteger}`;
      }
    }
  }

  const formattedInteger = formatIntegerPart(integerPart, separator, groupStyle);
  const prefix = isNegative ? '-' : '';

  // Preserve decimal separator even if no decimal digits
  if (hasDecimalSeparator) {
    return decimalPart ? `${prefix}${formattedInteger}${decimalSeparator}${decimalPart}` : `${prefix}${formattedInteger}${decimalSeparator}`;
  }

  return `${prefix}${formattedInteger}`;
}

/**
 * Routes the integer part to the appropriate formatting function based on style.
 */
function formatIntegerPart(
  integerPart: string,
  separator: string,
  groupStyle: ThousandStyle
): string {
  if (integerPart === '0' || integerPart === '') {
    return integerPart;
  }

  switch (groupStyle) {
    case ThousandStyle.None:
      return integerPart;
    case ThousandStyle.Thousand:
      return groupDigitsFromRight(integerPart, separator, GROUPING_CONFIG.thousand.size);
    case ThousandStyle.Lakh:
      return formatLakhStyle(integerPart, separator);
    case ThousandStyle.Wan:
      return groupDigitsFromRight(integerPart, separator, GROUPING_CONFIG.wan.size);
    default:
      return integerPart;
  }
}

/**
 * Formats with Indian-style grouping (first group of 3, then groups of 2).
 * @example "1234567" → "12,34,567"
 */
function formatLakhStyle(integerPart: string, separator: string): string {
  if (integerPart.length <= GROUPING_CONFIG.lakh.firstGroup) {
    return integerPart;
  }

  const groups: string[] = [];
  const firstGroupStart = integerPart.length - GROUPING_CONFIG.lakh.firstGroup;

  // First group: last 3 digits
  groups.unshift(integerPart.slice(firstGroupStart));

  // Remaining groups: 2 digits each, right-to-left
  for (let i = firstGroupStart; i > 0; i -= GROUPING_CONFIG.lakh.restGroup) {
    groups.unshift(integerPart.slice(Math.max(0, i - GROUPING_CONFIG.lakh.restGroup), i));
  }

  return groups.join(separator);
}

/**
 * Helper function to group digits from right to left with a fixed group size.
 * Used by thousand and wan styles.
 *
 * @param integerPart - The integer part to format
 * @param separator - The separator character
 * @param groupSize - The size of each group
 * @returns The formatted string
 */
function groupDigitsFromRight(integerPart: string, separator: string, groupSize: number): string {
  const groups: string[] = [];

  for (let i = integerPart.length; i > 0; i -= groupSize) {
    groups.unshift(integerPart.slice(Math.max(0, i - groupSize), i));
  }

  return groups.join(separator);
}

/**
 * Applies formatting to the input element if formatting is enabled.
 *
 * @param target - The input element
 * @param sanitizedAndTrimmedValue - The sanitized value to format
 * @param formattingOptions - Optional formatting options
 * @param separators - Optional separator configuration
 * @returns The formatted value, or the original value if formatting is not needed
 */
export function formatNumoraInput(
  sanitizedAndTrimmedValue: string,
  formattingOptions?: FormattingOptions,
  separators?: Separators
): string {
  if (formattingOptions?.formatOn === FormatOn.Change && formattingOptions.thousandSeparator) {
    const formattedValue = formatWithSeparators(
      sanitizedAndTrimmedValue,
      formattingOptions.thousandSeparator,
      formattingOptions.ThousandStyle ?? ThousandStyle.None,
      formattingOptions.enableLeadingZeros,
      separators?.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR
    );
    return formattedValue;
  }
  return sanitizedAndTrimmedValue;
}
