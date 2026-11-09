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
  displayToRawValue,
  formatValueForDisplay,
  normalizeNegativeZero,
  sanitizeNumoraInput,
  validateNumoraInputOptions,
  type FormattingOptions,
  type LocaleTag,
  type NumoraValues,
  type ValueSource,
} from 'numora';
import {
  computeCaretAfterRewrite,
  computeStripSeparatorsResult,
  handleOnBeforeInputNumoraInput,
  handleOnKeyDownNumoraInput,
  handleOnPasteNumoraInput,
  writeStripPreservingUndo,
  writeValuePreservingUndo,
  DEFAULT_THOUSAND_SEPARATOR,
  DEFAULT_DECIMAL_SEPARATOR,
  DEFAULT_GROUPING_STYLE,
} from 'numora/internal';

export interface NumoraHTMLInputElement extends HTMLInputElement {
  /** The formatted display string - the same value shown in the input, including thousand separators. */
  formattedValue?: string;
}

/**
 * Synthetic change event fired by NumoraInput on every value change.
 *
 * - `target.value` - the **canonical raw value**: ASCII digits, `.` decimal, no grouping.
 *   Pass it to react-hook-form's `Controller` (`field.onChange(e.target.value)`) or any
 *   other form library that takes a value.
 *
 * - `target.formattedValue` - the formatted display string (e.g. `"1,234.56"`),
 *   the same value visible in the input. Use this when you need to display or store
 *   the formatted representation.
 *
 * NOTE: `e.target.value` here is the RAW string, which is the inverse of reading the DOM
 * node directly - `inputRef.current.value` returns the FORMATTED string (what's rendered).
 *
 * Structurally assignable to `ChangeEvent<HTMLInputElement>`, but `target` is a Proxy, not
 * the input element itself. Do NOT spread react-hook-form's `register()`: it reads the DOM
 * node through its ref, so it stores the formatted display string, and `setValue`/`reset`
 * write a value back that a comma-decimal locale can misread. Use `Controller` instead.
 */
export type NumoraInputChangeEvent = Omit<ChangeEvent<HTMLInputElement>, 'target'> & {
  target: NumoraHTMLInputElement;
};

export type { NumoraValues };

/**
 * Creates a synthetic change event where `target.value` returns the raw (unformatted)
 * numeric string via a Proxy, and `target.formattedValue` exposes the formatted display
 * value (already set on the element before this is called).
 */
