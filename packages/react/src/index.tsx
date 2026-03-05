import {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  forwardRef,
  useCallback,
  useMemo,
  ClipboardEvent,
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  InputHTMLAttributes
} from 'react';
import {
  FormatOn,
  ThousandStyle,
  resolveLocaleOptions,
  formatValueForDisplay,
  removeThousandSeparators,
  validateNumoraInputOptions,
  type CaretPositionInfo,
  type FormattingOptions,
} from 'numora';
import {
  handleNumoraOnBlur,
  handleNumoraOnChange,
  handleNumoraOnKeyDown,
  handleNumoraOnPaste,
} from './handlers';

export interface NumoraHTMLInputElement extends HTMLInputElement {
  rawValue?: string;
}

export type NumoraInputChangeEvent = Omit<ChangeEvent<HTMLInputElement>, 'target'> & {
  target: NumoraHTMLInputElement;
};

/**
 * Creates a complete synthetic change event from a real HTMLInputElement.
 * Used when a change needs to be signalled without an actual DOM change event
 * (e.g. after paste with preventDefault, or after a controlled-value reformat).
 */
function createSyntheticChangeEvent(input: HTMLInputElement): NumoraInputChangeEvent {
  const nativeEvent = new Event('change', { bubbles: true, cancelable: false });
  return {
    nativeEvent,
    target: input as NumoraHTMLInputElement,
    currentTarget: input,
    type: 'change',
    bubbles: true,
    cancelable: false,
    defaultPrevented: false,
    eventPhase: Event.AT_TARGET,
    isTrusted: false,
    timeStamp: Date.now(),
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    persist: () => {},
    preventDefault: () => {},
    stopPropagation: () => {},
    stopImmediatePropagation: () => {},
  } as unknown as NumoraInputChangeEvent;
}

