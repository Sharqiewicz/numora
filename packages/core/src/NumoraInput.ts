import { handleOnKeyDownNumoraInput } from './utils/event-handlers';
import { writeValue } from './features/formatting';
import { displayToRawValue, formatValueForDisplay } from './utils/format-utils';
import {
  applyBeforeInput,
  applyBlur,
  applyInputFallback,
  applyPaste,
  applySetValue,
  attachFocusStrip,
  formatForDisplay,
} from './utils/dom-events';
import { appValue } from './utils/app-value';
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
  onValueChange?: (values: NumoraValues) => void;
  /**
   * Fired with the display string every time Numora rewrites the field, including the
   * rewrites `onValueChange` is silent about: the blur regroup, the focus strip, `setValue()`
   * and an `update()` that only changes the format. Not fired on creation
   * (`formatValue(defaultValue, options)` gives the first text) and never twice in a row for
   * the same text. Use it to mirror the field, e.g. in an animated overlay.
   */
  onFormattedValueChange?: (formattedValue: string) => void;
  /**
   * Initial value, as a canonical raw value (`'1234.5'` in every locale). When adopting an
   * existing `<input>`, its own value is kept unless this is passed. Later writes go through
   * {@link NumoraInput.setValue}. Same name and meaning as the React `defaultValue` prop.
   */
  defaultValue?: string;
}

// Display text destroy() leaves in a field, with its raw value, so a re-init can tell Numora's
// own leftover text from an app-supplied canonical value (ADR 0004). Weak: no element leak.
const leftovers = new WeakMap<HTMLInputElement, { text: string; raw: string }>();

export class NumoraInput {
  private el!: HTMLInputElement;

  // Options as the caller gave them (merged by update()), and their resolved form.
  private options: NumoraInputOptions;
  private resolvedOptions: ResolvedNumoraOptions;

  // Mirrors this instance's focus/blur listeners rather than `document.activeElement`: tests
  // and some embedders dispatch synthetic focus/blur without moving real focus.
  private isFocused = false;
  /** Field text after the last write this class made; restored when the `input` fallback must refuse a value. */
  private lastValue!: string;
  /** Last text given to `onFormattedValueChange`; unset until the constructor is done. */
  private reported?: string;
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
    this.options = options;

    // Options removed since v4 are ignored and warned about. Checked on a copy: the caller's
    // object is left alone.
    warnRemovedOptions(takeRemovedOptions({ ...options }));

