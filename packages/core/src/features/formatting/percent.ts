/**
 * Percent formatting utilities for displaying numeric values as percentages.
 * All functions use string arithmetic to avoid precision loss.
 */

import { formatWithSeparators } from './thousand-grouping';
import { ThousandStyle } from '@/types';
import { DEFAULT_DECIMAL_SEPARATOR } from '@/config';
import { applyDecimalPrecision, applyScaleNotation, compareStrings, isVeryLarge } from './numeric-formatting-utils';

/**
 * Checks if a value represents zero or is empty.
 */
function isZeroValue(value: string, decimalSeparator: string): boolean {
  return !value || value === '0' || value === decimalSeparator || value === '-' || value === `-${decimalSeparator}`;
}

/**
 * Extracts the sign and absolute value from a numeric string.
 */
function extractSign(value: string): { isNegative: boolean; absoluteValue: string } {
  const isNegative = value.startsWith('-');
  return { isNegative, absoluteValue: isNegative ? value.slice(1) : value };
}

/**
 * Multiplies a numeric string by 100 using string arithmetic.
 * Simplified algorithm: treat as integer representation, multiply, then normalize.
 */
function multiplyBy100(value: string, decimalSeparator: string): string {
  if (!value || value === '0') {
    return '0';
  }

  const hasDecimal = value.includes(decimalSeparator);
  const [integerPart, decimalPart = ''] = hasDecimal ? value.split(decimalSeparator) : [value, ''];

  // Multiply by 100: shift decimal point 2 places right
  // If decimal part <= 2 digits, move all to integer and pad with zeros
  // If decimal part > 2 digits, move first 2 digits to integer, keep rest as decimal
  let result: string;
  if (decimalPart.length <= 2) {
    const zerosNeeded = 2 - decimalPart.length;
    result = integerPart + decimalPart + '0'.repeat(zerosNeeded);
  } else {
    result = integerPart + decimalPart.slice(0, 2) + decimalSeparator + decimalPart.slice(2);
  }

  // Normalize: remove leading zeros, handle edge cases
  let cleaned = result.replace(/^0+/, '') || '0';
  
  // If result starts with decimal separator, add leading zero
  if (cleaned.startsWith(decimalSeparator)) {
    cleaned = '0' + cleaned;
  }
  
  if (cleaned.includes(decimalSeparator)) {
    const [intPart, decPart] = cleaned.split(decimalSeparator);
    return intPart === '0' && !decPart ? '0' : cleaned;
  }
  return cleaned;
}

/**
 * Core formatting pipeline for percentages.
 * Handles the common flow: multiply by 100 → format separators → apply precision.
 */
function formatPercentCore(
  value: string,
  options: {
    decimals: number;
    decimalSeparator: string;
    thousandSeparator?: string;
    thousandStyle: ThousandStyle;
    decimalsMin?: number;
  }
): string {
  const { decimals, decimalSeparator, thousandSeparator, thousandStyle, decimalsMin = 0 } = options;

  if (isZeroValue(value, decimalSeparator)) {
    return '0';
  }

  const { isNegative, absoluteValue } = extractSign(value);
  const percentValue = multiplyBy100(absoluteValue, decimalSeparator);

  let formatted = percentValue;
  if (thousandSeparator && thousandStyle !== ThousandStyle.None) {
    formatted = formatWithSeparators(percentValue, thousandSeparator, thousandStyle, false, decimalSeparator);
  }

  const result = applyDecimalPrecision(
    formatted,
    decimals,
    decimalsMin,
    decimalSeparator,
    false,
    value === '0'
  );

  return `${isNegative ? '-' : ''}${result}`;
}

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
  const result = formatPercentCore(value, {
    decimals,
    decimalSeparator,
    thousandSeparator,
    thousandStyle,
    decimalsMin: decimals, // Use decimals as decimalsMin to ensure trailing zeros are shown
  });
  return result === '0' ? '0%' : `${result}%`;
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

  if (isZeroValue(value, decimalSeparator)) {
    return '0%';
  }

  const { isNegative, absoluteValue } = extractSign(value);
  const percentValue = multiplyBy100(absoluteValue, decimalSeparator);

  if (isVeryLarge(percentValue)) {
    return veryLargePlaceholder;
  }

  const { scaledValue, scaleSuffix } = applyScaleNotation(percentValue, decimalSeparator);
  const shouldShowDecimals = compareStrings(scaledValue, decimalsUnder.toString()) < 0;
  const decimalsToShow = shouldShowDecimals ? decimals : 0;

  // Format the scaled value directly (it's already a percentage, not a decimal)
  let formatted = scaledValue;
  if (thousandSeparator && thousandStyle !== ThousandStyle.None) {
    formatted = formatWithSeparators(scaledValue, thousandSeparator, thousandStyle, false, decimalSeparator);
  }

  const result = applyDecimalPrecision(
    formatted,
    decimalsToShow,
    decimalsToShow,
    decimalSeparator,
    false,
    false
  );

  return `${isNegative ? '-' : ''}${result}${scaleSuffix}%`;
}
