import {
  handleOnChangeNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
} from '@/utils/event-handlers';
import { formatWithSeparators } from '@/features/formatting';
import { removeThousandSeparators } from '@/features/sanitization';
import { escapeRegExp } from '@/utils/escape-reg-exp';
import { getNumoraPattern } from '@/utils/input-pattern';
import { DEFAULT_DECIMAL_SEPARATOR, DEFAULT_ENABLE_COMPACT_NOTATION, DEFAULT_ENABLE_LEADING_ZEROS, DEFAULT_ENABLE_NEGATIVE, DEFAULT_FORMAT_ON, DEFAULT_DECIMAL_MAX_LENGTH, DEFAULT_DECIMAL_MIN_LENGTH, DEFAULT_RAW_VALUE_MODE, DEFAULT_THOUSAND_SEPARATOR, DEFAULT_THOUSAND_STYLE } from './config';
import { FormatOn, ThousandStyle } from './types';
import { validateNumoraInputOptions } from './validation';


export interface NumoraInputOptions extends Partial<Omit<HTMLInputElement, 'value' | 'defaultValue' | 'onchange'>> {
  // Formatting options
  formatOn?: FormatOn;

  // Thousand options
  thousandSeparator?: string;
  thousandStyle?: ThousandStyle;

  // Decimal options
  decimalSeparator?: string;
  decimalMaxLength?: number;
  decimalMinLength?: number;

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

  private options: NumoraInputOptions;

  private rawValue: string = '';

  private caretPositionBeforeChange?: {
    selectionStart: number;
    selectionEnd: number;
    endOffset?: number;
  };

  constructor(
    container: HTMLElement,
    {
      decimalMaxLength = DEFAULT_DECIMAL_MAX_LENGTH,
      decimalMinLength = DEFAULT_DECIMAL_MIN_LENGTH,
      formatOn = DEFAULT_FORMAT_ON,
      thousandSeparator = DEFAULT_THOUSAND_SEPARATOR,
      thousandStyle = DEFAULT_THOUSAND_STYLE,
      decimalSeparator = DEFAULT_DECIMAL_SEPARATOR,
      enableCompactNotation = DEFAULT_ENABLE_COMPACT_NOTATION,
      enableNegative = DEFAULT_ENABLE_NEGATIVE,
      enableLeadingZeros = DEFAULT_ENABLE_LEADING_ZEROS,
      rawValueMode = DEFAULT_RAW_VALUE_MODE,
      onChange,
      ...rest
    }: NumoraInputOptions
  ) {

    validateNumoraInputOptions({
      decimalMaxLength,
      decimalMinLength,
      formatOn,
      thousandSeparator,
      thousandStyle,
      decimalSeparator,
      enableCompactNotation,
      enableNegative,
      enableLeadingZeros,
      rawValueMode,
      onChange,
    });

    this.options = {
      decimalMaxLength,
      decimalMinLength,
      onChange,
      formatOn,
      thousandSeparator,
      thousandStyle,
      decimalSeparator,
      enableCompactNotation,
      enableNegative,
      enableLeadingZeros,
      rawValueMode,
      ...rest,
    };

    this.createInputElement(container);
    this.setupEventListeners();

    // Initialize raw value if rawValueMode is enabled and element has initial value
    if (this.options.rawValueMode && this.element.value) {
      // If initial value is set, extract raw value and format for display
      const initialValue = this.element.value;
      const raw = this.options.thousandSeparator
        ? removeThousandSeparators(initialValue, this.options.thousandSeparator)
        : initialValue;
      this.rawValue = raw;

      // Format for display if needed
      const thousandStyle = this.options.thousandStyle ?? DEFAULT_THOUSAND_STYLE;
      if (this.options.thousandSeparator && thousandStyle !== ThousandStyle.None && raw) {
        const formatted = formatWithSeparators(
          raw,
          this.options.thousandSeparator,
          thousandStyle,
          this.options.enableLeadingZeros ?? DEFAULT_ENABLE_LEADING_ZEROS,
          this.options.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR
        );
        this.element.value = formatted;
      }
    } else if (this.element.value && !this.options.rawValueMode) {
      // If not in rawValueMode but has initial value, apply formatting if needed
      const initialValue = this.element.value;
      const thousandStyle = this.options.thousandStyle ?? DEFAULT_THOUSAND_STYLE;
      if (this.options.thousandSeparator && thousandStyle !== ThousandStyle.None && initialValue) {
        const formatted = formatWithSeparators(
          initialValue,
          this.options.thousandSeparator,
          thousandStyle,
          this.options.enableLeadingZeros ?? DEFAULT_ENABLE_LEADING_ZEROS,
          this.options.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR
        );
        this.element.value = formatted;
      }
    }
  }

