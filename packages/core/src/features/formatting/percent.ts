/**
 * Percent formatting utilities for displaying numeric values as percentages.
 * All functions use string arithmetic to avoid precision loss.
 */

import { formatWithSeparators } from './thousand-grouping';
import { ThousandStyle } from '@/types';
import { DEFAULT_DECIMAL_SEPARATOR } from '@/config';

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

  // Apply decimal precision
  const [integerPart, decimalPart = ''] = formatted.split(decimalSeparator);
  let result: string;
  if (decimals === 0) {
    result = integerPart;
  } else if (decimalPart.length === 0) {
    result = `${integerPart}${decimalSeparator}${'0'.repeat(decimals)}`;
  } else if (decimalPart.length < decimals) {
    result = `${integerPart}${decimalSeparator}${decimalPart}${'0'.repeat(decimals - decimalPart.length)}`;
  } else {
    result = `${integerPart}${decimalSeparator}${decimalPart.slice(0, decimals)}`;
  }

  // Remove trailing zeros after decimal point
  result = result.replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '');

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

/**
 * Applies scale notation (k, M, T, etc.) to a large number.
 * Returns the scaled value and suffix.
 */
function applyScaleNotation(
  value: string,
  decimalSeparator: string
): { scaledValue: string; scaleSuffix: string } {
  const scales: Array<{ suffix: string; zeros: number }> = [
    { suffix: 'N', zeros: 30 },  // Nonillion
    { suffix: 'O', zeros: 27 },  // Octillion
    { suffix: 'Sp', zeros: 24 }, // Septillion
    { suffix: 'Sx', zeros: 21 }, // Sextillion
    { suffix: 'Qi', zeros: 18 }, // Quintillion
    { suffix: 'Qa', zeros: 15 }, // Quadrillion
    { suffix: 'T', zeros: 12 },  // Trillion
    { suffix: 'B', zeros: 9 },   // Billion
    { suffix: 'M', zeros: 6 },   // Million
    { suffix: 'k', zeros: 3 },   // Thousand
  ];

  const [integerPart, decimalPart = ''] = value.split(decimalSeparator);
  // Count total significant digits (excluding leading zeros in integer part)
  const cleanedInteger = integerPart.replace(/^0+/, '') || '0';
  const totalSignificantDigits = cleanedInteger.length + decimalPart.length;

  for (const scale of scales) {
    // Apply scale if the number has more digits than the scale requires
    // e.g., 1234 has 4 digits, which is > 3 (thousand scale), so use 'k'
    if (cleanedInteger.length > scale.zeros || (cleanedInteger.length === scale.zeros && decimalPart.length > 0)) {
      // Divide by moving decimal point left by scale.zeros positions
      const movePoint = scale.zeros;

      if (cleanedInteger.length > movePoint) {
        // Integer part is long enough: move decimal point left within integer
        const newInteger = cleanedInteger.slice(0, -movePoint);
        const movedDigits = cleanedInteger.slice(-movePoint);
        const newDecimal = movedDigits + decimalPart;
        // Trim trailing zeros from decimal
        const trimmedDecimal = newDecimal.replace(/0+$/, '');
        const scaledValue = trimmedDecimal
          ? `${newInteger}${decimalSeparator}${trimmedDecimal}`
          : newInteger;
        return { scaledValue, scaleSuffix: scale.suffix };
      } else {
        // Integer part is shorter: need to pad with zeros from decimal
        const digitsNeeded = movePoint - cleanedInteger.length;
        const newInteger = '0';
        const newDecimal = '0'.repeat(digitsNeeded) + cleanedInteger + decimalPart;
        // Trim trailing zeros
        const trimmedDecimal = newDecimal.replace(/0+$/, '');
        const scaledValue = trimmedDecimal
          ? `${newInteger}${decimalSeparator}${trimmedDecimal}`
          : newInteger;
        return { scaledValue, scaleSuffix: scale.suffix };
      }
    }
  }

  return { scaledValue: value, scaleSuffix: '' };
}

/**
 * Checks if a numeric string represents a very large number (exceeds our scale notation).
 */
function isVeryLarge(value: string): boolean {
  const [integerPart, decimalPart = ''] = value.split('.');
  const totalDigits = integerPart.length + decimalPart.length;
  // Consider values with more than 30 digits as "very large"
  return totalDigits > 30;
}

/**
 * Compares two numeric strings using string comparison.
 * Returns negative if a < b, positive if a > b, 0 if equal.
 * Uses string-based comparison to avoid precision issues.
 */
function compareStrings(a: string, b: string): number {
  // Remove decimal separator for comparison
  const aClean = a.replace('.', '');
  const bClean = b.replace('.', '');

  // Pad with zeros to same length
  const maxLen = Math.max(aClean.length, bClean.length);
  const aPadded = aClean.padStart(maxLen, '0');
  const bPadded = bClean.padStart(maxLen, '0');

  // Compare digit by digit
  for (let i = 0; i < maxLen; i++) {
    const aDigit = parseInt(aPadded[i], 10);
    const bDigit = parseInt(bPadded[i], 10);
    if (aDigit !== bDigit) {
      return aDigit - bDigit;
    }
  }

  return 0;
}
