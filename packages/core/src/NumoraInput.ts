import { handleOnKeyDownNumoraInput } from './utils/event-handlers';
import { writeValuePreservingUndo } from './features/formatting';
import { displayToRawValue } from './utils/format-utils';
import {
  applyBeforeInput,
  applyBlur,
  applyInputFallback,
  applyPaste,
  attachFocusStrip,
  formatForDisplay,
} from './utils/dom-events';
import { escapeRegExp } from './utils/escape-reg-exp';
import { resolveOptions } from './utils/resolve-options';
import { takeRemovedOptions, warnRemovedOptions } from './utils/removed-options';
import type { ResolvedNumoraOptions } from './utils/dom-events';
import type { NumoraOptions, NumoraValues } from './types';

// Native attributes the constructor forwards to the element. Deliberately a short list:
// anything else is set on `input.element` directly.
const NATIVE_ATTRIBUTES = [
  'id',
  'name',
  'className',
  'placeholder',
  'disabled',
  'readOnly',
  'required',
  'tabIndex',
  'title',
  'autofocus',
] as const;

export interface NumoraInputOptions
  extends NumoraOptions,
    Partial<Pick<HTMLInputElement, (typeof NATIVE_ATTRIBUTES)[number]>> {
  /** Sets the `aria-label` attribute. */
  ariaLabel?: string;
  /** Fired on every change with `{ value, formattedValue }`: canonical raw + display string. */
  onChange?: (values: NumoraValues) => void;
  /**
   * Initial value, as a canonical raw value (`'1234.5'` in every locale). When adopting an
   * existing `<input>`, its own value is kept unless this is passed.
   */
  value?: string;
}

// Display text destroy() leaves in a field, with its raw value, so a re-init can tell Numora's
// own leftover text from an app-supplied canonical value (ADR 0004). Weak: no element leak.
const leftovers = new WeakMap<HTMLInputElement, { text: string; raw: string }>();

export class NumoraInput {
  private el!: HTMLInputElement;

  private resolvedOptions: ResolvedNumoraOptions;
  private onChange?: (values: NumoraValues) => void;

  // Mirrors this instance's focus/blur listeners rather than `document.activeElement`: tests
  // and some embedders dispatch synthetic focus/blur without moving real focus.
  private isFocused = false;
  /** Field text after the last write this class made; restored when the `input` fallback must refuse a value. */
  private lastValue!: string;
  // Removes exactly the listeners Numora added, so destroy() leaves the caller's alone.
  private cleanups: Array<() => void> = [];

  /**
   * @param target - Either an existing `<input>` to **adopt in place** (its listeners are
   *   attached directly - ideal for a Svelte action / Vue directive / Solid ref), or any
   *   other element to **mount a new `<input>` into** as a child. Selected at runtime by an
   *   `instanceof HTMLInputElement` check.
   * @param options - Numora options plus a few native `<input>` attributes. Optional.
   */
  constructor(target: HTMLInputElement | HTMLElement, options: NumoraInputOptions = {}) {
    this.resolvedOptions = resolveOptions(options);
    this.onChange = options.onChange;

    // Options removed since v4 are ignored and warned about. Checked on a copy: the caller's
    // object is left alone.
    warnRemovedOptions(takeRemovedOptions({ ...options }));

    this.createInputElement(target, options);
    this.setupEventListeners();
    // The initial value (option, or a pre-set value on an adopted <input>) is supplied by
    // the app, so it is a canonical raw value (ADR 0004), not locale text. Also seeds `lastValue`.
    const left = leftovers.get(this.el);
    this.setValue(left?.text === this.el.value ? left.raw : this.el.value, {
      undoable: false,
    });
  }

  private createInputElement(container: HTMLElement, options: NumoraInputOptions): void {
    // If an <input> is passed directly (Svelte action, Vue directive, Angular directive,
    // Solid ref), adopt it instead of creating a new one so frameworks can use the
    // idiomatic <input use:numora> shape rather than a wrapping container <div>.
    const isExistingInput = container instanceof HTMLInputElement;
    this.el = isExistingInput ? container : document.createElement('input');

    // These attributes are REQUIRED for Numora to work correctly and must not be overridden:
    // - type='text': Using 'number' would cause browser-native validation/formatting that conflicts with Numora
    // - inputmode='decimal': Ensures mobile keyboards show numeric keypad
    // - spellcheck='false': Prevents spellcheck from interfering with numeric input
    // - autocomplete='off': Prevents browser autocomplete from interfering with formatting
    this.el.setAttribute('type', 'text');
    this.el.setAttribute('inputmode', 'decimal');
    this.el.setAttribute('spellcheck', 'false');
    this.el.setAttribute('autocomplete', 'off');

    // Pattern helps with native validation but is optional.
    // HTML pattern attr: optional leading `-` (if negatives enabled) + digits optionally
    // interleaved with the configured thousand separator + optional decimal separator +
    // digits. Must accept the component's OWN grouped output ("1,234", "1.234,5" in de-DE,
    // "12,34,567" in Lakh grouping, ...) or native constraint validation
    // (validity.patternMismatch / form.checkValidity()) fails on a value Numora itself
    // produced. Deliberately permissive about *where* the thousand separator falls -
    // Lakh/Wan group sizes differ from Thousand and enforcing exact group widths here would
    // just re-implement (and risk diverging from) formatWithSeparators.
    const escapedDecimal = escapeRegExp(this.resolvedOptions.decimalSeparator);
    const negativePrefix = this.resolvedOptions.allowNegative ? '-?' : '';
    const thousandSeparator = this.resolvedOptions.thousandSeparator;
    const escapedThousand = escapeRegExp(thousandSeparator);
    this.el.setAttribute(
      'pattern',
      `^${negativePrefix}[0-9${escapedThousand}]*([${escapedDecimal}][0-9]*)?$`
    );

    for (const name of NATIVE_ATTRIBUTES) {
      const attribute = options[name];
      if (attribute !== undefined) (this.el as unknown as Record<string, unknown>)[name] = attribute;
    }
    if (options.ariaLabel !== undefined) this.el.setAttribute('aria-label', options.ariaLabel);

    // When adopting an existing <input>, any pre-set value (e.g. <input value="100"
    // use:numora>) is kept unless the caller passes `value`.
    if (options.value !== undefined) this.el.value = options.value;

    if (!isExistingInput) {
      container.appendChild(this.el);
    }
  }

