import { removeExtraDots } from './decimals';
import { removeNonNumericCharacters } from './nonNumericCharacters';
import { expandScientificNotation } from './scientific-notation';
import { expandShorthand } from './shorthand';

export interface SanitizationOptions {
  shorthandParsing?: boolean;
  allowNegative?: boolean;
}

/**
 * Sanitizes numeric input by:
 * 1. (Optional) Expanding shorthand notation (e.g., 1k → 1000)
 * 2. Expanding scientific notation (e.g., 1.5e-5 → 0.000015)
 * 3. Removing non-numeric characters
 * 4. Removing extra decimal points
 *
 * @param value - The string value to sanitize
 * @param options - Optional sanitization configuration
 * @returns The sanitized numeric string
 */
export const sanitizeNumericInput = (
  value: string,
  options?: SanitizationOptions
): string => {
  // Step 1: Expand shorthand FIRST (if enabled)
  let sanitized = value;
  if (options?.shorthandParsing) {
    sanitized = expandShorthand(sanitized);
  }

  // Step 2: Expand scientific notation
  sanitized = expandScientificNotation(sanitized);

  // Step 3: Remove non-numeric characters
  sanitized = removeNonNumericCharacters(sanitized, options?.allowNegative);

  // Step 4: Remove extra dots
  return removeExtraDots(sanitized);
};
