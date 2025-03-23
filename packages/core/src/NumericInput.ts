import {
  handleOnChangeNumericInput,
  handleOnKeyDownNumericInput,
  handleOnPasteNumericInput,
} from '@/utils/event-handlers';

const DEFAULT_MAX_DECIMALS = 2;

interface NumericInputOptions extends HTMLInputElement {
  maxDecimals: number;
  onChange?: (value: string) => void;
}

export class NumericInput {
  private element!: HTMLInputElement;
  private options: NumericInputOptions;

  constructor(
    container: HTMLElement,
    { maxDecimals = DEFAULT_MAX_DECIMALS, onChange, ...rest }: NumericInputOptions
  ) {
    this.options = {
      maxDecimals,
      onChange,
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
  }

  private handleChange(e: Event): void {
    handleOnChangeNumericInput(e, this.options.maxDecimals);
    if (this.options.onChange) {
      this.options.onChange((e.target as HTMLInputElement).value);
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    handleOnKeyDownNumericInput(e);
  }

  private handlePaste(e: ClipboardEvent): void {
    handleOnPasteNumericInput(e, this.options.maxDecimals!);
    if (this.options.onChange) {
      this.options.onChange((e.target as HTMLInputElement).value);
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
