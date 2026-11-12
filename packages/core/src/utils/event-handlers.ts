import { getSeparators } from '../features/decimals';
import { sanitizeNumoraInput } from '../features/sanitization';
import { normalizeForeignFormat, canonicalToDisplayText } from '../features/foreign-format';
import { NON_ASCII_DECIMAL_SEPARATOR_GLYPHS } from '../features/decimal-separators';
import { containsScientificNotation } from '../features/scientific-notation';
import { skipOverThousandSeparatorOnDelete } from '../features/formatting';
import { computeCaretFromEdit } from './caret';
import { type NumoraOptions, InputType } from '../types';
import { formatInputValue } from './format-utils';

// Keys that, when typed, are candidates for remapping to the configured decimal separator:
// the plain ASCII '.' and ',' plus every non-ASCII glyph that functions as a decimal mark
// on some keyboard/locale (see `../features/decimal-separators` for the glyph table and
// the matching sanitization-side fix for paste/IME-commit). A candidate is remapped to
// `decimalSeparator` UNLESS it is itself the configured `thousandSeparator` (and differs
// from `decimalSeparator`), in which case the keystroke is rejected outright -
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
 * Invokes a user-supplied `isAllowed` validator, treating a throw as "not allowed".
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
/**
 * True when `allowScientificNotation` is `false` and user-typed/pasted/inserted text holds a
 * number in scientific notation. Such input must be refused as a whole: the sanitizer would
 * otherwise drop the `e` and turn `1.5e-7` into `1.57`. App-supplied values never go through
 * this check (they always expand).
 */
export function isScientificNotationRejected(
  text: string,
  formattingOptions?: NumoraOptions
): boolean {
  return (
    formattingOptions?.allowScientificNotation === false && containsScientificNotation(text)
  );
}

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
  formattingOptions?: NumoraOptions
): BeforeInputResult {
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
    // separator, which would make remapping a no-op anyway). ADR 0005: in a comma-decimal
    // locale (thousand '.', e.g. de-DE) a typed '.' is the decimal key - numpads and US
    // keyboards emit it - so it falls through to the decimal handling below (inserted only
    // while the value has no decimal yet, ignored otherwise). Any other key that equals
    // the thousand separator (',' in en-US) stays rejected: remapping it
    // would turn a grouping habit into a stray decimal point.
    if (inputData === thousandSep && inputData !== '.') {
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
  // intendedCursorPos: where the caret would sit in it. The final caret is computed from the
  // text left of that position (utils/caret.ts), so it is the only edit signal needed.
  let intendedValue: string;
  let intendedCursorPos: number;
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
      const deletesOverSeparator =
        currentValue[selectionStart - 1] === formattingOptions?.thousandSeparator;
      const deleteFrom = hasSelection
        ? selectionStart
        : Math.max(0, selectionStart - (deletesOverSeparator ? 2 : 1));
      const deleteTo = hasSelection ? selectionEnd : selectionStart;
      intendedValue = currentValue.slice(0, deleteFrom) + currentValue.slice(deleteTo);
      intendedCursorPos = deleteFrom;
      break;
    }
    case InputType.DeleteContentForward: {
      // Same mobile fallback as DeleteContentBackward above, mirrored for forward delete:
      // when the char at the caret is the thousand separator, delete the digit past it too.
      const deletesOverSeparator =
        currentValue[selectionStart] === formattingOptions?.thousandSeparator;
      const deleteTo = hasSelection
        ? selectionEnd
        : selectionStart + (deletesOverSeparator ? 2 : 1);
      intendedValue = currentValue.slice(0, selectionStart) + currentValue.slice(deleteTo);
      intendedCursorPos = selectionStart;
      break;
    }
    // Cut and drag always have a selection, so they delete exactly what a line deletion with a
    // selection does.
    case InputType.DeleteByCut:
    case InputType.DeleteByDrag:
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

  // Multi-character insertText (IME, text replacement, some soft keyboards) can carry a whole
  // "1.5e-7". With scientific notation off the field is left unchanged. The current value
  // never holds an `e`, so checking the intended value only fires on the inserted text.
  if (
    e.inputType === InputType.InsertText &&
    isScientificNotationRejected(intendedValue, formattingOptions)
  ) {
    return { type: 'reject' };
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

  const { formatted: newValue, raw: rawValue } = formatInputValue(
    intendedValue,
    decimalMaxLength,
    formattingOptions
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

  // The caret rank is the rank of the sanitized text that stood left of the caret after the
  // edit (see utils/caret.ts), selected in the final display string.
  const cursorPos =
    intendedValue !== newValue
      ? computeCaretFromEdit(
          intendedValue.slice(0, intendedCursorPos),
          newValue,
          decimalMaxLength,
          formattingOptions
        )
      : intendedCursorPos;

  return { type: 'handled', formatted: newValue, raw: rawValue, cursorPos };
}

/**
 * Skips the cursor over thousand separators on Delete/Backspace.
 */
export function handleOnKeyDownNumoraInput(
  e: KeyboardEvent,
  formattingOptions?: NumoraOptions
): void {
  skipOverThousandSeparatorOnDelete(e, e.target as HTMLInputElement, formattingOptions);
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
  formattingOptions?: NumoraOptions
): PasteResult {
  const inputElement = e.target as HTMLInputElement;
  const { value, selectionStart, selectionEnd } = inputElement;
  const separators = getSeparators(formattingOptions);

  // Pasted text is read with foreign-format detection (ADR 0006), NOT strictly by the
  // field's locale: de-DE `1.5` is 1.5 and `1,234,567.89` is 1234567.89. Only the clipboard
  // slice is detected - the rest of the combined value is the field's own display text.
  // The slice is rewritten to the field's locale text so the combined value then goes
  // through the ordinary pipeline, and the caret math below uses its (rewritten) length.
  const rawClipboard = e.clipboardData?.getData('text/plain') || '';
  const canonicalClipboard = normalizeForeignFormat(rawClipboard, formattingOptions);
  const clipboardData = canonicalToDisplayText(canonicalClipboard, separators.decimalSeparator);
  const selStart = selectionStart ?? 0;
  const selEnd = selectionEnd ?? 0;
  const combinedValue = value.slice(0, selStart) + clipboardData + value.slice(selEnd);
  // Scientific notation is on unless explicitly disabled. With it off, the sanitizer would
  // drop the `e` and turn `1.5e-7` into `1.57`, so refuse the paste instead. Check the
  // combined value: `e-7` pasted after `1.5` only forms a number once spliced in.
  if (isScientificNotationRejected(combinedValue, formattingOptions)) {
    return { type: 'reject' };
  }

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
  const cursorPos = computeCaretFromEdit(
    combinedValue.slice(0, selStart + clipboardData.length),
    formattedValue,
    decimalMaxLength,
    formattingOptions,
    true
  );

  return { type: 'handled', formatted: formattedValue, raw: rawValue, cursorPos };
}
