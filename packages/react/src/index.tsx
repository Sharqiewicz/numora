import { ChangeEvent, ClipboardEvent, forwardRef } from 'react';
import { handleOnChangeNumericInput, handleOnPasteNumericInput } from 'numora';

interface NumericInputProps {
  additionalStyle?: string;
  maxDecimals?: number;
  defaultValue?: string;
  autoFocus?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLInputElement>) => void;
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
  ({ maxDecimals = 2, onChange, ...props }: NumericInputProps) => {
    function handleOnChange(e: ChangeEvent<HTMLInputElement>): void {
      handleOnChangeNumericInput(e.nativeEvent, maxDecimals);
      if (onChange) onChange(e);
    }

    function handleOnPaste(e: ClipboardEvent<HTMLInputElement>): void {
      handleOnPasteNumericInput(e.nativeEvent, maxDecimals);
      if (onChange) onChange(e);
    }

    return (
      <input
        {...DEFAULT_PROPS}
        {...props}
        onChange={handleOnChange}
        onPaste={handleOnPaste}
        type="text"
        inputMode="decimal"
      />
    );
  }
);

NumericInput.displayName = 'NumericInput';

export { NumericInput };
