import { getSeparators } from '@/features/decimals';
import {
  getInputCaretPosition,
  updateCursorPosition,
  skipOverThousandSeparatorOnDelete,
} from '@/features/formatting';
import { type FormattingOptions, type CaretPositionInfo, FormatOn, InputType } from '@/types';
import { formatInputValue } from './format-utils';

/**
 * Handles the beforeinput event to format the value before it is applied to the DOM.
 *
 * Returns null for paste events so the dedicated paste handler can process them.
 *
 * @param e - The InputEvent (beforeinput)
 * @param decimalMaxLength - The maximum number of decimal places allowed
 * @param formattingOptions - Optional formatting options
 * @returns Object with formatted and raw values, or null if the event should be handled natively
 */
export function handleOnBeforeInputNumoraInput(
  e: InputEvent,
  decimalMaxLength: number,
  formattingOptions?: FormattingOptions
): { formatted: string; raw: string } | null {
  // Paste is handled by the dedicated paste event handler.
  if (e.inputType === InputType.InsertFromPaste || e.inputType === InputType.InsertFromDrop) {
    return null;
  }

  const target = e.target as HTMLInputElement;
  const currentValue = target.value;
  const selectionStart = target.selectionStart ?? 0;
  const selectionEnd = target.selectionEnd ?? 0;
  const separators = getSeparators(formattingOptions);

  let inputData = e.data ?? '';

  // Decimal separator handling: convert ',' or '.' to the configured separator and
  // prevent duplicate separators - previously handled in keydown, now lives here so
  // that undo history is preserved via the setRangeText path.
  if (e.inputType === InputType.InsertText && (e.data === ',' || e.data === '.')) {
    const decimalSep = separators.decimalSeparator;
    // The part of the value outside the current selection (will remain after typing)
    const valueOutsideSelection = currentValue.slice(0, selectionStart) + currentValue.slice(selectionEnd);
    if (valueOutsideSelection.includes(decimalSep)) {
      // Already has a decimal separator; block the insertion
      e.preventDefault();
      return null;
    }
    // Convert the typed character to the configured decimal separator
    inputData = decimalSep;
  }

  // Preventive decimal-cap check: when inserting a digit into the fractional part and the
  // fractional length would exceed decimalMaxLength, reject the keystroke. The post-hoc
  // truncation in formatInputValue still works as a safety net for paste/scientific/compact
  // expansion; this guard exists to avoid a brief overflow-then-trim flicker on plain typing.
  if (e.inputType === InputType.InsertText && /^\d$/.test(inputData)) {
    const decimalSep = separators.decimalSeparator;
    const decimalSepPos = currentValue.indexOf(decimalSep);
    if (decimalSepPos !== -1 && selectionStart > decimalSepPos) {
      const fractionalLength = currentValue.length - decimalSepPos - 1;
      const selectionLength = selectionEnd - selectionStart;
      if (fractionalLength - selectionLength + 1 > decimalMaxLength) {
        e.preventDefault();
        return null;
      }
    }
  }

  // Compute what the value would be after the browser applies the user's action.
  let intendedValue: string;
  let intendedCursorPos: number;

  switch (e.inputType) {
    case InputType.InsertText: {
      intendedValue = currentValue.slice(0, selectionStart) + inputData + currentValue.slice(selectionEnd);
      intendedCursorPos = selectionStart + inputData.length;
      break;
    }
    case InputType.DeleteContentBackward: {
      if (selectionStart !== selectionEnd) {
        intendedValue = currentValue.slice(0, selectionStart) + currentValue.slice(selectionEnd);
        intendedCursorPos = selectionStart;
      } else {
        const deleteFrom = Math.max(0, selectionStart - 1);
        intendedValue = currentValue.slice(0, deleteFrom) + currentValue.slice(selectionStart);
        intendedCursorPos = deleteFrom;
      }
      break;
    }
    case InputType.DeleteContentForward: {
      if (selectionStart !== selectionEnd) {
        intendedValue = currentValue.slice(0, selectionStart) + currentValue.slice(selectionEnd);
        intendedCursorPos = selectionStart;
      } else {
        intendedValue = currentValue.slice(0, selectionStart) + currentValue.slice(selectionStart + 1);
        intendedCursorPos = selectionStart;
      }
      break;
    }
    case InputType.DeleteByCut:
    case InputType.DeleteByDrag: {
      intendedValue = currentValue.slice(0, selectionStart) + currentValue.slice(selectionEnd);
      intendedCursorPos = selectionStart;
      break;
    }
    case InputType.DeleteSoftLineBackward:
    case InputType.DeleteHardLineBackward: {
      // Cmd/Ctrl+Backspace: delete from line start to selectionEnd (or selection range).
      const deleteFrom = selectionStart !== selectionEnd ? selectionStart : 0;
      intendedValue = currentValue.slice(0, deleteFrom) + currentValue.slice(selectionEnd);
      intendedCursorPos = deleteFrom;
      break;
    }
    case InputType.DeleteSoftLineForward:
    case InputType.DeleteHardLineForward: {
      // Cmd/Ctrl+Delete: delete from selectionStart to end of line (or selection range).
      const deleteTo = selectionStart !== selectionEnd ? selectionEnd : currentValue.length;
      intendedValue = currentValue.slice(0, selectionStart) + currentValue.slice(deleteTo);
      intendedCursorPos = selectionStart;
      break;
    }
    default:
      // Unknown input type - let the browser handle it natively.
      return null;
  }

  // Block the browser's raw insertion; we will apply the formatted value ourselves.
  e.preventDefault();

  // In 'change' mode, formatNumoraInput adds separators back, so we must remove them
  // first to parse the number (same logic as handleOnChangeNumoraInput).
  const shouldRemoveThousandSeparators = formattingOptions?.formatOn === FormatOn.Change;
  const { formatted: newValue, raw: rawValue } = formatInputValue(
    intendedValue,
    decimalMaxLength,
    formattingOptions,
    shouldRemoveThousandSeparators
  );

  // Apply the formatted value using setRangeText.
  target.setRangeText(newValue, 0, currentValue.length, 'end');

  // Build a synthetic caretPositionBeforeChange so updateCursorPosition can determine
  // the changed range between intendedValue and newValue. endOffset = number of chars
  // deleted forward from the cursor (the Delete-key path in findChangedRangeFromCaretPositions).
  // Only relevant when there's no selection; the selection branch uses selectionEnd - selectionStart.
  let endOffset = 0;
  if (selectionStart === selectionEnd) {
    if (e.inputType === InputType.DeleteContentForward) endOffset = 1;
    else if (e.inputType === InputType.DeleteSoftLineForward || e.inputType === InputType.DeleteHardLineForward) {
      endOffset = currentValue.length - selectionStart;
    }
  }
  const syntheticCaretInfo: CaretPositionInfo = {
    selectionStart,
    selectionEnd,
    endOffset,
  };

  // Restore the cursor to the correct position in the formatted string.
  if (intendedValue !== newValue) {
    updateCursorPosition(
      target,
      intendedValue,
      newValue,
      intendedCursorPos,
      syntheticCaretInfo,
      separators,
      formattingOptions
    );
  } else {
    target.setSelectionRange(intendedCursorPos, intendedCursorPos);
  }

  return { formatted: newValue, raw: rawValue };
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
  const inputElement = e.target as HTMLInputElement;

  skipOverThousandSeparatorOnDelete(e, inputElement, formattingOptions);

  return calculateEndOffset(e.key, inputElement.selectionStart, inputElement.selectionEnd);
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
