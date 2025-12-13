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
    const numoraInputRef = useRef<NumoraInputClass | null>(null);
    const previousValueRef = useRef<string | undefined>(
      typeof props.value === 'string' ? props.value : props.value?.toString()
    );

    // Store onChange in a ref to avoid recreating NumoraInput when it changes
    const onChangeRef = useRef(onChange);
    useEffect(() => {
      onChangeRef.current = onChange;
    }, [onChange]);

    // Initialize and update NumoraInput class when container is mounted or options change
    useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      // Preserve current value when recreating instance
      const currentValue = numoraInputRef.current?.getValue() || 
        (typeof props.value === 'string' ? props.value : props.value !== undefined ? String(props.value) : undefined) ||
        (typeof props.defaultValue === 'string' ? props.defaultValue : props.defaultValue !== undefined ? String(props.defaultValue) : undefined);

      // Clean up old instance - clear container and reset ref
      if (numoraInputRef.current) {
        container.innerHTML = '';
        numoraInputRef.current = null;
      }

      // Extract and convert value/defaultValue props
      const { value, defaultValue, ...restProps } = props;
      const stringValue = typeof value === 'string' ? value : value !== undefined ? String(value) : undefined;
      const stringDefaultValue = typeof defaultValue === 'string' ? defaultValue : defaultValue !== undefined ? String(defaultValue) : undefined;

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
        value: stringValue ?? currentValue,
        defaultValue: stringDefaultValue,
        onChange: (value: string) => {
          // Use ref to get latest onChange without recreating NumoraInput
          if (onChangeRef.current && numoraInputRef.current) {
            const inputElement = numoraInputRef.current.getElement();
            // The value parameter is the processed value from NumoraInput (after compact notation expansion, formatting, etc.)
            // Create a synthetic event that properly exposes the processed value
            // We create a new object to avoid mutating the actual input element
            const syntheticEvent = {
              target: {
                ...inputElement,
                value: value,
              },
              currentTarget: {
                ...inputElement,
                value: value,
              },
              preventDefault: () => {},
              stopPropagation: () => {},
            } as ChangeEvent<HTMLInputElement>;
            onChangeRef.current(syntheticEvent);
          }
        },
        ...(restProps as NumoraInputOptions),
      };

      const numoraInput = new NumoraInputClass(container, numoraOptions);
      numoraInputRef.current = numoraInput;

      // Forward the input element ref
      const inputElement = numoraInput.getElement();
      if (typeof ref === 'function') {
        ref(inputElement);
      } else if (ref) {
        ref.current = inputElement;
      }

      // Cleanup on unmount
      return () => {
        if (numoraInputRef.current && container) {
          container.innerHTML = '';
        }
        numoraInputRef.current = null;
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

    // Handle programmatic value changes (when value prop changes externally)
    useEffect(() => {
      const numoraInput = numoraInputRef.current;
      if (!numoraInput) return;

      const currentValue = typeof props.value === 'string'
        ? props.value
        : props.value !== undefined
          ? String(props.value)
          : undefined;
      const previousValue = previousValueRef.current;

      // Only update if value changed externally
      if (currentValue !== previousValue) {
        if (currentValue !== undefined) {
          numoraInput.setValue(currentValue);
        } else {
          numoraInput.setValue('');
        }
      }

      previousValueRef.current = currentValue;
    }, [props.value]);

    return <div ref={containerRef} style={{ display: 'contents' }} />;
  }
);

NumoraInput.displayName = 'NumoraInput';

export { NumoraInput };
export { FormatOn, ThousandStyle } from 'numora';
export type { FormattingOptions, CaretPositionInfo } from 'numora';
