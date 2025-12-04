import { trimToMaxDecimals, alreadyHasDecimal, replaceCommasWithDots } from '@/utils/decimals';
import { sanitizeNumericInput } from '@/utils/sanitization';
import {
  findChangedRangeFromCaretPositions,
  findChangeRange,
  calculateCursorPositionAfterFormatting,
  formatWithSeparators,
  type ThousandsGroupStyle,
} from '@/utils/formatting';

export interface FormattingOptions {
  formatOn?: 'blur' | 'change';
  thousandsSeparator?: string;
  thousandsGroupStyle?: ThousandsGroupStyle;
  shorthandParsing?: boolean;
  allowNegative?: boolean;
}


/**
 * Handles the input change event to ensure the value does not exceed the maximum number of decimal places,
 * replaces commas with dots, and removes invalid non-numeric characters.
 * Also handles cursor positioning for Delete/Backspace keys.
 * Optionally formats with thousand separators in real-time if formatOn is 'change'.
 *
 * @param e - The event triggered by the input.
 * @param maxDecimals - The maximum number of decimal places allowed.
 * @param caretPositionBeforeChange - Optional caret position info from keydown handler
 * @param formattingOptions - Optional formatting options for real-time formatting
 */
export function handleOnChangeNumericInput(
  e: Event,
  maxDecimals: number,
  caretPositionBeforeChange?: CaretPositionInfo,
  formattingOptions?: FormattingOptions
): void {
  const target = e.target as HTMLInputElement;
  const oldValue = target.value;
  const oldCursorPosition = target.selectionStart ?? 0;

  // Step 1: Sanitize the input
  if (formattingOptions?.formatOn === 'change' && formattingOptions.thousandsSeparator) {
    // In 'change' mode: remove thousands separators (they're formatting, not decimal separators)
    const escapedSeparator = formattingOptions.thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    target.value = target.value.replace(new RegExp(escapedSeparator, 'g'), '');
  } else {
    // In 'blur' mode or no formatting: convert commas to dots (comma as decimal separator)
    target.value = replaceCommasWithDots(target.value);
  }

  target.value = sanitizeNumericInput(target.value, {
    shorthandParsing: formattingOptions?.shorthandParsing,
    allowNegative: formattingOptions?.allowNegative
  });
  target.value = trimToMaxDecimals(target.value, maxDecimals);

  const sanitizedValue = target.value;

  // Step 2: Apply formatting if formatOn is 'change'
  if (formattingOptions?.formatOn === 'change' && formattingOptions.thousandsSeparator) {
    const formatted = formatWithSeparators(
      sanitizedValue,
      formattingOptions.thousandsSeparator,
      formattingOptions.thousandsGroupStyle || 'thousand'
    );

    target.value = formatted;
    const newValue = formatted;

    // Step 3: Calculate and set cursor position
    if (caretPositionBeforeChange) {
      const { selectionStart = 0, selectionEnd = 0, endOffset = 0 } = caretPositionBeforeChange;
      const changeRange = findChangedRangeFromCaretPositions(
        { selectionStart, selectionEnd, endOffset },
        oldValue,
        newValue
      );

      if (changeRange) {
        const newCursorPosition = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          oldCursorPosition,
          formattingOptions.thousandsSeparator,
          formattingOptions.thousandsGroupStyle || 'thousand',
          changeRange
        );
        target.setSelectionRange(newCursorPosition, newCursorPosition);
      } else {
        const fallbackChangeRange = findChangeRange(oldValue, newValue);
        if (fallbackChangeRange) {
          const newCursorPosition = calculateCursorPositionAfterFormatting(
            oldValue,
            newValue,
            oldCursorPosition,
            formattingOptions.thousandsSeparator,
            formattingOptions.thousandsGroupStyle || 'thousand',
            fallbackChangeRange
          );
          target.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }
    }
  } else {
    // No real-time formatting - just handle cursor for sanitization changes
    const newValue = sanitizedValue;

    if (oldValue !== newValue && caretPositionBeforeChange) {
      const { selectionStart = 0, selectionEnd = 0, endOffset = 0 } = caretPositionBeforeChange;
      const changeRange = findChangedRangeFromCaretPositions(
        { selectionStart, selectionEnd, endOffset },
        oldValue,
        newValue
      );

      if (changeRange) {
        const newCursorPosition = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          oldCursorPosition,
          ',',
          'thousand',
          changeRange
        );
        target.setSelectionRange(newCursorPosition, newCursorPosition);
      } else {
        const fallbackChangeRange = findChangeRange(oldValue, newValue);
        if (fallbackChangeRange) {
          const newCursorPosition = calculateCursorPositionAfterFormatting(
            oldValue,
            newValue,
            oldCursorPosition,
            ',',
            'thousand',
            fallbackChangeRange
          );
          target.setSelectionRange(newCursorPosition, newCursorPosition);
        }
      }
    }
  }
}

export interface CaretPositionInfo {
  selectionStart?: number;
  selectionEnd?: number;
  endOffset?: number;
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
export function handleOnKeyDownNumericInput(
  e: KeyboardEvent,
  formattingOptions?: FormattingOptions
): CaretPositionInfo | undefined {
  if (alreadyHasDecimal(e)) {
    e.preventDefault();
  }

  const inputElement = e.target as HTMLInputElement;
  const { selectionStart, selectionEnd, value } = inputElement;
  const { key } = e;

  // Skip over thousand separator on delete/backspace (only for 'change' mode)
  if (formattingOptions?.formatOn === 'change' && formattingOptions.thousandsSeparator && selectionStart !== null && selectionEnd !== null) {
    const sep = formattingOptions.thousandsSeparator;

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
 * Handles the paste event to ensure the value does not exceed the maximum number of decimal places,
 * replaces commas with dots, and removes invalid non-numeric characters.
 *
 * @param e - The clipboard event triggered by the input.
 * @param maxDecimals - The maximum number of decimal places allowed.
 * @param shorthandParsing - Optional flag to enable shorthand expansion (1k → 1000)
 * @returns The sanitized value after the paste event.
 */
export function handleOnPasteNumericInput(
  e: ClipboardEvent,
  maxDecimals: number,
  shorthandParsing?: boolean,
  allowNegative?: boolean
): string {
  const inputElement = e.target as HTMLInputElement;
  const { value, selectionStart, selectionEnd } = inputElement;

  const sanitizedClipboardData = sanitizeNumericInput(
    e.clipboardData?.getData('text/plain') || '',
    { shorthandParsing, allowNegative }
  );

  const combinedValue =
    value.slice(0, selectionStart || 0) + sanitizedClipboardData + value.slice(selectionEnd || 0);

  const sanitizedCombined = sanitizeNumericInput(combinedValue, {
    shorthandParsing,
    allowNegative
  });

  const isNegative = sanitizedCombined.startsWith('-');
  const absoluteValue = isNegative ? sanitizedCombined.slice(1) : sanitizedCombined;
  const [integerPart, ...decimalParts] = absoluteValue.split('.');
  const sanitizedValue = (isNegative ? '-' : '') + integerPart + (decimalParts.length > 0 ? '.' + decimalParts.join('') : '');

  e.preventDefault();
  inputElement.value = trimToMaxDecimals(sanitizedValue, maxDecimals);

  const newCursorPosition =
    (selectionStart || 0) +
    sanitizedClipboardData.length -
    (combinedValue.length - sanitizedValue.length);
  inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

  return trimToMaxDecimals(sanitizedValue, maxDecimals);
}
