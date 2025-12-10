import {
  handleOnChangeNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
} from '@/utils/event-handlers';
import { formatWithSeparators } from '@/features/formatting';
import { removeThousandSeparators } from '@/features/sanitization';
import { escapeRegExp } from '@/utils/escape-reg-exp';
import { DEFAULT_DECIMAL_SEPARATOR, DEFAULT_ENABLE_COMPACT_NOTATION, DEFAULT_ENABLE_LEADING_ZEROS, DEFAULT_ENABLE_NEGATIVE, DEFAULT_FORMAT_ON, DEFAULT_DECIMAL_MAX_LENGTH, DEFAULT_DECIMAL_MIN_LENGTH, DEFAULT_RAW_VALUE_MODE, DEFAULT_THOUSAND_SEPARATOR, DEFAULT_THOUSAND_STYLE } from './config';
import { FormatOn, ThousandStyle } from './types';
import { validateNumoraInputOptions } from './validation';


// Escape special regex characters in the decimal separator so it's treated as a literal character in the
// regex pattern, allowing any character (including numbers, letters, or symbols) to be used safely.
function getPattern(decimalSeparator: string, enableNegative: boolean) {
  const escapedSeparator = escapeRegExp(decimalSeparator);
  return enableNegative
  ? `^-?[0-9]*[${escapedSeparator}]?[0-9]*$` : `^[0-9]*[${escapedSeparator}]?[0-9]*$`;
}

export interface NumoraInputOptions extends Partial<HTMLInputElement> {
  // Formatting options
  formatOn: FormatOn;

  // Thousand options
  thousandSeparator: string;
  thousandStyle: ThousandStyle;

  // Decimal options
  decimalSeparator: string;
  decimalMaxLength: number;
  decimalMinLength?: number;

  // Parsing options
  enableCompactNotation: boolean;
  enableNegative: boolean;
  enableLeadingZeros: boolean;
  rawValueMode?: boolean;

  // Event handlers
  onChange: (value: string) => void;
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
      if (this.options.thousandSeparator && this.options.thousandStyle !== ThousandStyle.None && raw) {
        const formatted = formatWithSeparators(
          raw,
          this.options.thousandSeparator,
          this.options.thousandStyle,
          this.options.enableLeadingZeros,
          this.options.decimalSeparator
        );
        this.element.value = formatted;
      }
    }
  }

  private createInputElement(container: HTMLElement): void {

    this.element = document.createElement('input');

    const pattern = getPattern(this.options.decimalSeparator, this.options.enableNegative);
    this.element.setAttribute('pattern', pattern);

    this.element.setAttribute('minlength', '1');
    this.element.setAttribute('spellcheck', 'false');
    this.element.setAttribute('type', 'text');
    this.element.setAttribute('inputmode', 'decimal');
    this.element.setAttribute('autocomplete', 'off');
    this.element.setAttribute('autocorrect', 'off');
    this.element.setAttribute('autoCapitalize', 'off');

    const { decimalMaxLength, onChange, ...rest } = this.options;
    Object.assign(this.element, rest);

    container.appendChild(this.element);
  }

  private setupEventListeners(): void {
    this.element.addEventListener('input', this.handleChange.bind(this));
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.element.addEventListener('paste', this.handlePaste.bind(this));

    // Only add focus/blur handlers for 'blur' mode formatting
    if (this.options.formatOn === 'blur' && this.options.thousandSeparator) {
      this.element.addEventListener('focus', this.handleFocus.bind(this));
      this.element.addEventListener('blur', this.handleBlur.bind(this));
    }
  }

  private handleChange(e: Event): void {
    const target = e.target as HTMLInputElement;

    handleOnChangeNumoraInput(
      e,
      this.options.decimalMaxLength,
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

    if (this.options.onChange) {
      const valueToEmit = this.options.rawValueMode ? this.rawValue : target.value;
      this.options.onChange(valueToEmit);
    }
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
    const target = e.target as HTMLInputElement;
    const result = handleOnPasteNumoraInput(e, this.options.decimalMaxLength, {
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

    if (this.options.onChange) {
      const valueToEmit = this.options.rawValueMode ? this.rawValue : result;
      this.options.onChange(valueToEmit);
    }
  }

  private handleFocus(e: FocusEvent): void {
    // Remove separators for easier editing in 'blur' mode only
    if (this.options.formatOn === FormatOn.Blur && this.options.thousandSeparator) {
      const target = e.target as HTMLInputElement;
      target.value = removeThousandSeparators(target.value, this.options.thousandSeparator);
    }
  }

  private handleBlur(e: FocusEvent): void {
    const target = e.target as HTMLInputElement;
    // Add separators back in 'blur' mode
    if (this.options.thousandSeparator && this.options.thousandStyle !== ThousandStyle.None && target.value) {
      const formatted = formatWithSeparators(
        target.value,
        this.options.thousandSeparator,
        this.options.thousandStyle,
        this.options.enableLeadingZeros,
        this.options.decimalSeparator
      );
      target.value = formatted;

      // Update raw value if rawValueMode is enabled
      if (this.options.rawValueMode) {
        this.updateRawValue(formatted);
      }

      if (this.options.onChange) {
        const valueToEmit = this.options.rawValueMode ? this.rawValue : formatted;
        this.options.onChange(valueToEmit);
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
      if (this.options.thousandSeparator && this.options.thousandStyle !== ThousandStyle.None && raw) {
        const formatted = formatWithSeparators(
          raw,
          this.options.thousandSeparator,
          this.options.thousandStyle,
          this.options.enableLeadingZeros,
          this.options.decimalSeparator
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
}
