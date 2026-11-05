import {
  handleOnBeforeInputNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
} from './utils/event-handlers';
import {
  computeCursorPosition,
  computeStripSeparatorsResult,
  writeStripPreservingUndo,
  writeValuePreservingUndo,
} from './features/formatting';
import { getSeparators } from './features/decimals';
import {
  displayToRawValue,
  formatInputValue,
  formatValueForDisplay,
  normalizeNegativeZero,
} from './utils/format-utils';
import type { ValueSource } from './features/sanitization';
import { escapeRegExp } from './utils/escape-reg-exp';
import { applyLocale } from './utils/locale';
import {
  DEFAULT_AUTO_ADD_LEADING_ZERO,
  DEFAULT_DECIMAL_MAX_LENGTH,
  DEFAULT_DECIMAL_MIN_LENGTH,
  DEFAULT_DECIMAL_SEPARATOR,
  DEFAULT_ENABLE_COMPACT_NOTATION,
  DEFAULT_ENABLE_LEADING_ZEROS,
  DEFAULT_ENABLE_NEGATIVE,
  DEFAULT_FORMAT_ON,
  DEFAULT_THOUSAND_SEPARATOR,
  DEFAULT_GROUPING_STYLE,
} from './config';
import {
  FormatOn,
  InputType,
  GroupingStyle,
  type FormattingOptions,
  type CaretPositionInfo,
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

// Every option that belongs to Numora rather than the native <input>. createInputElement
// strips these before Object.assign-ing the rest onto the DOM element; otherwise they
// would land as nonsense attributes (`thousandseparator=","` etc.). Add new options here
// whenever a new field is introduced in NumoraInputOptions.
const NUMORA_OPTION_KEYS = new Set<string>([
  'decimalMaxLength',
  'decimalMinLength',
  'formatOn',
  'thousandSeparator',
  'groupingStyle',
  'decimalSeparator',
  'locale',
  'enableCompactNotation',
  'enableNegative',
  'enableLeadingZeros',
  'autoAddLeadingZero',
  'maxLength',
  'isAllowed',
  'onChange',
  'value',
  'defaultValue',
  // Protected native attrs set explicitly in createInputElement.
  'type',
  'inputMode',
  'spellcheck',
  'autocomplete',
]);

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

  // True while we're applying our own setRangeText. `setRangeText` does not synchronously
  // dispatch `input` in current browsers or jsdom (verified); this flag is defensive, for
  // environments or polyfills that do dispatch `input` on a programmatic write - such an
  // event must NOT re-enter handleChange's broadcast path, or onChange double-fires and
  // the cursor is recomputed against the post-write value.
  // try/finally in withInternalWrite guarantees this clears even if the write throws.
  private suppressNextInputEvent: boolean = false;

  // Mouse-driven focus: the browser commits the click→selection mapping AFTER focus
  // fires, using the input's current value. If we strip separators in the focus handler,
  // the click X-coord then maps to a position N digits too far right (where N = separators
  // before the click point). Set on mousedown, cleared on click after we strip + map -
  // click fires after the browser has finalised the caret, so selectionStart reflects
  // the user's intended position when we read it.
  private pendingMouseStrip: boolean = false;

  // Tracked internally rather than read off `document.activeElement` - tests (and some
  // non-browser embedders) dispatch synthetic `focus`/`blur` events directly without ever
  // moving the real DOM focus, so `document.activeElement` would not reflect them. This
  // flag mirrors whatever focus/blur events this instance's own listeners have actually
  // seen, which is what `handleChange`'s resting-vs-typing branch (A2-07) needs.
  private isFocused: boolean = false;

  private caretPositionBeforeChange?: CaretPositionInfo;

  // Bound listeners Numora attached, retained so destroy() can remove exactly them.
  private boundListeners: Array<[string, EventListener]> = [];
  private isDestroyed: boolean = false;

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
      enableNegative = DEFAULT_ENABLE_NEGATIVE,
      enableLeadingZeros = DEFAULT_ENABLE_LEADING_ZEROS,
      autoAddLeadingZero = DEFAULT_AUTO_ADD_LEADING_ZERO,
      maxLength,
      isAllowed,
      onChange,
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

    this.createInputElement(container, options);
    this.setupEventListeners();
    this.setDefaultValue();
  }

  /** Display text (what is in the field) to the canonical raw value. */
  private toRaw(display: string): string {
    return displayToRawValue(display, this.resolvedOptions);
  }

  /**
   * Runs the full sanitization + formatting pipeline on a value destined for the DOM
   * (initial value, programmatic `setValue`, and blur). Forcing `formatOn: Change` makes
   * grouping separators apply regardless of the field's edit-time mode, so a
   * resting/programmatic value always shows the same formatting the typed value settles
   * to. Delegates to `formatValueForDisplay` (rather than `formatInputValue` directly) so
   * decimalMinLength padding and the trailing-separator strip - display/blur-only concerns
   * - apply here too. Mirrors the React adapter's `formatForDisplay`, keeping the two
   * packages' non-typing paths in parity.
   *
   * `source` says how to read `value`: `display` (the field's own text, e.g. on blur),
   * `foreign` (browser-inserted text) or `canonical` (app-supplied, `.` is the decimal).
   */
  private formatForDisplay(
    value: string,
    source: ValueSource = 'display'
  ): { formatted: string; raw: string } {
    return formatValueForDisplay(
      value,
      this.resolvedOptions.decimalMaxLength,
      { ...this.resolvedOptions, formatOn: FormatOn.Change },
      source
    );
  }

  private setDefaultValue(): void {
    if (!this.element.value) return;

    // The initial value (option, or a pre-set value on an adopted <input>) is supplied by
    // the app, so it is a canonical raw value (ADR 0004), not locale text.
    this.element.value = this.formatForDisplay(this.element.value, 'canonical').formatted;
  }

  private createInputElement(container: HTMLElement, options: NumoraInputOptions): void {
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
    const escapedThousand = thousandSeparator ? escapeRegExp(thousandSeparator) : '';
    this.element.setAttribute(
      'pattern',
      `^${negativePrefix}[0-9${escapedThousand}]*([${escapedDecimal}][0-9]*)?$`
    );

    // Filter Numora-specific options + protected native attrs from what we assign.
    // maxLength is in NUMORA_OPTION_KEYS so it never reaches the native attribute - the
    // native one counts formatted chars (separators included), which would double-count
    // vs Numora's raw-length semantics.
    const nativeProps = Object.fromEntries(
      Object.entries(options).filter(([key]) => !NUMORA_OPTION_KEYS.has(key))
    );

    Object.assign(this.element, nativeProps);

    // Handle value initialization. When adopting an existing <input>, any pre-set value
    // (e.g. <input value="100" use:numora>) is preserved unless the caller passes value
    // or defaultValue explicitly via options.
    if (options.value !== undefined) {
      this.element.value = options.value;
    } else if (options.defaultValue !== undefined) {
      this.element.defaultValue = options.defaultValue;
      this.element.value = options.defaultValue;
    }

    if (!isExistingInput) {
      container.appendChild(this.element);
    }
  }

  private setupEventListeners(): void {
    // Bind once and record each listener so destroy() can remove exactly what we added
    // (without touching listeners a caller attached via the public addEventListener).
    const add = (type: string, handler: EventListener) => {
      this.element.addEventListener(type, handler);
      this.boundListeners.push([type, handler]);
    };

    // beforeinput fires before the browser applies the user's action and is cancelable,
    // which lets us apply the formatted value via setRangeText and preserve undo history.
    add('beforeinput', this.handleBeforeInput.bind(this) as EventListener);
    // The input listener stays as a fallback for programmatic value changes in tests or
    // environments that dispatch 'input' without a preceding 'beforeinput'.
    add('input', this.handleChange.bind(this) as EventListener);
    add('keydown', this.handleKeyDown.bind(this) as EventListener);
    add('paste', this.handlePaste.bind(this) as EventListener);

    // `isFocused` bookkeeping is unconditional - independent of the formatOn/grouping/
    // decimalMinLength/enableNegative combination below, `handleChange`'s resting-vs-typing
    // branch (A2-07) needs an accurate focus state for every configuration, including a
    // plain Change-mode field with none of those options set (which otherwise gets no
    // focus/blur listener at all). Deliberately minimal - no formatting side effects - so
    // it never changes behaviour for a config that doesn't also meet the condition below.
    add('focus', () => {
      this.isFocused = true;
    });
    add('blur', () => {
      this.isFocused = false;
    });

    // Focus/blur handlers are needed for 'blur' mode grouping, for decimalMinLength
    // padding (applies on blur regardless of formatOn - see handleBlur below), AND for the
    // -0 -> 0 normalization (A2-11), which is likewise a blur-time concern independent of
    // formatOn/grouping. The Blur-mode guard that used to live here now lives in
    // stripSeparatorsAndMapCaret so Change mode + decimalMinLength/enableNegative doesn't
    // strip separators on focus.
    if (
      (this.resolvedOptions.formatOn === FormatOn.Blur && this.resolvedOptions.thousandSeparator) ||
      this.resolvedOptions.decimalMinLength > 0 ||
      this.resolvedOptions.enableNegative
    ) {
      add('focus', this.handleFocus.bind(this) as EventListener);
      add('blur', this.handleBlur.bind(this) as EventListener);
      // Mouse path: capture the intent on mousedown, defer strip until click so the
      // browser's click→selection mapping runs against the still-formatted value and
      // is committed to selectionStart before we read it. Caret is hidden until then.
      add('mousedown', this.handleMouseDown.bind(this) as EventListener);
      add('click', this.handleClick.bind(this) as EventListener);
    }
  }

  /**
   * Removes all Numora-internal event listeners from the underlying input. Call this when
   * tearing down an adopted `<input>` (Svelte action `destroy`, Vue `unmounted`, Angular
   * `ngOnDestroy`, Solid `onCleanup`) or before re-initialising Numora on the same
   * element - otherwise each re-init stacks a fresh set of listeners that double-fire
   * onChange and duplicate every DOM write per keystroke.
   *
   * Only removes listeners Numora added; anything attached via the public
   * addEventListener is left untouched. Does not remove the element from the DOM.
   * Idempotent - calling it more than once is a no-op.
   */
  public destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    for (const [type, handler] of this.boundListeners) {
      this.element.removeEventListener(type, handler);
    }
    this.boundListeners = [];
  }

  /**
   * Runs `fn` with `suppressNextInputEvent` set so `handleChange` short-circuits if an
   * `input` event fires as a result. `setRangeText` does not synchronously dispatch
   * `input` in current browsers or jsdom (verified) - this guard is defensive, for
   * environments or polyfills that do dispatch `input` on a programmatic write. Exactly
   * one set/clear pair per write; try/finally guarantees the flag clears even if `fn`
   * throws.
   */
  private withInternalWrite(fn: () => void): void {
    this.suppressNextInputEvent = true;
    try {
      fn();
    } finally {
      this.suppressNextInputEvent = false;
    }
  }

  private handleValueChange(formattedValue: string, rawValue: string): void {
    this.resolvedOptions.onChange?.({ value: rawValue, formattedValue });
  }

  private handleBeforeInput(e: InputEvent): void {
    const result = handleOnBeforeInputNumoraInput(
      e,
      this.resolvedOptions.decimalMaxLength,
      this.resolvedOptions
    );

    switch (result.type) {
      case 'handled': {
        e.preventDefault();
        this.withInternalWrite(() =>
          writeValuePreservingUndo(this.element, result.formatted, result.cursorPos)
        );
        this.handleValueChange(result.formatted, result.raw);
        break;
      }
      case 'reject':
        e.preventDefault();
        break;
      case 'skip':
        break;
    }
  }

  private handleChange(e: Event): void {
    // Only reached via `input` if some environment/polyfill dispatched it off our own
    // setRangeText write; the originating handler (beforeinput/paste/focus/blur) already
    // broadcast. Skip to avoid double-firing.
    if (this.suppressNextInputEvent) return;

    const target = e.target as HTMLInputElement;

    // Undo/redo: the browser has restored a prior value. Re-formatting here would push
    // another setRangeText step onto the stack and break the natural Ctrl+Z walk-back.
    // Just broadcast the restored value.
    if (
      e instanceof InputEvent &&
      (e.inputType === InputType.HistoryUndo || e.inputType === InputType.HistoryRedo)
    ) {
      const raw = this.toRaw(target.value);
      this.caretPositionBeforeChange = undefined;
      this.handleValueChange(target.value, raw);
      return;
    }

    // Browser-inserted text (autofill, a programmatic `el.value = x` + dispatched `input`)
    // can be in any locale's format, so it is read with foreign-format detection (ADR 0006).
    // Programmatic input event (synthetic dispatch from external code or tests). Format
    // the current value and route the write through writeValuePreservingUndo so undo stays
    // intact instead of being wiped by `target.value = x`.
    const oldValue = target.value;
    // Max of start/end works around a mobile-browser caret bug where selectionStart lags.
    const oldCursorPosition = Math.max(target.selectionStart ?? 0, target.selectionEnd ?? 0);
    const separators = getSeparators(this.resolvedOptions);

    // When the element isn't focused (autofill, a programmatic `el.value = x` + dispatched
    // `input` from external code, a form library resetting the field), there is no typing
    // caret to preserve and no "mid-edit" state to respect - format the same way the
    // resting/display value is always formatted (formatForDisplay forces FormatOn.Change),
    // so e.g. Blur mode doesn't leave an ungrouped value sitting in an unfocused field.
    // The focused path is unchanged: format under the field's real formatOn mode.
    //
    // Tracked via the instance's own `isFocused` flag (set by handleFocus/handleBlur)
    // rather than `document.activeElement` - a synthetic `focus`/`blur` event dispatched
    // without moving real DOM focus (common in tests, and possible from non-browser
    // embedders) still reaches those listeners and should count as focused/unfocused.
    const isFocused = this.isFocused;
    const { formatted: newValue, raw: rawValue } = isFocused
      ? formatInputValue(
          oldValue,
          this.resolvedOptions.decimalMaxLength,
          this.resolvedOptions,
          this.resolvedOptions.formatOn === FormatOn.Change,
          'foreign'
        )
      : this.formatForDisplay(oldValue, 'foreign');

    if (oldValue !== newValue) {
      const computed = isFocused
        ? computeCursorPosition(
            oldValue,
            newValue,
            oldCursorPosition,
            this.caretPositionBeforeChange,
            separators,
            this.resolvedOptions
          )
        : newValue.length;
      this.withInternalWrite(() =>
        writeValuePreservingUndo(target, newValue, computed ?? newValue.length)
      );
    }

    this.caretPositionBeforeChange = undefined;
    this.handleValueChange(newValue, rawValue);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const inputElement = e.target as HTMLInputElement;
    this.caretPositionBeforeChange = handleOnKeyDownNumoraInput(e, this.resolvedOptions) ?? {
      selectionStart: inputElement.selectionStart ?? 0,
      selectionEnd: inputElement.selectionEnd ?? 0,
    };
  }

  private handlePaste(e: ClipboardEvent): void {
    e.preventDefault();
    // A readOnly/disabled field must reject the paste outright - no write, no onChange -
    // matching native <input> behaviour (a native readOnly/disabled input never accepts
    // pasted text either).
    if (this.element.readOnly || this.element.disabled) return;
    const result = handleOnPasteNumoraInput(
      e,
      this.resolvedOptions.decimalMaxLength,
      this.resolvedOptions
    );

    if (result.type === 'reject') return;

    this.withInternalWrite(() =>
      writeValuePreservingUndo(this.element, result.formatted, result.cursorPos)
    );
    this.handleValueChange(result.formatted, result.raw);
  }

  private stripSeparatorsAndMapCaret(target: HTMLInputElement): void {
    // Change mode never groups mid-edit, so there is nothing to strip on focus even when
    // focus/blur listeners are attached solely for decimalMinLength padding.
    if (this.resolvedOptions.formatOn !== FormatOn.Blur) return;
    const sep = this.resolvedOptions.thousandSeparator;
    if (!sep || this.resolvedOptions.groupingStyle === GroupingStyle.None) return;
    const displayStart = target.selectionStart ?? 0;
    const displayEnd = target.selectionEnd ?? target.value.length;
    // Captured before the write: stripping separators never changes the underlying digits,
    // only their display, so the canonical raw of `result.raw` below equals this in every real
    // case - comparing the two is what keeps onChange from firing on a focus/click that changes
    // nothing but presentation (see A2-06). Both sides must be canonical: `result.raw` is
    // locale text (`1234567,89` in de-DE).
    const rawBeforeStrip = this.toRaw(target.value);
    const result = computeStripSeparatorsResult(target.value, displayStart, displayEnd, sep);
    if (!result) return;

    this.withInternalWrite(() =>
      writeStripPreservingUndo(target, result.raw, result.rawStart, result.rawEnd)
    );
    if (this.toRaw(result.raw) !== rawBeforeStrip) {
      this.handleValueChange(target.value, this.toRaw(target.value));
    }
  }

  private handleFocus(e: FocusEvent): void {
    this.isFocused = true;
    // Mouse-driven focus: skip - the strip happens on click, after the browser
    // has placed the cursor based on where the user clicked in the formatted value.
    if (this.pendingMouseStrip) return;
    this.stripSeparatorsAndMapCaret(e.target as HTMLInputElement);
  }

  private handleMouseDown(e: MouseEvent): void {
    // Only the primary (left) button dispatches a following `click`; right/middle button
    // would set the flag with no `click` to clear it, wedging pendingMouseStrip true so
    // every later focus skips the separator strip. (blur also clears it as a backstop.)
    if (e.button !== 0) return;
    this.pendingMouseStrip = true;
  }

  private handleClick(e: MouseEvent): void {
    if (!this.pendingMouseStrip) return;
    this.pendingMouseStrip = false;
    this.stripSeparatorsAndMapCaret(e.target as HTMLInputElement);
  }

  private handleBlur(e: FocusEvent): void {
    this.isFocused = false;
    this.pendingMouseStrip = false;

    const target = e.target as HTMLInputElement;
    if (!target.value) return;

    const rawBeforeBlur = this.toRaw(target.value);

    // "-0" (and its decimal variants "-0.", "-0.00", "-.0") settle to the unsigned form at
    // rest - a resting negative zero is not a meaningful distinct value, and leaving it
    // means `valueAsNumber` reports -0 forever after. Runs before formatForDisplay so the
    // padding/grouping pipeline sees the already-designed string (see A2-11).
    const normalizedValue = normalizeNegativeZero(
      target.value,
      this.resolvedOptions.decimalSeparator
    );

    // formatForDisplay forces FormatOn.Change and strips existing separators before
    // re-grouping, so it is idempotent on an already-formatted value - re-blurring
    // "1,234,567.89" never re-groups it into "1,2,34,,567.89". It also pads to
    // decimalMinLength, matching React's blur handler.
    const { formatted, raw } = this.formatForDisplay(normalizedValue);
    if (formatted === target.value) return;

    this.withInternalWrite(() => writeValuePreservingUndo(target, formatted, formatted.length));
    // Only broadcast onChange when the sanitized raw value actually changed (A2-06) - blur
    // can otherwise be purely cosmetic (regrouping thousand separators onto an unchanged
    // raw value), and firing onChange for that misleads consumers into thinking the value
    // changed. A trailing-separator strip, decimalMinLength padding, and the -0
    // normalization above are real raw changes and must still notify.
    if (raw !== rawBeforeBlur) {
      this.handleValueChange(formatted, raw);
    }
  }

  /**
   * The canonical raw value: ASCII digits, `.` decimal, `-` sign, no grouping, identical for
   * every locale (de-DE display `1.234.567,89` -> `1234567.89`). Safe to parse with
   * `Number()` or a decimal library. Use {@link getFormattedValue} for the display string.
   */
  public getValue(): string {
    return this.toRaw(this.element.value);
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
    const { formatted } = this.formatForDisplay(value, 'canonical');

    if (options?.undoable === false) {
      this.element.value = formatted;
      return;
    }
    this.withInternalWrite(() =>
      writeValuePreservingUndo(this.element, formatted, formatted.length)
    );
  }

  public disable(): void {
    this.element.disabled = true;
  }

  public enable(): void {
    this.element.disabled = false;
  }

  public addEventListener(event: string, callback: EventListenerOrEventListenerObject): void {
    this.element.addEventListener(event, callback);
  }

  public removeEventListener(event: string, callback: EventListenerOrEventListenerObject): void {
    this.element.removeEventListener(event, callback);
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
