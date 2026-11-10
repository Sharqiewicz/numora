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
import { applyLocale } from './utils/locale';
import {
  DEFAULT_AUTO_ADD_LEADING_ZERO,
  DEFAULT_DECIMAL_MAX_LENGTH,
  DEFAULT_DECIMAL_MIN_LENGTH,
  DEFAULT_DECIMAL_SEPARATOR,
  DEFAULT_ENABLE_COMPACT_NOTATION,
  DEFAULT_ENABLE_SCIENTIFIC_NOTATION,
  DEFAULT_ENABLE_LEADING_ZEROS,
  DEFAULT_ENABLE_NEGATIVE,
  DEFAULT_FORMAT_ON,
  DEFAULT_THOUSAND_SEPARATOR,
  DEFAULT_GROUPING_STYLE,
} from './config';
import {
  FormatOn,
  GroupingStyle,
  type FormattingOptions,
  type LocaleTag,
  type NumoraValues,
} from './types';
import { validateNumoraInputOptions } from './validation';

// maxLength and isAllowed are opt-in only - no sensible default - so they stay optional
// in the resolved options. Everything else has a default in `config.ts`.
type ResolvedNumoraOptions = Required<Omit<FormattingOptions, 'maxLength' | 'isAllowed'>> &
  Pick<FormattingOptions, 'maxLength' | 'isAllowed'> & {
    onChange?: (values: NumoraValues) => void;
  };

export interface NumoraInputOptions
  extends Partial<Omit<HTMLInputElement, 'value' | 'defaultValue' | 'onChange' | 'maxLength'>> {
  // Formatting options
  formatOn?: FormatOn;

  // Thousand options
  thousandSeparator?: string;
  groupingStyle?: GroupingStyle;

  // Decimal options
  decimalSeparator?: string;
  decimalMaxLength?: number;
  decimalMinLength?: number;

  // Locale
  locale?: LocaleTag | true;

  // Parsing options
  enableCompactNotation?: boolean;
  enableScientificNotation?: boolean;
  enableNegative?: boolean;
  enableLeadingZeros?: boolean;
  autoAddLeadingZero?: boolean;

  // Validation
  /** Max raw length (digits + decimal sep + leading `-`). Separators not counted. */
  maxLength?: number;
  /** Reject keystroke/paste if this returns false. Called with post-sanitization raw value. */
  isAllowed?: (rawValue: string) => boolean;

  // Event handlers
  /** Fired on every change with `{ value, formattedValue }`: canonical raw + display string. */
  onChange?: (values: NumoraValues) => void;

  // Value initialization
  value?: string;
  defaultValue?: string;
}

export class NumoraInput {
  private element!: HTMLInputElement;

  private resolvedOptions: ResolvedNumoraOptions;

  // Mirrors this instance's focus/blur listeners rather than `document.activeElement`: tests
  // and some embedders dispatch synthetic focus/blur without moving real focus.
  private isFocused = false;
  /** Field text after the last write this class made; restored when the `input` fallback must refuse a value. */
  private lastValue = '';
  // Removes exactly the listeners Numora added, so destroy() leaves the caller's alone.
  private cleanups: Array<() => void> = [];

