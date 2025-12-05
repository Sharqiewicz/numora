import {
  trimToMaxDecimals,
  alreadyHasDecimal,
  getSeparators,
} from '@/utils/decimals';
import { sanitizeNumoraInput } from '@/utils/sanitization';
import {
  findChangedRangeFromCaretPositions,
  findChangeRange,
  calculateCursorPositionAfterFormatting,
  formatWithSeparators,
  type thousandStyle,
  getCaretBoundary,
  type CursorPositionOptions,
} from '@/utils/formatting';
import {
  setCaretPositionWithRetry,
  getInputCaretPosition,
} from '@/utils/formatting/caret-position-utils';
import {
  defaultIsCharacterEquivalent,
} from '@/utils/formatting/character-equivalence';
import { DEFAULT_DECIMAL_SEPARATOR } from '@/config';

export interface FormattingOptions {
  formatOn?: 'blur' | 'change';
  thousandSeparator?: string;
  thousandStyle?: thousandStyle;
  enableCompactNotation?: boolean;
  enableNegative?: boolean;
  enableLeadingZeros?: boolean;
  decimalSeparator?: string;
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
export function handleOnKeyDownNumoraInput(
  e: KeyboardEvent,
  formattingOptions?: FormattingOptions
): CaretPositionInfo | undefined {
  const separators = getSeparators({
    decimalSeparator: formattingOptions?.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
    thousandSeparator: formattingOptions?.thousandSeparator,
  });

  if (alreadyHasDecimal(e, separators.decimalSeparator)) {
    e.preventDefault();
  }

  const inputElement = e.target as HTMLInputElement;
  const { selectionStart, selectionEnd, value } = inputElement;
  const { key } = e;

  // Skip over thousand separator on delete/backspace (only for 'change' mode)
  if (formattingOptions?.formatOn === 'change' && formattingOptions.thousandSeparator && selectionStart !== null && selectionEnd !== null) {
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

  const separators = getSeparators({
    decimalSeparator: formattingOptions?.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
    thousandSeparator: formattingOptions?.thousandSeparator,
  });

  // Track raw input value before any processing
  const rawInputValue = target.value;

  target.value = sanitizeNumoraInput(target.value, {
    enableCompactNotation: formattingOptions?.enableCompactNotation,
    enableNegative: formattingOptions?.enableNegative,
    enableLeadingZeros: formattingOptions?.enableLeadingZeros,
    decimalSeparator: separators.decimalSeparator,
    thousandSeparator: formattingOptions?.formatOn === 'change' ? separators.thousandSeparator : undefined,
  });

  target.value = trimToMaxDecimals(target.value, decimalMaxLength, separators.decimalSeparator);

  const sanitizedValue = target.value;

  // Step 2: Apply formatting if formatOn is 'change'
  if (formattingOptions?.formatOn === 'change' && formattingOptions.thousandSeparator) {
    const formatted = formatWithSeparators(
      sanitizedValue,
      formattingOptions.thousandSeparator,
      formattingOptions.thousandStyle || 'thousand',
      formattingOptions.enableLeadingZeros,
      separators.decimalSeparator
    );

    target.value = formatted;
    const newValue = formatted;

    // Step 3: Calculate and set cursor position
    if (caretPositionBeforeChange) {
      const { selectionStart = 0, selectionEnd = 0, endOffset = 0 } = caretPositionBeforeChange;

      // Prioritize caret-based change detection (more accurate)
      let changeRange = findChangedRangeFromCaretPositions(
        { selectionStart, selectionEnd, endOffset },
        oldValue,
        newValue
      );

      // Fallback to string comparison if caret-based detection fails
      if (!changeRange) {
        changeRange = findChangeRange(oldValue, newValue);
      }

      if (changeRange) {
        // Create caret boundary
        const boundary = getCaretBoundary(newValue, {
          thousandSeparator: formattingOptions.thousandSeparator,
          decimalSeparator: separators.decimalSeparator,
        });

        const cursorOptions: CursorPositionOptions = {
          thousandSeparator: formattingOptions.thousandSeparator,
          decimalSeparator: separators.decimalSeparator,
          isCharacterEquivalent: defaultIsCharacterEquivalent,
          rawInputValue,
          boundary,
        };

        const newCursorPosition = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          oldCursorPosition,
          formattingOptions.thousandSeparator,
          formattingOptions.thousandStyle || 'thousand',
          changeRange,
          separators.decimalSeparator,
          cursorOptions
        );

        // Use mobile browser retry mechanism
        setCaretPositionWithRetry(target, newCursorPosition, newValue);
      }
    }
  } else {
    // No real-time formatting - just handle cursor for sanitization changes
    const newValue = sanitizedValue;

    if (oldValue !== newValue && caretPositionBeforeChange) {
      const { selectionStart = 0, selectionEnd = 0, endOffset = 0 } = caretPositionBeforeChange;

      // Prioritize caret-based change detection (more accurate)
      let changeRange = findChangedRangeFromCaretPositions(
        { selectionStart, selectionEnd, endOffset },
        oldValue,
        newValue
      );

      // Fallback to string comparison if caret-based detection fails
      if (!changeRange) {
        changeRange = findChangeRange(oldValue, newValue);
      }

      if (changeRange) {
        const boundary = getCaretBoundary(newValue, {
          thousandSeparator: separators.thousandSeparator,
          decimalSeparator: separators.decimalSeparator,
        });

        const cursorOptions: CursorPositionOptions = {
          thousandSeparator: separators.thousandSeparator,
          decimalSeparator: separators.decimalSeparator,
          isCharacterEquivalent: defaultIsCharacterEquivalent,
          rawInputValue,
          boundary,
        };

        const newCursorPosition = calculateCursorPositionAfterFormatting(
          oldValue,
          newValue,
          oldCursorPosition,
          separators.thousandSeparator || ',',
          'thousand',
          changeRange,
          separators.decimalSeparator,
          cursorOptions
        );

        setCaretPositionWithRetry(target, newCursorPosition, newValue);
      }
    }
  }
}


/**
 * Handles the paste event to ensure the value does not exceed the maximum number of decimal places,
 * replaces commas with dots, and removes invalid non-numeric characters.
 *
 * @param e - The clipboard event triggered by the input.
 * @param decimalMaxLength - The maximum number of decimal places allowed.
 * @param enableCompactNotation - Optional flag to enable compact notation expansion (1k → 1000)
 * @returns The sanitized value after the paste event.
 */
export function handleOnPasteNumoraInput(
  e: ClipboardEvent,
  decimalMaxLength: number,
  enableCompactNotation?: boolean,
  enableNegative?: boolean,
  enableLeadingZeros?: boolean,
  decimalSeparator?: string,
  thousandSeparator?: string
): string {
  e.preventDefault();

  const inputElement = e.target as HTMLInputElement;
  const { value, selectionStart, selectionEnd } = inputElement;

  const separators = getSeparators({
    decimalSeparator: decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
    thousandSeparator,
  });

  const clipboardData = e.clipboardData?.getData('text/plain') || '';
  const combinedValue =
    value.slice(0, selectionStart || 0) + clipboardData + value.slice(selectionEnd || 0);

  const sanitizedValue = sanitizeNumoraInput(combinedValue, {
    enableCompactNotation,
    enableNegative,
    enableLeadingZeros,
    decimalSeparator: separators.decimalSeparator,
    thousandSeparator: separators.thousandSeparator,
  });

  inputElement.value = trimToMaxDecimals(sanitizedValue, decimalMaxLength, separators.decimalSeparator);

  const newCursorPosition =
    (selectionStart || 0) +
    clipboardData.length -
    (combinedValue.length - sanitizedValue.length);
  inputElement.setSelectionRange(newCursorPosition, newCursorPosition);

  return inputElement.value;
}
