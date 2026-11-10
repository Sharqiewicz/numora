import {
  FormatOn,
  GroupingStyle,
  InputType,
  type NumoraOptions,
  type NumoraValues,
} from '../types';
import type { ValueSource } from '../features/sanitization';
import {
  computeStripSeparatorsResult,
  writeValuePreservingUndo,
} from '../features/formatting';
import {
  handleOnBeforeInputNumoraInput,
  handleOnPasteNumoraInput,
  isScientificNotationRejected,
} from './event-handlers';
import { computeCaretAfterRewrite } from './caret';
import {
  displayToRawValue,
  formatInputValue,
  formatValueForDisplay,
  normalizeNegativeZero,
} from './format-utils';

/**
 * DOM event steps shared by the vanilla class and `numora-react`. Each one reads the input,
 * writes through `setRangeText` (undo-preserving, fires no `input` event) and returns the
 * values to report, or `undefined` when there is nothing to report. Wrappers only decide how
 * to notify.
 */

/**
 * Options as `resolveOptions` returns them: `locale` already turned into separators, and
 * everything the event steps read unconditionally filled in.
 */
export type ResolvedNumoraOptions = Omit<NumoraOptions, 'locale'> &
  Required<
    Pick<
      NumoraOptions,
      'formatOn' | 'thousandSeparator' | 'groupingStyle' | 'decimalSeparator' | 'decimalMaxLength'
    >
  >;

/**
 * Resting format for values not being typed (initial, programmatic, blur): grouping always
 * applies (forced `FormatOn.Change`), plus `decimalMinLength` padding and the trailing
 * separator strip.
 */
export function formatForDisplay(
  value: string,
  opts: ResolvedNumoraOptions,
  source?: ValueSource
): { formatted: string; raw: string } {
  return formatValueForDisplay(
    value,
    opts.decimalMaxLength,
    { ...opts, formatOn: FormatOn.Change },
    source
  );
}

const write = (
  el: HTMLInputElement,
  formatted: string,
  raw: string,
  caret: number
): NumoraValues => {
  writeValuePreservingUndo(el, formatted, caret);
  return { value: raw, formattedValue: formatted };
};

/** `beforeinput`: cancels the edit when Numora handles or rejects it, and writes the result. */
export function applyBeforeInput(
  e: InputEvent,
  opts: ResolvedNumoraOptions
): NumoraValues | undefined {
  const result = handleOnBeforeInputNumoraInput(e, opts.decimalMaxLength, opts);
  if (result.type === 'skip') return;
  e.preventDefault();
  if (result.type === 'handled') {
    return write(e.target as HTMLInputElement, result.formatted, result.raw, result.cursorPos);
  }
}

/** `paste`: always cancels the browser's paste. A readOnly or disabled field takes nothing. */
export function applyPaste(
  e: ClipboardEvent,
  opts: ResolvedNumoraOptions
): NumoraValues | undefined {
  e.preventDefault();
  const el = e.target as HTMLInputElement;
  if (el.readOnly || el.disabled) return;
  const result = handleOnPasteNumoraInput(e, opts.decimalMaxLength, opts);
  if (result.type === 'handled') return write(el, result.formatted, result.raw, result.cursorPos);
}

/**
 * The `input` fallback: undo/redo, autofill, drop, IME commit, programmatic dispatch. Typing
 * never gets here (`beforeinput` handles it).
 *
 * - Undo/redo: the browser restored an earlier string. Report it, don't rewrite it: another
 *   write would push an undo step and break the Ctrl+Z walk-back.
 * - Scientific notation while `enableScientificNotation` is false: put back `previous` (the
 *   last value Numora wrote) and report nothing, since the value didn't change.
 * - Otherwise reformat. While `focused` the text is mid-edit and keeps the field's typing
 *   rules; unfocused it is landing at rest (e.g. autofill), so it gets the resting format.
 */