  /**
   * @param target - Either an existing `<input>` to **adopt in place** (its listeners are
   *   attached directly - ideal for a Svelte action / Vue directive / Solid ref), or any
   *   other element to **mount a new `<input>` into** as a child. Selected at runtime by an
   *   `instanceof HTMLInputElement` check.
   * @param options - Numora formatting options plus any native `<input>` attributes.
   */
  constructor(target: HTMLInputElement | HTMLElement, options: NumoraInputOptions) {
    const container = target;
    const {
      decimalMaxLength = DEFAULT_DECIMAL_MAX_LENGTH,
      decimalMinLength = DEFAULT_DECIMAL_MIN_LENGTH,
      formatOn = DEFAULT_FORMAT_ON,
      thousandSeparator,
      // Deliberately NOT defaulted here: `applyLocale` can derive the grouping style from
      // the locale (Indic locales -> Lakh), and a pre-applied default would always win the
      // `?? ` below and swallow the derived value. Defaulted after locale resolution.
      groupingStyle,
      decimalSeparator,
      locale,
      enableCompactNotation = DEFAULT_ENABLE_COMPACT_NOTATION,
      enableScientificNotation = DEFAULT_ENABLE_SCIENTIFIC_NOTATION,
      enableNegative = DEFAULT_ENABLE_NEGATIVE,
      enableLeadingZeros = DEFAULT_ENABLE_LEADING_ZEROS,
      autoAddLeadingZero = DEFAULT_AUTO_ADD_LEADING_ZERO,
      maxLength,
      isAllowed,
      onChange,
      // Pulled out so they never reach the native <input> (maxLength would double-count
      // separators; type/inputMode/spellcheck/autocomplete are set explicitly below).
      value,
      defaultValue,
      type,
      inputMode,
      spellcheck,
      autocomplete,
      ...nativeProps
    } = options;

    const separators = applyLocale(locale, { thousandSeparator, decimalSeparator, groupingStyle });

    this.resolvedOptions = {
      decimalMaxLength,
      decimalMinLength,
      formatOn,
      thousandSeparator: separators.thousandSeparator ?? DEFAULT_THOUSAND_SEPARATOR,
      groupingStyle: separators.groupingStyle ?? DEFAULT_GROUPING_STYLE,
      decimalSeparator: separators.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
      enableCompactNotation,
      enableScientificNotation,
      enableNegative,
      enableLeadingZeros,
      autoAddLeadingZero,
      maxLength,
      isAllowed,
      onChange,
    };

    // Validate AFTER defaults + locale are resolved, not on the raw options. The
    // separator-conflict and min/max-decimal checks only fire when both operands are
    // present; validating raw options let, e.g., `{ decimalSeparator: ',' }` slip through
    // (thousandSeparator undefined at that point) only to resolve to the default ','
    // separator at runtime and silently swallow the decimal part.
    validateNumoraInputOptions(this.resolvedOptions);

    this.createInputElement(container, nativeProps, value, defaultValue);
    this.setupEventListeners();
    this.setDefaultValue();
    this.lastValue = this.element.value;
  }

  private setDefaultValue(): void {
    // The initial value (option, or a pre-set value on an adopted <input>) is supplied by
    // the app, so it is a canonical raw value (ADR 0004), not locale text.
    this.element.value = formatForDisplay(this.element.value, this.resolvedOptions, 'canonical').formatted;
  }

  private createInputElement(
    container: HTMLElement,
    nativeProps: Partial<HTMLInputElement>,
    value?: string,
    defaultValue?: string
  ): void {
    // If an <input> is passed directly (Svelte action, Vue directive, Angular directive,
    // Solid ref), adopt it instead of creating a new one so frameworks can use the
    // idiomatic <input use:numora> shape rather than a wrapping container <div>.
    const isExistingInput = container instanceof HTMLInputElement;
    this.element = isExistingInput ? container : document.createElement('input');

    // These attributes are REQUIRED for Numora to work correctly and must not be overridden:
    // - type='text': Using 'number' would cause browser-native validation/formatting that conflicts with Numora
    // - inputmode='decimal': Ensures mobile keyboards show numeric keypad
    // - spellcheck='false': Prevents spellcheck from interfering with numeric input
    // - autocomplete='off': Prevents browser autocomplete from interfering with formatting
    this.element.setAttribute('type', 'text');
    this.element.setAttribute('inputmode', 'decimal');
    this.element.setAttribute('spellcheck', 'false');
    this.element.setAttribute('autocomplete', 'off');

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
    const negativePrefix = this.resolvedOptions.enableNegative ? '-?' : '';
    const thousandSeparator = this.resolvedOptions.thousandSeparator;
    const escapedThousand = escapeRegExp(thousandSeparator);
    this.element.setAttribute(
      'pattern',
      `^${negativePrefix}[0-9${escapedThousand}]*([${escapedDecimal}][0-9]*)?$`
    );

    Object.assign(this.element, nativeProps);

    // Handle value initialization. When adopting an existing <input>, any pre-set value
    // (e.g. <input value="100" use:numora>) is preserved unless the caller passes value
    // or defaultValue explicitly via options.
    if (value !== undefined) {
      this.element.value = value;
    } else if (defaultValue !== undefined) {
      this.element.defaultValue = defaultValue;
      this.element.value = defaultValue;
    }

    if (!isExistingInput) {
      container.appendChild(this.element);
    }
  }

