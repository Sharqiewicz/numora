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

  // Formatting options
  formatOn?: FormatOn;
  thousandSeparator?: string;
  thousandStyle?: ThousandStyle;
  decimalSeparator?: string;
  decimalMinLength?: number;

  // Feature flags
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

    // Initialize NumoraInput class once when container is mounted
    useEffect(() => {
      const container = containerRef.current;
      if (!container || numoraInputRef.current) return;

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
        value: stringValue,
        defaultValue: stringDefaultValue,
        onChange: (value: string) => {
          // Use ref to get latest onChange without recreating NumoraInput
          if (onChangeRef.current && numoraInputRef.current) {
            const inputElement = numoraInputRef.current.getElement();
            const syntheticEvent = {
              target: inputElement,
              currentTarget: inputElement,
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
        numoraInputRef.current = null;
      };
    }, []);

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
