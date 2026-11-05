import { getSeparators } from '../features/decimals';
import { sanitizeNumoraInput } from '../features/sanitization';
import { NON_ASCII_DECIMAL_SEPARATOR_GLYPHS } from '../features/decimal-separators';
import { computeCursorPosition, skipOverThousandSeparatorOnDelete } from '../features/formatting';
import { type FormattingOptions, type CaretPositionInfo, FormatOn, InputType } from '../types';
import { formatInputValue } from './format-utils';

// Keys that, when typed, are candidates for remapping to the configured decimal separator:
// the plain ASCII '.' and ',' plus every non-ASCII glyph that functions as a decimal mark
// on some keyboard/locale (see `../features/decimal-separators` for the glyph table and
// the matching sanitization-side fix for paste/IME-commit). A candidate is remapped to
// `decimalSeparator` UNLESS it is itself the configured `thousandSeparator` (and differs
// from `decimalSeparator`), in which case the keystroke is rejected outright (A2-04) -
// otherwise typing "1,000,000" under an en-US config (thousand ',', decimal '.') would
// have each comma parsed as a decimal point.
const DECIMAL_KEY_CANDIDATES = new Set<string>(['.', ',', ...NON_ASCII_DECIMAL_SEPARATOR_GLYPHS]);

/**
 * Outcome of `handleOnBeforeInputNumoraInput`. Pure: the helper does not mutate the
 * input or the event. The caller decides what to do based on the variant:
 *
 * - `handled`: caller should preventDefault, write `formatted` to the input via an
 *   undo-preserving write, set caret to `cursorPos`, and notify listeners.
 * - `reject`: caller should preventDefault. The input value is left untouched.
 * - `skip`: caller should NOT preventDefault. Includes paste (handled by the dedicated
 *   paste listener), native drop (no dedicated listener - it falls through to the
 *   browser's own insertion and the generic `input`/handleChange fallback), and any
 *   unrecognized inputType.
 */
export type BeforeInputResult =
  | { type: 'handled'; formatted: string; raw: string; cursorPos: number }
  | { type: 'reject' }
  | { type: 'skip' };

/**
 * Invokes a user-supplied `isAllowed` validator, treating a throw as "not allowed" (A2-08).
 *
 * `isAllowed` runs synchronously inside `beforeinput`/paste handling, BEFORE the caller
 * calls `preventDefault()`. If the validator throws and that exception is left to
 * propagate, it unwinds out of the event listener before `preventDefault()` ever runs, so
 * the browser proceeds to insert the raw keystroke natively - the exact bypass `isAllowed`
 * exists to prevent. `console.error`-reporting the error (rather than swallowing it
 * silently, and rather than rethrowing - which would surface as an unhandled exception
 * outside this call stack, e.g. via `queueMicrotask`) keeps it visible to the developer
 * without letting it interrupt the keystroke handling that must still return a `reject`
 * result, or risk crashing an unrelated caller (a test runner, a host app's own global
 * error handler) that isn't expecting an async throw from a keystroke.
 */
