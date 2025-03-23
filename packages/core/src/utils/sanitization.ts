const removeNonNumericCharacters = (value: string): string => value.replace(/[^0-9.]/g, '');

const removeExtraDots = (value: string): string => value.replace(/(\..*?)\./g, '$1');

export const sanitizeNumericInput = (value: string): string =>
  removeExtraDots(removeNonNumericCharacters(value));
