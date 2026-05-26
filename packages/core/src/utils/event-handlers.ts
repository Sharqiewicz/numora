import { getSeparators } from '@/features/decimals';
import { removeThousandSeparators } from '@/features/sanitization';
import {
  computeCursorPosition,
  skipOverThousandSeparatorOnDelete,
} from '@/features/formatting';
import { type FormattingOptions, type CaretPositionInfo, FormatOn, InputType } from '@/types';
import { formatInputValue } from './format-utils';

/**
 * Outcome of `handleOnBeforeInputNumoraInput`. Pure: the helper does not mutate the
 * input or the event. The caller decides what to do based on the variant:
 *
 * - `handled`: caller should preventDefault, write `formatted` to the input via an
 *   undo-preserving write, set caret to `cursorPos`, and notify listeners.
 * - `reject`: caller should preventDefault. The input value is left untouched.
 * - `skip`: caller should NOT preventDefault. Includes paste/drop (handled by the
 *   dedicated paste listener) and any unrecognized inputType.
 */
export type BeforeInputResult =
  | { type: 'handled'; formatted: string; raw: string; cursorPos: number }
  | { type: 'reject' }
  | { type: 'skip' };

/**
 * Computes the formatted value, raw value, and target cursor position for a
 * `beforeinput` event without mutating the input or the event.
 *
 * Callers are responsible for `preventDefault()` and applying the result to the DOM.
 *
 * @param e - The InputEvent (beforeinput)
 * @param decimalMaxLength - The maximum number of decimal places allowed
 * @param formattingOptions - Optional formatting options
 * @returns A tagged result describing what the caller should do
 */
export function handleOnBeforeInputNumoraInput(
  e: InputEvent,
  decimalMaxLength: number,
  formattingOptions?: FormattingOptions
): BeforeInputResult {
  if (e.inputType === InputType.InsertFromPaste || e.inputType === InputType.InsertFromDrop) {
    return { type: 'skip' };
  }

  const target = e.target as HTMLInputElement;
  const currentValue = target.value;
  const selectionStart = target.selectionStart ?? 0;
  const selectionEnd = target.selectionEnd ?? 0;
  const separators = getSeparators(formattingOptions);

  let inputData = e.data ?? '';

  if (e.inputType === InputType.InsertText && (e.data === ',' || e.data === '.')) {
    const decimalSep = separators.decimalSeparator;
    const valueOutsideSelection = currentValue.slice(0, selectionStart) + currentValue.slice(selectionEnd);
    if (valueOutsideSelection.includes(decimalSep)) {
      return { type: 'reject' };
    }
    inputData = decimalSep;
  }

  // Preventive decimal-cap check: rejecting up front avoids a brief overflow-then-trim
  // flicker. The post-hoc truncation in formatInputValue still covers paste/expansion paths.
  if (e.inputType === InputType.InsertText && /^\d$/.test(inputData)) {
    const decimalSep = separators.decimalSeparator;
    const decimalSepPos = currentValue.indexOf(decimalSep);
    if (decimalSepPos !== -1 && selectionStart > decimalSepPos) {
      const fractionalLength = currentValue.length - decimalSepPos - 1;
      const selectionLength = selectionEnd - selectionStart;
      if (fractionalLength - selectionLength + 1 > decimalMaxLength) {
        return { type: 'reject' };
      }
    }
  }

  // intendedValue: what the input would contain if we let the browser apply the action.
  // intendedCursorPos: where the caret would land in intendedValue.
  // endOffset: chars deleted forward from the cursor (only matters for Delete-forward
  // family with no selection). Used downstream by findChangedRangeFromCaretPositions.
  let intendedValue: string;
  let intendedCursorPos: number;
  let endOffset = 0;
  const hasSelection = selectionStart !== selectionEnd;

  switch (e.inputType) {
    case InputType.InsertText: {
      intendedValue = currentValue.slice(0, selectionStart) + inputData + currentValue.slice(selectionEnd);
      intendedCursorPos = selectionStart + inputData.length;
      break;
    }
    case InputType.DeleteContentBackward: {
      const deleteFrom = hasSelection ? selectionStart : Math.max(0, selectionStart - 1);
      const deleteTo = hasSelection ? selectionEnd : selectionStart;
      intendedValue = currentValue.slice(0, deleteFrom) + currentValue.slice(deleteTo);
      intendedCursorPos = deleteFrom;
      break;
    }
    case InputType.DeleteContentForward: {
      const deleteTo = hasSelection ? selectionEnd : selectionStart + 1;
      intendedValue = currentValue.slice(0, selectionStart) + currentValue.slice(deleteTo);
      intendedCursorPos = selectionStart;
      if (!hasSelection) endOffset = 1;
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
      const deleteFrom = hasSelection ? selectionStart : 0;
      intendedValue = currentValue.slice(0, deleteFrom) + currentValue.slice(selectionEnd);
      intendedCursorPos = deleteFrom;
      break;
    }
    case InputType.DeleteSoftLineForward:
    case InputType.DeleteHardLineForward: {
      const deleteTo = hasSelection ? selectionEnd : currentValue.length;
      intendedValue = currentValue.slice(0, selectionStart) + currentValue.slice(deleteTo);
      intendedCursorPos = selectionStart;
      if (!hasSelection) endOffset = currentValue.length - selectionStart;
      break;
    }
    default:
      return { type: 'skip' };
  }

  if (
    formattingOptions?.maxLength !== undefined &&
    e.inputType === InputType.InsertText
  ) {
    const sep = formattingOptions.thousandSeparator;
    const intendedRawLength = sep
      ? removeThousandSeparators(intendedValue, sep).length
      : intendedValue.length;
    if (intendedRawLength > formattingOptions.maxLength) {
      return { type: 'reject' };
    }
  }

  const shouldRemoveThousandSeparators = formattingOptions?.formatOn === FormatOn.Change;
  const { formatted: newValue, raw: rawValue } = formatInputValue(
    intendedValue,
    decimalMaxLength,
    formattingOptions,
    shouldRemoveThousandSeparators
  );

  if (formattingOptions?.isAllowed && !formattingOptions.isAllowed(rawValue)) {
    return { type: 'reject' };
  }

  let cursorPos: number;
  if (intendedValue !== newValue) {
    const syntheticCaretInfo: CaretPositionInfo = {
      selectionStart,
      selectionEnd,
      endOffset,
    };
    const computed = computeCursorPosition(
      intendedValue,
      newValue,
      intendedCursorPos,
      syntheticCaretInfo,
      separators,
      formattingOptions
    );
    cursorPos = computed ?? intendedCursorPos;
  } else {
    cursorPos = intendedCursorPos;
  }

  return { type: 'handled', formatted: newValue, raw: rawValue, cursorPos };
}

