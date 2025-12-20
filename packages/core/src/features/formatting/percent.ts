/**
 * Percent formatting utilities for displaying numeric values as percentages.
 * All functions use string arithmetic to avoid precision loss.
 */

import { formatWithSeparators } from './thousand-grouping';
import { ThousandStyle } from '@/types';
import { DEFAULT_DECIMAL_SEPARATOR } from '@/config';
import { applyDecimalPrecision, applyScaleNotation, compareStrings, isVeryLarge } from './numeric-formatting-utils';

/**
 * Formats a decimal value as a percentage string.
 * Input is expected as a decimal (e.g., 0.01 represents 1%).
 *
 * @param value - The numeric string value (as decimal, e.g., "0.01" for 1%)
 * @param decimals - Number of decimal places to show (default: 2)
 * @param decimalSeparator - The decimal separator character (default: '.')
 * @param thousandSeparator - Optional thousand separator for large percentages
 * @param thousandStyle - Optional thousand grouping style
 * @returns The formatted percentage string (e.g., "1.00%")
 *
 * @example
 * formatPercent("0.01", 2)        // "1.00%"
 * formatPercent("0.1234", 2)      // "12.34%"
 * formatPercent("1", 0)           // "100%"
 * formatPercent("0", 2)            // "0%"
 */
export function formatPercent(
  value: string,
  decimals: number = 2,
  decimalSeparator: string = DEFAULT_DECIMAL_SEPARATOR,
  thousandSeparator?: string,
  thousandStyle: ThousandStyle = ThousandStyle.None
): string {
  if (!value || value === '0' || value === decimalSeparator || value === '-' || value === `-${decimalSeparator}`) {
    return '0%';
  }

  const isNegative = value.startsWith('-');
  const absoluteValue = isNegative ? value.slice(1) : value;

  // Multiply by 100 to convert decimal to percentage
  const percentValue = multiplyBy100(absoluteValue, decimalSeparator);

  // Format with separators if needed
  let formatted = percentValue;
  if (thousandSeparator && thousandStyle !== ThousandStyle.None) {
    formatted = formatWithSeparators(
      percentValue,
      thousandSeparator,
      thousandStyle,
      false,
      decimalSeparator
    );
  }

  const result = applyDecimalPrecision(
    formatted,
    decimals,
    0, // decimalsMin for formatPercent is always 0, as there is no decimalsMinAppliesToZero
    decimalSeparator,
    false, // decimalsMinAppliesToZero is false for formatPercent
    value === '0'
  );

  return `${isNegative ? '-' : ''}${result}%`;
}

/**
 * Formats a large percentage value with scale notation (k, M, T, etc.) for very large percentages.
 * Input is expected as a decimal (e.g., 0.01 represents 1%).
 *
 * @param value - The numeric string value (as decimal, e.g., "0.01" for 1%)
 * @param decimals - Number of decimal places to show for values under threshold (default: 2)
 * @param options - Optional formatting options
 * @returns The formatted percentage string with scale suffix if needed (e.g., "1.23M%")
 *
 * @example
 * formatLargePercent("0.01", 2)           // "1.00%"
 * formatLargePercent("1000", 2)           // "100000%"
 * formatLargePercent("1000000", 2)       // "100M%"
 */
export function formatLargePercent(
  value: string | null | undefined,
  decimals: number = 2,
  options: {
    missingPlaceholder?: string;
    veryLargePlaceholder?: string;
    decimalsUnder?: number;
    decimalSeparator?: string;
    thousandSeparator?: string;
    thousandStyle?: ThousandStyle;
  } = {}
): string {
  const {
    missingPlaceholder = '?',
    veryLargePlaceholder = '🔥',
    decimalsUnder = 1000,
    decimalSeparator = DEFAULT_DECIMAL_SEPARATOR,
    thousandSeparator,
    thousandStyle = ThousandStyle.None,
  } = options;

  if (value === null || value === undefined || value === '') {
    return missingPlaceholder;
  }

  if (value === '0' || value === decimalSeparator || value === '-' || value === `-${decimalSeparator}`) {
    return '0%';
  }

  const isNegative = value.startsWith('-');
  const absoluteValue = isNegative ? value.slice(1) : value;

  // Multiply by 100 to convert decimal to percentage
  const percentValue = multiplyBy100(absoluteValue, decimalSeparator);

  // Check if value is very large (would exceed our scale notation)
  // For now, we'll use a simple threshold - values over 1e30 are considered "very large"
  if (isVeryLarge(percentValue)) {
    return veryLargePlaceholder;
  }

  // Apply scale notation if value is large enough
  const { scaledValue, scaleSuffix } = applyScaleNotation(percentValue, decimalSeparator);

  // Format the scaled value
  const shouldShowDecimals = compareStrings(scaledValue, decimalsUnder.toString()) < 0;
  const formatted = formatPercent(
    scaledValue,
    shouldShowDecimals ? decimals : 0,
    decimalSeparator,
    thousandSeparator,
    thousandStyle
  );

  // Remove the % from formatPercent and add scale suffix
  const withoutPercent = formatted.slice(0, -1);
  return `${isNegative ? '-' : ''}${withoutPercent}${scaleSuffix}%`;
}

/**
 * Multiplies a numeric string by 100 using string arithmetic.
 */
function multiplyBy100(value: string, decimalSeparator: string): string {
  if (!value || value === '0') {
    return '0';
  }

  const hasDecimal = value.includes(decimalSeparator);
  if (!hasDecimal) {
    return value + '00';
  }

  const [integerPart, decimalPart = ''] = value.split(decimalSeparator);
  const decimalLength = decimalPart.length;

  if (decimalLength <= 2) {
    // Decimal part fits within 2 digits: move all decimals to integer part
    const zerosNeeded = 2 - decimalLength;
    return integerPart + decimalPart + '0'.repeat(zerosNeeded);
  } else {
    // Decimal part is longer: move first 2 digits to integer part
    const decimalToMove = decimalPart.slice(0, 2);
    const remainingDecimal = decimalPart.slice(2);
    return integerPart + decimalToMove + decimalSeparator + remainingDecimal;
  }
}
