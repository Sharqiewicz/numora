import { removeExtraDecimalSeparators } from './decimals';
import { removeNonNumericCharacters } from './non-numeric-characters';
import { expandScientificNotation } from './scientific-notation';
import { expandCompactNotation } from './compact-notation';
import { removeLeadingZeros } from './leading-zeros';
import { prependLeadingZero } from './prepend-leading-zero';
import { truncateToMaxLength } from './max-length';
import { filterMobileKeyboardArtifacts } from './mobile-keyboard-filtering';
import { normalizeFullWidthDigits } from './fullwidth-digits';
import { normalizeUnicodeMinus } from './unicode-minus';
import { getCachedRegex } from '../utils/regex-cache';
import { escapeRegExp } from '../utils/escape-reg-exp';
import type { FormattingOptions } from '../types';

/**
 * Removes all occurrences of thousand separator from a string.
 * Uses cached regex for performance optimization.
 *
 * @param value - The string to remove separators from
 * @param thousandSeparator - The thousand separator character to remove
 * @returns The string with all thousand separators removed
 */
export function removeThousandSeparators(value: string, thousandSeparator: string): string {
  return value.replace(getCachedRegex(escapeRegExp(thousandSeparator)), '');
}

/**
 * Sanitizes numeric input by:
 * 0. Filter mobile keyboard artifacts (non-breaking spaces, Unicode whitespace)
 * 1. Remove thousand separators (formatting, not data) - only when `thousandSeparator` is set
 * 2. Normalizing fullwidth digits (e.g., １２３ → 123) and non-ASCII minus signs (e.g., − → -)
 * 3. (Optional) Expanding compact notation (e.g., 1k → 1000)
 * 4. Expanding scientific notation (e.g., 1.5e-5 → 0.000015)
 * 5. Removing non-numeric characters
 * 6. Removing extra decimal points
 * 7. (Optional) Removing leading zeros
 * 8. (Optional) Prepend `0` before a bare leading decimal separator (.5 → 0.5)
 * 9. (Optional) Truncate raw to `maxLength` characters
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
  // Step 1 also strips NBSP-family whitespace (incl. U+202F, the French thousand separator
  // from Intl.NumberFormat). For NBSP-using locales this means step 2 may already be a
  // no-op by the time it runs - benign, but worth knowing when debugging locale output.
  let sanitized = filterMobileKeyboardArtifacts(value);

  // Defense-in-depth: sanitization runs synchronously inside beforeinput/paste handlers
  // that have already called preventDefault(). An unexpected throw here (e.g. an
  // adversarial expansion the individual guards didn't anticipate) would propagate out of
  // the event handler and leave the input in an undefined state. Fall back to the
  // best-effort value computed so far rather than crashing the keystroke.
  try {
    if (formattingOptions?.thousandSeparator) {
      sanitized = removeThousandSeparators(sanitized, formattingOptions.thousandSeparator);
    }

    sanitized = normalizeFullWidthDigits(sanitized);
    sanitized = normalizeUnicodeMinus(sanitized);

    if (formattingOptions?.enableCompactNotation) {
      sanitized = expandCompactNotation(sanitized, formattingOptions?.decimalSeparator);
    }

    sanitized = expandScientificNotation(sanitized, formattingOptions?.decimalSeparator);

    sanitized = removeNonNumericCharacters(
      sanitized,
      formattingOptions?.enableNegative,
      formattingOptions?.decimalSeparator
    );

    sanitized = removeExtraDecimalSeparators(sanitized, formattingOptions?.decimalSeparator);

    if (!formattingOptions?.enableLeadingZeros) {
      sanitized = removeLeadingZeros(sanitized, formattingOptions?.decimalSeparator);
    }

    if (formattingOptions?.autoAddLeadingZero) {
      sanitized = prependLeadingZero(sanitized, formattingOptions?.decimalSeparator);
    }

    if (formattingOptions?.maxLength !== undefined) {
      sanitized = truncateToMaxLength(
        sanitized,
        formattingOptions.maxLength,
        formattingOptions?.decimalSeparator
      );
    }
  } catch {
    // `sanitized` holds the last successfully-completed step's output.
    return sanitized;
  }

  return sanitized;
};
