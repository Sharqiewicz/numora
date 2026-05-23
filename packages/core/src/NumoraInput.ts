import {
  handleOnBeforeInputNumoraInput,
  handleOnChangeNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
} from '@/utils/event-handlers';
import { formatWithSeparators } from '@/features/formatting';
import { removeThousandSeparators } from '@/features/sanitization';
import { escapeRegExp } from '@/utils/escape-reg-exp';
import { getNumoraPattern } from '@/utils/input-pattern';
import { applyLocale } from '@/utils/locale';
import {
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
import { FormatOn, ThousandStyle, FormattingOptions } from './types';
import { validateNumoraInputOptions } from './validation';


type ResolvedNumoraOptions = Required<FormattingOptions> & {
  onChange?: (value: string) => void;
};

export interface NumoraInputOptions extends Partial<Omit<HTMLInputElement, 'value' | 'defaultValue' | 'onChange'>> {
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
  rawValueMode?: boolean;

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

  private caretPositionBeforeChange?: {
    selectionStart: number;
    selectionEnd: number;
    endOffset?: number;
  };

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
      rawValueMode = DEFAULT_RAW_VALUE_MODE,
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
      rawValueMode,
      onChange,
    };

    this.createInputElement(container, options);
    this.setupEventListeners();
    this.setDefaultValue();
  }

  private setDefaultValue(): void {
    if (!this.element.value) return;

    const raw = this.resolvedOptions.thousandSeparator
      ? removeThousandSeparators(this.element.value, this.resolvedOptions.thousandSeparator)
      : this.element.value;

    if (this.resolvedOptions.rawValueMode) {
      this.rawValue = raw;
    }

    this.element.value = this.formatValueForDisplay(raw);
  }

  private createInputElement(container: HTMLElement, options: NumoraInputOptions): void {
    this.element = document.createElement('input');

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
    const pattern = getNumoraPattern(this.resolvedOptions.decimalSeparator, this.resolvedOptions.enableNegative);
    this.element.setAttribute('pattern', pattern);

    // Extract Numora-specific options and protected attributes that shouldn't be assigned to the element
    const {
      decimalMaxLength,
      decimalMinLength,
      formatOn,
      thousandSeparator,
      thousandStyle,
      decimalSeparator,
      locale,
      enableCompactNotation,
      enableNegative,
      enableLeadingZeros,
      rawValueMode,
      onChange,
      value,
      defaultValue,
      type,
      inputMode,
      spellcheck,
      autocomplete,
      ...nativeProps
    } = options;

    Object.assign(this.element, nativeProps);

    // Handle value initialization
    if (value !== undefined) {
      this.element.value = value;
    } else if (defaultValue !== undefined) {
      this.element.defaultValue = defaultValue;
      this.element.value = defaultValue;
    }

    container.appendChild(this.element);
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

  private formatValueForDisplay(value: string): string {
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
    // handleOnBeforeInputNumoraInput calls e.preventDefault() + setRangeText for handled
    // input types. The synchronous 'input' event fired by setRangeText will be picked up
    // by handleChange, which is the single place handleValueChange is called.
    handleOnBeforeInputNumoraInput(
      e,
      this.resolvedOptions.decimalMaxLength,
      this.resolvedOptions
    );
  }

  private handleChange(e: Event): void {
    const { formatted, raw } = handleOnChangeNumoraInput(
      e,
      this.resolvedOptions.decimalMaxLength,
      this.caretPositionBeforeChange,
      this.resolvedOptions
    );

    // Clear caret position captured in handleKeyDown after it's used to restore cursor position after formatting.
    this.caretPositionBeforeChange = undefined;

    this.handleValueChange(formatted, raw);

    // Native 'input' event will continue to bubble naturally
    // Users can attach their own listeners via addEventListener or getElement()
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const inputElement = e.target as HTMLInputElement;
    const { selectionStart, selectionEnd } = inputElement;

    const caretInfo = handleOnKeyDownNumoraInput(e, this.resolvedOptions);

    if (caretInfo) {
      this.caretPositionBeforeChange = {
        selectionStart: selectionStart ?? 0,
        selectionEnd: selectionEnd ?? 0,
        endOffset: caretInfo.endOffset,
      };
    } else {
      this.caretPositionBeforeChange = {
        selectionStart: selectionStart ?? 0,
        selectionEnd: selectionEnd ?? 0,
      };
    }
  }

  private handlePaste(e: ClipboardEvent): void {
    const { formatted, raw } = handleOnPasteNumoraInput(e, this.resolvedOptions.decimalMaxLength, this.resolvedOptions);

    this.handleValueChange(formatted, raw);

    // Note: handleOnPasteNumoraInput calls e.preventDefault() internally
    // We manually set the value, so we need to dispatch a synthetic input event
    // to ensure native event listeners are notified
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    this.element.dispatchEvent(inputEvent);
  }

  private handleFocus(e: FocusEvent): void {
    // Remove separators for easier editing in 'blur' mode only
    if (this.resolvedOptions.formatOn === FormatOn.Blur && this.resolvedOptions.thousandSeparator) {
      const target = e.target as HTMLInputElement;
      target.value = removeThousandSeparators(target.value, this.resolvedOptions.thousandSeparator);
    }
  }

  private handleBlur(e: FocusEvent): void {
    const target = e.target as HTMLInputElement;
    // Add separators back in 'blur' mode
    const { thousandSeparator, thousandStyle } = this.resolvedOptions;
    if (thousandSeparator && thousandStyle !== ThousandStyle.None && target.value) {
      const formatted = this.formatValueForDisplay(target.value);
      target.value = formatted;

      // Extract raw value by removing separators for rawValueMode
      const raw = this.resolvedOptions.rawValueMode
        ? removeThousandSeparators(formatted, thousandSeparator)
        : undefined;

      this.handleValueChange(formatted, raw);
    }
  }

  public getValue(): string {
    if (this.resolvedOptions.rawValueMode) {
      return this.rawValue;
    }
    return this.element.value;
  }

  public setValue(value: string): void {
    if (this.resolvedOptions.rawValueMode) {
      // Remove separators to get raw value (in case formatted value is passed)
      const raw = this.resolvedOptions.thousandSeparator
        ? removeThousandSeparators(value, this.resolvedOptions.thousandSeparator)
        : value;

      // Store raw value
      this.rawValue = raw;

      // Format for display if formatting is enabled
      this.element.value = this.formatValueForDisplay(raw);
    } else {
      this.element.value = value;
    }
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
    const cleanValue = this.resolvedOptions.thousandSeparator
      ? removeThousandSeparators(value, this.resolvedOptions.thousandSeparator)
      : value;
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
