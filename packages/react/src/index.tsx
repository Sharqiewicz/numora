import React, { ChangeEvent, ClipboardEvent, forwardRef } from 'react';
import {
  handleOnChangeNumericInput,
  handleOnPasteNumericInput,
  handleOnKeyDownNumericInput,
  type ThousandsGroupStyle,
  type FormatOn,
} from 'numora';

interface NumericInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'inputMode'> {
  additionalStyle?: string;
  maxDecimals?: number;
  onChange?: (e: ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLInputElement>) => void;

  // Formatting options
  formatOn?: FormatOn;  // Default: 'blur'
  thousandsSeparator?: string;  // Default: ','
  thousandsGroupStyle?: ThousandsGroupStyle;  // Default: 'thousand'
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
    formatOn = 'blur',
    thousandsSeparator = ',',
    thousandsGroupStyle = 'thousand',
    ...props
  }: NumericInputProps, ref) => {
    const [caretPositionBeforeChange, setCaretPositionBeforeChange] =
      React.useState<{ selectionStart: number; selectionEnd: number; endOffset?: number }>();

    function handleOnKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
      const caretInfo = handleOnKeyDownNumericInput(e.nativeEvent, {
        formatOn,
        thousandsSeparator,
        thousandsGroupStyle,
      });

      if (caretInfo) {
        setCaretPositionBeforeChange(caretInfo);
      } else {
        const input = e.currentTarget;
        setCaretPositionBeforeChange({
          selectionStart: input.selectionStart ?? 0,
          selectionEnd: input.selectionEnd ?? 0,
        });
      }

      // Call user's onKeyDown if provided
      if (props.onKeyDown) {
        props.onKeyDown(e);
      }
    }

    function handleOnChange(e: ChangeEvent<HTMLInputElement>): void {
      handleOnChangeNumericInput(
        e.nativeEvent,
        maxDecimals,
        caretPositionBeforeChange,
        {
          formatOn,
          thousandsSeparator,
          thousandsGroupStyle,
        }
      );
      setCaretPositionBeforeChange(undefined);
      if (onChange) onChange(e);
    }

    function handleOnPaste(e: ClipboardEvent<HTMLInputElement>): void {
      handleOnPasteNumericInput(e.nativeEvent, maxDecimals);
      if (onChange) onChange(e);
    }

    function handleOnFocus(e: React.FocusEvent<HTMLInputElement>): void {
      // Remove separators for easier editing in 'blur' mode
      if (formatOn === 'blur' && thousandsSeparator) {
        const target = e.currentTarget;
        target.value = target.value.replace(
          new RegExp(thousandsSeparator.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
          ''
        );
      }

      // Call user's onFocus if provided
      if (props.onFocus) {
        props.onFocus(e);
      }
    }

    function handleOnBlur(e: React.FocusEvent<HTMLInputElement>): void {
      // Add separators back in 'blur' mode
      if (formatOn === 'blur' && thousandsSeparator && e.currentTarget.value) {
        const target = e.currentTarget;

        // Need to import formatWithSeparators or handle differently
        // For now, we'll trigger onChange which will handle it
      }

      // Call user's onBlur if provided
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
