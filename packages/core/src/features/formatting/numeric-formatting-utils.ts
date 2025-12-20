/**
 * Common utilities for numeric formatting.
 */

import { DEFAULT_DECIMAL_SEPARATOR } from '@/config';

/**
 * Checks if a numeric string represents a very large number.
 */
export function isVeryLarge(value: string): boolean {
  const [integerPart, decimalPart = ''] = value.split('.');
  const totalDigits = integerPart.length + decimalPart.length;
  return totalDigits > 30;
}

/**
 * Compares two numeric strings using string comparison.
 * Returns negative if a < b, positive if a > b, 0 if equal.
 * Uses string-based comparison to avoid precision issues.
 */
export function compareStrings(a: string, b: string): number {
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
 * Applies scale notation to a numeric string.
 */
export function applyScaleNotation(
    value: string,
    decimalSeparator: string,
    minScale: number = 0
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
 * Helper for applying decimal precision and handling trailing zeros.
 */
export function applyDecimalPrecision(
  value: string,
  decimals: number,
  decimalsMin: number,
  decimalSeparator: string,
  decimalsMinAppliesToZero: boolean = false,
  isZeroValue: boolean = false
): string {
  if (isZeroValue && decimalsMinAppliesToZero && decimalsMin > 0) {
    return `0${decimalSeparator}${'0'.repeat(decimalsMin)}`;
  }

  const [integerPart, decimalPart = ''] = value.split(decimalSeparator);
  let result: string;

  if (decimals === 0) {
    result = integerPart;
  } else if (decimalPart.length === 0) {
    const zeros = '0'.repeat(Math.max(decimals, decimalsMin));
    result = `${integerPart}${decimalSeparator}${zeros}`;
  } else if (decimalPart.length < decimals) {
    const zerosToAdd = Math.max(decimals - decimalPart.length, decimalsMin - decimalPart.length);
    result = `${integerPart}${decimalSeparator}${decimalPart}${'0'.repeat(zerosToAdd)}`;
  } else {
    result = `${integerPart}${decimalSeparator}${decimalPart.slice(0, decimals)}`;
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

  return result;
}