function callIsAllowed(isAllowed: (rawValue: string) => boolean, rawValue: string): boolean {
  try {
    return isAllowed(rawValue);
  } catch (err) {
    console.error('[numora] isAllowed threw; treating the keystroke as not allowed:', err);
    return false;
  }
}

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

  if (e.inputType === InputType.InsertText && DECIMAL_KEY_CANDIDATES.has(inputData)) {
    const decimalSep = separators.decimalSeparator;
    const thousandSep = formattingOptions?.thousandSeparator;

    // The typed key is configured as the thousand separator (and isn't ALSO the decimal
    // separator, which would make remapping a no-op anyway): reject the keystroke rather
    // than remap it to a decimal point (A2-04/A2-05).
    if (inputData === thousandSep && inputData !== decimalSep) {
      return { type: 'reject' };
    }

    // decimalMaxLength: 0 means no fractional part is allowed at all, so refuse the
    // decimal-separator keystroke outright rather than insert-then-trim it away.
    if (decimalMaxLength === 0) {
      return { type: 'reject' };
    }
    const valueOutsideSelection =
      currentValue.slice(0, selectionStart) + currentValue.slice(selectionEnd);
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
  // intendedCursorPos: where the caret would land in intendedValue. The caret math
  // (computeCursorPosition) maps this through separator reflow, so intendedCursorPos
  // already encodes the post-edit position for every action below (including Delete).
  // endOffset is retained on the caret-info payload for back-compat but no longer drives
  // the caret computation.
  let intendedValue: string;
  let intendedCursorPos: number;
  let endOffset = 0;
  const hasSelection = selectionStart !== selectionEnd;

  switch (e.inputType) {
    case InputType.InsertText: {
      intendedValue =
        currentValue.slice(0, selectionStart) + inputData + currentValue.slice(selectionEnd);
      intendedCursorPos = selectionStart + inputData.length;
      break;
    }
    case InputType.DeleteContentBackward: {
      // Mobile fallback: separator skipping normally happens in handleOnKeyDownNumoraInput,
      // but Android soft keyboards often report `key: 'Unidentified'` or fire no keydown at
      // all, so `beforeinput` is the only signal. When the char immediately before the caret
      // is the thousand separator, delete the digit behind it too - otherwise deleting just
      // the separator re-formats back to the same string (a no-op backspace). Only applies
      // with no active selection; a real keydown-driven caret skip has already moved the
      // caret past the separator by the time this runs, so this branch is simply not taken.
      const thousandSep = formattingOptions?.thousandSeparator;
      const deletesOverSeparator =
        !hasSelection &&
        thousandSep !== undefined &&
        currentValue[selectionStart - 1] === thousandSep;
      const deleteFrom = hasSelection
        ? selectionStart
        : deletesOverSeparator
          ? Math.max(0, selectionStart - 2)
          : Math.max(0, selectionStart - 1);
      const deleteTo = hasSelection ? selectionEnd : selectionStart;
      intendedValue = currentValue.slice(0, deleteFrom) + currentValue.slice(deleteTo);
      intendedCursorPos = deleteFrom;
      break;
    }
    case InputType.DeleteContentForward: {
      // Same mobile fallback as DeleteContentBackward above, mirrored for forward delete:
      // when the char at the caret is the thousand separator, delete the digit past it too.
      const thousandSep = formattingOptions?.thousandSeparator;
      const deletesOverSeparator =
        !hasSelection && thousandSep !== undefined && currentValue[selectionStart] === thousandSep;
      const deleteTo = hasSelection
        ? selectionEnd
        : deletesOverSeparator
          ? selectionStart + 2
          : selectionStart + 1;
      intendedValue = currentValue.slice(0, selectionStart) + currentValue.slice(deleteTo);
      intendedCursorPos = selectionStart;
      if (!hasSelection) endOffset = deleteTo - selectionStart;
      break;
    }
    case InputType.DeleteByCut:
    case InputType.DeleteByDrag: {
      intendedValue = currentValue.slice(0, selectionStart) + currentValue.slice(selectionEnd);
      intendedCursorPos = selectionStart;
      break;
    }
    case InputType.DeleteSoftLineBackward:
    case InputType.DeleteHardLineBackward:
    // A numeric field is always a single "word", so word-boundary deletion (Alt/Option +
    // Backspace/Delete on desktop) behaves the same as line deletion here.
    case InputType.DeleteWordBackward: {
      const deleteFrom = hasSelection ? selectionStart : 0;
      intendedValue = currentValue.slice(0, deleteFrom) + currentValue.slice(selectionEnd);
      intendedCursorPos = deleteFrom;
      break;
    }
    case InputType.DeleteSoftLineForward:
    case InputType.DeleteHardLineForward:
    case InputType.DeleteWordForward: {
      const deleteTo = hasSelection ? selectionEnd : currentValue.length;
      intendedValue = currentValue.slice(0, selectionStart) + currentValue.slice(deleteTo);
      intendedCursorPos = selectionStart;
      if (!hasSelection) endOffset = currentValue.length - selectionStart;
      break;
    }
    default:
      // Everything else — most notably IME composition (`insertCompositionText`) — is left to
      // the browser. Skipping means no preventDefault, so the composition commits natively and
      // the generic `input`/handleChange path re-derives the value from the committed DOM
      // string. The VALUE stays correct (sanitization still runs); the CARET is best-effort
      // during an active composition, because there is no pre-edit caret to map from. Known
      // limit, not an oversight: intercepting composition would require buffering the
      // composing text and is out of scope for a numeric field.
      return { type: 'skip' };
  }

  if (formattingOptions?.maxLength !== undefined && e.inputType === InputType.InsertText) {
    // Check the length AFTER sanitization (grouping separators stripped, leading zeros
    // collapsed, etc.), not the raw pre-sanitization intended value - otherwise a value
    // that would sanitize down to fit under maxLength gets rejected anyway.
    const sanitizedLength = sanitizeNumoraInput(intendedValue, {
      ...formattingOptions,
      maxLength: undefined,
    }).length;
    if (sanitizedLength > formattingOptions.maxLength) {
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

  if (formattingOptions?.isAllowed && !callIsAllowed(formattingOptions.isAllowed, rawValue)) {
    return { type: 'reject' };
  }

  // Nothing actually changed (e.g. a rejected letter, Backspace at position 0, Delete at
  // the end, Backspace on an empty field) - reject so the caller does not fire onChange
  // for a no-op keystroke. Accepted consequence: a selection whose replacement sanitizes
  // back to the exact same string (e.g. selecting the "," in "1,234" and typing a letter)
  // keeps its selection instead of collapsing, since `reject` leaves the DOM untouched.
  if (newValue === currentValue) {
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
  const separators = getSeparators(formattingOptions);

  const clipboardData = e.clipboardData?.getData('text/plain') || '';
  const selStart = selectionStart ?? 0;
  const selEnd = selectionEnd ?? 0;
  const combinedValue = value.slice(0, selStart) + clipboardData + value.slice(selEnd);

  // Always strip thousand separators during paste: pasted content may contain separators
  // and the current value may have separators (blur mode); both need to be parsed together.
  const { formatted: formattedValue, raw: rawValue } = formatInputValue(
    combinedValue,
    decimalMaxLength,
    formattingOptions,
    true
  );

  if (formattingOptions?.isAllowed && !callIsAllowed(formattingOptions.isAllowed, rawValue)) {
    return { type: 'reject' };
  }

  // Paste is the same shape as a keystroke: `combinedValue` is the post-edit value with
  // stale separators and `intendedCursorPos` is the post-edit caret (just after the pasted
  // text). Route both through the same rank/select mapping the typing path uses, so that a
  // length change occurring away from the paste point (e.g. a decimal trim at the tail) is
  // not misattributed to the insertion point.
  const intendedCursorPos = selStart + clipboardData.length;

  let cursorPos: number;
  if (combinedValue !== formattedValue) {
    const syntheticCaretInfo: CaretPositionInfo = {
      selectionStart: selStart,
      selectionEnd: selEnd,
      endOffset: 0,
    };
    const computed = computeCursorPosition(
      combinedValue,
      formattedValue,
      intendedCursorPos,
      syntheticCaretInfo,
      separators,
      formattingOptions
    );
    cursorPos = computed ?? intendedCursorPos;
  } else {
    cursorPos = intendedCursorPos;
  }

  return { type: 'handled', formatted: formattedValue, raw: rawValue, cursorPos };
}
