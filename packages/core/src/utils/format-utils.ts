import {
  trimToDecimalMaxLength,
  ensureMinDecimals,
  getSeparators,
} from '@/features/decimals';
import { sanitizeNumoraInput, buildSanitizationOptions } from '@/features/sanitization';
import { formatNumoraInput } from '@/features/formatting';
import { type FormattingOptions, FormatOn } from '@/types';

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
    shouldRemoveThousandSeparators ??
    (formattingOptions?.formatOn === FormatOn.Change);

  const sanitizedValue = sanitizeNumoraInput(
    rawValue,
    buildSanitizationOptions(formattingOptions, separators, shouldRemove)
  );

  const sanitizedAndTrimmedValue = trimToDecimalMaxLength(
    sanitizedValue,
    decimalMaxLength,
    separators.decimalSeparator
  );

  const minDecimals = formattingOptions?.decimalMinLength ?? 0;
  const valueWithMinDecimals = ensureMinDecimals(
    sanitizedAndTrimmedValue,
    minDecimals,
    separators.decimalSeparator
  );

  // Raw value is the value before formatting (after sanitization, trimming, min decimals)
  const raw = valueWithMinDecimals;

  // Formatted value includes thousand separators if formatting is enabled
  const formatted = formatNumoraInput(valueWithMinDecimals, formattingOptions, separators);

  return { formatted, raw };
}

/**
 * Formats a value for display (e.g., initial values, controlled values).
 * Assumes the value might already contain thousand separators, so removes them before processing.
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
  return formatInputValue(
    value,
    decimalMaxLength,
    formattingOptions,
    shouldRemoveThousandSeparators
  );
}