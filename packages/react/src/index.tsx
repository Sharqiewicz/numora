import React, {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from 'react';
import {
  FormatOn,
  ThousandStyle,
  formatValue,
  type CaretPositionInfo,
  type FormattingOptions,
} from 'numora';
import {
  handleNumoraOnBlur,
  handleNumoraOnChange,
  handleNumoraOnKeyDown,
  handleNumoraOnPaste,
} from './handlers';

interface NumoraInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'type' | 'inputMode'
  > {
  maxDecimals?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement> | React.ClipboardEvent<HTMLInputElement>) => void;

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

const NumoraInput = forwardRef<HTMLInputElement, NumoraInputProps>((props, ref) => {
  const {
    maxDecimals = 2,
    onChange,
    onPaste,
    onBlur,
    onKeyDown,
    formatOn = FormatOn.Blur,
    thousandSeparator = ',',
    thousandStyle = ThousandStyle.Thousand,
    decimalSeparator = '.',
    decimalMinLength,
    enableCompactNotation = false,
    enableNegative = false,
    enableLeadingZeros = false,
    rawValueMode = false,
    value: controlledValue,
    defaultValue,
    ...rest
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const caretInfoRef = useRef<CaretPositionInfo | undefined>(undefined);

  const formattingOptions: FormattingOptions & { rawValueMode?: boolean } = {
    formatOn,
    thousandSeparator,
    ThousandStyle: thousandStyle,
    decimalSeparator,
    decimalMinLength,
    enableCompactNotation,
    enableNegative,
    enableLeadingZeros,
    rawValueMode,
  };

  const getFormattedDefaultValue = (): string => {
    if (defaultValue !== undefined) {
      const { formatted } = formatValue(String(defaultValue), maxDecimals, formattingOptions);
      return formatted;
    }
    return '';
  };

  const getInitialControlledValue = (): string => {
    if (controlledValue !== undefined) {
      const { formatted } = formatValue(String(controlledValue), maxDecimals, formattingOptions);
      return formatted;
    }
    return '';
  };

  const [internalValue, setInternalValue] = useState<string>(getInitialControlledValue);

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

  // When controlled value changes, normalize/format it for display
  useEffect(() => {
    if (controlledValue !== undefined) {
      const { formatted } = formatValue(String(controlledValue), maxDecimals, formattingOptions);
      setInternalValue(formatted);
    }
  }, [controlledValue, maxDecimals, formatOn, thousandSeparator, thousandStyle, decimalSeparator, decimalMinLength, enableCompactNotation, enableNegative, enableLeadingZeros, rawValueMode]);

  const isControlled = controlledValue !== undefined;

  const updateValue = (value: string) => {
    if (isControlled) {
      setInternalValue(value);
    }
  };

  const syncEventValue = (
    target: HTMLInputElement,
    formattedValue: string,
    rawValue?: string
  ): void => {
    Object.defineProperty(target, 'value', {
      writable: true,
      value: formattedValue,
    });

    if (rawValue !== undefined) {
      Object.defineProperty(target, 'rawValue', {
        writable: true,
        value: rawValue,
        enumerable: true,
        configurable: true,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, rawValue } = handleNumoraOnChange(e, {
      decimalMaxLength: maxDecimals,
      caretPositionBeforeChange: caretInfoRef.current,
      formattingOptions,
    });
    caretInfoRef.current = undefined;

    syncEventValue(e.target, value, rawValue);
    updateValue(value);

    if (onChange) {
      onChange(e);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const { value, rawValue } = handleNumoraOnPaste(e, {
      decimalMaxLength: maxDecimals,
      formattingOptions,
    });

    syncEventValue(e.target, value, rawValue);
    updateValue(value);

    if (onPaste) {
      onPaste(e);
    }
    if (onChange) {
      onChange(e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    caretInfoRef.current = handleNumoraOnKeyDown(e, formattingOptions);
    if (onKeyDown) {
      onKeyDown(e);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { value, rawValue } = handleNumoraOnBlur(e, {
      decimalMaxLength: maxDecimals,
      formattingOptions,
    });

    syncEventValue(e.target, value, rawValue);
    updateValue(value);

    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <input
      {...rest}
      ref={inputRef}
      {...(isControlled
        ? { value: internalValue }
        : { defaultValue: getFormattedDefaultValue() }
      )}
      onChange={handleChange}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      type="text"
      inputMode="decimal"
    />
  );
});

NumoraInput.displayName = 'NumoraInput';

export { NumoraInput };
export { FormatOn, ThousandStyle } from 'numora';
export type { FormattingOptions, CaretPositionInfo } from 'numora';
