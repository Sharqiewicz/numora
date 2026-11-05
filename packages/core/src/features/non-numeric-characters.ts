/**
 * Removes non-numeric characters from a string, preserving the decimal separator.
 * A single character loop: no regex is built or escaped per call.
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
  let numericOnly = '';
  let runStart = 0;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if ((ch >= '0' && ch <= '9') || ch === decimalSeparator) continue;
    if (i > runStart) numericOnly += value.slice(runStart, i);
    runStart = i + 1;
  }
  numericOnly = runStart === 0 ? value : numericOnly + value.slice(runStart);

  if (!enableNegative) return numericOnly;

  if (value.startsWith('-') && (numericOnly.length > 0 || value === '-')) {
    return '-' + numericOnly;
  }
  return numericOnly;
};