/**
 * Skips the cursor over thousand separators on Delete/Backspace and returns the caret
 * info the change handler needs to disambiguate Delete-forward (`endOffset: 1`) from
 * Backspace or non-deletion keys (`endOffset: 0`). Returns undefined for keys that
 * aren't Delete/Backspace so the caller can null out the stored caret info.
 */
export function handleOnKeyDownNumoraInput(
  e: KeyboardEvent,
  formattingOptions?: FormattingOptions
): CaretPositionInfo | undefined {
  const inputElement = e.target as HTMLInputElement;
  skipOverThousandSeparatorOnDelete(e, inputElement, formattingOptions);

  if (e.key !== 'Backspace' && e.key !== 'Delete') return undefined;

  const selectionStart = inputElement.selectionStart ?? 0;
  const selectionEnd = inputElement.selectionEnd ?? 0;
  return {
    selectionStart,
    selectionEnd,
    endOffset: e.key === 'Delete' && selectionStart === selectionEnd ? 1 : 0,
  };
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

/**
 * Outcome of `handleOnPasteNumoraInput`. The caller always calls preventDefault on the
 * paste event; the variant says whether to apply a write or leave the input untouched.
 *
 * - `handled`: write `formatted` via an undo-preserving write, set caret to `cursorPos`.
 * - `reject`: do nothing further (input is unchanged).
 */
export type PasteResult =
  | { type: 'handled'; formatted: string; raw: string; cursorPos: number }
  | { type: 'reject' };

/**
 * Computes the formatted value and cursor position for a paste event without mutating
 * the input or the event. The caller owns `preventDefault()` and the DOM write.
 */
export function handleOnPasteNumoraInput(
  e: ClipboardEvent,
  decimalMaxLength: number,
  formattingOptions?: FormattingOptions
): PasteResult {
  const inputElement = e.target as HTMLInputElement;
  const { value, selectionStart, selectionEnd } = inputElement;

  const clipboardData = e.clipboardData?.getData('text/plain') || '';
  const combinedValue =
    value.slice(0, selectionStart || 0) + clipboardData + value.slice(selectionEnd || 0);

  // Always strip thousand separators during paste: pasted content may contain separators
  // and the current value may have separators (blur mode); both need to be parsed together.
  const { formatted: formattedValue, raw: rawValue } = formatInputValue(
    combinedValue,
    decimalMaxLength,
    formattingOptions,
    true
  );

  if (formattingOptions?.isAllowed && !formattingOptions.isAllowed(rawValue)) {
    return { type: 'reject' };
  }

  const newCursorPosition = calculateCursorPositionAfterPaste(
    selectionStart || 0,
    clipboardData.length,
    combinedValue.length,
    formattedValue.length
  );

  return { type: 'handled', formatted: formattedValue, raw: rawValue, cursorPos: newCursorPosition };
}
