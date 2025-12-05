/**
 * Number formatting utilities with thousands separators.
 * Supports multiple grouping styles: thousand (Western), lakh (Indian), wan (Chinese)
 */

import { GROUPING_CONFIG, type ThousandsGroupStyle } from './constants';

/**
 * Formats a numeric string with thousands separators based on the specified group style.
 *
 * @param value - The numeric string to format (e.g., "1234567")
 * @param separator - The separator character to use (e.g., ",")
 * @param groupStyle - The grouping style: 'thousand' (1,234,567), 'lakh' (12,34,567), or 'wan' (123,4567)
 * @returns The formatted string with separators
 *
 * @example
 * formatWithSeparators("1234567", ",", "thousand") // "1,234,567"
 * formatWithSeparators("1234567", ",", "lakh")     // "12,34,567"
 * formatWithSeparators("1234567", ",", "wan")      // "123,4567"
 * formatWithSeparators("1234.56", ",", "thousand") // "1,234.56"
 */
export function formatWithSeparators(
  value: string,
  separator: string,
  groupStyle: ThousandsGroupStyle = 'thousand',
  allowLeadingZeros = false
): string {
  // Handle edge cases: empty, zero, or just decimal point
  if (!value || value === '0' || value === '.' || value === '-' || value === '-.') {
    return value;
  }

  const hasDecimalPoint = value.includes('.');
  const isNegative = value.startsWith('-');
  const absoluteValue = isNegative ? value.slice(1) : value;
  const [integerPart, decimalPart] = absoluteValue.split('.');

  // Handle edge case: value starts with decimal point (e.g., ".5")
  if (!integerPart) {
    const result = decimalPart ? `.${decimalPart}` : absoluteValue;
    return isNegative ? `-${result}` : result;
  }

  // Preserve leading zeros if allowed
  if (allowLeadingZeros && integerPart.startsWith('0') && integerPart.length > 1) {
    const leadingZerosMatch = integerPart.match(/^(0+)/);
    if (leadingZerosMatch) {
      const leadingZeros = leadingZerosMatch[1];
      const significantPart = integerPart.slice(leadingZeros.length);
      if (significantPart) {
        const formattedSignificant = formatIntegerPart(significantPart, separator, groupStyle);
        const formattedInteger = leadingZeros + formattedSignificant;
        const prefix = isNegative ? '-' : '';
        
        if (hasDecimalPoint) {
          return decimalPart ? `${prefix}${formattedInteger}.${decimalPart}` : `${prefix}${formattedInteger}.`;
        }
        return `${prefix}${formattedInteger}`;
      }
    }
  }

  const formattedInteger = formatIntegerPart(integerPart, separator, groupStyle);
  const prefix = isNegative ? '-' : '';

  // Preserve decimal point even if no decimal digits
  if (hasDecimalPoint) {
    return decimalPart ? `${prefix}${formattedInteger}.${decimalPart}` : `${prefix}${formattedInteger}.`;
  }

  return `${prefix}${formattedInteger}`;
}

/**
 * Routes the integer part to the appropriate formatting function based on style.
 */
function formatIntegerPart(
  integerPart: string,
  separator: string,
  groupStyle: ThousandsGroupStyle
): string {
  if (integerPart === '0' || integerPart === '') {
    return integerPart;
  }

  switch (groupStyle) {
    case 'thousand':
      return formatThousandStyle(integerPart, separator);
    case 'lakh':
      return formatLakhStyle(integerPart, separator);
    case 'wan':
      return formatWanStyle(integerPart, separator);
    default:
      return formatThousandStyle(integerPart, separator);
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