  private createInputElement(container: HTMLElement): void {
    this.element = document.createElement('input');

    // These attributes are REQUIRED for Numora to work correctly and must not be overridden:
    // - type='text': Using 'number' would cause browser-native validation/formatting that conflicts with Numora
    // - inputmode='decimal': Ensures mobile keyboards show numeric keypad
    // - spellcheck='false': Prevents spellcheck from interfering with numeric input
    // - autocomplete='off': Prevents browser autocomplete from interfering with formatting
    // - autocorrect='off': Prevents iOS Safari autocorrect from interfering with numeric input
    // - autoCapitalize='off': Prevents iOS Safari auto-capitalization from interfering with numeric input
    this.element.setAttribute('type', 'text');
    this.element.setAttribute('inputmode', 'decimal');
    this.element.setAttribute('spellcheck', 'false');
    this.element.setAttribute('autocomplete', 'off');
    this.element.setAttribute('autocorrect', 'off');

    // Set pattern only if decimal separator and enableNegative are configured
    // Pattern helps with native validation but is optional
    if (this.options.decimalSeparator !== undefined && this.options.enableNegative !== undefined) {
      const pattern = getNumoraPattern(this.options.decimalSeparator, this.options.enableNegative);
      this.element.setAttribute('pattern', pattern);
    }

    // Extract Numora-specific options and protected attributes that shouldn't be assigned to the element
    const {
      decimalMaxLength,
      decimalMinLength,
      formatOn,
      thousandSeparator,
      thousandStyle,
      decimalSeparator,
      enableCompactNotation,
      enableNegative,
      enableLeadingZeros,
      rawValueMode,
      onChange,
      value,
      defaultValue,
      type, // Exclude - forced to 'text' above
      inputMode, // Exclude - forced to 'decimal' above
      spellcheck, // Exclude - forced to 'false' above
      autocomplete, // Exclude - forced to 'off' above
      autocorrect, // Exclude - forced to 'off' above
      ...nativeProps
    } = this.options;

    // Assign all native HTMLInputElement properties (except type which is forced)
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
    this.element.addEventListener('input', this.handleChange.bind(this));
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.element.addEventListener('paste', this.handlePaste.bind(this));

    // Only add focus/blur handlers for 'blur' mode formatting
    const formatOn = this.options.formatOn ?? DEFAULT_FORMAT_ON;
    if (formatOn === FormatOn.Blur && this.options.thousandSeparator) {
      this.element.addEventListener('focus', this.handleFocus.bind(this));
      this.element.addEventListener('blur', this.handleBlur.bind(this));
    }
  }

  private handleChange(e: Event): void {
    const target = e.target as HTMLInputElement;

    handleOnChangeNumoraInput(
      e,
      this.options.decimalMaxLength ?? DEFAULT_DECIMAL_MAX_LENGTH,
      this.caretPositionBeforeChange,
      {
        formatOn: this.options.formatOn,
        thousandSeparator: this.options.thousandSeparator,
        ThousandStyle: this.options.thousandStyle,
        enableCompactNotation: this.options.enableCompactNotation,
        enableNegative: this.options.enableNegative,
        enableLeadingZeros: this.options.enableLeadingZeros,
        decimalSeparator: this.options.decimalSeparator,
        decimalMinLength: this.options.decimalMinLength,
        rawValueMode: this.options.rawValueMode,
      }
    );

    // Clear caret position captured in handleKeyDown after it's used to restore cursor position after formatting.
    this.caretPositionBeforeChange = undefined;

    // Update raw value if rawValueMode is enabled
    if (this.options.rawValueMode) {
      this.updateRawValue(target.value);
    }

    // Call Numora onChange callback if provided
    if (this.options.onChange) {
      const valueToEmit = this.options.rawValueMode ? this.rawValue : target.value;
      this.options.onChange(valueToEmit);
    }

    // Native 'input' event will continue to bubble naturally
    // Users can attach their own listeners via addEventListener or getElement()
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const inputElement = e.target as HTMLInputElement;
    const { selectionStart, selectionEnd } = inputElement;

    const caretInfo = handleOnKeyDownNumoraInput(e, {
      formatOn: this.options.formatOn,
      thousandSeparator: this.options.thousandSeparator,
      ThousandStyle: this.options.thousandStyle,
      decimalSeparator: this.options.decimalSeparator,
    });

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
    const result = handleOnPasteNumoraInput(e, this.options.decimalMaxLength ?? DEFAULT_DECIMAL_MAX_LENGTH, {
      formatOn: this.options.formatOn,
      thousandSeparator: this.options.thousandSeparator,
      ThousandStyle: this.options.thousandStyle,
      enableCompactNotation: this.options.enableCompactNotation,
      enableNegative: this.options.enableNegative,
      enableLeadingZeros: this.options.enableLeadingZeros,
      decimalSeparator: this.options.decimalSeparator,
      decimalMinLength: this.options.decimalMinLength,
      rawValueMode: this.options.rawValueMode,
    });

    // Update raw value if rawValueMode is enabled
    if (this.options.rawValueMode) {
      this.updateRawValue(result);
    }

    // Call Numora onChange callback if provided
    if (this.options.onChange) {
      const valueToEmit = this.options.rawValueMode ? this.rawValue : result;
      this.options.onChange(valueToEmit);
    }

    // Note: handleOnPasteNumoraInput calls e.preventDefault() internally
    // We manually set the value, so we need to dispatch a synthetic input event
    // to ensure native event listeners are notified
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    this.element.dispatchEvent(inputEvent);
  }

