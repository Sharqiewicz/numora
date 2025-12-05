import { removeExtraDecimalSeparators } from './decimals';
import { removeNonNumericCharacters } from './non-numeric-characters';
import { expandScientificNotation } from './scientific-notation';
import { expandShorthand } from './shorthand';
import { removeLeadingZeros } from './leading-zeros';
import { filterMobileKeyboardArtifacts } from './mobile-keyboard-filtering';

export interface SanitizationOptions {
  shorthandParsing?: boolean;
  allowNegative?: boolean;
  allowLeadingZeros?: boolean;
  decimalSeparator?: string;
  allowedDecimalSeparators?: string[];
}

/**
 * Sanitizes numeric input by:
 * 1. (Optional) Expanding shorthand notation (e.g., 1k → 1000)
 * 2. Expanding scientific notation (e.g., 1.5e-5 → 0.000015)
 * 3. Removing non-numeric characters
 * 4. Removing extra decimal points
 * 5. (Optional) Removing leading zeros
 *
 * @param value - The string value to sanitize
 * @param options - Optional sanitization configuration
 * @returns The sanitized numeric string
 */
export const sanitizeNumoraInput = (
  value: string,
  options?: SanitizationOptions
): string => {
  // Step 0: Filter mobile keyboard artifacts (non-breaking spaces, Unicode whitespace)
  let sanitized = filterMobileKeyboardArtifacts(value);

  // Step 1: Expand shorthand FIRST (if enabled)
  if (options?.shorthandParsing) {
    sanitized = expandShorthand(sanitized);
  }

  // Step 2: Expand scientific notation
  sanitized = expandScientificNotation(sanitized);

  // Step 3: Remove non-numeric characters
  sanitized = removeNonNumericCharacters(
    sanitized,
    options?.allowNegative,
    options?.allowedDecimalSeparators
  );

  // Step 4: Remove extra decimal separators
  sanitized = removeExtraDecimalSeparators(sanitized, options?.decimalSeparator || '.');

  // Step 5: Remove leading zeros (if not allowed)
  if (!options?.allowLeadingZeros) {
    sanitized = removeLeadingZeros(sanitized);
  }

  return sanitized;
};
