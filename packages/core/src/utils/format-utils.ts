import {
  trimToDecimalMaxLength,
  ensureMinDecimals,
  getSeparators,
} from '@/features/decimals';
import { sanitizeNumoraInput, buildSanitizationOptions } from '@/features/sanitization';
import { formatNumoraInput } from '@/features/formatting';
import { type FormattingOptions, FormatOn } from '@/types';

/**
 * Processes and formats a numeric input value by sanitizing, trimming decimals, and applying formatting.
 * This is a pure function that doesn't require DOM elements or events.
 *
 * @param rawValue - The raw input value to process
 * @param decimalMaxLength - Maximum number of decimal places allowed
 * @param formattingOptions - Optional formatting options
 * @param shouldRemoveThousandSeparators - Whether to remove thousand separators during sanitization (default: determined by formatOn)
 * @returns Object with formatted value and raw value (raw value is the value before formatting)
 */
export function processAndFormatValue(
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
 * Formats a value for display using the provided formatting options.
 * This is a pure function that can be used without DOM events.
 *
 * @param value - The value to format
 * @param decimalMaxLength - Maximum number of decimal places allowed
 * @param formattingOptions - Optional formatting options
 * @returns Object with formatted value and raw value
 */
export function formatValue(
  value: string,
  decimalMaxLength: number,
  formattingOptions?: FormattingOptions
): { formatted: string; raw: string } {
  // For pure formatting (not from an input event), we should remove separators
  // if they exist, since the value might already be formatted
  const shouldRemoveThousandSeparators = !!formattingOptions?.thousandSeparator;
  return processAndFormatValue(
    value,
    decimalMaxLength,
    formattingOptions,
    shouldRemoveThousandSeparators
  );
}