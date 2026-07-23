/**
 * Removes leading zeros from a numeric string while preserving the value "0" itself.
 * Only removes leading zeros from the integer part, not from decimal values like "0.5".
 *
 * @param value - The numeric string to process
 * @param decimalSeparator - The decimal separator character (default: '.')
 * @returns The string with leading zeros removed
 *
 * @example
 * removeLeadingZeros("007")        // "7"
 * removeLeadingZeros("0001")       // "1"
 * removeLeadingZeros("0")          // "0"
 * removeLeadingZeros("0.5")        // "0.5"
 * removeLeadingZeros("-007")       // "-7"
 * removeLeadingZeros("123")        // "123"
 * removeLeadingZeros("00.5")       // "0.5"
 * removeLeadingZeros("-00.5")      // "-0.5"
 * removeLeadingZeros("00,5", ",")  // "0,5"
 */
export function removeLeadingZeros(value: string, decimalSeparator: string = '.'): string {
  if (!value || value === '0' || value === '-0' || value === '-' || value === decimalSeparator) {
    return value;
  }

  const isNegative = value.startsWith('-');
  const absoluteValue = isNegative ? value.slice(1) : value;

  if (absoluteValue === decimalSeparator) {
    return value;
  }

  const decimalIdx = absoluteValue.indexOf(decimalSeparator);
  if (decimalIdx !== -1) {
    const integerPart = absoluteValue.slice(0, decimalIdx);
    const decimalPart = absoluteValue.slice(decimalIdx + 1);
    if (integerPart) {
      const cleanedInteger = integerPart.replace(/^0+/, '') || '0';
      const result = cleanedInteger + decimalSeparator + decimalPart;
      return isNegative ? '-' + result : result;
    }
    return value;
  }

  if (absoluteValue.startsWith('0')) {
    const withoutLeadingZeros = absoluteValue.replace(/^0+/, '') || '0';
    return isNegative ? '-' + withoutLeadingZeros : withoutLeadingZeros;
  }

  return value;
}
