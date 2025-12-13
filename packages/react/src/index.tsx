import React, { ChangeEvent, ClipboardEvent, forwardRef } from 'react';
import {
  handleOnChangeNumoraInput,
  handleOnPasteNumoraInput,
  handleOnKeyDownNumoraInput,
  FormatOn,
  ThousandStyle,
  type FormattingOptions,
  type CaretPositionInfo,
} from 'numora';

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'inputMode'> {
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

const DEFAULT_PROPS = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'none',
  minLength: 1,
  placeholder: '0.0',
  pattern: '^[0-9]*[.,]?[0-9]*$',
  spellCheck: false,
  step: 'any',
};

const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
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
  }: NumericInputProps, ref) => {
    const [caretPositionBeforeChange, setCaretPositionBeforeChange] =
      React.useState<CaretPositionInfo>();

    const formattingOptions: FormattingOptions = {
      formatOn,
      thousandSeparator,
      ThousandStyle: thousandStyle as any,
      decimalSeparator,
      decimalMinLength,
      enableCompactNotation,
      enableNegative,
      enableLeadingZeros,
      rawValueMode,
    };

    function handleOnKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
      const caretInfo = handleOnKeyDownNumoraInput(e.nativeEvent, formattingOptions);

      if (caretInfo) {
        setCaretPositionBeforeChange(caretInfo);
      } else {
        const input = e.currentTarget;
        setCaretPositionBeforeChange({
          selectionStart: input.selectionStart ?? 0,
          selectionEnd: input.selectionEnd ?? 0,
        });
      }

      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    }

    function handleOnChange(e: ChangeEvent<HTMLInputElement>): void {
      handleOnChangeNumoraInput(
        e.nativeEvent,
        maxDecimals,
        caretPositionBeforeChange,
        formattingOptions
      );
      setCaretPositionBeforeChange(undefined);
      if (onChange) onChange(e);
    }

    function handleOnPaste(e: ClipboardEvent<HTMLInputElement>): void {
      handleOnPasteNumoraInput(e.nativeEvent, maxDecimals, formattingOptions);
      if (onChange) onChange(e);
    }

    function handleOnFocus(e: React.FocusEvent<HTMLInputElement>): void {
      if (formatOn === FormatOn.Blur && thousandSeparator) {
        const target = e.currentTarget;
        target.value = target.value.replace(
          new RegExp(thousandSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          ''
        );
      }

      if (props.onFocus) {
        props.onFocus(e);
      }
    }

    function handleOnBlur(e: React.FocusEvent<HTMLInputElement>): void {
      if (props.onBlur) {
        props.onBlur(e);
      }
    }

    return (
      <input
        {...DEFAULT_PROPS}
        {...props}
        ref={ref}
        onChange={handleOnChange}
        onKeyDown={handleOnKeyDown}
        onPaste={handleOnPaste}
        onFocus={handleOnFocus}
        onBlur={handleOnBlur}
        type="text"
        inputMode="decimal"
      />
    );
  }
);

NumericInput.displayName = 'NumericInput';

export { NumericInput };
