import { trimToDecimalMaxLength, ensureMinDecimals, getSeparators } from '../features/decimals';
import { sanitizeNumoraInput } from '../features/sanitization';
import { formatWithSeparators } from '../features/formatting';
import { type FormattingOptions, FormatOn } from '../types';
import { DEFAULT_GROUPING_STYLE } from '../config';

/**
 * Formats a value from user input events (onChange, onBlur) by sanitizing, trimming decimals, and applying formatting.
 * The behavior adapts based on formatOn mode - removes separators in 'change' mode since they'll be re-added.
 *
 * @param rawValue - The raw input value from the user event
 * @param decimalMaxLength - Maximum number of decimal places allowed
 * @param formattingOptions - Optional formatting options
 * @param shouldRemoveThousandSeparators - Whether to remove thousand separators during sanitization (default: determined by formatOn)
 * @returns Object with formatted value and raw value (raw value is the value before formatting)
 */
export function formatInputValue(
  rawValue: string,
  decimalMaxLength: number,
  formattingOptions?: FormattingOptions,
  shouldRemoveThousandSeparators?: boolean
): { formatted: string; raw: string } {
  const separators = getSeparators(formattingOptions);

  // In 'change' mode, formatNumoraInput adds separators back, so we must remove them first to parse the number.
  // In 'blur' mode, formatNumoraInput does nothing during typing, so removing separators would be unnecessary.
  const shouldRemove =
    shouldRemoveThousandSeparators ?? formattingOptions?.formatOn === FormatOn.Change;

  // sanitizeNumoraInput treats `thousandSeparator` as the flag for separator removal:
  // pass undefined to keep separators (e.g. typing path in blur mode).
  const sanitizeOptions = shouldRemove
    ? formattingOptions
    : { ...formattingOptions, thousandSeparator: undefined };
  const sanitizedValue = sanitizeNumoraInput(rawValue, sanitizeOptions);

  const sanitizedAndTrimmedValue = trimToDecimalMaxLength(
    sanitizedValue,
    decimalMaxLength,
    separators.decimalSeparator
  );

  // decimalMinLength padding is a display/blur concern, not a typing concern - see
  // formatValueForDisplay below. Padding on every keystroke would make a 2/2 currency
  // field unable to receive cents by typing (the padded zeros immediately hit the
  // decimal-cap check).

  // Apply thousand separators only in Change mode; Blur mode formats on blur, not on every keystroke.
  const shouldFormat =
    formattingOptions?.formatOn === FormatOn.Change && !!formattingOptions.thousandSeparator;
  const formatted = shouldFormat
    ? formatWithSeparators(
        sanitizedAndTrimmedValue,
        formattingOptions.thousandSeparator as string,
        // Must mirror `config.ts`, not hardcode `None`. This function is exported from the
        // package root, so a direct caller passing only `{ thousandSeparator: ',' }` and
        // relying on the documented Thousand default silently got no grouping at all.
        formattingOptions.groupingStyle ?? DEFAULT_GROUPING_STYLE,
        formattingOptions.enableLeadingZeros,
        separators.decimalSeparator
      )
    : sanitizedAndTrimmedValue;

  return { formatted, raw: sanitizedAndTrimmedValue };
}

/**
 * Formats a value for display (e.g., initial values, controlled values, blur). Assumes the
 * value might already contain thousand separators, so removes them before processing.
 *
 * Unlike `formatInputValue` (the typing path), this pads to `decimalMinLength` and strips a
 * trailing decimal separator - both are display/blur-only concerns so a field can still
 * receive `1.` mid-entry while typing. Order: trim (inside formatInputValue) -> strip
 * trailing separator -> pad. Padding and the trailing-separator strip only ever touch the
 * fraction, so doing them after `formatInputValue` (which may already have applied grouping
 * in Change mode) is safe - e.g. "1,234." -> "1,234" -> "1,234.00".
 *
 * @param value - The value to format for display
 * @param decimalMaxLength - Maximum number of decimal places allowed
 * @param formattingOptions - Optional formatting options
 * @returns Object with formatted value and raw value
 */
export function formatValueForDisplay(
  value: string,
  decimalMaxLength: number,
  formattingOptions?: FormattingOptions
): { formatted: string; raw: string } {
  const shouldRemoveThousandSeparators = !!formattingOptions?.thousandSeparator;
  const { formatted, raw } = formatInputValue(
    value,
    decimalMaxLength,
    formattingOptions,
    shouldRemoveThousandSeparators
  );

  const separators = getSeparators(formattingOptions);
  const minDecimals = formattingOptions?.decimalMinLength ?? 0;

  const stripTrailingSeparator = (v: string): string =>
    v.endsWith(separators.decimalSeparator) ? v.slice(0, -separators.decimalSeparator.length) : v;

  return {
    formatted: ensureMinDecimals(
      stripTrailingSeparator(formatted),
      minDecimals,
      separators.decimalSeparator
    ),
    raw: ensureMinDecimals(stripTrailingSeparator(raw), minDecimals, separators.decimalSeparator),
  };
}

/**
 * Maps a negative value whose magnitude is exactly zero ("-0", "-0.", "-0.00", "-.0", ...)
 * to the same string with only the sign removed ("0", "0.", "0.00", ".0"). A resting
 * negative zero is not a meaningful distinct value - and left alone, `valueAsNumber` would
 * report `-0` for it indefinitely (see A2-11).
 *
 * Pure and narrow: any digit other than `0` anywhere in the value (or a bare `-` with
 * nothing after it) leaves the input completely untouched. Only the sign is ever dropped -
 * padding/leading zeros are preserved exactly as given.
 *
 * @param value - A sanitized numeric string (optionally signed), e.g. a field's raw value.
 * @param decimalSeparator - The configured decimal separator (e.g. '.' or ',').
 * @returns `value` unchanged, or `value` with the leading `-` removed when the magnitude is zero.
 */
export function normalizeNegativeZero(value: string, decimalSeparator: string): string {
  if (!value.startsWith('-')) return value;

  const rest = value.slice(1);
  if (!rest) return value;

  let sawZeroDigit = false;
  for (const ch of rest) {
    if (ch === '0') {
      sawZeroDigit = true;
      continue;
    }
    if (decimalSeparator && ch === decimalSeparator) continue;
    // Any other character (a nonzero digit, stray separator, etc.) means this isn't an
    // all-zero magnitude - leave the original value untouched.
    return value;
  }

  return sawZeroDigit ? rest : value;
}
