import {
  handleOnBeforeInputNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
} from '@/utils/event-handlers';
import {
  computeCursorPosition,
  computeStripSeparatorsResult,
  formatWithSeparators,
  writeStripPreservingUndo,
  writeValuePreservingUndo,
} from '@/features/formatting';
import { getSeparators } from '@/features/decimals';
import { formatInputValue } from '@/utils/format-utils';
import { removeThousandSeparators } from '@/features/sanitization';
import { escapeRegExp } from '@/utils/escape-reg-exp';
import { applyLocale } from '@/utils/locale';
import {
  DEFAULT_AUTO_ADD_LEADING_ZERO,
  DEFAULT_DECIMAL_MAX_LENGTH,
  DEFAULT_DECIMAL_MIN_LENGTH,
  DEFAULT_DECIMAL_SEPARATOR,
  DEFAULT_ENABLE_COMPACT_NOTATION,
  DEFAULT_ENABLE_LEADING_ZEROS,
  DEFAULT_ENABLE_NEGATIVE,
  DEFAULT_FORMAT_ON,
  DEFAULT_RAW_VALUE_MODE,
  DEFAULT_THOUSAND_SEPARATOR,
  DEFAULT_THOUSAND_STYLE,
} from './config';
import { FormatOn, InputType, ThousandStyle, FormattingOptions, CaretPositionInfo } from './types';
import { validateNumoraInputOptions } from './validation';


// maxLength and isAllowed are opt-in only - no sensible default - so they stay optional
// in the resolved options. Everything else has a default in `config.ts`.
type ResolvedNumoraOptions = Required<Omit<FormattingOptions, 'maxLength' | 'isAllowed'>>
  & Pick<FormattingOptions, 'maxLength' | 'isAllowed'>
  & {
    onChange?: (value: string) => void;
  };

// Every option that belongs to Numora rather than the native <input>. createInputElement
// strips these before Object.assign-ing the rest onto the DOM element; otherwise they
// would land as nonsense attributes (`thousandseparator=","` etc.). Add new options here
// whenever a new field is introduced in NumoraInputOptions.
const NUMORA_OPTION_KEYS = new Set<string>([
  'decimalMaxLength', 'decimalMinLength', 'formatOn', 'thousandSeparator',
  'thousandStyle', 'decimalSeparator', 'locale',
  'enableCompactNotation', 'enableNegative', 'enableLeadingZeros',
  'autoAddLeadingZero', 'rawValueMode',
  'maxLength', 'isAllowed', 'onChange',
  'value', 'defaultValue',
  // Protected native attrs set explicitly in createInputElement.
  'type', 'inputMode', 'spellcheck', 'autocomplete',
]);

export interface NumoraInputOptions extends Partial<Omit<HTMLInputElement, 'value' | 'defaultValue' | 'onChange' | 'maxLength'>> {
  // Formatting options
  formatOn?: FormatOn;

  // Thousand options
  thousandSeparator?: string;
  thousandStyle?: ThousandStyle;

  // Decimal options
  decimalSeparator?: string;
  decimalMaxLength?: number;
  decimalMinLength?: number;

  // Locale
  locale?: string | true;

  // Parsing options
  enableCompactNotation?: boolean;
  enableNegative?: boolean;
  enableLeadingZeros?: boolean;
  autoAddLeadingZero?: boolean;
  rawValueMode?: boolean;

  // Validation
  /** Max raw length (digits + decimal sep + leading `-`). Separators not counted. */
  maxLength?: number;
  /** Reject keystroke/paste if this returns false. Called with post-sanitization raw value. */
  isAllowed?: (rawValue: string) => boolean;

  // Event handlers
  onChange?: (value: string) => void;

  // Value initialization
  value?: string;
  defaultValue?: string;
}

export class NumoraInput {
  private element!: HTMLInputElement;

  private resolvedOptions: ResolvedNumoraOptions;

  private rawValue: string = '';

  // True while we're applying our own setRangeText. The synchronous `input` event that
  // setRangeText fires must NOT re-enter handleChange's broadcast path, or onChange
  // double-fires and the cursor is recomputed against the post-write value.
  // try/finally in withInternalWrite guarantees this clears even if the write throws.
  private suppressNextInputEvent: boolean = false;

  // Mouse-driven focus: the browser commits the click→selection mapping AFTER focus
  // fires, using the input's current value. If we strip separators in the focus handler,
  // the click X-coord then maps to a position N digits too far right (where N = separators
  // before the click point). Set on mousedown, cleared on click after we strip + map -
  // click fires after the browser has finalised the caret, so selectionStart reflects
  // the user's intended position when we read it.
  private pendingMouseStrip: boolean = false;

  private caretPositionBeforeChange?: CaretPositionInfo;

