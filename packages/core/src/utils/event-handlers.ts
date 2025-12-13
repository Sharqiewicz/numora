import {
  trimToDecimalMaxLength,
  ensureMinDecimals,
  getSeparators,
  convertCommaOrDotToDecimalSeparatorAndPreventMultimpleDecimalSeparators,
} from '@/features/decimals';
import { sanitizeNumoraInput, buildSanitizationOptions } from '@/features/sanitization';
import {
  getInputCaretPosition,
  updateCursorPosition,
  formatNumoraInput,
  skipOverThousandSeparatorOnDelete,
} from '@/features/formatting';
import { type FormattingOptions, type CaretPositionInfo, FormatOn } from '@/types';


/**
 * Processes and formats a numeric input value by sanitizing, trimming decimals, and applying formatting.
 *
 * @param rawValue - The raw input value to process
 * @param decimalMaxLength - Maximum number of decimal places allowed
 * @param shouldRemoveThousandSeparators - Whether to remove thousand separators during sanitization
 * @param formattingOptions - Optional formatting options
 * @param separators - Separator configuration
 * @returns Object with formatted value and raw value (raw value is the value before formatting)
 */
function processAndFormatValue(
  rawValue: string,
  decimalMaxLength: number,
  shouldRemoveThousandSeparators: boolean,
  formattingOptions: FormattingOptions | undefined,
  separators: ReturnType<typeof getSeparators>
): { formatted: string; raw: string } {
  const sanitizedValue = sanitizeNumoraInput(
    rawValue,
    buildSanitizationOptions(formattingOptions, separators, shouldRemoveThousandSeparators)
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
 * Calculates the end offset for the caret position.
 * @param key - The key pressed.
 * @param selectionStart - The selection start position.
 * @param selectionEnd - The selection end position.
 * @returns The end offset.
 */
function calculateEndOffset(key: string, selectionStart: number | null, selectionEnd: number | null) {
  if (key === 'Backspace' || key === 'Delete') {

    if (key === 'Delete' && selectionStart === selectionEnd) {
      return {
        endOffset: 1
      };
    }

    return {
      endOffset: 0
    };

  }
}

/**
 * Handles the keydown event to prevent the user from entering a second decimal point.
 * Also tracks selection info for Delete/Backspace keys to enable proper cursor positioning.
 * In 'change' mode with formatting, skips cursor over thousand separators on delete/backspace.
 *
 * @param e - The keyboard event triggered by the input.
 * @param formattingOptions - Optional formatting options for separator skipping
 * @returns Caret position info if Delete/Backspace was pressed, undefined otherwise
 */
export function handleOnKeyDownNumoraInput(
  e: KeyboardEvent,
  formattingOptions?: FormattingOptions
): CaretPositionInfo | undefined {

  const { decimalSeparator } = getSeparators(formattingOptions);
  const inputElement = e.target as HTMLInputElement;

  if (convertCommaOrDotToDecimalSeparatorAndPreventMultimpleDecimalSeparators(e, inputElement, formattingOptions, decimalSeparator)) {
    e.preventDefault();
    return;
  }

  skipOverThousandSeparatorOnDelete(e, inputElement, formattingOptions);

  return calculateEndOffset(e.key, inputElement.selectionStart, inputElement.selectionEnd)

}

/**
 * Handles the input change event to ensure the value does not exceed the maximum number of decimal places,
 * replaces commas with dots, and removes invalid non-numeric characters.
 * Also handles cursor positioning for Delete/Backspace keys.
 * Optionally formats with thousand separators in real-time if formatOn is 'change'.
 *
 * @param e - The event triggered by the input.
 * @param decimalMaxLength - The maximum number of decimal places allowed.
 * @param caretPositionBeforeChange - Optional caret position info from keydown handler
 * @param formattingOptions - Optional formatting options for real-time formatting
 */
export function handleOnChangeNumoraInput(
  e: Event,
  decimalMaxLength: number,
  caretPositionBeforeChange?: CaretPositionInfo,
  formattingOptions?: FormattingOptions
): void {
  const target = e.target as HTMLInputElement;
  const oldValue = target.value;
  const oldCursorPosition = getInputCaretPosition(target);
  const separators = getSeparators(formattingOptions);

  // In 'change' mode, formatNumoraInput adds separators back, so we must remove them first to parse the number.
  // In 'blur' mode, formatNumoraInput does nothing during typing, so removing separators would be unnecessary.
  const shouldRemoveThousandSeparators = formattingOptions?.formatOn === FormatOn.Change;

  const { formatted: newValue, raw: rawValue } = processAndFormatValue(
    oldValue,
    decimalMaxLength,
    shouldRemoveThousandSeparators,
    formattingOptions,
    separators
  );

  target.value = newValue;

  // Store raw value in a data attribute if rawValueMode is enabled (for NumoraInput to access)
  if (formattingOptions?.rawValueMode) {
    target.setAttribute('data-raw-value', rawValue);
  }

  if (oldValue !== newValue) {
    updateCursorPosition(
      target,
      oldValue,
      newValue,
      oldCursorPosition,
      caretPositionBeforeChange,
      separators,
      formattingOptions
    );
  }
}


/**
 * Calculates the cursor position after paste, accounting for the net change in value length.
 *
 * @param selectionStart - The selection start position before paste
 * @param clipboardDataLength - Length of the pasted clipboard data
 * @param combinedValueLength - Length of the combined value (current + pasted)
 * @param formattedLength - Length after sanitization and formatting
 * @returns The new cursor position
 */
function calculateCursorPositionAfterPaste(
  selectionStart: number,
  clipboardDataLength: number,
  combinedValueLength: number,
  formattedLength: number
): number {
  const netLengthChange = formattedLength - combinedValueLength;
  return selectionStart + clipboardDataLength + netLengthChange;
}

export function handleOnPasteNumoraInput(
  e: ClipboardEvent,
  decimalMaxLength: number,
  formattingOptions?: FormattingOptions
): string {
  // Prevent default paste to handle it manually with sanitization, formatting, and proper cursor positioning.
  e.preventDefault();

  const inputElement = e.target as HTMLInputElement;
  const { value, selectionStart, selectionEnd } = inputElement;
  const separators = getSeparators(formattingOptions);

  const clipboardData = e.clipboardData?.getData('text/plain') || '';
  const combinedValue =
    value.slice(0, selectionStart || 0) + clipboardData + value.slice(selectionEnd || 0);

  // Always remove thousand separators during paste: pasted content may contain separators, current value may
  // have separators (blur mode), and we need to parse the combined value correctly.
  const { formatted: formattedValue, raw: rawValue } = processAndFormatValue(
    combinedValue,
    decimalMaxLength,
    true,
    formattingOptions,
    separators
  );

  inputElement.value = formattedValue;

  // Store raw value in a data attribute if rawValueMode is enabled (for NumoraInput to access)
  if (formattingOptions?.rawValueMode) {
    inputElement.setAttribute('data-raw-value', rawValue);
  }

  const newCursorPosition = calculateCursorPositionAfterPaste(
    selectionStart || 0,
    clipboardData.length,
    combinedValue.length,
    formattedValue.length
  );

  inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

  return inputElement.value;
}

/**
 * Formats a value programmatically using Numora's full pipeline.
 * This is useful for formatting values that are set externally (e.g., from props in React).
 *
 * @param value - The raw value to format
 * @param maxDecimals - Maximum number of decimal places allowed
 * @param formattingOptions - Formatting options (formatOn, thousandSeparator, etc.)
 * @returns The formatted value string
 */
export function formatValueForNumora(
  value: string,
  maxDecimals: number,
  formattingOptions?: FormattingOptions
): string {
  if (!value) {
    return value;
  }

  const separators = getSeparators(formattingOptions);

  // For programmatic values, we should remove thousand separators first
  // since the value might already be formatted or might contain separators
  const shouldRemoveThousandSeparators = true;

  const { formatted } = processAndFormatValue(
    value,
    maxDecimals,
    shouldRemoveThousandSeparators,
    formattingOptions,
    separators
  );

  return formatted;
}

/**
 * Formats a value programmatically and returns both formatted and raw values.
 * This is useful when you need both the formatted display value and the raw numeric value.
 *
 * @param value - The raw value to format
 * @param maxDecimals - Maximum number of decimal places allowed
 * @param formattingOptions - Formatting options (formatOn, thousandSeparator, etc.)
 * @returns Object with formatted value and raw value
 */
export function formatValueForNumoraWithRaw(
  value: string,
  maxDecimals: number,
  formattingOptions?: FormattingOptions
): { formatted: string; raw: string } {
  if (!value) {
    return { formatted: value, raw: value };
  }

  const separators = getSeparators(formattingOptions);

  // For programmatic values, we should remove thousand separators first
  // since the value might already be formatted or might contain separators
  const shouldRemoveThousandSeparators = true;

  return processAndFormatValue(
    value,
    maxDecimals,
    shouldRemoveThousandSeparators,
    formattingOptions,
    separators
  );
}