    this.createInputElement(target);
    this.applyOptions(options);
    // When adopting an existing <input>, any pre-set value (e.g. <input value="100"
    // use:numora>) is kept unless the caller passes `defaultValue`.
    if (options.defaultValue !== undefined) this.el.value = appValue(options.defaultValue, 'defaultValue');
    this.setupEventListeners();
    // The initial value (option, or a pre-set value on an adopted <input>) is supplied by
    // the app, so it is a canonical raw value (ADR 0004), not locale text. Also seeds `lastValue`.
    const left = leftovers.get(this.el);
    this.setValue(left?.text === this.el.value ? left.raw : this.el.value);
    this.reported = this.el.value;
  }

  private createInputElement(container: HTMLElement): void {
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

    if (!isExistingInput) {
      container.appendChild(this.el);
    }
  }

  /**
   * Writes the native attributes given onto the element. No `pattern` is set: the field can
   * only hold what Numora wrote, and a `pattern` of your own on the element is left alone.
   */
  private applyOptions(options: NumoraInputOptions): void {
    for (const name of NATIVE_ATTRIBUTES) {
      const attribute = options[name];
      if (attribute !== undefined) (this.el as unknown as Record<string, unknown>)[name] = attribute;
    }
    if (options.ariaLabel !== undefined) this.el.setAttribute('aria-label', options.ariaLabel);
  }

  private setupEventListeners(): void {
    const el = this.el;
    // Read per event: update() swaps the options.
    const opts = () => this.resolvedOptions;
    const add = <E extends Event>(type: string, handler: (e: E) => void) => {
      el.addEventListener(type, handler as EventListener);
      this.cleanups.push(() => el.removeEventListener(type, handler as EventListener));
    };

    // `beforeinput` is cancelable and fires before the browser edits, so only the formatted
    // value is ever shown.
    add<InputEvent>('beforeinput', (e) => this.emit(applyBeforeInput(e, opts())));
    // Fallback for edits with no `beforeinput`: autofill, drop, programmatic dispatch.
    // Mid-composition text is the IME's: the final non-composing `input` reconciles it.
    add<InputEvent>('input', (e) =>
      e.isComposing || this.emit(applyInputFallback(el, this.isFocused, this.lastValue, opts()))
    );
    add<KeyboardEvent>('keydown', (e) => handleOnKeyDownNumoraInput(e, opts()));
    add<ClipboardEvent>('paste', (e) => this.emit(applyPaste(e, opts())));
    add('focus', () => {
      this.isFocused = true;
    });
    add('blur', () => {
      this.isFocused = false;
      this.emit(applyBlur(el, opts()));
    });
    this.cleanups.push(
      // A strip leaves the raw value alone: only the display is reported.
      attachFocusStrip(el, opts, () => this.emit(undefined))
    );
  }

  /**
   * Removes all Numora-internal event listeners from the underlying input. Call this when
   * tearing down an adopted `<input>` (Svelte action `destroy`, Vue `unmounted`, Angular
   * `ngOnDestroy`, Solid `onCleanup`) or before re-initialising Numora on the same
   * element - otherwise each re-init stacks a fresh set of listeners that double-fire
   * onValueChange and duplicate every DOM write per keystroke.
   *
   * Only removes listeners Numora added; anything else attached to the element is left
   * untouched. Does not remove the element from the DOM.
   * Idempotent - calling it more than once is a no-op.
   */
  public destroy(): void {
    // splice empties the list, so a second destroy() is a no-op.
    if (this.cleanups.length) {
      leftovers.set(this.el, { text: this.el.value, raw: this.rawValue });
    }
    for (const cleanup of this.cleanups.splice(0)) cleanup();
  }

  /**
   * Records a write to the field and reports it: `onValueChange` when the caller passes the
   * values of a raw change, then `onFormattedValueChange` when the text is new.
   */
  private emit(values: NumoraValues | undefined): void {
    const text = this.el.value;
    this.lastValue = text;
    if (values) this.options.onValueChange?.({ value: values.value, formattedValue: values.formattedValue });
    if (this.reported !== undefined && text !== this.reported) {
      this.reported = text;
      this.options.onFormattedValueChange?.(text);
    }
  }

  /**
   * The canonical raw value: ASCII digits, `.` decimal, `-` sign, no grouping, identical for
   * every locale (de-DE display `1.234.567,89` -> `1234567.89`). Safe to pass to a decimal
   * library. Read-only: write with {@link setValue}. (`element.value` is the display string.)
   */
  public get rawValue(): string {
    return displayToRawValue(this.el.value, this.resolvedOptions);
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
   * Sets the input's value programmatically. Like assigning `element.value`, it is the app's
   * own write: it does not call `onValueChange` and is not checked by `isAllowed`. The new
   * text still goes to `onFormattedValueChange`.
   *
   * @param value - A canonical raw value (ADR 0004): `.` is always the decimal mark and
   *   there is no grouping, whatever the field's locale (`'1234.5'` shows as `1.234,5` in
   *   de-DE). It is never detected as locale text. It is re-formatted for display.
   */
  public setValue(value: string): void {
    // Same pipeline as typing/paste, so programmatic writes honor sanitization,
    // decimalMaxLength, maxLength, allowNegative and grouping.
    applySetValue(this.el, value, this.isFocused, this.resolvedOptions);
    this.emit(undefined);
  }

  /**
   * Changes options on a live field. `options` is merged over the current ones; a key set
   * to `undefined` goes back to its default (a native attribute left `undefined` is not
   * touched). The current raw value is kept and re-run through the new options: the display
   * is rewritten, and `onValueChange` fires only if the raw value itself changed, e.g. a
   * smaller `decimalMaxLength` cut digits off (ADR 0008).
   *
   * @throws when the merged options are invalid. Nothing is changed in that case.
   */
  public update(options: Omit<NumoraInputOptions, 'defaultValue'>): void {
    const merged = { ...this.options, ...options };
    const resolved = resolveOptions(merged);
    warnRemovedOptions(takeRemovedOptions({ ...options }));

    const before = this.rawValue;
    this.options = merged;
    this.resolvedOptions = resolved;
    this.applyOptions(options);

    // A focused Blur-mode field shows no grouping, so it keeps its edit-time format.
    const { formatted, raw } = this.isFocused
      ? formatValueForDisplay(before, resolved.decimalMaxLength, resolved, 'canonical')
      : formatForDisplay(before, resolved, 'canonical');
    if (formatted !== this.el.value) writeValue(this.el, formatted, formatted.length);
    this.emit(raw !== before ? { value: raw, formattedValue: formatted } : undefined);
  }
}
