import { removeExtraDots } from './decimals';
import { removeNonNumericCharacters } from './nonNumericCharacters';
import { expandScientificNotation } from './scientific-notation';




/**
 * Sanitizes numeric input by:
 * 1. Expanding scientific notation (e.g., 1.5e-7 → 0.00000015)
 * 2. Removing non-numeric characters
 * 3. Removing extra decimal points
 *
 * @param value - The string value to sanitize
 * @returns The sanitized numeric string
 */
export const sanitizeNumericInput = (value: string): string => {
  const expanded = expandScientificNotation(value);
  const cleaned = removeNonNumericCharacters(expanded);
  return removeExtraDots(cleaned);
};