  private setupEventListeners(): void {
    const el = this.el;
    const opts = this.resolvedOptions;
    const add = <E extends Event>(type: string, handler: (e: E) => void) => {
      el.addEventListener(type, handler as EventListener);
      this.cleanups.push(() => el.removeEventListener(type, handler as EventListener));
    };

    // `beforeinput` is cancelable and fires before the browser edits, so the formatted value
    // goes in through `setRangeText` and the undo history survives.
    add<InputEvent>('beforeinput', (e) => this.emit(applyBeforeInput(e, opts)));
    // Fallback for edits with no `beforeinput`: undo/redo, autofill, programmatic dispatch.
    // Mid-composition text is the IME's: the final non-composing `input` reconciles it.
    add<InputEvent>('input', (e) =>
      e.isComposing || this.emit(applyInputFallback(el, e.inputType, this.isFocused, this.lastValue, opts))
    );
    add<KeyboardEvent>('keydown', (e) => handleOnKeyDownNumoraInput(e, opts));
    add<ClipboardEvent>('paste', (e) => this.emit(applyPaste(e, opts)));
    add('focus', () => {
      this.isFocused = true;
    });
    add('blur', () => {
      this.isFocused = false;
      // Only a raw change notifies: regrouping alone is cosmetic.
      const values = applyBlur(el, opts);
      this.emit(values?.rawChanged ? values : undefined);
    });
    this.cleanups.push(
      attachFocusStrip(
        el,
        () => opts,
        () => {
          this.lastValue = el.value;
        }
      )
    );
  }

  /**
   * Removes all Numora-internal event listeners from the underlying input. Call this when
   * tearing down an adopted `<input>` (Svelte action `destroy`, Vue `unmounted`, Angular
   * `ngOnDestroy`, Solid `onCleanup`) or before re-initialising Numora on the same
   * element - otherwise each re-init stacks a fresh set of listeners that double-fire
   * onChange and duplicate every DOM write per keystroke.
   *
   * Only removes listeners Numora added; anything else attached to the element is left
   * untouched. Does not remove the element from the DOM.
   * Idempotent - calling it more than once is a no-op.
   */
  public destroy(): void {
    // splice empties the list, so a second destroy() is a no-op.
    if (this.cleanups.length) {
      leftovers.set(this.el, { text: this.el.value, raw: this.value });
    }
    for (const cleanup of this.cleanups.splice(0)) cleanup();
  }

  /** Records a write the shared helpers made and reports it. */
  private emit(values: NumoraValues | undefined): void {
    this.lastValue = this.el.value;
    if (values) this.onChange?.({ value: values.value, formattedValue: values.formattedValue });
  }

  /**
   * The canonical raw value: ASCII digits, `.` decimal, `-` sign, no grouping, identical for
   * every locale (de-DE display `1.234.567,89` -> `1234567.89`). Safe to pass to a decimal
   * library. Assigning it is the same as {@link setValue}.
   */
  public get value(): string {
    return displayToRawValue(this.el.value, this.resolvedOptions);
  }

  public set value(value: string) {
    this.setValue(value);
  }

  /** The display string shown in the field (locale separators and grouping included). */
  public get formattedValue(): string {
    return this.el.value;
  }

  /** The underlying `<input>`: set any native attribute or add listeners on it directly. */
  public get element(): HTMLInputElement {
    return this.el;
  }

  /**
   * Sets the input's value programmatically.
   *
   * @param value - A canonical raw value (ADR 0004): `.` is always the decimal mark and
   *   there is no grouping, whatever the field's locale (`'1234.5'` shows as `1.234,5` in
   *   de-DE). It is never detected as locale text. It is re-formatted for display.
   * @param options.undoable - Defaults to `true`: routes the write through `setRangeText`
   *   so the browser's undo stack stays intact and `Ctrl+Z` can revert this call. Pass
   *   `false` only when you intentionally want to wipe the undo history (e.g. form reset).
   */
  public setValue(value: string, options?: { undoable?: boolean }): void {
    // Route through the same pipeline as typing/paste so programmatic writes honor
    // sanitization, decimalMaxLength, maxLength, allowNegative and grouping.
    const { formatted } = formatForDisplay(value, this.resolvedOptions, 'canonical');

    if (options?.undoable === false) this.el.value = formatted;
    else writeValuePreservingUndo(this.el, formatted, formatted.length);
    this.lastValue = formatted;
  }
}