export interface NumoraInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'type' | 'inputMode' | 'onFocus' | 'onBlur'
  > {
  maxDecimals?: number;
  onChange?: (e: NumoraInputChangeEvent) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
  /** Called with the raw (unformatted) numeric string on every value change. */
  onRawValueChange?: (rawValue: string | undefined) => void;

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
    onFocus,
    onRawValueChange,
    formatOn = FormatOn.Blur,
    thousandSeparator,
    thousandStyle = ThousandStyle.Thousand,
    decimalSeparator,
    decimalMinLength,
    enableCompactNotation = false,
    enableNegative = false,
    enableLeadingZeros = false,
    rawValueMode = false,
    value: controlledValue,
    defaultValue,
    ...rest
  } = props;

  validateNumoraInputOptions({
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
  });

  const internalInputRef = useRef<HTMLInputElement>(null);
  const caretInfoRef = useRef<CaretPositionInfo | undefined>(undefined);
  const lastCaretPosRef = useRef<number | null>(null);

  // Memoize to give callbacks a stable reference - avoids recreating all
  // useCallback functions on every render when primitive props haven't changed.
  const formattingOptions: FormattingOptions = useMemo(() => {
    const resolved = resolveLocaleOptions({ thousandSeparator, thousandStyle, decimalSeparator });

    return {
      formatOn,
      thousandSeparator: resolved.thousandSeparator,
      ThousandStyle: resolved.thousandStyle,
      decimalSeparator: resolved.decimalSeparator,
      decimalMinLength,
      enableCompactNotation,
      enableNegative,
      enableLeadingZeros,
      rawValueMode,
    };
  }, [formatOn, thousandSeparator, thousandStyle, decimalSeparator, decimalMinLength,
    enableCompactNotation, enableNegative, enableLeadingZeros, rawValueMode]);

  const getInitialValue = (): string => {
    const valueToFormat = controlledValue !== undefined ? controlledValue : defaultValue;
    if (valueToFormat !== undefined) {
      const { formatted } = formatValueForDisplay(String(valueToFormat), maxDecimals, formattingOptions);
      return formatted;
    }
    return '';
  };

  const [displayValue, setDisplayValue] = useState<string>(getInitialValue);

  // Track the current displayValue via a ref so the controlled-value useEffect
  // can compare against it without adding displayValue as a dependency (which
  // would cause the effect to re-run on every keystroke).
  const displayValueRef = useRef<string>(displayValue);
  displayValueRef.current = displayValue;

  // Sync external ref with internal ref
  useLayoutEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(internalInputRef.current);
    } else {
      ref.current = internalInputRef.current;
    }
  }, [ref]);

  // When the controlled value or formatting options change, reformat the display.
  // Uses displayValueRef (not displayValue in deps) to avoid re-running on every keystroke.
  // Does NOT call onChange - that would create a circular loop with react-hook-form Controller.
  useEffect(() => {
    if (controlledValue !== undefined) {
      const { formatted, raw } = formatValueForDisplay(String(controlledValue), maxDecimals, formattingOptions);
      if (formatted !== displayValueRef.current) {
        setDisplayValue(formatted);

        if (internalInputRef.current) {
          (internalInputRef.current as NumoraHTMLInputElement).rawValue = raw;
        }
        onRawValueChange?.(raw);
      }
    }
  }, [controlledValue, maxDecimals, formattingOptions, onRawValueChange]);

  // Restore cursor position after render.
  // No dependency array is intentional: this must run after every render so it catches
  // the re-render triggered by setDisplayValue in handleChange/handlePaste.
  // lastCaretPosRef is a ref (not reactive), so it cannot be a dependency.
  useLayoutEffect(() => {
    if (internalInputRef.current && lastCaretPosRef.current !== null) {
      const input = internalInputRef.current;
      const pos = lastCaretPosRef.current;
      input.setSelectionRange(pos, pos);
      lastCaretPosRef.current = null;
    }
  });

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value, rawValue } = handleNumoraOnChange(e, {
      decimalMaxLength: maxDecimals,
      caretPositionBeforeChange: caretInfoRef.current,
      formattingOptions,
    });

    if (internalInputRef.current) {
      const cursorPos = internalInputRef.current.selectionStart;
      if (cursorPos !== null && cursorPos !== undefined) {
        lastCaretPosRef.current = cursorPos;
      }
    }

    caretInfoRef.current = undefined;

    (e.target as NumoraHTMLInputElement).rawValue = rawValue;

    onRawValueChange?.(rawValue);

    setDisplayValue(value);

    if (onChange) {
      onChange(e as unknown as NumoraInputChangeEvent);
    }
  }, [maxDecimals, formattingOptions, onChange, onRawValueChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    const coreCaretInfo = handleNumoraOnKeyDown(e, formattingOptions);

    if (!coreCaretInfo && internalInputRef.current) {
      const selectionStart = internalInputRef.current.selectionStart ?? 0;
      const selectionEnd = internalInputRef.current.selectionEnd ?? 0;
      caretInfoRef.current = {
        selectionStart,
        selectionEnd,
      };
    } else {
      caretInfoRef.current = coreCaretInfo;
    }

    if (onKeyDown) {
      onKeyDown(e);
    }
  }, [formattingOptions, onKeyDown]);

  const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
    const { value, rawValue } = handleNumoraOnPaste(e, {
      decimalMaxLength: maxDecimals,
      formattingOptions,
    });

    lastCaretPosRef.current = (e.target as HTMLInputElement).selectionStart;
    (e.target as NumoraHTMLInputElement).rawValue = rawValue;

    onRawValueChange?.(rawValue);

    setDisplayValue(value);

    if (onPaste) {
      onPaste(e);
    }

    // Paste calls e.preventDefault() internally, so React's onChange never fires.
    // We synthesise a proper change event so consumers see a typed ChangeEvent.
    if (onChange) {
      onChange(createSyntheticChangeEvent(e.target as HTMLInputElement));
    }
  }, [maxDecimals, formattingOptions, onPaste, onChange, onRawValueChange]);

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    if (
      formattingOptions.formatOn === FormatOn.Blur &&
      formattingOptions.thousandSeparator &&
      formattingOptions.ThousandStyle !== ThousandStyle.None
    ) {
      // Read directly from the DOM element to avoid a stale displayValue closure
      // and to eliminate displayValue from the deps array (which would recreate
      // this callback on every keystroke).
      const currentValue = (e.target as HTMLInputElement).value;
      setDisplayValue(removeThousandSeparators(currentValue, formattingOptions.thousandSeparator!));
    }

    if (onFocus) {
      onFocus(e);
    }
  }, [formattingOptions, onFocus]);

  const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const { value, rawValue } = handleNumoraOnBlur(e, {
      decimalMaxLength: maxDecimals,
      formattingOptions,
    });

    (e.target as NumoraHTMLInputElement).rawValue = rawValue;

    onRawValueChange?.(rawValue);
    setDisplayValue(value);

    if (onBlur) {
      onBlur(e);
    }
  }, [maxDecimals, formattingOptions, onBlur, onRawValueChange]);

  return (
    <input
      {...rest}
      ref={internalInputRef}
      value={displayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={handleFocus}
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