function createSyntheticChangeEvent(
  input: NumoraHTMLInputElement,
  rawValue: string
): NumoraInputChangeEvent {
  const nativeEvent = new Event('change', { bubbles: true, cancelable: false });
  const target = new Proxy(input, {
    get(t, prop: string | symbol) {
      if (prop === 'value') return rawValue;
      const v = Reflect.get(t, prop) as unknown;
      return typeof v === 'function' ? (v as (...args: unknown[]) => unknown).bind(t) : v;
    },
  });
  return {
    nativeEvent,
    target,
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
    'onChange' | 'type' | 'inputMode' | 'onFocus' | 'onBlur' | 'maxLength'
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
   * Digit-grouping style for the thousand separator. When `locale` is set and this is
   * left unset, the style is derived from the locale (Indic locales -> `Lakh`).
   * @defaultValue GroupingStyle.Thousand
   */
  groupingStyle?: GroupingStyle;
  decimalSeparator?: string;
  decimalMinLength?: number;

  enableCompactNotation?: boolean;
  /** Expand pasted `1.5e-7` (default). Set `false` to reject such a paste instead. */
  enableScientificNotation?: boolean;
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
    // Deliberately NOT defaulted here: `applyLocale` can derive the grouping style from
    // the locale (Indic locales -> Lakh), and a pre-applied default would always win the
    // `?? ` below and swallow the derived value. Defaulted after locale resolution.
    groupingStyle,
    decimalSeparator,
    decimalMinLength,
    enableCompactNotation = false,
    enableScientificNotation = true,
    enableNegative = false,
    enableLeadingZeros = false,
    autoAddLeadingZero = false,
    maxLength,
    isAllowed,
    value: controlledValue,
    defaultValue,
    ...rest
  } = props;

  // Latest onChange/isAllowed, refreshed synchronously every render (a plain ref mutation
  // in the render body, not an effect - safe because these are only ever read later, from
  // event handlers that run after this render has committed). Lets the formattingOptions
  // memo below depend only on the formatting props: an inline `onChange`/`isAllowed` (a new
  // function identity every parent render) would otherwise force `applyLocale` and
  // `validateNumoraInputOptions` to re-run on every render for no reason (A2-09).
  const latestCallbacksRef = useRef({ onChange, isAllowed });
  latestCallbacksRef.current.onChange = onChange;
  latestCallbacksRef.current.isAllowed = isAllowed;

  // Stable identity (never changes) so it can sit in formattingOptions without pulling
  // `isAllowed` into the memo's deps. Delegates to whatever `isAllowed` currently is via
  // the ref above, so behavior for the core handlers is unchanged.
  const stableIsAllowed = useCallback(
    (rawValue: string) => latestCallbacksRef.current.isAllowed?.(rawValue) ?? true,
    []
  );

  const formattingOptions: FormattingOptions = useMemo(() => {
    const separators = applyLocale(locale, { thousandSeparator, decimalSeparator, groupingStyle });
    // Resolve separator defaults BEFORE validating, exactly as the vanilla class does
    // (NumoraInput resolves then validates). Validating the unresolved options let a
    // half-configured locale — e.g. thousandSeparator '.' with decimalSeparator left to
    // default to '.' — slip past the separator-conflict check and silently swallow the
    // decimal part at runtime. It also left thousandSeparator undefined, disabling grouping
    // even though the README documents ',' as the default.
    const options: FormattingOptions = {
      formatOn,
      thousandSeparator: separators.thousandSeparator ?? DEFAULT_THOUSAND_SEPARATOR,
      groupingStyle: separators.groupingStyle ?? DEFAULT_GROUPING_STYLE,
      decimalSeparator: separators.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
      decimalMaxLength,
      decimalMinLength,
      enableCompactNotation,
      enableScientificNotation,
      enableNegative,
      enableLeadingZeros,
      autoAddLeadingZero,
      maxLength,
      isAllowed: stableIsAllowed,
    };
    // Validate inside useMemo so misconfig throws early in both dev and prod, and we
    // don't re-validate on every render. Validated against the REAL current onChange/
    // isAllowed (read from the ref, not the stable wrapper) so a genuine caller mistake
    // (wrong type) still throws - this only runs when the formatting props themselves
    // change, not on every inline-callback identity change. The cast bridges the signature
    // gap: vanilla's onChange takes a values object, React's takes an event - assertFunction only
    // checks `typeof === 'function'`, so either is fine.
    validateNumoraInputOptions({
      ...options,
      isAllowed: latestCallbacksRef.current.isAllowed,
      onChange: latestCallbacksRef.current.onChange as unknown as
        | ((values: NumoraValues) => void)
        | undefined,
    });
    return options;
  }, [
    locale,
    formatOn,
    thousandSeparator,
    groupingStyle,
    decimalSeparator,
    decimalMaxLength,
    decimalMinLength,
    enableCompactNotation,
    enableScientificNotation,
    enableNegative,
    enableLeadingZeros,
    autoAddLeadingZero,
    maxLength,
    stableIsAllowed,
  ]);

  // Programmatic / restored values always want separators applied, regardless of whether
  // the user chose Blur mode (which suppresses separators during typing). Inline helper
  // avoids a second formatting-options object that callers would have to track.
  const formatForDisplay = (value: string, source: ValueSource = 'display') =>
    formatValueForDisplay(
      value,
      decimalMaxLength,
      { ...formattingOptions, formatOn: FormatOn.Change },
      source
    );

  const internalInputRef = useRef<HTMLInputElement>(null);
  // Mirror of props read by mount-only DOM listeners (beforeinput, mousedown/click) that
  // would otherwise capture stale closures. Refreshed every render in the layout effect
  // below so the listeners always see the latest options/callbacks without re-registering.
  const stateRef = useRef({ onChange, onValueChange, decimalMaxLength, formattingOptions });
  // True while we're applying our own setRangeText. `setRangeText` does not synchronously
  // dispatch `input` in current browsers or jsdom (verified) - this flag is defensive,
  // for environments or polyfills that do dispatch `input` on a programmatic write, so
  // that event can't re-enter handleChange and double-fire onChange on the typing path.
  // It also guards React's value tracker: setRangeText mutates the DOM value without
  // going through React's patched `value` setter, so if a native `input` event did fire
  // afterward, React's tracker could see it as an external change and invoke handleChange
  // on top of the onChange we already called directly (see the beforeinput handler below).
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

  const stripSeparatorsAndMapCaret = useCallback(
    (input: HTMLInputElement) => {
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
      const result = computeStripSeparatorsResult(
        input.value,
        displayStart,
        displayEnd,
        opts.thousandSeparator
      );
      if (!result) return;

      withInternalWrite(() => {
        writeStripPreservingUndo(input, result.raw, result.rawStart, result.rawEnd);
      });

      // A2-06: this strip only changes the DISPLAY (separators removed for editing) - the
      // raw numeric value is exactly the same before and after (stripping separators cannot
      // change the number). So unlike the beforeinput/paste/blur paths, no onChange/
      // onValueChange here: firing one would tell consumers the value changed when it did
      // not (e.g. a controlled `onChange={e => setV(e.target.value)}` would re-render with
      // an unchanged raw, for no purpose). Still refresh `formattedValue` so it mirrors the
      // new (stripped) display.
      const numInput = input as NumoraHTMLInputElement;
      numInput.formattedValue = input.value;
    },
    [withInternalWrite]
  );

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
    // App-supplied values are canonical raw values ('1234.5', never locale text).
    return formatForDisplay(String(valueToFormat), 'canonical').formatted;
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

    const controlledValueString = String(controlledValue);
    const numInput = input as NumoraHTMLInputElement;

    // A2-01: is this just the parent echoing the raw value straight back (the single most
    // common controlled pattern: onChange -> setState(e.target.value) -> value={state})?
    // `formatValueForDisplay`/`formatForDisplay` both strip a trailing decimal separator and
    // pad to `decimalMinLength` - display/blur-only concerns. Comparing THOSE formatted
    // strings against the DOM's current value made "1." round-trip through the parent as
    // "1" (the trailing dot stripped), "0.05" collapse mid-entry, and a decimalMinLength:2
    // field snap to "1.00" after every keystroke - because the comparison itself, not just
    // the write, was already lossy. `sanitizeNumoraInput` performs none of those
    // display-only transforms (no trailing-separator strip, no padding, no grouping), so
    // comparing ITS output for the DOM value and the controlled value is a faithful "is this
    // the same number" check. Equal -> the parent didn't actually change anything -> leave
    // the DOM untouched (don't strip trailing separators or pad while the user is mid-entry)
    // and just refresh `formattedValue`. Different -> the parent genuinely changed the
    // value (external update, clamping, a numeric-state round-trip that lost precision,
    // etc.) -> fall through to the resting/editing formatting as before.
    const domRaw = sanitizeNumoraInput(input.value, formattingOptions);
    const controlledRaw = sanitizeNumoraInput(controlledValueString, formattingOptions, 'canonical');
    if (domRaw === controlledRaw) {
      numInput.formattedValue = input.value;
      return;
    }

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
      ? formatValueForDisplay(controlledValueString, decimalMaxLength, formattingOptions, 'canonical')
      : formatForDisplay(controlledValueString, 'canonical');
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
          withInternalWrite(() =>
            writeValuePreservingUndo(input, result.formatted, result.cursorPos)
          );
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
      const raw = displayToRawValue(numInput.value, formattingOptions);
      numInput.formattedValue = numInput.value;
      if (onChange) onChange(createSyntheticChangeEvent(numInput, raw));
      if (onValueChange) onValueChange({ value: raw, formattedValue: numInput.value });
      return;
    }

    // A2-07: this is the native-`input` fallback path (undo/redo handled above; what's
    // left is IME commit, autofill, drag-drop, or a programmatic dispatch) - not the
    // keystroke path. A keystroke goes through beforeinput/handleOnBeforeInputNumoraInput,
    // which already knows it's mid-typing. Here we only have the DOM value, so we must
    // infer intent from focus: while focused, format with the real `formatOn` (Blur mode
    // stays ungrouped, matching what typing would have produced); while NOT focused, the
    // value is landing in its RESTING state (e.g. an autofill into a blurred field), so
    // format for resting display (`formatForDisplay`, forced Change) - otherwise Blur mode
    // would leave an autofilled value ungrouped until the next focus+blur cycle.
    const isFocused = typeof document !== 'undefined' && document.activeElement === numInput;
    const { formatted, raw } = isFocused
      ? formatValueForDisplay(numInput.value, decimalMaxLength, formattingOptions, 'foreign')
      : formatForDisplay(numInput.value, 'foreign');
    if (formatted !== numInput.value) {
      // Same rank logic as the vanilla class: mapped while focused, at the end otherwise.
      // (Undo/redo returned above: the browser restores its own caret there.)
      const caret = computeCaretAfterRewrite(
        numInput.value,
        Math.max(numInput.selectionStart ?? 0, numInput.selectionEnd ?? 0),
        formatted,
        decimalMaxLength,
        formattingOptions,
        !!formattingOptions.thousandSeparator,
        isFocused
      );
      withInternalWrite(() => writeValuePreservingUndo(numInput, formatted, caret));
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
    // A2-02: a readOnly/disabled input must not accept a paste - preventDefault (already
    // done above) blocks the browser's own paste, and returning here skips writing the
    // clipboard content via setRangeText and skips onChange/onValueChange/onPaste, since
    // nothing was actually pasted.
    if (e.currentTarget.readOnly || e.currentTarget.disabled) return;
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
    // Runs on Blur mode (grouping applies on blur) and also whenever decimalMinLength is
    // set, since padding is a display/blur-only concern regardless of formatOn - matching
    // the vanilla package's widened focus/blur listener registration.
    // enableNegative joins the guard for the -0 -> 0 normalization (A2-11), which is a
    // blur-time concern independent of formatOn/grouping, matching the vanilla package.
    if (
      formattingOptions.formatOn === FormatOn.Blur ||
      (formattingOptions.decimalMinLength ?? 0) > 0 ||
      formattingOptions.enableNegative
    ) {
      const decimalSep = formattingOptions.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR;
      const { formatted, raw } = formatForDisplay(
        normalizeNegativeZero(e.target.value, decimalSep)
      );
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
