const removeNonNumericCharacters = (value: string): string => value.replace(/[^0-9.]/g, '');

const removeExtraDots = (value: string): string => value.replace(/(\..*?)\./g, '$1');

export const sanitizeNumericInput = (value: string): string =>
  removeExtraDots(removeNonNumericCharacters(value));

export const replaceCommasWithDots = (value: string): string => value.replace(/,/g, '.');

/**
 * Checks if the input already has a decimal point and prevents the user from entering another one.
 */
export const alreadyHasDecimal = (e: KeyboardEvent) => {
  const decimalChars = ['.', ','];
  return decimalChars.some(
    (char) => e.key === char && e.target && (e.target as HTMLInputElement).value.includes('.')
  );
};
