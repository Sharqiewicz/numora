/**
 * Trims a string representation of a number to a maximum number of decimal places.
 *
 * @param value - The string to trim.
 * @param maxDecimals - The maximum number of decimal places to allow.
 * @returns The trimmed string.
 */
export const trimToMaxDecimals = (value: string, maxDecimals: number): string => {
  const [integer, decimal] = value.split('.');
  return decimal ? `${integer}.${decimal.slice(0, maxDecimals)}` : value;
};
