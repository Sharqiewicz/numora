import {
  trimToMaxDecimals,
  alreadyHasDecimal,
  getSeparatorsFromOptions,
  convertCommaOrDotToDecimalSeparator,
} from '@/utils/decimals';
import { sanitizeNumoraInput, buildSanitizationOptions } from '@/utils/sanitization';
import {
  applyFormattingIfNeeded,
} from '@/utils/formatting';
import {
  getInputCaretPosition,
  updateCursorPosition,
} from '@/utils/formatting/caret-position-utils';
import { type FormattingOptions, type CaretPositionInfo, FormatOn } from '@/types';

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
  const separators = getSeparatorsFromOptions(formattingOptions);
  const inputElement = e.target as HTMLInputElement;
  const { selectionStart, selectionEnd, value } = inputElement;
  const { key } = e;

  // Convert comma or dot to decimal separator when thousandStyle is None/undefined
  if (convertCommaOrDotToDecimalSeparator(e, inputElement, formattingOptions, separators)) {
    return undefined;
  }

  if (alreadyHasDecimal(e, separators.decimalSeparator)) {
    e.preventDefault();
  }

  // Skip over thousand separator on delete/backspace (only for 'change' mode)
  if (formattingOptions?.formatOn === FormatOn.Change && formattingOptions.thousandSeparator && selectionStart !== null && selectionEnd !== null) {
    const sep = formattingOptions.thousandSeparator;

    if (selectionStart === selectionEnd) {
      // Backspace: cursor moves left, skips over separator
      if (key === 'Backspace' && selectionStart > 0 && value[selectionStart - 1] === sep) {
        inputElement.setSelectionRange(selectionStart - 1, selectionStart - 1);
        // Don't prevent default - let it delete the digit before separator
      }

      // Delete: cursor stays, skips over separator
      if (key === 'Delete' && value[selectionStart] === sep) {
        inputElement.setSelectionRange(selectionStart + 1, selectionStart + 1);
        // Don't prevent default - let it delete the digit after separator
      }
    }
  }

  if (key === 'Backspace' || key === 'Delete') {
    let endOffset = 0;

    if (key === 'Delete' && selectionStart === selectionEnd) {
      endOffset = 1;
    }

    return {
      selectionStart: selectionStart ?? 0,
      selectionEnd: selectionEnd ?? 0,
      endOffset,
    };
  }

  return undefined;
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

  const separators = getSeparatorsFromOptions(formattingOptions);
  const rawInputValue = target.value;

  const shouldRemoveThousandSeparators = formattingOptions?.formatOn === FormatOn.Change;
  target.value = sanitizeNumoraInput(
    target.value,
    buildSanitizationOptions(formattingOptions, separators, shouldRemoveThousandSeparators)
  );

  target.value = trimToMaxDecimals(target.value, decimalMaxLength, separators.decimalSeparator);

  const sanitizedValue = target.value;
  const newValue = applyFormattingIfNeeded(target, sanitizedValue, formattingOptions, separators);

  if (oldValue !== newValue) {
    updateCursorPosition(
      target,
      oldValue,
      newValue,
      oldCursorPosition,
      caretPositionBeforeChange,
      rawInputValue,
      separators,
      formattingOptions
    );
  }
}


/**
 * Handles the paste event to ensure the value does not exceed the maximum number of decimal places,
 * replaces commas with dots, and removes invalid non-numeric characters.
 *
 * @param e - The clipboard event triggered by the input.
 * @param decimalMaxLength - The maximum number of decimal places allowed.
 * @param formattingOptions - Optional formatting options
 * @returns The sanitized value after the paste event.
 */
export function handleOnPasteNumoraInput(
  e: ClipboardEvent,
  decimalMaxLength: number,
  formattingOptions?: FormattingOptions
): string {
  e.preventDefault();

  const inputElement = e.target as HTMLInputElement;
  const { value, selectionStart, selectionEnd } = inputElement;

  const separators = getSeparatorsFromOptions(formattingOptions);

  const clipboardData = e.clipboardData?.getData('text/plain') || '';
  const combinedValue =
    value.slice(0, selectionStart || 0) + clipboardData + value.slice(selectionEnd || 0);

  const sanitizedValue = sanitizeNumoraInput(
    combinedValue,
    buildSanitizationOptions(formattingOptions, separators, true)
  );

  inputElement.value = trimToMaxDecimals(sanitizedValue, decimalMaxLength, separators.decimalSeparator);

  const newCursorPosition =
    (selectionStart || 0) +
    clipboardData.length -
    (combinedValue.length - sanitizedValue.length);
  inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

  return inputElement.value;
}
