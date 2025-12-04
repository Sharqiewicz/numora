import {
  handleOnChangeNumericInput,
  handleOnKeyDownNumericInput,
  handleOnPasteNumericInput,
} from '@/utils/event-handlers';
import { formatWithSeparators, type ThousandsGroupStyle } from '@/utils/formatting';

const DEFAULT_MAX_DECIMALS = 2;

export type FormatOn = 'blur' | 'change';

export interface NumericInputOptions extends Partial<HTMLInputElement> {
  maxDecimals?: number;
  onChange?: (value: string) => void;

  // Formatting options
  formatOn?: FormatOn;  // Default: 'blur'
  thousandsSeparator?: string;  // Default: ','
  thousandsGroupStyle?: ThousandsGroupStyle;  // Default: 'thousand'

  // Parsing options
  shorthandParsing?: boolean;  // Default: false
}

export class NumericInput {
  private element!: HTMLInputElement;
  private options: NumericInputOptions;
  private caretPositionBeforeChange?: {
    selectionStart: number;
    selectionEnd: number;
    endOffset?: number;
  };

  constructor(
    container: HTMLElement,
    {
      maxDecimals = DEFAULT_MAX_DECIMALS,
      onChange,
      formatOn = 'blur',
      thousandsSeparator = ',',
      thousandsGroupStyle = 'thousand',
      shorthandParsing = false,
      ...rest
    }: NumericInputOptions
  ) {
    this.options = {
      maxDecimals,
      onChange,
      formatOn,
      thousandsSeparator,
      thousandsGroupStyle,
      shorthandParsing,
      ...rest,
    };

    this.createInputElement(container);
    this.setupEventListeners();
  }

  private createInputElement(container: HTMLElement): void {
    this.element = document.createElement('input');

    this.element.setAttribute('minlength', '1');
    this.element.setAttribute('pattern', '^[0-9]*[.,]?[0-9]*$');
    this.element.setAttribute('spellcheck', 'false');
    this.element.setAttribute('type', 'text');
    this.element.setAttribute('inputmode', 'decimal');

    const { maxDecimals, onChange, ...rest } = this.options;
    Object.assign(this.element, rest);

    container.appendChild(this.element);
  }

  private setupEventListeners(): void {
    this.element.addEventListener('input', this.handleChange.bind(this));
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.element.addEventListener('paste', this.handlePaste.bind(this));

    // Only add focus/blur handlers for 'blur' mode formatting
    if (this.options.formatOn === 'blur' && this.options.thousandsSeparator) {
      this.element.addEventListener('focus', this.handleFocus.bind(this));
      this.element.addEventListener('blur', this.handleBlur.bind(this));
    }
  }

  private handleChange(e: Event): void {
    handleOnChangeNumericInput(
      e,
      this.options.maxDecimals || DEFAULT_MAX_DECIMALS,
      this.caretPositionBeforeChange,
      {
        formatOn: this.options.formatOn,
        thousandsSeparator: this.options.thousandsSeparator,
        thousandsGroupStyle: this.options.thousandsGroupStyle,
        shorthandParsing: this.options.shorthandParsing,
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

    const caretInfo = handleOnKeyDownNumericInput(e, {
      formatOn: this.options.formatOn,
      thousandsSeparator: this.options.thousandsSeparator,
      thousandsGroupStyle: this.options.thousandsGroupStyle,
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
    handleOnPasteNumericInput(
      e,
      this.options.maxDecimals || DEFAULT_MAX_DECIMALS,
      this.options.shorthandParsing
    );
    if (this.options.onChange) {
      this.options.onChange((e.target as HTMLInputElement).value);
    }
  }

  private handleFocus(e: FocusEvent): void {
    const target = e.target as HTMLInputElement;
    // Remove separators for easier editing in 'blur' mode only
    if (this.options.formatOn === 'blur' && this.options.thousandsSeparator) {
      target.value = target.value.replace(
        new RegExp(this.options.thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
        ''
      );
    }
  }

  private handleBlur(e: FocusEvent): void {
    const target = e.target as HTMLInputElement;
    // Add separators back in 'blur' mode
    if (this.options.thousandsSeparator && target.value) {
      const formatted = formatWithSeparators(
        target.value,
        this.options.thousandsSeparator,
        this.options.thousandsGroupStyle || 'thousand'
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
