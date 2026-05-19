import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useCallback,
  useMemo,
  ClipboardEvent,
  ChangeEvent,
  FocusEvent,
  KeyboardEvent,
  InputHTMLAttributes,
} from 'react';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import {
  FormatOn,
  ThousandStyle,
  applyLocale,
  formatValueForDisplay,
  handleOnBeforeInputNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
  removeThousandSeparators,
  validateNumoraInputOptions,
  type FormattingOptions,
} from 'numora';

export interface NumoraHTMLInputElement extends HTMLInputElement {
  /** The formatted display string - the same value shown in the input, including thousand separators. */
  formattedValue?: string;
}

/**
 * Synthetic change event fired by NumoraInput on every value change.
 *
 * - `target.value` - the **raw (unformatted) numeric string**, separators stripped.
 *   Safe to pass directly to react-hook-form's `field.onChange` or any other form library.
 *
 * - `target.formattedValue` - the formatted display string (e.g. `"1,234.56"`),
 *   the same value visible in the input. Use this when you need to display or store
 *   the formatted representation.
 *
 * Structurally assignable to `ChangeEvent<HTMLInputElement>`, so react-hook-form's
 * `register.onChange` can be spread directly onto the `onChange` prop.
 */
export type NumoraInputChangeEvent = Omit<ChangeEvent<HTMLInputElement>, "target"> & {
  target: NumoraHTMLInputElement;
};

/**
 * Creates a synthetic change event where `target.value` returns the raw (unformatted)
 * numeric string via a Proxy, and `target.formattedValue` exposes the formatted display
 * value (already set on the element before this is called).
 *
 * Cast is safe: the object satisfies every field of NumoraInputChangeEvent. The only
 * structural mismatch is currentTarget (plain HTMLInputElement vs EventTarget &
 * HTMLInputElement), which is equivalent at runtime since HTMLInputElement implements
 * EventTarget. A full SyntheticEvent cannot be constructed outside React internals.
 */
