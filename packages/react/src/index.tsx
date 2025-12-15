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
  type CaretPositionInfo,
  type FormattingOptions,
  handleOnChangeNumoraInput,
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

  const [internalValue, setInternalValue] = useState<string>(
    controlledValue !== undefined
      ? String(controlledValue)
      : defaultValue !== undefined
        ? String(defaultValue)
        : ''
  );

  // Keep internal state in sync when controlled
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(String(controlledValue));
    }
  }, [controlledValue]);

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement, []);

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

  const formatValueWithCore = (value: string): string => {
    const el = inputRef.current ?? document.createElement('input');
    el.value = value;
    const fakeEvent = { target: el } as unknown as Event;
    handleOnChangeNumoraInput(fakeEvent, maxDecimals, undefined, formattingOptions);
    return el.value;
  };

  // When controlled value changes, normalize/format it for display
  useEffect(() => {
    if (controlledValue !== undefined) {
      const formatted = formatValueWithCore(String(controlledValue));
      setInternalValue(formatted);
    }
  }, [controlledValue, formatOn, thousandSeparator, thousandStyle, decimalSeparator, decimalMinLength, enableCompactNotation, enableNegative, enableLeadingZeros, rawValueMode, maxDecimals]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, rawValue } = handleNumoraOnChange(e, {
      decimalMaxLength: maxDecimals,
      caretPositionBeforeChange: caretInfoRef.current,
      formattingOptions,
    });
    caretInfoRef.current = undefined;

    if (controlledValue === undefined) {
      setInternalValue(value);
    } else {
      setInternalValue(value);
    }

    if (onChange) {
      onChange(e);
    }

    // Optionally expose rawValue via a custom event attribute if needed later
    if (rawValue && e.target && rawValueMode) {
      // Keep the raw value on the input for consumers that read it directly
      e.target.setAttribute('data-raw-value', rawValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const { value, rawValue } = handleNumoraOnPaste(e, {
      decimalMaxLength: maxDecimals,
      formattingOptions,
    });

    if (controlledValue === undefined) {
      setInternalValue(value);
    } else {
      setInternalValue(value);
    }

    if (onPaste) {
      onPaste(e);
    }
    if (onChange) {
      onChange(e);
    }

    if (rawValue && e.target && rawValueMode) {
      (e.target as HTMLInputElement).setAttribute('data-raw-value', rawValue);
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

    if (controlledValue === undefined) {
      setInternalValue(value);
    } else {
      setInternalValue(value);
    }

    if (onBlur) {
      onBlur(e);
    }

    if (rawValue && e.target && rawValueMode) {
      (e.target as HTMLInputElement).setAttribute('data-raw-value', rawValue);
    }
  };

  return (
    <input
      {...rest}
      ref={inputRef}
      value={internalValue}
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