export function applyInputFallback(
  el: HTMLInputElement,
  inputType: string,
  focused: boolean,
  previous: string,
  opts: ResolvedNumoraOptions
): NumoraValues | undefined {
  const value = el.value;
  if (inputType === InputType.HistoryUndo || inputType === InputType.HistoryRedo) {
    return { value: displayToRawValue(value, opts), formattedValue: value };
  }
  if (isScientificNotationRejected(value, opts)) {
    // The caret pointed into the refused text, so it goes to the end.
    writeValuePreservingUndo(el, previous, previous.length);
    return;
  }
  // A focused Change-mode field already shows its own grouping, which foreign detection would
  // misread as a decimal (`12,3456`). Blur mode shows none while focused, so it stays foreign.
  const own = focused && opts.formatOn === FormatOn.Change && !!opts.thousandSeparator;
  const { formatted, raw } = focused
    ? formatInputValue(value, opts.decimalMaxLength, opts, undefined, own ? 'display' : 'foreign')
    : formatForDisplay(value, opts, 'foreign');
  if (formatted === value) return { value: raw, formattedValue: formatted };
  // Max of start/end works around a mobile-browser caret bug where selectionStart lags.
  const caret = Math.max(el.selectionStart ?? 0, el.selectionEnd ?? 0);
  return write(
    el,
    formatted,
    raw,
    computeCaretAfterRewrite(
      value,
      caret,
      formatted,
      opts.decimalMaxLength,
      opts,
      focused
    )
  );
}

/**
 * Blur: settle the value at rest (grouping, padding, trailing separator strip, `-0` to `0`).
 * Runs in Blur mode, or when `decimalMinLength` or `enableNegative` need a resting fix-up; a
 * Change-mode field is otherwise already at rest. Returns `undefined` when the display didn't
 * change. `rawChanged` is false when only the grouping changed: vanilla reports only raw
 * changes, React also reports display changes so mirrors of `formattedValue` stay in sync.
 */
export function applyBlur(
  el: HTMLInputElement,
  opts: ResolvedNumoraOptions
): (NumoraValues & { rawChanged: boolean }) | undefined {
  if (opts.formatOn !== FormatOn.Blur && !opts.decimalMinLength && !opts.enableNegative) return;
  const before = displayToRawValue(el.value, opts);
  const { formatted, raw } = formatForDisplay(
    normalizeNegativeZero(el.value, opts.decimalSeparator),
    opts
  );
  if (formatted === el.value) return;
  writeValuePreservingUndo(el, formatted, formatted.length);
  return { value: raw, formattedValue: formatted, rawChanged: raw !== before };
}

/**
 * Blur mode shows separators only at rest: focusing strips them for editing and keeps the
 * caret on the same digit. Stripping never changes the raw value, so it reports nothing;
 * `onStrip` runs after each strip write.
 *
 * Mouse focus defers the strip to `click`: the browser places the caret after `focus`,
 * against the still-formatted value, so stripping on `focus` would map a caret that isn't
 * there yet. Only the primary button is followed by a `click`; `blur` clears a pending strip
 * whose `click` never came (drag released outside).
 *
 * Returns a function that removes the listeners.
 */
export function attachFocusStrip(
  el: HTMLInputElement,
  getOpts: () => ResolvedNumoraOptions,
  onStrip: () => void
): () => void {
  let pendingMouse = false;
  const strip = () => {
    const { formatOn, thousandSeparator, groupingStyle } = getOpts();
    if (formatOn !== FormatOn.Blur || !thousandSeparator || groupingStyle === GroupingStyle.None)
      return;
    const result = computeStripSeparatorsResult(
      el.value,
      el.selectionStart ?? 0,
      el.selectionEnd ?? el.value.length,
      thousandSeparator
    );
    if (!result) return;
    writeValuePreservingUndo(el, result.raw, result.rawStart, result.rawEnd, 'preserve');
    onStrip();
  };
  const listeners: [string, (e: Event) => void][] = [
    [
      'mousedown',
      (e) => {
        if ((e as MouseEvent).button === 0) pendingMouse = true;
      },
    ],
    [
      'click',
      () => {
        if (!pendingMouse) return;
        pendingMouse = false;
        strip();
      },
    ],
    ['focus', () => pendingMouse || strip()],
    [
      'blur',
      () => {
        pendingMouse = false;
      },
    ],
  ];
  for (const [type, fn] of listeners) el.addEventListener(type, fn);
  return () => {
    for (const [type, fn] of listeners) el.removeEventListener(type, fn);
  };
}
