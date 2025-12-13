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
import { FormatOn, ThousandStyle, FormattingOptions } from './types';
import { validateNumoraInputOptions } from './validation';


interface ResolvedNumoraOptions {
  decimalMaxLength: number;
  decimalMinLength: number;
  formatOn: FormatOn;
  thousandSeparator: string;
  thousandStyle: ThousandStyle;
  decimalSeparator: string;
  enableCompactNotation: boolean;
  enableNegative: boolean;
  enableLeadingZeros: boolean;
  rawValueMode: boolean;
  onChange?: (value: string) => void;
}

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

  private resolvedOptions: ResolvedNumoraOptions;

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

    this.resolvedOptions = this.getResolvedOptions();

    this.createInputElement(container);
    this.setupEventListeners();

    // Initialize raw value if rawValueMode is enabled and element has initial value
    if (this.resolvedOptions.rawValueMode && this.element.value) {
      // If initial value is set, extract raw value and format for display
      const initialValue = this.element.value;
      const raw = this.resolvedOptions.thousandSeparator
        ? removeThousandSeparators(initialValue, this.resolvedOptions.thousandSeparator)
        : initialValue;
      this.rawValue = raw;

      // Format for display if needed
      this.element.value = this.formatValueForDisplay(raw);
    } else if (this.element.value && !this.resolvedOptions.rawValueMode) {
      // If not in rawValueMode but has initial value, apply formatting if needed
      const initialValue = this.element.value;
      this.element.value = this.formatValueForDisplay(initialValue);
    }
  }

  private createInputElement(container: HTMLElement): void {
    this.element = document.createElement('input');

    // These attributes are REQUIRED for Numora to work correctly and must not be overridden:
    // - type='text': Using 'number' would cause browser-native validation/formatting that conflicts with Numora
    // - inputmode='decimal': Ensures mobile keyboards show numeric keypad
    // - spellcheck='false': Prevents spellcheck from interfering with numeric input
    // - autocomplete='off': Prevents browser autocomplete from interfering with formatting
    // - autoCapitalize='off': Prevents iOS Safari auto-capitalization from interfering with numeric input
    this.element.setAttribute('type', 'text');
    this.element.setAttribute('inputmode', 'decimal');
    this.element.setAttribute('spellcheck', 'false');
    this.element.setAttribute('autocomplete', 'off');

    // Set pattern only if decimal separator and enableNegative are configured
    // Pattern helps with native validation but is optional
    if (this.resolvedOptions.decimalSeparator !== undefined && this.resolvedOptions.enableNegative !== undefined) {
      const pattern = getNumoraPattern(this.resolvedOptions.decimalSeparator, this.resolvedOptions.enableNegative);
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
    if (this.resolvedOptions.formatOn === FormatOn.Blur && this.resolvedOptions.thousandSeparator) {
      this.element.addEventListener('focus', this.handleFocus.bind(this));
      this.element.addEventListener('blur', this.handleBlur.bind(this));
    }
  }

  private getResolvedOptions(): ResolvedNumoraOptions {
    return {
      decimalMaxLength: this.options.decimalMaxLength ?? DEFAULT_DECIMAL_MAX_LENGTH,
      decimalMinLength: this.options.decimalMinLength ?? DEFAULT_DECIMAL_MIN_LENGTH,
      formatOn: this.options.formatOn ?? DEFAULT_FORMAT_ON,
      thousandSeparator: this.options.thousandSeparator ?? DEFAULT_THOUSAND_SEPARATOR,
      thousandStyle: this.options.thousandStyle ?? DEFAULT_THOUSAND_STYLE,
      decimalSeparator: this.options.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
      enableCompactNotation: this.options.enableCompactNotation ?? DEFAULT_ENABLE_COMPACT_NOTATION,
      enableNegative: this.options.enableNegative ?? DEFAULT_ENABLE_NEGATIVE,
      enableLeadingZeros: this.options.enableLeadingZeros ?? DEFAULT_ENABLE_LEADING_ZEROS,
      rawValueMode: this.options.rawValueMode ?? DEFAULT_RAW_VALUE_MODE,
      onChange: this.options.onChange,
    };
  }

  private buildFormattingOptions(): FormattingOptions {
    return {
      formatOn: this.resolvedOptions.formatOn,
      thousandSeparator: this.resolvedOptions.thousandSeparator,
      ThousandStyle: this.resolvedOptions.thousandStyle,
      enableCompactNotation: this.resolvedOptions.enableCompactNotation,
      enableNegative: this.resolvedOptions.enableNegative,
      enableLeadingZeros: this.resolvedOptions.enableLeadingZeros,
      decimalSeparator: this.resolvedOptions.decimalSeparator,
      decimalMinLength: this.resolvedOptions.decimalMinLength,
      rawValueMode: this.resolvedOptions.rawValueMode,
    };
  }

  private handleValueChange(newValue: string, sourceValue?: string): void {
    const valueToProcess = sourceValue ?? newValue;

    if (this.resolvedOptions.rawValueMode) {
      this.updateRawValue(valueToProcess);
    }

    if (this.resolvedOptions.onChange) {
      const valueToEmit = this.resolvedOptions.rawValueMode ? this.rawValue : newValue;
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

  private handleChange(e: Event): void {
    const target = e.target as HTMLInputElement;

    handleOnChangeNumoraInput(
      e,
      this.resolvedOptions.decimalMaxLength,
      this.caretPositionBeforeChange,
      this.buildFormattingOptions()
    );

    // Clear caret position captured in handleKeyDown after it's used to restore cursor position after formatting.
    this.caretPositionBeforeChange = undefined;

    this.handleValueChange(target.value);

    // Native 'input' event will continue to bubble naturally
    // Users can attach their own listeners via addEventListener or getElement()
  }

  private handleKeyDown(e: KeyboardEvent): void {
    const inputElement = e.target as HTMLInputElement;
    const { selectionStart, selectionEnd } = inputElement;

    const formattingOptions = this.buildFormattingOptions();
    const caretInfo = handleOnKeyDownNumoraInput(e, {
      formatOn: formattingOptions.formatOn,
      thousandSeparator: formattingOptions.thousandSeparator,
      ThousandStyle: formattingOptions.ThousandStyle,
      decimalSeparator: formattingOptions.decimalSeparator,
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
    const result = handleOnPasteNumoraInput(e, this.resolvedOptions.decimalMaxLength, this.buildFormattingOptions());

    this.handleValueChange(result);

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
      const oldValue = target.value;
      const formatted = this.formatValueForDisplay(target.value);
      target.value = formatted;

      this.handleValueChange(formatted);

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
    if (!this.resolvedOptions.thousandSeparator) {
      this.rawValue = formattedValue;
      return;
    }

    // Remove thousand separators to get raw value
    this.rawValue = removeThousandSeparators(formattedValue, this.resolvedOptions.thousandSeparator);
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