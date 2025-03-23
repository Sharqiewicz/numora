// @TODO: support a choice between comma and dot as decimal separator
export const replaceCommasWithDots = (value: string): string => value.replace(/,/g, '.');

/**
 * Checks if the input already has a decimal point and prevents the user from entering another one.
 */
export const alreadyHasDecimal = (e: KeyboardEvent) => {
  // @TODO: add support for specialChars
  const decimalChars = ['.', ','];

  return decimalChars.some(
    (char) => e.key === char && e.target && (e.target as HTMLInputElement).value.includes('.')
  );
};

/**
 * Trims a string representation of a number to a maximum number of decimal places.
 *
 * @param value - The string to trim.
 * @param maxDecimals - The maximum number of decimal places to allow.
 * @returns The trimmed string.
 */
export const trimToMaxDecimals = (value: string, maxDecimals: number): string => {
  // @TODO: change when a choice between comma and dot as decimal separator is implemented
  const [integer, decimal] = value.split('.');
  return decimal ? `${integer}.${decimal.slice(0, maxDecimals)}` : value;
};
