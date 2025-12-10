/**
 * Large number formatting utilities for displaying numbers with scale notation (k, M, T, etc.).
 * These are display-only utilities, not for input formatting.
 */

import { formatWithSeparators } from './thousand-grouping';
import { ThousandStyle } from '@/types';
import { DEFAULT_DECIMAL_SEPARATOR } from '@/config';

export interface FormatLargeNumberOptions {
  /** Minimum scale threshold - only apply scale notation above this (default: 0, meaning always apply if applicable) */
  minScale?: number;
  /** Under what value should decimals be shown (default: 1000) */
  decimalsUnder?: number;
  /** Maximum decimal places to show (default: 2) */
  decimals?: number;
  /** Minimum decimal places to show (default: 0) */
  decimalsMin?: number;
  /** Show minimum decimals even when value is 0 (default: false) */
  decimalsMinAppliesToZero?: boolean;
  /** Placeholder for very large numbers that exceed our scale notation (default: '🔥') */
  veryLargePlaceholder?: string;
  /** Decimal separator (default: '.') */
  decimalSeparator?: string;
  /** Thousand separator for formatting (optional) */
  thousandSeparator?: string;
  /** Thousand grouping style (default: None) */
  thousandStyle?: ThousandStyle;
}

const defaultFormatLargeNumberOptions: Required<Omit<FormatLargeNumberOptions, 'thousandSeparator' | 'thousandStyle'>> & {
  thousandSeparator?: string;
  thousandStyle?: ThousandStyle;
} = {
  minScale: 0,
  decimalsUnder: 1000,
  decimals: 2,
  decimalsMin: 0,
  decimalsMinAppliesToZero: false,
  veryLargePlaceholder: '🔥',
  decimalSeparator: DEFAULT_DECIMAL_SEPARATOR,
};

/**
 * Scale definitions for large number formatting.
 */
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

/**
 * Formats a large number with scale notation (k, M, T, etc.) for display.
 *
 * @param value - The numeric string value to format
 * @param options - Optional formatting options
 * @returns The formatted string with scale suffix if applicable
 *
 * @example
 * formatLargeNumber("123")        // "123"
 * formatLargeNumber("1234")        // "1.23k"
 * formatLargeNumber("1234567")    // "1.23M"
 * formatLargeNumber("0")          // "0"
 */
export function formatLargeNumber(
  value: string,
  options: FormatLargeNumberOptions = {}
): string {
  const {
    minScale = defaultFormatLargeNumberOptions.minScale,
    decimalsUnder = defaultFormatLargeNumberOptions.decimalsUnder,
    decimals = defaultFormatLargeNumberOptions.decimals,
    decimalsMin = defaultFormatLargeNumberOptions.decimalsMin,
    decimalsMinAppliesToZero = defaultFormatLargeNumberOptions.decimalsMinAppliesToZero,
    veryLargePlaceholder = defaultFormatLargeNumberOptions.veryLargePlaceholder,
    decimalSeparator = defaultFormatLargeNumberOptions.decimalSeparator,
    thousandSeparator,
    thousandStyle = ThousandStyle.None,
  } = options;

  if (!value || value === '0' || value === decimalSeparator || value === '-' || value === `-${decimalSeparator}`) {
    if (decimalsMinAppliesToZero && decimalsMin > 0) {
      return `0${decimalSeparator}${'0'.repeat(decimalsMin)}`;
    }
    return '0';
  }

  const isNegative = value.startsWith('-');
  const absoluteValue = isNegative ? value.slice(1) : value;

  // Check if value is very large
  if (isVeryLarge(absoluteValue)) {
    return veryLargePlaceholder;
  }

  // Apply scale notation
  const { scaledValue, scaleSuffix } = applyScaleNotation(
    absoluteValue,
    decimalSeparator,
    minScale
  );

  // Determine if we should show decimals
  const shouldShowDecimals = compareStrings(scaledValue, decimalsUnder.toString()) < 0;
  const decimalPlaces = shouldShowDecimals ? decimals : 0;

  // Format the scaled value
  let formatted = scaledValue;
  if (thousandSeparator && thousandStyle !== ThousandStyle.None) {
    formatted = formatWithSeparators(
      scaledValue,
      thousandSeparator,
      thousandStyle,
      false,
      decimalSeparator
    );
  }

  // Apply decimal precision
  const [integerPart, decimalPart = ''] = formatted.split(decimalSeparator);
  let result: string;

  if (decimalPlaces === 0) {
    result = integerPart;
  } else if (decimalPart.length === 0) {
    const zeros = '0'.repeat(Math.max(decimalPlaces, decimalsMin));
    result = `${integerPart}${decimalSeparator}${zeros}`;
  } else if (decimalPart.length < decimalPlaces) {
    const zerosToAdd = Math.max(decimalPlaces - decimalPart.length, decimalsMin - decimalPart.length);
    result = `${integerPart}${decimalSeparator}${decimalPart}${'0'.repeat(zerosToAdd)}`;
  } else {
    result = `${integerPart}${decimalSeparator}${decimalPart.slice(0, decimalPlaces)}`;
  }

  // Apply minimum decimals if needed
  if (decimalsMin > 0) {
    const [intPart, decPart = ''] = result.split(decimalSeparator);
    if (decPart.length < decimalsMin) {
      const zerosToAdd = decimalsMin - decPart.length;
      result = `${intPart}${decimalSeparator}${decPart}${'0'.repeat(zerosToAdd)}`;
    }
  }

  // Remove trailing zeros after decimal point (but respect decimalsMin)
  if (decimalsMin === 0) {
    result = result.replace(/(\.[0-9]*?)0+$/, '$1').replace(/\.$/, '');
  } else {
    const [intPart, decPart = ''] = result.split(decimalSeparator);
    if (decPart) {
      const trimmed = decPart.replace(/0+$/, '');
      const finalDec = trimmed.length >= decimalsMin ? trimmed : decPart.slice(0, decimalsMin);
      result = finalDec ? `${intPart}${decimalSeparator}${finalDec}` : intPart;
    }
  }

  return `${isNegative ? '-' : ''}${result}${scaleSuffix}`;
}

/**
 * Applies scale notation to a numeric string.
 */
function applyScaleNotation(
  value: string,
  decimalSeparator: string,
  minScale: number
): { scaledValue: string; scaleSuffix: string } {
  const [integerPart, decimalPart = ''] = value.split(decimalSeparator);
  // Count total significant digits (excluding leading zeros in integer part)
  const cleanedInteger = integerPart.replace(/^0+/, '') || '0';

  for (const scale of scales) {
    if (scale.zeros >= minScale) {
      // Apply scale if the number has more digits than the scale requires
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
  }

  return { scaledValue: value, scaleSuffix: '' };
}

/**
 * Checks if a numeric string represents a very large number.
 */
function isVeryLarge(value: string): boolean {
  const [integerPart, decimalPart = ''] = value.split('.');
  const totalDigits = integerPart.length + decimalPart.length;
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