  constructor(container: HTMLElement, options: NumoraInputOptions) {
    validateNumoraInputOptions(options);

    const {
      decimalMaxLength = DEFAULT_DECIMAL_MAX_LENGTH,
      decimalMinLength = DEFAULT_DECIMAL_MIN_LENGTH,
      formatOn = DEFAULT_FORMAT_ON,
      thousandSeparator,
      thousandStyle = DEFAULT_THOUSAND_STYLE,
      decimalSeparator,
      locale,
      enableCompactNotation = DEFAULT_ENABLE_COMPACT_NOTATION,
      enableNegative = DEFAULT_ENABLE_NEGATIVE,
      enableLeadingZeros = DEFAULT_ENABLE_LEADING_ZEROS,
      autoAddLeadingZero = DEFAULT_AUTO_ADD_LEADING_ZERO,
      rawValueMode = DEFAULT_RAW_VALUE_MODE,
      maxLength,
      isAllowed,
      onChange,
    } = options;

    const separators = applyLocale(locale, { thousandSeparator, decimalSeparator });

    this.resolvedOptions = {
      decimalMaxLength,
      decimalMinLength,
      formatOn,
      thousandSeparator: separators.thousandSeparator ?? DEFAULT_THOUSAND_SEPARATOR,
      thousandStyle,
      decimalSeparator: separators.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
      enableCompactNotation,
      enableNegative,
      enableLeadingZeros,
      autoAddLeadingZero,
      rawValueMode,
      maxLength,
      isAllowed,
      onChange,
    };

    this.createInputElement(container, options);
    this.setupEventListeners();
    this.setDefaultValue();
  }

  private toRaw(value: string): string {
    const sep = this.resolvedOptions.thousandSeparator;
    return sep ? removeThousandSeparators(value, sep) : value;
  }

  private setDefaultValue(): void {
    if (!this.element.value) return;

    const raw = this.toRaw(this.element.value);

    if (this.resolvedOptions.rawValueMode) {
      this.rawValue = raw;
    }

    this.element.value = this.applyDisplaySeparators(raw);
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

    // Pattern helps with native validation but is optional
    // HTML pattern attr: optional leading `-` (if negatives enabled) + digits + optional decimal separator + digits.
    const escapedDecimal = escapeRegExp(this.resolvedOptions.decimalSeparator);
    const negativePrefix = this.resolvedOptions.enableNegative ? '-?' : '';
    this.element.setAttribute('pattern', `^${negativePrefix}[0-9]*[${escapedDecimal}]?[0-9]*$`);

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
    // beforeinput fires before the browser applies the user's action and is cancelable,
    // which lets us apply the formatted value via setRangeText and preserve undo history.
    this.element.addEventListener('beforeinput', this.handleBeforeInput.bind(this));
    // The input listener stays as a fallback for programmatic value changes in tests or
    // environments that dispatch 'input' without a preceding 'beforeinput'.
    this.element.addEventListener('input', this.handleChange.bind(this));
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.element.addEventListener('paste', this.handlePaste.bind(this));

    // Only add focus/blur handlers for 'blur' mode formatting
    if (this.resolvedOptions.formatOn === FormatOn.Blur && this.resolvedOptions.thousandSeparator) {
      this.element.addEventListener('focus', this.handleFocus.bind(this));
      this.element.addEventListener('blur', this.handleBlur.bind(this));
      // Mouse path: capture the intent on mousedown, defer strip until click so the
      // browser's click→selection mapping runs against the still-formatted value and
      // is committed to selectionStart before we read it. Caret is hidden until then.
      this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
      this.element.addEventListener('click', this.handleClick.bind(this));
    }
  }

  /**
   * Runs `fn` with `suppressNextInputEvent` set so the synchronous `input` event fired
   * by `setRangeText` is short-circuited in `handleChange`. Exactly one set/clear pair
   * per write; try/finally guarantees the flag clears even if `fn` throws.
   */
  private withInternalWrite(fn: () => void): void {
    this.suppressNextInputEvent = true;
    try {
      fn();
    } finally {
      this.suppressNextInputEvent = false;
    }
  }

  private handleValueChange(formattedValue: string, rawValue?: string): void {
    if (this.resolvedOptions.rawValueMode && rawValue !== undefined) {
      this.rawValue = rawValue;
    }

    if (this.resolvedOptions.onChange) {
      const valueToEmit = this.resolvedOptions.rawValueMode ? this.rawValue : formattedValue;
      this.resolvedOptions.onChange(valueToEmit);
    }
  }

