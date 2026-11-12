import {
  FormatOn,
  GroupingStyle,
  type NumoraOptions,
  type NumoraValues,
} from '../types';
import type { ValueSource } from '../features/sanitization';
import {
  computeStripSeparatorsResult,
  writeValue,
} from '../features/formatting';
import {
  handleOnBeforeInputNumoraInput,
  handleOnPasteNumoraInput,
  isScientificNotationRejected,
  callIsAllowed,
} from './event-handlers';
import { appValue } from './app-value';
import { computeCaretAfterRewrite } from './caret';
import {
  displayToRawValue,
  formatInputValue,
  formatValueForDisplay,
  normalizeNegativeZero,
} from './format-utils';

/**
 * DOM event steps shared by the vanilla class and `numora-react`. Each one reads the input,
 * writes through `setRangeText` (fires no `input` event) and returns the
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
  const { formatted, raw } = formatValueForDisplay(
    value,
    opts.decimalMaxLength,
    { ...opts, formatOn: FormatOn.Change },
    source
  );
  // A resting field has no lone sign or separator (`-`, `.`, `-.`): it is empty. Negative
  // zero (`-0`, `-0.00`) drops its sign.
  if (!/\d/.test(formatted)) return { formatted: '', raw: '' };
  return {
    formatted: normalizeNegativeZero(formatted, opts.decimalSeparator),
    raw: normalizeNegativeZero(raw, '.'),
  };
}

/**
 * The app's own write (ADR 0011), shared by vanilla `setValue()` and the React ref's: a
 * canonical raw value through the same pipeline as typing, in the edit format on a focused
 * field and the resting format otherwise. Returns the text written.
 */
export function applySetValue(
  el: HTMLInputElement,
  value: string,
  focused: boolean,
  opts: ResolvedNumoraOptions
): string {
  const raw = appValue(value, 'setValue()');
  const { formatted } = focused
    ? formatValueForDisplay(raw, opts.decimalMaxLength, opts, 'canonical')
    : formatForDisplay(raw, opts, 'canonical');
  writeValue(el, formatted, formatted.length);
  return formatted;
}

const write = (
  el: HTMLInputElement,
  formatted: string,
  raw: string,
  caret: number
): NumoraValues => {
  writeValue(el, formatted, caret);
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
  if (result.type !== 'handled' || result.formatted === el.value) return;
  return write(el, result.formatted, result.raw, result.cursorPos);
}

/**
 * The `input` fallback: every change the browser makes itself (autofill, drop, IME commit,
 * programmatic dispatch). Typing never gets here (`beforeinput` handles it).
 *
 * - Scientific notation while `allowScientificNotation` is false: put back `previous` (the
 *   last value Numora wrote) and report nothing, since the value didn't change.
 * - Otherwise reformat. While `focused` the text is mid-edit and keeps the field's typing
 *   rules; unfocused it is landing at rest (e.g. autofill), so it gets the resting format.
 */
export function applyInputFallback(
  el: HTMLInputElement,
  focused: boolean,
  previous: string,
  opts: ResolvedNumoraOptions
): NumoraValues | undefined {
  const value = el.value;
  // Nothing changed since Numora's last write: nothing to check, rewrite or report.
  if (value === previous) return;
  if (isScientificNotationRejected(value, opts)) {
    // The caret pointed into the refused text, so it goes to the end.
    writeValue(el, previous, previous.length);
    return;
  }
  // A focused Change-mode field already shows its own grouping, which foreign detection would
  // misread as a decimal (`12,3456`). Blur mode shows none while focused, so it stays foreign.
  const own = focused && opts.formatOn === FormatOn.Change;
  const { formatted, raw } = focused
    ? formatInputValue(value, opts.decimalMaxLength, opts, undefined, own ? 'display' : 'foreign')
    : formatForDisplay(value, opts, 'foreign');
  if (opts.isAllowed && !callIsAllowed(opts.isAllowed, raw)) {
    writeValue(el, previous, previous.length);
    return;
  }
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
 * Blur: settle the value at rest (grouping, padding, trailing separator strip, `-0` to `0`,
 * a lone sign or separator to empty). Runs in every mode; an already settled field is a no-op
 * (the formatted text equals the current text). Returns the values only when the raw value
 * changed (trailing separator strip, `decimalMinLength` padding, `-0` to `0`): regrouping
 * alone is cosmetic, so it is written but not reported, in both packages.
 */
export function applyBlur(
  el: HTMLInputElement,
  opts: ResolvedNumoraOptions
): NumoraValues | undefined {
  const before = displayToRawValue(el.value, opts);
  const { formatted, raw } = formatForDisplay(el.value, opts);
  if (formatted === el.value) return;
  writeValue(el, formatted, formatted.length);
  if (raw !== before) return { value: raw, formattedValue: formatted };
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
    if (formatOn !== FormatOn.Blur || groupingStyle === GroupingStyle.None) return;
    const result = computeStripSeparatorsResult(
      el.value,
      el.selectionStart ?? 0,
      el.selectionEnd ?? el.value.length,
      thousandSeparator
    );
    if (!result) return;
    writeValue(el, result.raw, result.rawStart, result.rawEnd, 'preserve');
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
