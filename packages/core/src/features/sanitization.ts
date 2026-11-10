import { removeExtraDecimalSeparators } from './decimals';
import { removeNonNumericCharacters } from './non-numeric-characters';
import { expandScientificNotation } from './scientific-notation';
import { expandCompactNotation } from './compact-notation';
import { removeLeadingZeros } from './leading-zeros';
import { prependLeadingZero } from './prepend-leading-zero';
import { truncateToMaxLength } from './max-length';
import { filterMobileKeyboardArtifacts } from './mobile-keyboard-filtering';
import { normalizeDigits } from './fullwidth-digits';
import { normalizeUnicodeMinus } from './unicode-minus';
import { normalizeDecimalSeparators } from './decimal-separators';
import { normalizeForeignFormat, canonicalToDisplayText } from './foreign-format';
import type { NumoraOptions } from '../types';

// Upper bound on the raw input length sanitization will ever process. No numeric input a
// person types or pastes is longer than this, and capping here bounds every downstream
// step (including the two regex/scan-based expansions) against a pathological paste.
const MAX_INPUT_LENGTH = 10_000;

/**
 * Where a string handed to the pipeline came from, which decides how its `.` and `,` are read.
 *
 * - `display` (default): the field's own locale text (typing, blur, the DOM value).
 *   `thousandSeparator` groups, `decimalSeparator` is the decimal.
 * - `foreign`: text of unknown format (paste, autofill, browser-inserted text). Read with
 *   foreign-format detection (ADR 0006), then continues as locale text.
 * - `canonical`: a value supplied by the app (`value`, `defaultValue`, `setValue`). `.` is
 *   ALWAYS the decimal (ADR 0004), never grouping and never detected.
 *
 * The output is always locale text (field decimal separator, no grouping); the
 * canonical raw value is derived from it with `displayToRawValue`.
 */
export type ValueSource = 'display' | 'foreign' | 'canonical';

/**
 * Removes all occurrences of thousand separator from a string.
 *
 * @param value - The string to remove separators from
 * @param thousandSeparator - The thousand separator character to remove
 * @returns The string with all thousand separators removed
 */
export function removeThousandSeparators(value: string, thousandSeparator?: string): string {
  // The separator is exactly one character, so split/join is a literal replace-all: no regex
  // to build, escape or cache.
  return thousandSeparator ? value.split(thousandSeparator).join('') : value;
}

/**
 * Sanitizes numeric input by:
 * 0. Capping the raw input to `MAX_INPUT_LENGTH` characters - bounds every downstream
 *    step (including the regex/scan-based notation expansions) against a pathological
 *    paste or keystroke
 * 1. Filter mobile keyboard artifacts (non-breaking spaces, Unicode whitespace)
 * 1b. Read the text per `source` (foreign-format detection / canonical `.` decimal)
 * 2. Remove thousand separators (formatting, not data) - only when `thousandSeparator` is set
 * 3. Normalizing fullwidth digits (e.g., １２３ → 123), non-ASCII minus signs (e.g., − → -),
 *    and non-ASCII decimal-separator glyphs (e.g., Arabic ٫ or fullwidth ， → the configured
 *    `decimalSeparator`) - see `normalizeDecimalSeparators` for the full glyph table
 * 4. (Optional) Expanding compact notation (e.g., 1k → 1000)
 * 5. Expanding scientific notation (e.g., 1.5e-5 → 0.000015)
 * 6. Removing non-numeric characters
 * 7. Removing extra decimal points
 * 8. (Optional) Removing leading zeros
 * 9. (Optional) Prepend `0` before a bare leading decimal separator (.5 → 0.5)
 * 10. (Optional) Truncate raw to `maxLength` characters
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
  formattingOptions?: NumoraOptions,
  source: ValueSource = 'display'
): string => {
  const decimalSeparator = formattingOptions?.decimalSeparator;

  // Step 1 also strips NBSP-family whitespace (incl. U+202F, the French thousand separator
  // from Intl.NumberFormat). For NBSP-using locales this means step 2 may already be a
  // no-op by the time it runs - benign, but worth knowing when debugging locale output.
  // Step 0 (slice is a no-op for anything shorter).
  let sanitized = filterMobileKeyboardArtifacts(value.slice(0, MAX_INPUT_LENGTH));

  // Source handling comes first so every later step sees plain locale text.
  if (source !== 'display') {
    sanitized = canonicalToDisplayText(
      source === 'foreign' ? normalizeForeignFormat(sanitized, formattingOptions) : sanitized,
      decimalSeparator
    );
  }

  sanitized = removeThousandSeparators(sanitized, formattingOptions?.thousandSeparator);

  sanitized = normalizeDecimalSeparators(
    normalizeUnicodeMinus(normalizeDigits(sanitized)),
    decimalSeparator
  );

  if (formattingOptions?.allowCompactNotation) {
    sanitized = expandCompactNotation(sanitized, decimalSeparator);
  }

  sanitized = expandScientificNotation(sanitized, decimalSeparator);

  sanitized = removeNonNumericCharacters(sanitized, formattingOptions?.allowNegative, decimalSeparator);

  sanitized = removeExtraDecimalSeparators(sanitized, decimalSeparator);

  if (!formattingOptions?.allowLeadingZeros) {
    sanitized = removeLeadingZeros(sanitized, decimalSeparator);
  }

  if (formattingOptions?.padLeadingZero) {
    sanitized = prependLeadingZero(sanitized, decimalSeparator);
  }

  if (formattingOptions?.maxLength !== undefined) {
    sanitized = truncateToMaxLength(sanitized, formattingOptions.maxLength, decimalSeparator);
  }

  return sanitized;
};
