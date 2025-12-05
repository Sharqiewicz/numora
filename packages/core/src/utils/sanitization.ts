import { removeExtraDecimalSeparators } from './decimals';
import { removeNonNumericCharacters } from './non-numeric-characters';
import { expandScientificNotation } from './scientific-notation';
import { expandCompactNotation } from './compact-notation';
import { removeLeadingZeros } from './leading-zeros';
import { filterMobileKeyboardArtifacts } from './mobile-keyboard-filtering';

export interface SanitizationOptions {
  enableCompactNotation?: boolean;
  enableNegative?: boolean;
  enableLeadingZeros?: boolean;
  decimalSeparator?: string;
  thousandSeparator?: string;
}

/**
 * Sanitizes numeric input by:
 * 0. Filter mobile keyboard artifacts (non-breaking spaces, Unicode whitespace)
 * 1. Remove thousand separators (formatting, not data)
 * 2. (Optional) Expanding compact notation (e.g., 1k → 1000)
 * 3. Expanding scientific notation (e.g., 1.5e-5 → 0.000015)
 * 4. Removing non-numeric characters
 * 5. Removing extra decimal points
 * 6. (Optional) Removing leading zeros
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

  // Step 1: Remove thousand separators (they're formatting, not data)
  if (options?.thousandSeparator) {
    const escapedSeparator = options.thousandSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    sanitized = sanitized.replace(new RegExp(escapedSeparator, 'g'), '');
  }

  // Step 2: Expand compact notation FIRST (if enabled)
  if (options?.enableCompactNotation) {
    sanitized = expandCompactNotation(sanitized);
  }

  // Step 3: Expand scientific notation
  sanitized = expandScientificNotation(sanitized);

  // Step 4: Remove non-numeric characters
  sanitized = removeNonNumericCharacters(
    sanitized,
    options?.enableNegative,
    options?.decimalSeparator
  );

  // Step 5: Remove extra decimal separators
  sanitized = removeExtraDecimalSeparators(sanitized, options?.decimalSeparator || '.');

  // Step 6: Remove leading zeros (if not allowed)
  if (!options?.enableLeadingZeros) {
    sanitized = removeLeadingZeros(sanitized);
  }

  return sanitized;
};
