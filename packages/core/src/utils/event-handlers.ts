import {
  getSeparators,
  handleDecimalSeparatorKey,
} from '@/features/decimals';
import {
  getInputCaretPosition,
  updateCursorPosition,
  skipOverThousandSeparatorOnDelete,
} from '@/features/formatting';
import { type FormattingOptions, type CaretPositionInfo, FormatOn } from '@/types';
import { formatInputValue } from './format-utils';

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

  if (handleDecimalSeparatorKey(e, inputElement, formattingOptions, decimalSeparator)) {
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
 * @returns Object with formatted value and raw value
 */
export function handleOnChangeNumoraInput(
  e: Event,
  decimalMaxLength: number,
  caretPositionBeforeChange?: CaretPositionInfo,
  formattingOptions?: FormattingOptions
): { formatted: string; raw: string } {
  const target = e.target as HTMLInputElement;
  const oldValue = target.value;
  const oldCursorPosition = getInputCaretPosition(target);
  const separators = getSeparators(formattingOptions);

  // In 'change' mode, formatNumoraInput adds separators back, so we must remove them first to parse the number.
  // In 'blur' mode, formatNumoraInput does nothing during typing, so removing separators would be unnecessary.
  const shouldRemoveThousandSeparators = formattingOptions?.formatOn === FormatOn.Change;

  const { formatted: newValue, raw: rawValue } = formatInputValue(
    oldValue,
    decimalMaxLength,
    formattingOptions,
    shouldRemoveThousandSeparators
  );

  target.value = newValue;

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

  return { formatted: newValue, raw: rawValue };
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
): { formatted: string; raw: string } {
  // Prevent default paste to handle it manually with sanitization, formatting, and proper cursor positioning.
  e.preventDefault();

  const inputElement = e.target as HTMLInputElement;
  const { value, selectionStart, selectionEnd } = inputElement;

  const clipboardData = e.clipboardData?.getData('text/plain') || '';
  const combinedValue =
    value.slice(0, selectionStart || 0) + clipboardData + value.slice(selectionEnd || 0);

  // Always remove thousand separators during paste: pasted content may contain separators, current value may
  // have separators (blur mode), and we need to parse the combined value correctly.
  const { formatted: formattedValue, raw: rawValue } = formatInputValue(
    combinedValue,
    decimalMaxLength,
    formattingOptions,
    true
  );

  inputElement.value = formattedValue;

  const newCursorPosition = calculateCursorPositionAfterPaste(
    selectionStart || 0,
    clipboardData.length,
    combinedValue.length,
    formattedValue.length
  );

  inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

  return { formatted: formattedValue, raw: rawValue };
}