  private setupEventListeners(): void {
    const el = this.element;
    const opts = this.resolvedOptions;
    const add = <E extends Event>(type: string, handler: (e: E) => void) => {
      el.addEventListener(type, handler as EventListener);
      this.cleanups.push(() => el.removeEventListener(type, handler as EventListener));
    };

    // `beforeinput` is cancelable and fires before the browser edits, so the formatted value
    // goes in through `setRangeText` and the undo history survives.
    add<InputEvent>('beforeinput', (e) => this.emit(applyBeforeInput(e, opts)));
    // Fallback for edits with no `beforeinput`: undo/redo, autofill, programmatic dispatch.
    add<InputEvent>('input', (e) =>
      this.emit(applyInputFallback(el, e.inputType, this.isFocused, this.lastValue, opts))
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
    for (const cleanup of this.cleanups.splice(0)) cleanup();
  }

  /** Records a write the shared helpers made and reports it. */
  private emit(values: NumoraValues | undefined): void {
    this.lastValue = this.element.value;
    if (values) this.resolvedOptions.onChange?.({ value: values.value, formattedValue: values.formattedValue });
  }

  /**
   * The canonical raw value: ASCII digits, `.` decimal, `-` sign, no grouping, identical for
   * every locale (de-DE display `1.234.567,89` -> `1234567.89`). Safe to parse with
   * `Number()` or a decimal library. Use {@link getFormattedValue} for the display string.
   */
  public getValue(): string {
    return displayToRawValue(this.element.value, this.resolvedOptions);
  }

  /** The display string shown in the field (locale separators and grouping included). */
  public getFormattedValue(): string {
    return this.element.value;
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
    // sanitization, decimalMaxLength, maxLength, enableNegative and grouping.
    const { formatted } = formatForDisplay(value, this.resolvedOptions, 'canonical');

    if (options?.undoable === false) {
      this.element.value = formatted;
      this.lastValue = formatted;
      return;
    }
    writeValuePreservingUndo(this.element, formatted, formatted.length);
    this.lastValue = formatted;
  }

  /**
   * Returns the underlying HTMLInputElement for direct access.
   * This allows users to interact with the input as a normal HTMLInputElement.
   */
  public getElement(): HTMLInputElement {
    return this.element;
  }

  /**
   * The canonical raw value (same as {@link getValue}). Use {@link getFormattedValue} for
   * the display string.
   */
  public get value(): string {
    return this.getValue();
  }

  /**
   * Sets the value of the input from a canonical raw value (same as {@link setValue}).
   */
  public set value(val: string) {
    this.setValue(val);
  }

  /**
   * Gets the value as a number, similar to HTMLInputElement.valueAsNumber.
   * Returns NaN if the value cannot be converted to a number.
   *
   * **Precision warning**: this getter returns a JavaScript `number` (IEEE 754 double).
   * Values beyond ~15 significant digits will lose precision. Numora is designed around
   * string values for this reason - prefer {@link getValue} when exact precision matters.
   * Treat `valueAsNumber` strictly as an escape hatch for arithmetic that you already know
   * is safe at float precision.
   */
  public get valueAsNumber(): number {
    const value = this.getValue();
    if (!value) {
      return NaN;
    }
    return Number(value);
  }

  /**
   * Sets the value from a number, similar to HTMLInputElement.valueAsNumber.
   *
   * @throws {RangeError} if `num` is negative and `enableNegative` is false. A silent
   * sign flip on a money field is worse than an exception - the field would otherwise
   * display a positive value for a negative input with no indication anything was lost.
   * @throws {RangeError} if `num` is `Infinity`, `-Infinity`, or `NaN` (passed directly as a
   * number, not a non-numeric coercion - see below). Silently clearing the field for a
   * non-finite number hides a bug in the caller's own arithmetic; a numeric field has no
   * sensible display for "infinity" to silently normalize to, unlike -0.
   */
  public set valueAsNumber(num: number) {
    // Untyped JS callers can pass a non-number here despite the `number` type. Only
    // genuinely non-numeric input (typeof !== 'number' - a string, an object, ...) is
    // treated leniently and silently clears the field, matching the pre-existing behaviour
    // for e.g. `valueAsNumber = 'abc'`. A real `number` that happens to be `NaN` falls
    // through to the finiteness check below and throws, same as `Infinity`/`-Infinity` -
    // silently clearing the field for those hides a bug in the caller's own arithmetic; a
    // numeric field has no sensible display to silently normalize a non-finite value to.
    if (typeof num !== 'number' && Number.isNaN(Number(num))) {
      this.setValue('');
      return;
    }
    if (!Number.isFinite(num)) {
      throw new RangeError(`valueAsNumber: value must be finite (received ${num})`);
    }
    if (num < 0 && !this.resolvedOptions.enableNegative) {
      throw new RangeError('valueAsNumber: negative value but enableNegative is false');
    }
    // `num.toString()` is a canonical raw value (dot decimal, possibly exponent form that
    // the sanitization pipeline expands), exactly what `setValue` takes.
    this.setValue(num.toString());
  }
}
