import { escapeRegExp } from '../utils/escape-reg-exp';

/**
 * Removes non-numeric characters from a string, preserving the decimal separator.
 *
 * @param value - The string to sanitize
 * @param enableNegative - Whether to allow negative sign
 * @param decimalSeparator - The decimal separator character (default: '.')
 * @returns The sanitized string with only numbers and the decimal separator
 */
export const removeNonNumericCharacters = (
  value: string,
  enableNegative = false,
  decimalSeparator: string = '.'
): string => {
  const escapedSeparator = escapeRegExp(decimalSeparator);
  const regex = new RegExp(`[^0-9${escapedSeparator}]`, 'g');

  if (!enableNegative) {
    return value.replace(regex, '');
  }

  const hasLeadingMinus = value.startsWith('-');
  const numericOnly = value.replace(regex, '');

  if (hasLeadingMinus) {
    if (numericOnly.length > 0) {
      return '-' + numericOnly;
    }
    if (value === '-') {
      return '-';
    }
  }

  return numericOnly;
};