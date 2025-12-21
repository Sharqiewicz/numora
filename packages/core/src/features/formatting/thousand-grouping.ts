/**
 * Number formatting utilities with thousand separators.
 * Supports multiple grouping styles: thousand (Western), lakh (Indian), wan (Chinese)
 */

import { GROUPING_CONFIG  } from './constants';
import { DEFAULT_DECIMAL_SEPARATOR } from '@/config';
import type { FormattingOptions, Separators } from '@/types';
import { ThousandStyle, FormatOn } from '@/types';



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
    const leadingZerosMatch = integerPart.match(/^(0+)/);
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
      return formatThousandStyle(integerPart, separator);
    case ThousandStyle.Lakh:
      return formatLakhStyle(integerPart, separator);
    case ThousandStyle.Wan:
      return formatWanStyle(integerPart, separator);
    default:
      return integerPart;
  }
}

/**
 * Formats with Western-style grouping (groups of 3).
 * @example "1234567" → "1,234,567"
 */
function formatThousandStyle(integerPart: string, separator: string): string {
  return groupDigitsFromRight(integerPart, separator, GROUPING_CONFIG.thousand.size);
}

/**
 * Formats with Indian-style grouping (first group of 3, then groups of 2).
 * @example "1234567" → "12,34,567"
 */
function formatLakhStyle(integerPart: string, separator: string): string {
  if (integerPart.length <= GROUPING_CONFIG.lakh.firstGroup) {
    return integerPart;
  }

  const reversed = integerPart.split('').reverse();
  const groups: string[] = [];

  // First group: 3 digits from the right
  const firstGroup = reversed.slice(0, GROUPING_CONFIG.lakh.firstGroup).reverse().join('');
  groups.push(firstGroup);

  // Remaining groups: 2 digits each
  for (let i = GROUPING_CONFIG.lakh.firstGroup; i < reversed.length; i += GROUPING_CONFIG.lakh.restGroup) {
    groups.push(reversed.slice(i, i + GROUPING_CONFIG.lakh.restGroup).reverse().join(''));
  }

  return groups.reverse().join(separator);
}

/**
 * Formats with Chinese-style grouping (groups of 4).
 * @example "12345678" → "1234,5678"
 */
function formatWanStyle(integerPart: string, separator: string): string {
  return groupDigitsFromRight(integerPart, separator, GROUPING_CONFIG.wan.size);
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
  const reversed = integerPart.split('').reverse();
  const groups: string[] = [];

  for (let i = 0; i < reversed.length; i += groupSize) {
    groups.push(reversed.slice(i, i + groupSize).reverse().join(''));
  }

  return groups.reverse().join(separator);
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
