import React, { ChangeEvent, ClipboardEvent, forwardRef, useEffect, useRef } from 'react';
import {
  FormatOn,
  ThousandStyle,
  NumoraInput as NumoraInputClass,
  type NumoraInputOptions,
} from 'numora';

interface NumoraInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'inputMode'> {
  maxDecimals?: number;
  onChange?: (e: ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLInputElement>) => void;

  formatOn?: FormatOn;
  thousandSeparator?: string;
  thousandStyle?: ThousandStyle;
  decimalSeparator?: string;
  decimalMinLength?: number;

  enableCompactNotation?: boolean;
  enableNegative?: boolean;
  enableLeadingZeros?: boolean;
  rawValueMode?: boolean;
}

// Helper: Convert any value to string, handling undefined
function toStringValue(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  return typeof value === 'string' ? value : String(value);
}

// Helper: Create React synthetic event from NumoraInput onChange
function createChangeEvent(
  element: HTMLInputElement,
  value: string
): ChangeEvent<HTMLInputElement> {
  return {
    target: Object.assign(element, { value }),
    currentTarget: Object.assign(element, { value }),
  } as ChangeEvent<HTMLInputElement>;
}

// Helper: Forward ref to input element
function forwardRefToElement(
  ref: React.Ref<HTMLInputElement>,
  element: HTMLInputElement
): void {
  if (typeof ref === 'function') {
    ref(element);
  } else if (ref) {
    ref.current = element;
  }
}

const NumoraInput = forwardRef<HTMLInputElement, NumoraInputProps>(
  ({
    maxDecimals = 2,
    onChange,
    formatOn = FormatOn.Blur,
    thousandSeparator = ',',
    thousandStyle = ThousandStyle.Thousand,
    decimalSeparator = '.',
    decimalMinLength,
    enableCompactNotation = false,
    enableNegative = false,
    enableLeadingZeros = false,
    rawValueMode = false,
    ...props
  }: NumoraInputProps, ref: React.Ref<HTMLInputElement>) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const instanceRef = useRef<NumoraInputClass | null>(null);

    // Store onChange in a ref to avoid recreating NumoraInput when it changes
    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // Initialize and update NumoraInput instance when container is mounted or options change
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Preserve current value when recreating instance
      const preservedValue = instanceRef.current?.getValue() ||
        toStringValue(props.value) ||
        toStringValue(props.defaultValue);

      // Clean up old instance
      if (instanceRef.current) {
        container.innerHTML = '';
        instanceRef.current = null;
      }

      // Extract and convert value/defaultValue props
      const { value, defaultValue, ...restProps } = props;
      const valueStr = toStringValue(value);
      const defaultValueStr = toStringValue(defaultValue);

      const numoraOptions: NumoraInputOptions = {
        decimalMaxLength: maxDecimals,
        decimalMinLength,
        formatOn,
        thousandSeparator,
        thousandStyle,
        decimalSeparator,
        enableCompactNotation,
        enableNegative,
        enableLeadingZeros,
        rawValueMode,
        value: valueStr ?? preservedValue,
        defaultValue: defaultValueStr,
        onChange: (value: string) => {
          if (onChangeRef.current && instanceRef.current) {
            const element = instanceRef.current.getElement();
            const event = createChangeEvent(element, value);
            onChangeRef.current(event);
          }
        },
        ...(restProps as NumoraInputOptions),
      };

      const instance = new NumoraInputClass(container, numoraOptions);
      instanceRef.current = instance;

      forwardRefToElement(ref, instance.getElement());

      return () => {
        if (instanceRef.current && container) {
          container.innerHTML = '';
        }
        instanceRef.current = null;
      };
    }, [
      maxDecimals,
      decimalMinLength,
      formatOn,
      thousandSeparator,
      thousandStyle,
      decimalSeparator,
      enableCompactNotation,
      enableNegative,
      enableLeadingZeros,
      rawValueMode,
    ]);

    // Sync external value prop changes to NumoraInput (controlled component)
    useEffect(() => {
      const instance = instanceRef.current;
      if (!instance) return;

      const currentValue = toStringValue(props.value);
      const instanceValue = instance.getValue();

      if (currentValue !== instanceValue) {
        const element = instance.getElement();
        instance.setValue(currentValue ?? '');

        const inputEvent = new Event('input', { bubbles: true, cancelable: true });
        element.dispatchEvent(inputEvent);
      }
    }, [props.value]);

    return <div ref={containerRef} style={{ display: 'contents' }} />;
  }
);

NumoraInput.displayName = 'NumoraInput';

export { NumoraInput };
export { FormatOn, ThousandStyle } from 'numora';
export type { FormattingOptions, CaretPositionInfo } from 'numora';
