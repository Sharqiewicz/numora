/**
 * Removes leading zeros from a numeric string while preserving the value "0" itself.
 * Only removes leading zeros from the integer part, not from decimal values like "0.5".
 *
 * @param value - The numeric string to process
 * @returns The string with leading zeros removed
 *
 * @example
 * removeLeadingZeros("007")     // "7"
 * removeLeadingZeros("0001")    // "1"
 * removeLeadingZeros("0")       // "0"
 * removeLeadingZeros("0.5")     // "0.5"
 * removeLeadingZeros("-007")    // "-7"
 * removeLeadingZeros("123")     // "123"
 * removeLeadingZeros("00.5")    // "0.5"
 * removeLeadingZeros("-00.5")   // "-0.5"
 */
export function removeLeadingZeros(value: string): string {
  if (!value || value === '0' || value === '-0' || value === '-' || value === '.') {
    return value;
  }

  const isNegative = value.startsWith('-');
  const absoluteValue = isNegative ? value.slice(1) : value;

  if (!absoluteValue || absoluteValue === '0' || absoluteValue === '.') {
    return value;
  }

  const hasDecimal = absoluteValue.includes('.');
  if (hasDecimal) {
    const [integerPart, decimalPart] = absoluteValue.split('.');
    if (integerPart && integerPart.length > 0) {
      const cleanedInteger = integerPart.replace(/^0+/, '') || '0';
      const result = cleanedInteger + '.' + decimalPart;
      return isNegative ? '-' + result : result;
    }
    return value;
  }

  if (absoluteValue.startsWith('0') && absoluteValue.length > 1) {
    const withoutLeadingZeros = absoluteValue.replace(/^0+/, '') || '0';
    return isNegative ? '-' + withoutLeadingZeros : withoutLeadingZeros;
  }

  return value;
}
