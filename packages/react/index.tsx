import React, { forwardRef } from 'react';
import { handleOnChangeNumericInput, handleOnPasteNumericInput } from './helpers';

interface NumericInputProps extends React.ComponentPropsWithoutRef<'input'> {
  maxDecimals?: number;
  onValueChange?: (value: string) => void;
  className?: string;
  loading?: boolean;
  readOnly?: boolean;
  additionalStyle?: string;
  defaultValue?: string;
  autoFocus?: boolean;
}

const NumericInput = forwardRef<HTMLInputElement, NumericInputProps>(
  (
    {
      maxDecimals = 2,
      className = '',
      additionalStyle,
      onChange,
      onPaste,
      disabled = false,
      loading = false,
      register,
      readOnly = false,
      defaultValue,
      autoFocus,
      ...props
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (register) {
        handleOnChangeNumericInput(e, maxDecimals);
        register.onChange(e);
      }
      onChange?.(e);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      if (register) {
        handleOnPasteNumericInput(e, maxDecimals);
        register.onChange(e);
      }
      onPaste?.(e);
    };

    const removeText = disabled ? ' opacity-0' : '';
    const finalClassName = register
      ? `input border-0 focus:shadow-none bg-transparent focus:outline-none px-4 w-full h-full ${
          additionalStyle || ''
        } ${removeText}`
      : className;

    return (
      <div className="relative flex-grow">
        <input
          ref={ref}
          {...(register || {})}
          {...props}
          onChange={handleChange}
          onPaste={handlePaste}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          pattern="^[0-9]*[.,]?[0-9]*$"
          inputMode="decimal"
          type="text"
          className={finalClassName}
          placeholder={props.placeholder || '0.0'}
          spellCheck={false}
          step="any"
          value={defaultValue}
          autoFocus={autoFocus}
        />
        {(loading || disabled) && (
          <span className="absolute top-1/2 right-3 -translate-y-1/2 loading loading-bars loading-sm text-primary" />
        )}
      </div>
    );
  }
);

NumericInput.displayName = 'NumericInput';

export default NumericInput;
