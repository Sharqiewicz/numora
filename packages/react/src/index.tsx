import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useCallback,
} from 'react';
import {
  FormatOn,
  ThousandStyle,
  formatValueForDisplay,
  type CaretPositionInfo,
  type FormattingOptions,
} from 'numora';
import {
  handleNumoraOnBlur,
  handleNumoraOnChange,
  handleNumoraOnKeyDown,
  handleNumoraOnPaste,
} from './handlers';

export interface NumoraInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'type' | 'inputMode'
  > {
  maxDecimals?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

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

  const internalInputRef = useRef<HTMLInputElement>(null);
  const caretInfoRef = useRef<CaretPositionInfo | undefined>(undefined);
  const lastCaretPosRef = useRef<number | null>(null);

  const formattingOptions: FormattingOptions = {
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

  const getInitialValue = (): string => {
    const valueToFormat = controlledValue !== undefined ? controlledValue : defaultValue;
    if (valueToFormat !== undefined) {
      const { formatted } = formatValueForDisplay(String(valueToFormat), maxDecimals, formattingOptions);
      return formatted;
    }
    return '';
  };

  const [displayValue, setDisplayValue] = useState<string>(getInitialValue);

  // Sync external ref with internal ref
  useLayoutEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(internalInputRef.current);
    } else {
      ref.current = internalInputRef.current;
    }
  }, [ref]);

  // When controlled value changes from outside, update display value
  useEffect(() => {
    if (controlledValue !== undefined) {
      const { formatted } = formatValueForDisplay(String(controlledValue), maxDecimals, formattingOptions);
      if (formatted !== displayValue) {
        setDisplayValue(formatted);
      }
    }
  }, [controlledValue, maxDecimals, formattingOptions]);

  // Restore cursor position after render
  useLayoutEffect(() => {
    if (internalInputRef.current && lastCaretPosRef.current !== null) {
      const input = internalInputRef.current;
      const pos = lastCaretPosRef.current;
      input.setSelectionRange(pos, pos);
      lastCaretPosRef.current = null;
    }
  });

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleChange', e.nativeEvent);
    const { value, rawValue } = handleNumoraOnChange(e, {
      decimalMaxLength: maxDecimals,
      caretPositionBeforeChange: caretInfoRef.current,
      formattingOptions,
    });

    caretInfoRef.current = undefined;

    // Store current cursor position to restore after React render
    lastCaretPosRef.current = e.target.selectionStart;

    // Add rawValue to the event object without overriding 'value' property
    (e.target as any).rawValue = rawValue;

    setDisplayValue(value);

    if (onChange) {
      onChange(e);
    }
  }, [maxDecimals, formattingOptions, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    caretInfoRef.current = handleNumoraOnKeyDown(e, formattingOptions);
    if (onKeyDown) {
      onKeyDown(e);
    }
  }, [formattingOptions, onKeyDown]);

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
    const { value, rawValue } = handleNumoraOnPaste(e, {
      decimalMaxLength: maxDecimals,
      formattingOptions,
    });

    // For paste, we often want to move cursor to the end of pasted content
    // handleNumoraOnPaste already handles DOM value and cursor, but React will overwrite it.
    // So we capture where the core logic set the cursor.
    lastCaretPosRef.current = (e.target as HTMLInputElement).selectionStart;
    (e.target as any).rawValue = rawValue;

    setDisplayValue(value);

    if (onPaste) {
      onPaste(e);
    }

    // Trigger onChange manually because paste event doesn't always trigger a ChangeEvent in all React versions
    // when we preventDefault.
    if (onChange) {
      const changeEvent = e as unknown as React.ChangeEvent<HTMLInputElement>;
      onChange(changeEvent);
    }
  }, [maxDecimals, formattingOptions, onPaste, onChange]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { value, rawValue } = handleNumoraOnBlur(e, {
      decimalMaxLength: maxDecimals,
      formattingOptions,
    });

    (e.target as any).rawValue = rawValue;
    setDisplayValue(value);

    if (onBlur) {
      onBlur(e);
    }
  }, [maxDecimals, formattingOptions, onBlur]);

  return (
    <input
      {...rest}
      ref={internalInputRef}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onBlur={handleBlur}
      type="text"
      inputMode="decimal"
      spellCheck={false}
      autoComplete="off"
    />
  );
});

NumoraInput.displayName = 'NumoraInput';

export { NumoraInput };
export { FormatOn, ThousandStyle } from 'numora';
export type { FormattingOptions, CaretPositionInfo } from 'numora';
