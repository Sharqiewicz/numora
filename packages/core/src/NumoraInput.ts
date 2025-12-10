import {
  handleOnChangeNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
} from '@/utils/event-handlers';
import { formatWithSeparators } from '@/features/formatting';
import { removeThousandSeparators } from '@/features/sanitization';
import { escapeRegExp } from '@/utils/escape-reg-exp';
import { DEFAULT_DECIMAL_SEPARATOR, DEFAULT_ENABLE_COMPACT_NOTATION, DEFAULT_ENABLE_LEADING_ZEROS, DEFAULT_ENABLE_NEGATIVE, DEFAULT_FORMAT_ON, DEFAULT_DECIMAL_MAX_LENGTH, DEFAULT_DECIMAL_MIN_LENGTH, DEFAULT_THOUSAND_SEPARATOR, DEFAULT_THOUSAND_STYLE } from './config';
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

  // Event handlers
  onChange: (value: string) => void;
}

export class NumoraInput {
  private element!: HTMLInputElement;

  private options: NumoraInputOptions;

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
      ...rest,
    };

    this.createInputElement(container);
    this.setupEventListeners();
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
      }
    );

    // Clear caret position captured in handleKeyDown after it's used to restore cursor position after formatting.
    this.caretPositionBeforeChange = undefined;

    if (this.options.onChange) {
      this.options.onChange((e.target as HTMLInputElement).value);
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
    handleOnPasteNumoraInput(e, this.options.decimalMaxLength, {
      formatOn: this.options.formatOn,
      thousandSeparator: this.options.thousandSeparator,
      ThousandStyle: this.options.thousandStyle,
      enableCompactNotation: this.options.enableCompactNotation,
      enableNegative: this.options.enableNegative,
      enableLeadingZeros: this.options.enableLeadingZeros,
      decimalSeparator: this.options.decimalSeparator,
      decimalMinLength: this.options.decimalMinLength,
    });
    if (this.options.onChange) {
      this.options.onChange((e.target as HTMLInputElement).value);
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

      if (this.options.onChange) {
        this.options.onChange(formatted);
      }
    }
  }

  public getValue(): string {
    return this.element.value;
  }

  public setValue(value: string): void {
    this.element.value = value;
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
