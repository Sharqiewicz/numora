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
  const sign = value.startsWith('-') ? '-' : '';
  const absoluteValue = value.slice(sign.length);
  const decimalIdx = absoluteValue.indexOf(decimalSeparator);
  const integerPart = decimalIdx === -1 ? absoluteValue : absoluteValue.slice(0, decimalIdx);
  // No integer digits ('', '-', '.5', '-.5'): nothing to strip.
  if (!integerPart) return value;
  return sign + (integerPart.replace(/^0+/, '') || '0') + absoluteValue.slice(integerPart.length);
}
