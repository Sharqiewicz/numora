import {
  handleOnChangeNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
} from '@/utils/event-handlers';
import { formatWithSeparators, type thousandStyle } from '@/utils/formatting';
import { DEFAULT_DECIMAL_SEPARATOR, DEFAULT_ENABLE_COMPACT_NOTATION, DEFAULT_ENABLE_LEADING_ZEROS, DEFAULT_ENABLE_NEGATIVE, DEFAULT_FORMAT_ON, DEFAULT_DECIMAL_MAX_LENGTH, DEFAULT_THOUSAND_SEPARATOR, DEFAULT_THOUSAND_STYLE } from './config';
import { FormatOn } from './types';
import { validateNumoraInputOptions } from './validation';

export interface NumoraInputOptions extends Partial<HTMLInputElement> {
  // Formatting options
  formatOn: FormatOn;

  // Thousand options
  thousandSeparator: string;
  thousandStyle: thousandStyle;

  // Decimal options
  decimalSeparator: string;
  decimalMaxLength: number;

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

  private spaceInputTracker: { lastSpaceTime: number; lastSpacePosition: number } = {
    lastSpaceTime: 0,
    lastSpacePosition: -1,
  };

  constructor(
    container: HTMLElement,
    {
      decimalMaxLength = DEFAULT_DECIMAL_MAX_LENGTH,
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

    const escapedSeparator = this.options.decimalSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const pattern = this.options.enableNegative
    ? `^-?[0-9]*[${escapedSeparator}]?[0-9]*$`
    : `^[0-9]*[${escapedSeparator}]?[0-9]*$`;

    this.element.setAttribute('minlength', '1');
    this.element.setAttribute('pattern', pattern);
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
        thousandStyle: this.options.thousandStyle,
        enableCompactNotation: this.options.enableCompactNotation,
        enableNegative: this.options.enableNegative,
        enableLeadingZeros: this.options.enableLeadingZeros,
        decimalSeparator: this.options.decimalSeparator,
      }
    );
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
      thousandStyle: this.options.thousandStyle,
      decimalSeparator: this.options.decimalSeparator,
    });

    if (caretInfo) {
      this.caretPositionBeforeChange = {
        selectionStart: caretInfo.selectionStart ?? selectionStart ?? 0,
        selectionEnd: caretInfo.selectionEnd ?? selectionEnd ?? 0,
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
    handleOnPasteNumoraInput(
      e,
      this.options.decimalMaxLength,
      this.options.enableCompactNotation,
      this.options.enableNegative,
      this.options.enableLeadingZeros,
      this.options.decimalSeparator,
      this.options.thousandSeparator
    );
    if (this.options.onChange) {
      this.options.onChange((e.target as HTMLInputElement).value);
    }
  }

  private handleFocus(e: FocusEvent): void {
    const target = e.target as HTMLInputElement;
    // Remove separators for easier editing in 'blur' mode only
    if (this.options.formatOn === 'blur' && this.options.thousandSeparator) {
      target.value = target.value.replace(
        new RegExp(this.options.thousandSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        ''
      );
    }
  }

  private handleBlur(e: FocusEvent): void {
    const target = e.target as HTMLInputElement;
    // Add separators back in 'blur' mode
    if (this.options.thousandSeparator && target.value) {
      const formatted = formatWithSeparators(
        target.value,
        this.options.thousandSeparator,
        this.options.thousandStyle || 'thousand',
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
