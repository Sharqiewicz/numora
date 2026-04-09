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
  InputHTMLAttributes,
} from 'react';
import {
  FormatOn,
  ThousandStyle,
  applyLocale,
  formatValueForDisplay,
  removeThousandSeparators,
  validateNumoraInputOptions,
  type FormattingOptions,
} from 'numora';
import {
  handleNumoraOnBeforeInput,
  handleNumoraOnBlur,
  handleNumoraOnKeyDown,
  handleNumoraOnPaste,
} from './handlers';

export interface NumoraHTMLInputElement extends HTMLInputElement {
  rawValue?: string;
}

export type NumoraInputChangeEvent = Omit<ChangeEvent<HTMLInputElement>, 'target'> & {
  target: NumoraHTMLInputElement;
};

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
  } as NumoraInputChangeEvent;
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

  locale?: string | true;
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

/** Extract the raw value from a formatted display value by stripping thousand separators. */
function toRawValue(formatted: string, thousandSeparator?: string): string {
  return thousandSeparator ? removeThousandSeparators(formatted, thousandSeparator) : formatted;
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
    locale,
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

  const formattingOptions: FormattingOptions = useMemo(() => {
    const separators = applyLocale(locale, { thousandSeparator, decimalSeparator });
    return {
      formatOn,
      thousandSeparator: separators.thousandSeparator,
      ThousandStyle: thousandStyle,
      decimalSeparator: separators.decimalSeparator,
      decimalMinLength,
      enableCompactNotation,
      enableNegative,
      enableLeadingZeros,
      rawValueMode,
    };
  }, [locale, formatOn, thousandSeparator, thousandStyle, decimalSeparator, decimalMinLength,
    enableCompactNotation, enableNegative, enableLeadingZeros, rawValueMode]);

  // Compute initial formatted value once at mount. Using uncontrolled defaultValue means
  // React never overwrites the DOM value on re-renders, which is what allows undo to work.
  const [initialDisplayValue] = useState<string>(() => {
    const valueToFormat = controlledValue !== undefined ? controlledValue : defaultValue;
    if (valueToFormat !== undefined) {
      const { formatted } = formatValueForDisplay(String(valueToFormat), maxDecimals, formattingOptions);
      return formatted;
    }
    return '';
  });

  // Sync external ref
  useLayoutEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') ref(internalInputRef.current);
    else ref.current = internalInputRef.current;
  }, [ref]);

  // Set the initial rawValue on the element after mount so consumers that read it
  // synchronously from the ref always see a defined value.
  useEffect(() => {
    const input = internalInputRef.current;
    if (!input) return;
    (input as NumoraHTMLInputElement).rawValue = toRawValue(input.value, formattingOptions.thousandSeparator);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally runs once on mount only

  // Sync controlled value prop changes and formatting option changes (locale switch, separator
  // change, maxDecimals change, etc.). Direct assignment is fine — programmatic changes don't
  // need undo history. We compare formatted against input.value (not a prev-value ref) so the
  // effect correctly reformats when formattingOptions changes even if controlledValue is the same.
  useEffect(() => {
    if (controlledValue === undefined) return;
    const input = internalInputRef.current;
    if (!input) return;

    const { formatted, raw } = formatValueForDisplay(String(controlledValue), maxDecimals, formattingOptions);
    if (formatted !== input.value) {
      input.value = formatted;
      (input as NumoraHTMLInputElement).rawValue = raw;
      onRawValueChange?.(raw);
    }
  }, [controlledValue, maxDecimals, formattingOptions, onRawValueChange]);

  // Keep refs in sync so the beforeinput handler always sees the latest options without
  // needing to re-register the listener on every render. useLayoutEffect ensures the refs
  // are updated before the browser can fire a beforeinput event after a commit.
  const formattingOptionsRef = useRef(formattingOptions);
  const maxDecimalsRef = useRef(maxDecimals);
  useLayoutEffect(() => {
    formattingOptionsRef.current = formattingOptions;
    maxDecimalsRef.current = maxDecimals;
  });

  // Native beforeinput listener attached directly to the input element (not via React's
  // synthetic event delegation). React's onBeforeInput fires at the root during bubbling —
  // by that point the browser has already committed the mutation, so e.preventDefault() is
  // a no-op. A direct listener on the element fires synchronously before the browser decides
  // whether to apply the mutation, which is the only way cancellation works correctly.
  // Registered once at mount; options are read via refs to avoid re-registration churn.
  useEffect(() => {
    const input = internalInputRef.current;
    if (!input) return;

    const handler = (e: InputEvent) => {
      const result = handleNumoraOnBeforeInput(e, {
        decimalMaxLength: maxDecimalsRef.current,
        formattingOptions: formattingOptionsRef.current,
      });
      if (result !== null) {
        (input as NumoraHTMLInputElement).rawValue = result.rawValue;
      }
    };

    input.addEventListener('beforeinput', handler);
    return () => input.removeEventListener('beforeinput', handler);
  }, []);

  // handleChange fires after every native input event:
  //   • from setRangeText (typing path) — rawValue already set by beforeinput handler
  //   • from the input fallback path    — rawValue recomputed from current value
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const formatted = e.target.value;
    // Always recompute from the current display value so stale rawValue (e.g. after undo)
    // is never used. removeThousandSeparators(formatted) == raw for all formatting modes.
    const rawValue = toRawValue(formatted, formattingOptions.thousandSeparator);

    (e.target as NumoraHTMLInputElement).rawValue = rawValue;
    onRawValueChange?.(rawValue);

    if (onChange) onChange(e as NumoraInputChangeEvent);
  }, [formattingOptions.thousandSeparator, onChange, onRawValueChange]);

  // handleKeyDown is still needed for skipOverThousandSeparatorOnDelete (moves the cursor
  // past separators before beforeinput fires). caretInfoRef is no longer needed because
  // handleOnBeforeInputNumoraInput derives its own caret info from the InputEvent.
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    handleNumoraOnKeyDown(e, formattingOptions);
    if (onKeyDown) onKeyDown(e);
  }, [formattingOptions, onKeyDown]);

  const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
    const { value, rawValue } = handleNumoraOnPaste(e, { decimalMaxLength: maxDecimals, formattingOptions });

    const input = e.target as HTMLInputElement;
    input.value = value;
    (input as NumoraHTMLInputElement).rawValue = rawValue;

    onRawValueChange?.(rawValue);

    if (onPaste) onPaste(e);

    // handleOnPasteNumoraInput calls e.preventDefault(), so no native input/change fires.
    // Synthesise a change event so consumers see the same API as typing.
    if (onChange) onChange(createSyntheticChangeEvent(input));
  }, [maxDecimals, formattingOptions, onPaste, onChange, onRawValueChange]);

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    // In Blur mode we strip separators while the user is editing, then re-apply on blur.
    if (
      formattingOptions.formatOn === FormatOn.Blur &&
      formattingOptions.thousandSeparator &&
      formattingOptions.ThousandStyle !== ThousandStyle.None
    ) {
      const input = e.target as HTMLInputElement;
      input.value = removeThousandSeparators(input.value, formattingOptions.thousandSeparator!);
      // rawValue doesn't change — it was already separator-free
    }
    if (onFocus) onFocus(e);
  }, [formattingOptions, onFocus]);

  const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const { value, rawValue } = handleNumoraOnBlur(e, { decimalMaxLength: maxDecimals, formattingOptions });

    const input = e.target as HTMLInputElement;
    input.value = value;

    // rawValue is only defined when handleNumoraOnBlur applied formatting (Blur mode).
    // In Change mode it returns undefined — don't overwrite or emit in that case.
    if (rawValue !== undefined) {
      (input as NumoraHTMLInputElement).rawValue = rawValue;
      onRawValueChange?.(rawValue);
      // Notify onChange so consumers see the formatted-on-blur value.
      if (onChange) onChange(createSyntheticChangeEvent(input));
    }

    if (onBlur) onBlur(e);
  }, [maxDecimals, formattingOptions, onBlur, onChange, onRawValueChange]);

  return (
    <input
      {...rest}
      ref={internalInputRef}
      defaultValue={initialDisplayValue}
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
