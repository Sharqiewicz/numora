import { trimToDecimalMaxLength, ensureMinDecimals, getSeparators } from '../features/decimals';
import {
  sanitizeNumoraInput,
  removeThousandSeparators,
  type ValueSource,
} from '../features/sanitization';
import { formatWithSeparators } from '../features/formatting';
import { type FormattingOptions, FormatOn } from '../types';
import { DEFAULT_GROUPING_STYLE, DEFAULT_DECIMAL_SEPARATOR } from '../config';

/**
 * Converts the field's display text (locale decimal, optional grouping) to the canonical
 * raw value: ASCII digits, `.` decimal, `-` sign, no grouping, for every locale (ADR 0004).
 * Order matters: grouping is removed BEFORE the decimal swap, because in de-DE the
 * thousand separator is `.` and the decimal separator `,` becomes `.`.
 *
 * @example
 * displayToRawValue('1.234.567,89', { decimalSeparator: ',', thousandSeparator: '.' })
 * // '1234567.89'
 */
export function displayToRawValue(
  display: string,
  options?: Pick<FormattingOptions, 'decimalSeparator' | 'thousandSeparator'>
): string {
  const decimalSeparator = options?.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR;
  const thousandSeparator = options?.thousandSeparator;
  const raw = thousandSeparator ? removeThousandSeparators(display, thousandSeparator) : display;
  return raw.split(decimalSeparator).join('.');
}

/**
 * The sanitize + decimal-trim half of `formatInputValue`, before grouping: locale text with
 * no grouping (in Change mode) and at most `decimalMaxLength` decimals. Shared with the caret
 * mapper, which runs it on the text before the caret.
 */
export function sanitizeAndTrim(
  rawValue: string,
  decimalMaxLength: number,
  formattingOptions?: FormattingOptions,
  shouldRemoveThousandSeparators?: boolean,
  source: ValueSource = 'display'
): string {
  // In 'change' mode, formatNumoraInput adds separators back, so we must remove them first to parse the number.
  // In 'blur' mode, formatNumoraInput does nothing during typing, so removing separators would be unnecessary.
  const shouldRemove =
    shouldRemoveThousandSeparators ?? formattingOptions?.formatOn === FormatOn.Change;

  // sanitizeNumoraInput treats `thousandSeparator` as the flag for separator removal:
  // pass undefined to keep separators (e.g. typing path in blur mode).
  // `foreign`/`canonical` sources are never the field's own grouped text, and detection
  // needs the configured separators, so they always get the full options.
  const sanitizeOptions =
    shouldRemove || source !== 'display'
      ? formattingOptions
      : { ...formattingOptions, thousandSeparator: undefined };
  const sanitizedValue = sanitizeNumoraInput(rawValue, sanitizeOptions, source);

  return trimToDecimalMaxLength(
    sanitizedValue,
    decimalMaxLength,
    getSeparators(formattingOptions).decimalSeparator
  );
}

/**
 * Formats a value from user input events (onChange, onBlur) by sanitizing, trimming decimals, and applying formatting.
 * The behavior adapts based on formatOn mode - removes separators in 'change' mode since they'll be re-added.
 *
 * @param rawValue - The raw input value from the user event
 * @param decimalMaxLength - Maximum number of decimal places allowed
 * @param formattingOptions - Optional formatting options
 * @param shouldRemoveThousandSeparators - Whether to remove thousand separators during sanitization (default: determined by formatOn)
 * @param source - How to read `rawValue`'s separators (see `ValueSource`). Default `'display'`.
 * @returns `formatted` (display text) and `raw` (the canonical raw value: `.` decimal, no grouping)
 */
export function formatInputValue(
  rawValue: string,
  decimalMaxLength: number,
  formattingOptions?: FormattingOptions,
  shouldRemoveThousandSeparators?: boolean,
  source: ValueSource = 'display'
): { formatted: string; raw: string } {
  const separators = getSeparators(formattingOptions);
  const sanitizedAndTrimmedValue = sanitizeAndTrim(
    rawValue,
    decimalMaxLength,
    formattingOptions,
    shouldRemoveThousandSeparators,
    source
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
        separators.decimalSeparator
      )
    : sanitizedAndTrimmedValue;

  return { formatted, raw: displayToRawValue(sanitizedAndTrimmedValue, formattingOptions) };
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
 * @param source - How to read `value` (see `ValueSource`). Default `'display'`: the field's
 *   own locale text. Pass `'canonical'` for app-supplied values (`.` is always the decimal).
 * @returns `formatted` (display text) and `raw` (canonical raw value)
 */
export function formatValueForDisplay(
  value: string,
  decimalMaxLength: number,
  formattingOptions?: FormattingOptions,
  source: ValueSource = 'display'
): { formatted: string; raw: string } {
  const shouldRemoveThousandSeparators = !!formattingOptions?.thousandSeparator;
  const { formatted, raw } = formatInputValue(
    value,
    decimalMaxLength,
    formattingOptions,
    shouldRemoveThousandSeparators,
    source
  );

  const separators = getSeparators(formattingOptions);
  const minDecimals = formattingOptions?.decimalMinLength ?? 0;

  const stripTrailingSeparator = (v: string): string =>
    v.endsWith(separators.decimalSeparator) ? v.slice(0, -1) : v;

  return {
    formatted: ensureMinDecimals(
      stripTrailingSeparator(formatted),
      minDecimals,
      separators.decimalSeparator
    ),
    // `raw` is canonical here, so its decimal separator is always '.'.
    raw: ensureMinDecimals(
      raw.endsWith('.') ? raw.slice(0, -1) : raw,
      minDecimals,
      DEFAULT_DECIMAL_SEPARATOR
    ),
  };
}

/**
 * Maps a negative value whose magnitude is exactly zero ("-0", "-0.", "-0.00", "-.0", ...)
 * to the same string with only the sign removed ("0", "0.", "0.00", ".0"). A resting
 * negative zero is not a meaningful distinct value - and left alone, `valueAsNumber` would
 * report `-0` for it indefinitely.
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
  const rest = value.slice(1);
  // All zeros once the decimal separators are dropped, and at least one zero.
  return value[0] === '-' && /^0+$/.test(rest.split(decimalSeparator).join('')) ? rest : value;
}
