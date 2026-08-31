/**
 * Number formatting utilities with thousand separators.
 * Supports multiple grouping styles: thousand (Western), lakh (Indian), wan (Chinese)
 */

import { GROUPING_CONFIG  } from './constants';
import { GroupingStyle } from '../../types';

/**
 * Formats a numeric string with thousand separators based on the specified group style.
 *
 * @param value - The numeric string to format (e.g., "1234567")
 * @param separator - The separator character to use (e.g., ",")
 * @param groupStyle - The grouping style: 'none' (no separators), 'thousand' (1,234,567), 'lakh' (12,34,567), or 'wan' (123,4567)
 * @param _enableLeadingZeros - Vestigial. Leading zeros are grouped as part of the full
 *   integer regardless (see the note in the body), so this flag has no effect here. The
 *   parameter is retained because `decimalSeparator` follows it positionally.
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
  groupStyle: GroupingStyle = GroupingStyle.Thousand,
  _enableLeadingZeros = false,
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

  // Note: leading zeros (when enableLeadingZeros preserves them) are grouped as part of
  // the full integer, e.g. "0001234" → "0,001,234", not "0001,234". formatIntegerPart
  // handles the whole string uniformly, so no separate leading-zero branch is needed.
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
  groupStyle: GroupingStyle
): string {
  if (integerPart === '0' || integerPart === '') {
    return integerPart;
  }

  switch (groupStyle) {
    case GroupingStyle.None:
      return integerPart;
    case GroupingStyle.Thousand:
      return groupDigitsFromRight(integerPart, separator, GROUPING_CONFIG.thousand.size);
    case GroupingStyle.Lakh:
      return formatLakhStyle(integerPart, separator);
    case GroupingStyle.Wan:
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

  // Collected right-to-left with `push` and reversed once at the end; `unshift` would
  // re-index the whole array per group, making this quadratic in the group count.
  const groups: string[] = [];
  const firstGroupStart = integerPart.length - GROUPING_CONFIG.lakh.firstGroup;

  // First group: last 3 digits
  groups.push(integerPart.slice(firstGroupStart));

  // Remaining groups: 2 digits each, right-to-left
  for (let i = firstGroupStart; i > 0; i -= GROUPING_CONFIG.lakh.restGroup) {
    groups.push(integerPart.slice(Math.max(0, i - GROUPING_CONFIG.lakh.restGroup), i));
  }

  return groups.reverse().join(separator);
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

  // Collect right-to-left with `push` and reverse once, rather than `unshift`-ing each
  // group into place. `unshift` re-indexes the whole array per call, making this
  // quadratic in the group count - a pasted 160k-digit value cost ~900ms. Linear now.
  for (let i = integerPart.length; i > 0; i -= groupSize) {
    groups.push(integerPart.slice(Math.max(0, i - groupSize), i));
  }

  return groups.reverse().join(separator);
}

