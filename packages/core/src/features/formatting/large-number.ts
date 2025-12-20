/**
 * Large number formatting utilities for displaying numbers with scale notation (k, M, T, etc.).
 * These are display-only utilities, not for input formatting.
 */

import { formatWithSeparators } from './thousand-grouping';
import { ThousandStyle } from '@/types';
import { DEFAULT_DECIMAL_SEPARATOR } from '@/config';
import { applyDecimalPrecision, applyScaleNotation, compareStrings, isVeryLarge } from './numeric-formatting-utils';

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

  const result = applyDecimalPrecision(
    formatted,
    decimalPlaces,
    decimalsMin,
    decimalSeparator,
    decimalsMinAppliesToZero,
    value === '0' // Pass whether the original value is '0'
  );

  return `${isNegative ? '-' : ''}${result}${scaleSuffix}`;
}