  private applyDisplaySeparators(value: string): string {
    if (!value) {
      return value;
    }

    const { thousandSeparator, thousandStyle, enableLeadingZeros, decimalSeparator } = this.resolvedOptions;

    if (thousandSeparator && thousandStyle !== ThousandStyle.None) {
      return formatWithSeparators(
        value,
        thousandSeparator,
        thousandStyle,
        enableLeadingZeros,
        decimalSeparator
      );
    }

    return value;
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
    // Our own setRangeText fired this synchronously; the originating handler
    // (beforeinput/paste/focus/blur) already broadcast. Skip to avoid double-firing.
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

    // Programmatic input event (synthetic dispatch from external code or tests). Format
    // the current value and route the write through writeValuePreservingUndo so undo stays
    // intact instead of being wiped by `target.value = x`.
    const oldValue = target.value;
    // Max of start/end works around a mobile-browser caret bug where selectionStart lags.
    const oldCursorPosition = Math.max(target.selectionStart ?? 0, target.selectionEnd ?? 0);
    const separators = getSeparators(this.resolvedOptions);
    const shouldRemoveThousandSeparators = this.resolvedOptions.formatOn === FormatOn.Change;

    const { formatted: newValue, raw: rawValue } = formatInputValue(
      oldValue,
      this.resolvedOptions.decimalMaxLength,
      this.resolvedOptions,
      shouldRemoveThousandSeparators
    );

    if (oldValue !== newValue) {
      const computed = computeCursorPosition(
        oldValue,
        newValue,
        oldCursorPosition,
        this.caretPositionBeforeChange,
        separators,
        this.resolvedOptions
      );
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
    const result = handleOnPasteNumoraInput(e, this.resolvedOptions.decimalMaxLength, this.resolvedOptions);

    if (result.type === 'reject') return;

    this.withInternalWrite(() =>
      writeValuePreservingUndo(this.element, result.formatted, result.cursorPos)
    );
    this.handleValueChange(result.formatted, result.raw);
  }

  private stripSeparatorsAndMapCaret(target: HTMLInputElement): void {
    const sep = this.resolvedOptions.thousandSeparator;
    if (!sep || this.resolvedOptions.thousandStyle === ThousandStyle.None) return;
    const displayStart = target.selectionStart ?? 0;
    const displayEnd = target.selectionEnd ?? target.value.length;
    const result = computeStripSeparatorsResult(target.value, displayStart, displayEnd, sep);
    if (!result) return;

    this.withInternalWrite(() =>
      writeStripPreservingUndo(target, result.raw, result.rawStart, result.rawEnd)
    );
    this.handleValueChange(result.raw, result.raw);
  }

  private handleFocus(e: FocusEvent): void {
    // Mouse-driven focus: skip - the strip happens on click, after the browser
    // has placed the cursor based on where the user clicked in the formatted value.
    if (this.pendingMouseStrip) return;
    this.stripSeparatorsAndMapCaret(e.target as HTMLInputElement);
  }

  private handleMouseDown(): void {
    this.pendingMouseStrip = true;
  }

  private handleClick(e: MouseEvent): void {
    if (!this.pendingMouseStrip) return;
    this.pendingMouseStrip = false;
    this.stripSeparatorsAndMapCaret(e.target as HTMLInputElement);
  }

  private handleBlur(e: FocusEvent): void {
    this.pendingMouseStrip = false;

    const target = e.target as HTMLInputElement;
    const { thousandSeparator, thousandStyle } = this.resolvedOptions;
    if (!thousandSeparator || thousandStyle === ThousandStyle.None || !target.value) return;

    const formatted = this.applyDisplaySeparators(target.value);
    if (formatted !== target.value) {
      this.withInternalWrite(() =>
        writeValuePreservingUndo(target, formatted, formatted.length)
      );
    }

    const raw = this.resolvedOptions.rawValueMode
      ? this.toRaw(formatted)
      : undefined;
    this.handleValueChange(formatted, raw);
  }

  public getValue(): string {
    if (this.resolvedOptions.rawValueMode) {
      return this.rawValue;
    }
    return this.element.value;
  }

  /**
   * Sets the input's value programmatically.
   *
   * @param value - The new value. In `rawValueMode`, this is treated as raw and re-formatted for display.
   * @param options.undoable - Defaults to `true`: routes the write through `setRangeText`
   *   so the browser's undo stack stays intact and `Ctrl+Z` can revert this call. Pass
   *   `false` only when you intentionally want to wipe the undo history (e.g. form reset).
   */
  public setValue(value: string, options?: { undoable?: boolean }): void {
    let displayValue: string;
    if (this.resolvedOptions.rawValueMode) {
      const raw = this.toRaw(value);
      this.rawValue = raw;
      displayValue = this.applyDisplaySeparators(raw);
    } else {
      displayValue = value;
    }

    if (options?.undoable === false) {
      this.element.value = displayValue;
      return;
    }
    this.withInternalWrite(() =>
      writeValuePreservingUndo(this.element, displayValue, displayValue.length)
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
   * Gets the current value of the input.
   * In rawValueMode, returns the raw numeric value without formatting.
   * Otherwise, returns the formatted display value.
   */
  public get value(): string {
    return this.getValue();
  }

  /**
   * Sets the value of the input.
   * In rawValueMode, the value will be formatted for display.
   * Otherwise, sets the value directly.
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
    // Remove thousand separators and convert decimal separator to dot for parsing
    const cleanValue = this.toRaw(value);
    const normalizedValue = this.resolvedOptions.decimalSeparator && this.resolvedOptions.decimalSeparator !== '.'
      ? cleanValue.replace(new RegExp(escapeRegExp(this.resolvedOptions.decimalSeparator), 'g'), '.')
      : cleanValue;
    return parseFloat(normalizedValue);
  }

  /**
   * Sets the value from a number, similar to HTMLInputElement.valueAsNumber.
   */
  public set valueAsNumber(num: number) {
    if (isNaN(num)) {
      this.setValue('');
      return;
    }
    const stringValue = num.toString();
    this.setValue(stringValue);
  }
}
