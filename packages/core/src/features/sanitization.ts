import { removeExtraDecimalSeparators } from './decimals';
import { removeNonNumericCharacters } from './non-numeric-characters';
import { expandScientificNotation } from './scientific-notation';
import { expandCompactNotation } from './compact-notation';
import { removeLeadingZeros } from './leading-zeros';
import { filterMobileKeyboardArtifacts } from './mobile-keyboard-filtering';
import { normalizeFullWidthDigits } from './fullwidth-digits';
import { getCachedSeparatorRegex } from '../utils/regex-cache';
import type { FormattingOptions } from '@/types';

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

/**
 * Sanitizes numeric input by:
 * 0. Filter mobile keyboard artifacts (non-breaking spaces, Unicode whitespace)
 * 1. Remove thousand separators (formatting, not data) - only when `thousandSeparator` is set
 * 2. Normalizing fullwidth digits (e.g., １２３ → 123)
 * 3. (Optional) Expanding compact notation (e.g., 1k → 1000)
 * 4. Expanding scientific notation (e.g., 1.5e-5 → 0.000015)
 * 5. Removing non-numeric characters
 * 6. Removing extra decimal points
 * 7. (Optional) Removing leading zeros
 *
 * Note: Decimal separator conversion (comma ↔ dot) is handled in the beforeinput event
 * (handleOnBeforeInputNumoraInput), not here, to avoid converting thousand separators.
 *
 * `formattingOptions.thousandSeparator` doubles as a flag: pass it to strip separators,
 * leave it undefined to keep them. Callers that want to short-circuit removal (e.g.
 * formatOn === 'blur' on the typing path) should set thousandSeparator to undefined.
 */
export const sanitizeNumoraInput = (
  value: string,
  formattingOptions?: FormattingOptions
): string => {
  let sanitized = filterMobileKeyboardArtifacts(value);

  if (formattingOptions?.thousandSeparator) {
    sanitized = removeThousandSeparators(sanitized, formattingOptions.thousandSeparator);
  }

  sanitized = normalizeFullWidthDigits(sanitized);

  if (formattingOptions?.enableCompactNotation) {
    sanitized = expandCompactNotation(sanitized);
  }

  sanitized = expandScientificNotation(sanitized);

  sanitized = removeNonNumericCharacters(
    sanitized,
    formattingOptions?.enableNegative,
    formattingOptions?.decimalSeparator
  );

  sanitized = removeExtraDecimalSeparators(sanitized, formattingOptions?.decimalSeparator);

  if (!formattingOptions?.enableLeadingZeros) {
    sanitized = removeLeadingZeros(sanitized);
  }

  return sanitized;
};
