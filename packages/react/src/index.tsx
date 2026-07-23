import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useCallback,
  useMemo,
  type ClipboardEvent,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type InputHTMLAttributes,
} from 'react';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

// Public types/enums come from the package root; cross-package plumbing (event handlers,
// undo-preserving writes, sanitization primitives) comes from the internal subpath.
import {
  FormatOn,
  InputType,
  GroupingStyle,
  applyLocale,
  formatValueForDisplay,
  removeThousandSeparators,
  validateNumoraInputOptions,
  type FormattingOptions,
  type LocaleTag,
} from 'numora';
import {
  computeStripSeparatorsResult,
  handleOnBeforeInputNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
  writeStripPreservingUndo,
  writeValuePreservingUndo,
  DEFAULT_THOUSAND_SEPARATOR,
  DEFAULT_DECIMAL_SEPARATOR,
} from 'numora/internal';

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
 * NOTE: `e.target.value` here is the RAW string, which is the inverse of reading the DOM
 * node directly - `inputRef.current.value` returns the FORMATTED string (what's rendered).
 *
 * Structurally assignable to `ChangeEvent<HTMLInputElement>`, so react-hook-form's
 * `register.onChange` can be spread directly onto the `onChange` prop.
 */
export type NumoraInputChangeEvent = Omit<ChangeEvent<HTMLInputElement>, "target"> & {
  target: NumoraHTMLInputElement;
};

/** Plain value payload passed to `onValueChange`. */
export interface NumoraValues {
  /** Raw (unformatted) numeric string, separators stripped. */
  value: string;
  /** Formatted display string (e.g. `"1,234.56"`), the value visible in the input. */
  formattedValue: string;
}

/**
 * Creates a synthetic change event where `target.value` returns the raw (unformatted)
 * numeric string via a Proxy, and `target.formattedValue` exposes the formatted display
 * value (already set on the element before this is called).
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
    "onChange" | "type" | "inputMode" | "onFocus" | "onBlur" | "maxLength"
  > {
  /**
   * Maximum number of decimal places. Defaults to 18 (DeFi-safe: most ERC-20 tokens use
   * 18 decimals). Fiat/checkout fields typically set this to 2.
   */
  decimalMaxLength?: number;
  onChange?: (e: NumoraInputChangeEvent) => void;
  /**
   * Plain-object value callback: `{ value, formattedValue }`, fired on every change
   * alongside `onChange`. An alternative to the synthetic event for consumers who prefer a
   * data callback (mirrors react-number-format's `onValueChange`).
   */
  onValueChange?: (values: NumoraValues) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;

  locale?: LocaleTag | true;
  formatOn?: FormatOn;
  thousandSeparator?: string;
  /**
   * Digit-grouping style for the thousand separator.
   * @defaultValue GroupingStyle.Thousand
   */
  groupingStyle?: GroupingStyle;
  decimalSeparator?: string;
  decimalMinLength?: number;

  enableCompactNotation?: boolean;
  enableNegative?: boolean;
  enableLeadingZeros?: boolean;
  autoAddLeadingZero?: boolean;

  /**
   * Max raw length (digits, decimal separator, and leading `-`). Thousand separators are
   * NOT counted. Enforced at keystroke (typing past it is rejected) and on paste (the
   * combined value is truncated). Does NOT set the native HTML `maxLength` attribute,
   * which would count formatted characters and double-count separators.
   */
  maxLength?: number;
  /**
   * Custom validator. Called with the post-sanitization raw value the input would have
   * after the keystroke or paste. Return false to reject the edit - no value change,
   * no `onChange` fires, undo history is untouched.
   */
  isAllowed?: (rawValue: string) => boolean;
}

/** Strip thousand separators to recover the raw numeric string from a formatted display value. */
function toRawValue(formatted: string, thousandSeparator?: string): string {
  return thousandSeparator ? removeThousandSeparators(formatted, thousandSeparator) : formatted;
}