  private handleFocus(e: FocusEvent): void {
    // Remove separators for easier editing in 'blur' mode only
    const formatOn = this.options.formatOn ?? DEFAULT_FORMAT_ON;
    if (formatOn === FormatOn.Blur && this.options.thousandSeparator) {
      const target = e.target as HTMLInputElement;
      target.value = removeThousandSeparators(target.value, this.options.thousandSeparator);
    }
  }

  private handleBlur(e: FocusEvent): void {
    const target = e.target as HTMLInputElement;
    // Add separators back in 'blur' mode
    const thousandStyle = this.options.thousandStyle ?? DEFAULT_THOUSAND_STYLE;
    if (this.options.thousandSeparator && thousandStyle !== ThousandStyle.None && target.value) {
      const oldValue = target.value;
      const formatted = formatWithSeparators(
        target.value,
        this.options.thousandSeparator,
        thousandStyle,
        this.options.enableLeadingZeros ?? DEFAULT_ENABLE_LEADING_ZEROS,
        this.options.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR
      );
      target.value = formatted;

      // Update raw value if rawValueMode is enabled
      if (this.options.rawValueMode) {
        this.updateRawValue(formatted);
      }

      // Call Numora onChange callback if provided
      if (this.options.onChange) {
        const valueToEmit = this.options.rawValueMode ? this.rawValue : formatted;
        this.options.onChange(valueToEmit);
      }

      // Dispatch input and change events if value changed
      if (oldValue !== formatted) {
        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        this.element.dispatchEvent(inputEvent);
        const changeEvent = new Event('change', { bubbles: true, cancelable: true });
        this.element.dispatchEvent(changeEvent);
      }
    }
  }

  /**
   * Extracts and stores the raw numeric value from a formatted value.
   * Gets the raw value from the data attribute set by event handlers, or extracts it from formatted value.
   */
  private updateRawValue(formattedValue: string): void {
    // Try to get raw value from data attribute (set by event handlers)
    const rawFromAttribute = this.element.getAttribute('data-raw-value');
    if (rawFromAttribute !== null) {
      this.rawValue = rawFromAttribute;
      this.element.removeAttribute('data-raw-value');
      return;
    }

    // Fallback: extract raw value by removing separators
    if (!this.options.thousandSeparator) {
      this.rawValue = formattedValue;
      return;
    }

    // Remove thousand separators to get raw value
    this.rawValue = removeThousandSeparators(formattedValue, this.options.thousandSeparator);
  }

  public getValue(): string {
    if (this.options.rawValueMode) {
      return this.rawValue;
    }
    return this.element.value;
  }

  public setValue(value: string): void {
    if (this.options.rawValueMode) {
      // Remove separators to get raw value (in case formatted value is passed)
      const raw = this.options.thousandSeparator
        ? removeThousandSeparators(value, this.options.thousandSeparator)
        : value;

      // Store raw value
      this.rawValue = raw;

      // Format for display if formatting is enabled
      const thousandStyle = this.options.thousandStyle ?? DEFAULT_THOUSAND_STYLE;
      if (this.options.thousandSeparator && thousandStyle !== ThousandStyle.None && raw) {
        const formatted = formatWithSeparators(
          raw,
          this.options.thousandSeparator,
          thousandStyle,
          this.options.enableLeadingZeros ?? DEFAULT_ENABLE_LEADING_ZEROS,
          this.options.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR
        );
        this.element.value = formatted;
      } else {
        this.element.value = raw;
      }
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
   */
  public get valueAsNumber(): number {
    const value = this.getValue();
    if (!value) {
      return NaN;
    }
    // Remove thousand separators and convert decimal separator to dot for parsing
    const cleanValue = this.options.thousandSeparator
      ? removeThousandSeparators(value, this.options.thousandSeparator)
      : value;
    const normalizedValue = this.options.decimalSeparator && this.options.decimalSeparator !== '.'
      ? cleanValue.replace(new RegExp(escapeRegExp(this.options.decimalSeparator), 'g'), '.')
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
