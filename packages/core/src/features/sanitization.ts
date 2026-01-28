import { removeExtraDecimalSeparators } from './decimals';
import { removeNonNumericCharacters } from './non-numeric-characters';
import { expandScientificNotation } from './scientific-notation';
import { expandCompactNotation } from './compact-notation';
import { removeLeadingZeros } from './leading-zeros';
import { filterMobileKeyboardArtifacts } from './mobile-keyboard-filtering';
import { getCachedSeparatorRegex } from '../utils/regex-cache';
import type { FormattingOptions, Separators } from '@/types';
import { DEFAULT_DECIMAL_SEPARATOR } from '@/config';

/**
 * Removes all occurrences of thousand separator from a string.
 * Uses cached regex for performance optimization.
 *
 * @param value - The string to remove separators from
 * @param thousandSeparator - The thousand separator character to remove
 * @returns The string with all thousand separators removed
 */
export function removeThousandSeparators(value: string, thousandSeparator: string): string {
  const regex = getCachedSeparatorRegex(thousandSeparator);
  return value.replace(regex, '');
}

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
 * Note: Decimal separator conversion (comma ↔ dot) is handled in the keydown event
 * (handleDecimalSeparatorKey), not here, to avoid converting thousand separators.
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
  // Note: Decimal separator conversion is handled in keydown event (handleDecimalSeparatorKey),
  // not here, to avoid converting thousand separators that were added by formatting.
  if (options?.thousandSeparator) {
    sanitized = removeThousandSeparators(sanitized, options.thousandSeparator);
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
  sanitized = removeExtraDecimalSeparators(sanitized, options?.decimalSeparator || DEFAULT_DECIMAL_SEPARATOR);

  // Step 6: Remove leading zeros (if not allowed)
  if (!options?.enableLeadingZeros) {
    sanitized = removeLeadingZeros(sanitized);
  }

  return sanitized;
};

/**
 * Builds sanitization options from formatting options and separators.
 *
 * @param formattingOptions - Optional formatting options
 * @param separators - Separator configuration
 * @param shouldRemoveThousandSeparators - Whether to remove thousand separators
 * @returns Sanitization options
 */
export function buildSanitizationOptions(
  formattingOptions: FormattingOptions | undefined,
  separators: Separators,
  shouldRemoveThousandSeparators: boolean
): SanitizationOptions {
  return {
    enableCompactNotation: formattingOptions?.enableCompactNotation,
    enableNegative: formattingOptions?.enableNegative,
    enableLeadingZeros: formattingOptions?.enableLeadingZeros,
    decimalSeparator: separators.decimalSeparator,
    thousandSeparator: shouldRemoveThousandSeparators ? separators.thousandSeparator : undefined,
  };
}