const NumoraInput = forwardRef<HTMLInputElement, NumoraInputProps>((props, ref) => {
  const {
    decimalMaxLength = 18,
    onChange,
    onValueChange,
    onPaste,
    onBlur,
    onKeyDown,
    onFocus,
    locale,
    formatOn = FormatOn.Blur,
    thousandSeparator,
    groupingStyle = GroupingStyle.Thousand,
    decimalSeparator,
    decimalMinLength,
    enableCompactNotation = false,
    enableNegative = false,
    enableLeadingZeros = false,
    autoAddLeadingZero = false,
    maxLength,
    isAllowed,
    value: controlledValue,
    defaultValue,
    ...rest
  } = props;

  const formattingOptions: FormattingOptions = useMemo(() => {
    const separators = applyLocale(locale, { thousandSeparator, decimalSeparator });
    // Resolve separator defaults BEFORE validating, exactly as the vanilla class does
    // (NumoraInput resolves then validates). Validating the unresolved options let a
    // half-configured locale — e.g. thousandSeparator '.' with decimalSeparator left to
    // default to '.' — slip past the separator-conflict check and silently swallow the
    // decimal part at runtime. It also left thousandSeparator undefined, disabling grouping
    // even though the README documents ',' as the default.
    const options: FormattingOptions = {
      formatOn,
      thousandSeparator: separators.thousandSeparator ?? DEFAULT_THOUSAND_SEPARATOR,
      groupingStyle,
      decimalSeparator: separators.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
      decimalMaxLength,
      decimalMinLength,
      enableCompactNotation,
      enableNegative,
      enableLeadingZeros,
      autoAddLeadingZero,
      maxLength,
      isAllowed,
    };
    // Validate inside useMemo so misconfig throws early in both dev and prod, and we
    // don't re-validate on every render. onChange is included so assertFunction runs.
    // The cast bridges the signature gap: vanilla's onChange takes a string, React's
    // takes an event - assertFunction only checks `typeof === 'function'`, so either is fine.
    validateNumoraInputOptions({ ...options, onChange: onChange as unknown as ((value: string) => void) | undefined });
    return options;
  }, [locale, formatOn, thousandSeparator, groupingStyle, decimalSeparator, decimalMaxLength, decimalMinLength,
    enableCompactNotation, enableNegative, enableLeadingZeros, autoAddLeadingZero,
    maxLength, isAllowed, onChange]);

  // Programmatic / restored values always want separators applied, regardless of whether
  // the user chose Blur mode (which suppresses separators during typing). Inline helper
  // avoids a second formatting-options object that callers would have to track.
  const formatForDisplay = (raw: string) => formatValueForDisplay(raw, decimalMaxLength, {
    ...formattingOptions,
    formatOn: FormatOn.Change,
  });

  const internalInputRef = useRef<HTMLInputElement>(null);
  // Mirror of props read by mount-only DOM listeners (beforeinput, mousedown/click) that
  // would otherwise capture stale closures. Refreshed every render in the layout effect
  // below so the listeners always see the latest options/callbacks without re-registering.
  const stateRef = useRef({ onChange, onValueChange, decimalMaxLength, formattingOptions });
  // True while we're applying our own setRangeText. The synchronous `input` event that
  // setRangeText fires must NOT re-enter handleChange, or onChange double-fires on the
  // typing path. Also load-bearing for React's value-tracker: see handleChange below.
  const suppressNextInputEventRef = useRef(false);
  // Mouse-driven focus: the browser commits click→selection AFTER focus, using the
  // input's current value. Defer the strip from focus to click so the browser places
  // the cursor against the still-formatted value before we map it to raw indices.
  const pendingMouseStripRef = useRef(false);

  // Stable across renders: deps:[] + ref-only reads. Used as effect deps so we want
  // identity stability rather than re-registration on every render.
  const withInternalWrite = useCallback((fn: () => void): void => {
    suppressNextInputEventRef.current = true;
    try {
      fn();
    } finally {
      suppressNextInputEventRef.current = false;
    }
  }, []);

  const stripSeparatorsAndMapCaret = useCallback((input: HTMLInputElement) => {
    const opts = stateRef.current.formattingOptions;
    if (
      opts.formatOn !== FormatOn.Blur ||
      !opts.thousandSeparator ||
      opts.groupingStyle === GroupingStyle.None
    ) {
      return;
    }
    const displayStart = input.selectionStart ?? 0;
    const displayEnd = input.selectionEnd ?? input.value.length;
    const result = computeStripSeparatorsResult(input.value, displayStart, displayEnd, opts.thousandSeparator);
    if (!result) return;

    withInternalWrite(() => {
      writeStripPreservingUndo(input, result.raw, result.rawStart, result.rawEnd);
    });

    // Broadcast the strip so consumers (form libs, Torph overlays, etc.) can mirror the
    // new display. The internal `input` event from setRangeText is short-circuited in
    // handleChange to avoid double-firing on the typing path, so call onChange explicitly.
    const numInput = input as NumoraHTMLInputElement;
    numInput.formattedValue = result.raw;
    const cb = stateRef.current.onChange;
    if (cb) cb(createSyntheticChangeEvent(numInput, result.raw));
    const vcb = stateRef.current.onValueChange;
    if (vcb) vcb({ value: result.raw, formattedValue: result.raw });
  }, [withInternalWrite]);

  // Computed once on mount. Uncontrolled defaultValue lets React leave the DOM value alone
  // on re-renders, which is what allows undo to work. Forces FormatOn.Change for the
  // initial format so Blur mode also renders separators on the unfocused initial paint -
  // matching vanilla NumoraInput's setDefaultValue + applyDisplaySeparators. Without this,
  // defaultValue="1234567" lands in the DOM as "1234567" and the first focus has no
  // separators to strip (computeStripSeparatorsResult returns null), so onChange never
  // fires and overlay integrations like Torph can't sync until the next blur+focus cycle.
  const [initialDisplayValue] = useState(() => {
    const valueToFormat = controlledValue !== undefined ? controlledValue : defaultValue;
    if (valueToFormat === undefined) return '';
    return formatForDisplay(String(valueToFormat)).formatted;
  });

  // Layout effect 1: external ref → internal input.
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

  // Layout effect 2: refresh stateRef every render so mount-only DOM listeners see the
  // latest props; re-sync the DOM value when controlled `value` changes. Runs on every
  // render. Equality guard short-circuits the common echo-back case. When the value
  // differs, route through writeValuePreservingUndo so external updates don't wipe undo.
  useIsomorphicLayoutEffect(() => {
    stateRef.current = { onChange, onValueChange, decimalMaxLength, formattingOptions };

    if (controlledValue === undefined) return;
    const input = internalInputRef.current;
    if (!input) return;

    // In Blur mode the DOM value carries no thousand separators while the field is being
    // edited (they're only added on blur). Formatting the controlled echo-back WITH
    // separators here - the single most common controlled pattern, where onChange feeds
    // the parent's value prop straight back - would inject commas mid-typing and snap the
    // caret to the end, defeating Blur mode. So while the input is focused in Blur mode,
    // format for editing (no separators, via the real formatOn); otherwise format for the
    // resting display (forced Change, with separators).
    const isEditingInBlurMode =
      formattingOptions.formatOn === FormatOn.Blur &&
      typeof document !== 'undefined' &&
      document.activeElement === input;
    const { formatted } = isEditingInBlurMode
      ? formatValueForDisplay(String(controlledValue), decimalMaxLength, formattingOptions)
      : formatForDisplay(String(controlledValue));
    const numInput = input as NumoraHTMLInputElement;
    if (formatted === input.value) {
      numInput.formattedValue = formatted;
      return;
    }

    withInternalWrite(() => writeValuePreservingUndo(input, formatted, formatted.length));
    numInput.formattedValue = formatted;
  });

  // Mount-only native DOM listeners. All three (beforeinput, mousedown, click) need to
  // bypass React's synthetic event delegation:
  //   - beforeinput: React's synthetic fires during bubbling, too late to preventDefault.
  //   - mousedown/click: synthetic batching can re-order the focus→caret-commit→click
  //     sequence the strip-deferral depends on.
  // Options are read via stateRef (kept current by the layout effect above).
  useEffect(() => {
    const input = internalInputRef.current;
    if (!input) return;
    (input as NumoraHTMLInputElement).formattedValue = input.value;

    const onBeforeInput = (e: InputEvent) => {
      const result = handleOnBeforeInputNumoraInput(
        e,
        stateRef.current.decimalMaxLength,
        stateRef.current.formattingOptions
      );

      switch (result.type) {
        case 'skip':
          return;
        case 'reject':
          e.preventDefault();
          return;
        case 'handled': {
          e.preventDefault();
          const numInput = input as NumoraHTMLInputElement;
          withInternalWrite(() => writeValuePreservingUndo(input, result.formatted, result.cursorPos));
          numInput.formattedValue = result.formatted;
          // Call onChange directly with the raw value - guaranteed delivery regardless of
          // React's value-tracker diff (which can silently drop onChange when the tracker
          // and input.value happen to align after concurrent renders).
          const cb = stateRef.current.onChange;
          if (cb) cb(createSyntheticChangeEvent(numInput, result.raw));
          const vcb = stateRef.current.onValueChange;
          if (vcb) vcb({ value: result.raw, formattedValue: result.formatted });
          break;
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      // Only the primary (left) button dispatches a following `click`; a right/middle
      // button would set the flag with no `click` to clear it, wedging pendingMouseStrip
      // true so every later focus skips the separator strip.
      if (e.button !== 0) return;
      const opts = stateRef.current.formattingOptions;
      if (
        opts.formatOn !== FormatOn.Blur ||
        !opts.thousandSeparator ||
        opts.groupingStyle === GroupingStyle.None
      ) {
        return;
      }
      pendingMouseStripRef.current = true;
    };

    const onClick = () => {
      if (!pendingMouseStripRef.current) return;
      pendingMouseStripRef.current = false;
      stripSeparatorsAndMapCaret(input);
    };

    input.addEventListener('beforeinput', onBeforeInput);
    input.addEventListener('mousedown', onMouseDown);
    input.addEventListener('click', onClick);
    return () => {
      input.removeEventListener('beforeinput', onBeforeInput);
      input.removeEventListener('mousedown', onMouseDown);
      input.removeEventListener('click', onClick);
    };
  }, [withInternalWrite, stripSeparatorsAndMapCaret]);

  // Inline React event handlers. No useCallback wrappers: these are attached to a single
  // <input> in this component's JSX, so memoizing identity buys nothing and only forces
  // the reader to mentally validate dep arrays.

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (suppressNextInputEventRef.current) return;

    const numInput = e.target as NumoraHTMLInputElement;
    const inputType = (e.nativeEvent as InputEvent).inputType;

    // Undo/redo restores the literal previous DOM string. Don't re-format and write back
    // via setRangeText - that would push another undo step and break the natural Ctrl+Z
    // walk-back. Just broadcast.
    if (inputType === InputType.HistoryUndo || inputType === InputType.HistoryRedo) {
      const raw = toRawValue(numInput.value, formattingOptions.thousandSeparator);
      numInput.formattedValue = numInput.value;
      if (onChange) onChange(createSyntheticChangeEvent(numInput, raw));
      if (onValueChange) onValueChange({ value: raw, formattedValue: numInput.value });
      return;
    }

    const { formatted, raw } = formatValueForDisplay(numInput.value, decimalMaxLength, formattingOptions);
    if (formatted !== numInput.value) {
      withInternalWrite(() => writeValuePreservingUndo(numInput, formatted, formatted.length));
    }
    numInput.formattedValue = formatted;
    if (onChange) onChange(createSyntheticChangeEvent(numInput, raw));
    if (onValueChange) onValueChange({ value: raw, formattedValue: formatted });
  };

  // skipOverThousandSeparatorOnDelete moves the cursor past separators before beforeinput
  // fires. No caret-info ref needed - handleOnBeforeInputNumoraInput derives its own.
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    handleOnKeyDownNumoraInput(e.nativeEvent, formattingOptions);
    if (onKeyDown) onKeyDown(e);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.nativeEvent.preventDefault();
    const result = handleOnPasteNumoraInput(e.nativeEvent, decimalMaxLength, formattingOptions);
    if (result.type === 'reject') {
      if (onPaste) onPaste(e);
      return;
    }
    const numInput = e.target as NumoraHTMLInputElement;
    withInternalWrite(() => writeValuePreservingUndo(numInput, result.formatted, result.cursorPos));
    numInput.formattedValue = result.formatted;
    if (onPaste) onPaste(e);
    if (onChange) onChange(createSyntheticChangeEvent(numInput, result.raw));
    if (onValueChange) onValueChange({ value: result.raw, formattedValue: result.formatted });
  };

  const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
    // Mouse-driven focus: defer to click so the browser positions the cursor against
    // the still-formatted value.
    if (!pendingMouseStripRef.current) {
      stripSeparatorsAndMapCaret(e.target as HTMLInputElement);
    }
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    // Clear any pending mouse-strip so a deferred strip that never got its `click` (drag
    // released outside the input, suppressed click) can't carry over to the next focus.
    pendingMouseStripRef.current = false;
    if (formattingOptions.formatOn === FormatOn.Blur) {
      const { formatted, raw } = formatForDisplay(e.target.value);
      const numInput = e.target as NumoraHTMLInputElement;
      const valueChanged = formatted !== numInput.value;
      if (valueChanged) {
        withInternalWrite(() => writeValuePreservingUndo(numInput, formatted, formatted.length));
      }
      numInput.formattedValue = formatted;
      if (valueChanged && onChange) onChange(createSyntheticChangeEvent(numInput, raw));
      if (valueChanged && onValueChange) onValueChange({ value: raw, formattedValue: formatted });
    }
    if (onBlur) onBlur(e);
  };

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
export { FormatOn, GroupingStyle, InputType } from 'numora';
export type { FormattingOptions, LocaleTag } from 'numora';