function createSyntheticChangeEvent(input: NumoraHTMLInputElement, rawValue: string): NumoraInputChangeEvent {
  const nativeEvent = new Event("change", { bubbles: true, cancelable: false });
  const target = new Proxy(input, {
    get(t, prop: string | symbol) {
      if (prop === "value") return rawValue;
      const v = Reflect.get(t, prop) as unknown;
      return typeof v === "function" ? (v as (...args: unknown[]) => unknown).bind(t) : v;
    },
  });
  return {
    nativeEvent,
    target,
    currentTarget: input,
    type: "change",
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
    "onChange" | "type" | "inputMode" | "onFocus" | "onBlur"
  > {
  maxDecimals?: number;
  onChange?: (e: NumoraInputChangeEvent) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;

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

/** Strip thousand separators to recover the raw numeric string from a formatted display value. */
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

  if (process.env.NODE_ENV !== 'production') {
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
  }

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

  const internalInputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  // Flag used to prevent handleChange from double-calling onChange on the typing path.
  // Set to true immediately before the programmatic input dispatch (which is synchronous),
  // so it is still true when handleChange runs, then cleared after dispatch returns.
  const isHandledByBeforeInputRef = useRef(false);
  const maxDecimalsRef = useRef(maxDecimals);
  const formattingOptionsRef = useRef(formattingOptions);

  // Computed once on mount. Uncontrolled defaultValue lets React leave the DOM value alone
  // on re-renders, which is what allows undo to work.
  const [initialDisplayValue] = useState(() => {
    const valueToFormat = controlledValue !== undefined ? controlledValue : defaultValue;
    if (valueToFormat === undefined) return '';
    return formatValueForDisplay(String(valueToFormat), maxDecimals, formattingOptions).formatted;
  });

  // Sync external ref → internal input element.
  useIsomorphicLayoutEffect(() => {
    if (!ref) return;
    if (typeof ref === 'function') {
      ref(internalInputRef.current);
      return () => ref(null);
    }
    ref.current = internalInputRef.current;
    return () => {
      ref.current = null;
    };
  }, [ref]);

  // Keep refs in sync so the native beforeinput listener (registered once at mount) always
  // sees the latest options/callbacks without needing to re-register. Intentionally no deps —
  // must run after every render to stay current.
  useIsomorphicLayoutEffect(() => {
    formattingOptionsRef.current = formattingOptions;
    maxDecimalsRef.current = maxDecimals;
    onChangeRef.current = onChange;
  });

  // Mount-only DOM init: set formattedValue on the element so consumers reading it
  // synchronously from the ref always see a defined value. No reactive inputs to track.
  useEffect(() => {
    const input = internalInputRef.current;
    if (!input) return;
    (input as NumoraHTMLInputElement).formattedValue = input.value;
  }, []);

  // Sync controlled value prop changes and formatting option changes (locale switch, separator
  // change, maxDecimals change, etc.). Direct assignment is fine - programmatic changes don't
  // need undo history. We compare formatted against input.value (not a prev-value ref) so the
  // effect correctly reformats when formattingOptions changes even if controlledValue is the same.
  // Always format with separators regardless of formatOn - the formatOn setting only controls
  // real-time typing behaviour, not how a programmatically-set value is displayed.
  useEffect(() => {
    if (controlledValue === undefined) return;
    const input = internalInputRef.current;
    if (!input) return;

    const displayOptions = formattingOptions.formatOn === FormatOn.Blur
      ? { ...formattingOptions, formatOn: FormatOn.Change }
      : formattingOptions;
    const { formatted } = formatValueForDisplay(String(controlledValue), maxDecimals, displayOptions);
    if (formatted !== input.value) {
      input.value = formatted;
      (input as NumoraHTMLInputElement).formattedValue = formatted;
    }
  }, [controlledValue, maxDecimals, formattingOptions]);

  // Native beforeinput listener attached directly to the input element (not via React's
  // synthetic event delegation). React's onBeforeInput fires at the root during bubbling -
  // by that point the browser has already committed the mutation, so e.preventDefault() is
  // a no-op. A direct listener on the element fires synchronously before the browser decides
  // whether to apply the mutation, which is the only way cancellation works correctly.
  // Registered once at mount; options are read via refs to avoid re-registration churn.
  useEffect(() => {
    const input = internalInputRef.current;
    if (!input) return;

    const handler = (e: InputEvent) => {
      // Paste/drop are handled by the React onPaste handler which already calls onChange.
      if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') return;

      const result = handleOnBeforeInputNumoraInput(
        e,
        maxDecimalsRef.current,
        formattingOptionsRef.current
      );
      if (result === null) return;

      const numInput = input as NumoraHTMLInputElement;
      numInput.formattedValue = result.formatted;
      // Call onChange directly - guaranteed delivery, no dependency on React's
      // value-tracker diff or synthetic event pipeline (which can silently drop onChange
      // when the tracker and input.value happen to match after concurrent renders).
      if (onChangeRef.current) {
        onChangeRef.current(createSyntheticChangeEvent(numInput, result.raw ?? ''));
      }
      // Dispatch input only to keep React's internal value tracker in sync.
      // Required for undo detection: when the user undoes, the browser fires a real input
      // event and handleChange needs the tracker to reflect the current value.
      // dispatchEvent is synchronous - isHandledByBeforeInputRef is true throughout
      // handleChange's execution and cleared immediately after dispatch returns.
      isHandledByBeforeInputRef.current = true;
      input.dispatchEvent(new Event("input", { bubbles: true }));
      isHandledByBeforeInputRef.current = false;
    };

    input.addEventListener('beforeinput', handler);
    return () => input.removeEventListener('beforeinput', handler);
  }, []);

  // handleChange fires for every native input event. For the typing path this is the
  // programmatic dispatch from beforeinput (callbacks already called there) - the flag
  // causes an early return to avoid double-firing. For undo/redo and other browser-native
  // input events, the flag is false and we process normally.
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    if (isHandledByBeforeInputRef.current) return;

    const formatted = e.target.value;
    // Always recompute from the current display value so stale values (e.g. after undo)
    // are never used. removeThousandSeparators(formatted) == raw for all formatting modes.
    const rawValue = toRawValue(formatted, formattingOptions.thousandSeparator);

    const numInput = e.target as NumoraHTMLInputElement;
    numInput.formattedValue = formatted;

    if (onChange) onChange(createSyntheticChangeEvent(numInput, rawValue));
  }, [formattingOptions.thousandSeparator, onChange]);

  // handleKeyDown is still needed for skipOverThousandSeparatorOnDelete (moves the cursor
  // past separators before beforeinput fires). caretInfoRef is no longer needed because
  // handleOnBeforeInputNumoraInput derives its own caret info from the InputEvent.
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    handleOnKeyDownNumoraInput(e.nativeEvent, formattingOptions);
    if (onKeyDown) onKeyDown(e);
  }, [formattingOptions, onKeyDown]);

  const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
    const { formatted, raw } = handleOnPasteNumoraInput(e.nativeEvent, maxDecimals, formattingOptions);

    const numInput = e.target as NumoraHTMLInputElement;
    numInput.value = formatted;
    numInput.formattedValue = formatted;

    if (onPaste) onPaste(e);

    // handleOnPasteNumoraInput calls e.preventDefault(), so no native input/change fires.
    // Synthesise a change event so consumers see the same API as typing.
    if (onChange) onChange(createSyntheticChangeEvent(numInput, raw ?? ''));
  }, [maxDecimals, formattingOptions, onPaste, onChange]);

  const handleFocus = useCallback((e: FocusEvent<HTMLInputElement>) => {
    // In Blur mode we strip separators while the user is editing, then re-apply on blur.
    if (
      formattingOptions.formatOn === FormatOn.Blur &&
      formattingOptions.thousandSeparator &&
      formattingOptions.ThousandStyle !== ThousandStyle.None
    ) {
      const input = e.target as HTMLInputElement;
      input.value = removeThousandSeparators(input.value, formattingOptions.thousandSeparator);
      // formattedValue doesn't change - rawValue was already separator-free
    }
    if (onFocus) onFocus(e);
  }, [formattingOptions, onFocus]);

  const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    // In Blur mode, re-apply separators on blur and notify onChange. In Change mode the
    // value is already formatted and stable, so we leave it alone.
    if (formattingOptions.formatOn === FormatOn.Blur) {
      const { formatted, raw } = formatValueForDisplay(
        e.target.value,
        maxDecimals,
        { ...formattingOptions, formatOn: FormatOn.Change }
      );
      const numInput = e.target as NumoraHTMLInputElement;
      numInput.value = formatted;
      numInput.formattedValue = formatted;
      if (onChange) onChange(createSyntheticChangeEvent(numInput, raw));
    }

    if (onBlur) onBlur(e);
  }, [maxDecimals, formattingOptions, onBlur, onChange]);

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
