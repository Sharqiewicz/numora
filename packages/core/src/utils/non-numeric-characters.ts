/**
 * Escapes special regex characters in a string.
 */
function escapeRegExp(str: string): string {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}

/**
 * Removes non-numeric characters from a string, preserving allowed decimal separators.
 *
 * @param value - The string to sanitize
 * @param allowNegative - Whether to allow negative sign
 * @param allowedDecimalSeparators - Array of allowed decimal separator characters (default: ['.'])
 * @returns The sanitized string with only numbers and allowed separators
 */
export const removeNonNumericCharacters = (
  value: string,
  allowNegative = false,
  allowedDecimalSeparators: string[] = ['.']
): string => {
  const escapedSeparators = allowedDecimalSeparators.map(escapeRegExp).join('');
  const regex = new RegExp(`[^0-9${escapedSeparators}]`, 'g');

  if (!allowNegative) {
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