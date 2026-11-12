import {
  useRef,
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useMemo,
  type ClipboardEvent,
  type ChangeEvent,
  type FocusEvent,
  type KeyboardEvent,
  type ForwardRefExoticComponent,
  type InputHTMLAttributes,
  type Ref,
  type RefObject,
} from 'react';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

// Public types come from the package root; the shared DOM-event steps and pipeline helpers
// come from the internal subpath.
import type { NumoraOptions, NumoraValues } from 'numora';
import {
  displayToRawValue,
  formatValueForDisplay,
  sanitizeNumoraInput,
  applyBeforeInput,
  applyBlur,
  applyInputFallback,
  applyPaste,
  applySetValue,
  attachFocusStrip,
  formatForDisplay,
  handleOnKeyDownNumoraInput,
  writeValue,
  isProduction,
  resolveOptions,
  takeRemovedOptions,
  warnRemovedOptions,
  appValue,
  warnServerLocale,
  type ResolvedNumoraOptions,
} from 'numora/internal';

export interface NumoraHTMLInputElement extends HTMLInputElement {
  /**
   * The display string shown in the field right now, grouping included. Same as `value` on
   * the element. Available as soon as the ref is set.
   */
  readonly formattedValue: string;
  /**
   * The canonical raw value of the field right now: ASCII digits, `.` decimal, no grouping.
   * Read it from a ref (`ref.current.rawValue`), where `value` is the display string.
   * Available as soon as the ref is set.
   */
  readonly rawValue: string;
  /**
   * Writes a canonical raw value into the field, the same as the vanilla `setValue()`. It is
   * the app's own write: it calls neither `onChange` nor `onValueChange` and is not checked
   * by `isAllowed`. For uncontrolled fields. A controlled field goes straight back to its
   * `value` prop, so change that prop instead.
   */
  setValue(value: string): void;
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
 * numeric string via a Proxy, and `target.formattedValue` is the element's display string.
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
    // Native accessors (disabled, value, ...) throw "Illegal invocation" if run with
    // this=Proxy, so writes are forwarded with the real input as receiver. Assigning
    // `value` writes through to the real input (the getter still reports the raw value).
    set(t, prop: string | symbol, v: unknown) {
      return Reflect.set(t, prop, v, t);
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

// `activeElement` of the input's own root: `document.activeElement` is the host inside a
// shadow root or the iframe element for a portaled input, never the input.
const isFocused = (el: HTMLElement) => (el.getRootNode() as Document | ShadowRoot).activeElement === el;

export interface NumoraInputProps
  extends NumoraOptions,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'onChange' | 'type' | 'inputMode' | 'onFocus' | 'onBlur' | 'maxLength' | 'value' | 'defaultValue'
    > {
  /**
   * Controlled value, as a canonical raw string (`'1234.5'` in every locale). Never a number.
   * The field shows this value after every change: an edit your handler does not store is
   * put back.
   */
  value?: string;
  /** Initial value of an uncontrolled field, as a canonical raw string. Never a number. */
  defaultValue?: string;
  onChange?: (e: NumoraInputChangeEvent) => void;
  /**
   * Plain-object value callback: `{ value, formattedValue }`, fired on every change
   * alongside `onChange`. An alternative to the synthetic event for consumers who prefer a
   * data callback (mirrors react-number-format's `onValueChange`).
   */
  onValueChange?: (values: NumoraValues) => void;
  /**
   * Fired with the display string every time Numora rewrites the field, including the
   * rewrites `onChange` / `onValueChange` are silent about: the blur regroup, the focus strip,
   * `ref.setValue()`, a new `value` prop and a formatting-prop change. Not fired on mount
   * (`formatValue(value, options)` gives the first text) and never twice in a row for the
   * same text. Use it to mirror the field, e.g. in an animated overlay.
   */
  onFormattedValueChange?: (formattedValue: string) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

const NumoraInputImpl = forwardRef<NumoraHTMLInputElement, NumoraInputProps>((props, ref) => {
  const {
    decimalMaxLength,
    onChange,
    onValueChange,
    onFormattedValueChange,
    onPaste,
    onBlur,
    onKeyDown,
    onFocus,
    locale,
    formatOn,
    thousandSeparator,
    groupingStyle,
    decimalSeparator,
    decimalMinLength,
    allowCompactNotation,
    allowScientificNotation,
    allowNegative,
    allowLeadingZeros,
    padLeadingZero,
    maxLength,
    isAllowed,
    value: controlledValue,
    defaultValue,
    ...rest
  } = props;

  // Props removed since v4: kept off the DOM here, warned about once on mount.
  const stale = takeRemovedOptions(rest);

  const lastValidOptions = useRef<ResolvedNumoraOptions | undefined>(undefined);
  // biome-ignore lint/correctness/useExhaustiveDependencies: callbacks are read via stateRef; a new onChange/isAllowed identity must not re-resolve options.
  const formattingOptions: ResolvedNumoraOptions = useMemo(() => {
    warnServerLocale(locale);
    // Same resolver as the vanilla class: locale, defaults, then validation of the resolved
    // options against this render's real `isAllowed`/`onChange`, so a wrong type still throws.
    let options: ResolvedNumoraOptions;
    try {
      options = resolveOptions({
        locale,
        formatOn,
        thousandSeparator,
        groupingStyle,
        decimalSeparator,
        decimalMaxLength,
        decimalMinLength,
        allowCompactNotation,
        allowScientificNotation,
        allowNegative,
        allowLeadingZeros,
        padLeadingZero,
        maxLength,
        isAllowed,
        onChange,
        onValueChange,
        onFormattedValueChange,
      });
    } catch (error) {
      // Invalid options throw in development. In production a bad prop must not take the
      // page down: log it and keep the last valid options (the defaults on a first render).
      if (!isProduction()) throw error;
      console.error(error);
      options = lastValidOptions.current ?? resolveOptions({});
    }
    lastValidOptions.current = options;
    // Stable identity so `isAllowed` stays out of the memo's deps; delegates to the
    // current `isAllowed` via stateRef (read only from event handlers, after commit).
    options.isAllowed = (rawValue: string) => stateRef.current.isAllowed?.(rawValue) ?? true;
    return options;
  }, [
    locale,
    formatOn,
    thousandSeparator,
    groupingStyle,
    decimalSeparator,
    decimalMaxLength,
    decimalMinLength,
    allowCompactNotation,
    allowScientificNotation,
    allowNegative,
    allowLeadingZeros,
    padLeadingZero,
    maxLength,
  ]);

  const internalInputRef = useRef<HTMLInputElement>(null);
  // Latest props for the mount-only DOM listeners and the stable `isAllowed` wrapper,
  // refreshed every render by the layout effect below.
  const stateRef = useRef({
    onChange,
    onValueChange,
    onFormattedValueChange,
    isAllowed,
    formattingOptions,
    controlledValue,
  });
  // Re-renders this component alone; see `emit`.
  const [, resync] = useState(0);
  // Field text after the last write Numora made; restored when the `input` fallback must
  // refuse a value. Private: the public `formattedValue` reads the element.
  const lastValue = useRef('');
  // Last text given to `onFormattedValueChange`; seeded on mount, so mount reports nothing.
  const reported = useRef('');

  // The one place the React callbacks fire. Every caller first wrote the field, so
  // `lastValue` is refreshed here too. `values` are passed for a raw change only; a new
  // display text is reported either way.
  const emit = (el: NumoraHTMLInputElement, values?: NumoraValues) => {
    const text = el.value;
    lastValue.current = text;
    const { onChange: cb, onValueChange: vcb, onFormattedValueChange: fcb } = stateRef.current;
    if (values) {
      cb?.(createSyntheticChangeEvent(el, values.value));
      vcb?.({ value: values.value, formattedValue: values.formattedValue });
    }
    if (text !== reported.current) {
      reported.current = text;
      fcb?.(text);
    }
    if (!values) return;
    // Controlled: render again even if the parent kept its state, so the layout effect below
    // puts the field back to `value`. Batched with the parent's own update when it accepts.
    if (stateRef.current.controlledValue !== undefined) resync((n) => n + 1);
  };

  // Computed once on mount. Uncontrolled defaultValue lets React leave the DOM value alone
  // on re-renders, so Numora's writes stay. Uses the resting format, so a Blur-mode
  // field paints with separators like vanilla and the first focus has separators to strip.
  // App-supplied values are canonical raw values ('1234.5', never locale text).
  const [initialDisplayValue] = useState(
    () => formatForDisplay(appValue(controlledValue ?? defaultValue, 'value'), formattingOptions, 'canonical').formatted
  );

  // Before the ref is handed out, so a callback ref and a parent's layout effect can already
  // read both. Getters, so they are never stale: both read the field, `rawValue` under the
  // current options. Read-only, like the vanilla handle: an assignment throws.
  useIsomorphicLayoutEffect(() => {
    const input = internalInputRef.current as NumoraHTMLInputElement;
    reported.current = input.value;
    Object.defineProperties(input, {
      formattedValue: { configurable: true, get: () => input.value },
      rawValue: {
        configurable: true,
        get: () => displayToRawValue(input.value, stateRef.current.formattingOptions),
      },
      setValue: {
        configurable: true,
        value: (value: string) => {
          applySetValue(input, value, isFocused(input), stateRef.current.formattingOptions);
          emit(input);
          // Controlled: render again so the layout effect puts the field back to `value`.
          if (stateRef.current.controlledValue !== undefined) resync((n) => n + 1);
        },
      },
    });
  }, []);

  // External ref -> internal input (function and object refs; nulled on unmount).
  useImperativeHandle(ref, () => internalInputRef.current as NumoraHTMLInputElement, []);

  // Layout effect 2: refresh stateRef every render so mount-only DOM listeners see the
  // latest props; re-sync the DOM value when controlled `value` changes. Runs on every
  // render. Equality guard short-circuits the common echo-back case. When the value
  // differs, write it with writeValue.
  useIsomorphicLayoutEffect(() => {
    const prev = stateRef.current.formattingOptions;
    stateRef.current = {
      onChange,
      onValueChange,
      onFormattedValueChange,
      isAllowed,
      formattingOptions,
      controlledValue,
    };

    const input = internalInputRef.current as NumoraHTMLInputElement;
    // Options changed (locale, separators): the DOM text is still in the OLD format, so it
    // can't be compared under the new one. Repaint, reading an uncontrolled field's number
    // under the old options.
    const changed = prev !== formattingOptions;
    if (controlledValue === undefined && !changed) return;
    const controlledValueString = String(controlledValue ?? displayToRawValue(input.value, prev));

    // Is this just the parent echoing the raw value straight back (the single most
    // common controlled pattern: onChange -> setState(e.target.value) -> value={state})?
    // `formatValueForDisplay`/`formatForDisplay` both strip a trailing decimal separator and
    // pad to `decimalMinLength` - display/blur-only concerns. Comparing THOSE formatted
    // strings against the DOM's current value made "1." round-trip through the parent as
    // "1", "0.05" collapse mid-entry, and a decimalMinLength:2 field snap to "1.00" after
    // every keystroke. `sanitizeNumoraInput` performs none of those display-only transforms,
    // so comparing ITS output for the DOM value and the controlled value is a faithful "is
    // this the same number" check. Equal -> leave the DOM untouched. Different -> the parent
    // genuinely changed the value -> format and write it.
    if (
      changed ||
      sanitizeNumoraInput(input.value, formattingOptions) !==
      sanitizeNumoraInput(controlledValueString, formattingOptions, 'canonical')
    ) {
      // While focused in Blur mode the DOM carries no thousand separators (only added on
      // blur), so format for editing (real formatOn) to avoid injecting commas mid-typing;
      // otherwise format for the resting display (forced Change, with separators).
      const focused = isFocused(input);
      const format = (options: ResolvedNumoraOptions) =>
        focused
          ? formatValueForDisplay(controlledValueString, options.decimalMaxLength, options, 'canonical')
          : formatForDisplay(controlledValueString, options, 'canonical');
      const { formatted, raw } = format(formattingOptions);
      if (formatted !== input.value) writeValue(input, formatted, formatted.length);
      // New options that change the number itself (a smaller `decimalMaxLength` cutting
      // digits, `allowNegative` dropping the sign) are reported; a repaint alone is not.
      if (changed && raw !== format(prev).raw) {
        emit(input, { value: raw, formattedValue: formatted });
      }
    }
    // Reports the text when this effect rewrote it (new `value`, new options).
    emit(input);
  });

  // Mount-only native listeners. `beforeinput` must be native: React's synthetic one fires
  // while bubbling, too late to cancel. The focus strip's mousedown/click/focus sequence is
  // native too, so React's batching can't reorder it. Options come from stateRef.
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only; emit reads the latest props via stateRef.
  useEffect(() => {
    const input = internalInputRef.current as NumoraHTMLInputElement;
    lastValue.current = input.value;
    warnRemovedOptions(stale);
    const onBeforeInput = (e: InputEvent) => {
      const values = applyBeforeInput(e, stateRef.current.formattingOptions);
      if (values) emit(input, values);
    };
    input.addEventListener('beforeinput', onBeforeInput);
    // A strip only removes separators, so the raw value is unchanged: refresh `lastValue`,
    // report nothing.
    const detach = attachFocusStrip(input, () => stateRef.current.formattingOptions, () => emit(input));
    return () => {
      input.removeEventListener('beforeinput', onBeforeInput);
      detach();
    };
  }, []);

  // `input` fallback: autofill, drop, IME commit. `lastValue` still holds the
  // last value Numora wrote, which a refused scientific-notation insert restores.
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target as NumoraHTMLInputElement;
    // Mid-composition text is the IME's: the final non-composing `input` reconciles it.
    if ((e.nativeEvent as InputEvent).isComposing) return;
    const focused = isFocused(el);
    emit(el, applyInputFallback(el, focused, lastValue.current, formattingOptions));
  };

  // The app's handler runs first; `preventDefault()` in it turns Numora's handling off.
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    onKeyDown?.(e);
    if (!e.defaultPrevented) handleOnKeyDownNumoraInput(e.nativeEvent, formattingOptions);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget as NumoraHTMLInputElement;
    // Nothing reaches a readOnly or disabled field, so its `onPaste` doesn't run either.
    if (el.readOnly || el.disabled) return e.preventDefault();
    onPaste?.(e);
    if (!e.defaultPrevented) emit(el, applyPaste(e.nativeEvent, formattingOptions));
  };

  // Like vanilla, blur reports only a raw change (trailing separator strip, padding, `-0` to
  // `0`); regrouping alone rewrites the field without a callback.
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    emit(e.target as NumoraHTMLInputElement, applyBlur(e.target, formattingOptions));
    onBlur?.(e);
  };

  return (
    <input
      spellCheck={false}
      autoComplete="off"
      {...rest}
      ref={internalInputRef}
      defaultValue={initialDisplayValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      onFocus={onFocus}
      onBlur={handleBlur}
      type="text"
      inputMode="decimal"
    />
  );
});

NumoraInputImpl.displayName = 'NumoraInput';

/**
 * The ref is typed `NumoraHTMLInputElement` (with `rawValue` / `formattedValue`), but a plain
 * `useRef<HTMLInputElement>` object ref is accepted too, so existing refs keep compiling.
 * Callback refs receive `NumoraHTMLInputElement | null`.
 */
const NumoraInput = NumoraInputImpl as ForwardRefExoticComponent<
  NumoraInputProps & {
    ref?: Ref<NumoraHTMLInputElement> | RefObject<HTMLInputElement | null>;
  }
>;

export { NumoraInput };
export { FormatOn, GroupingStyle, formatValue, parseValue, getSeparatorsFromLocale } from 'numora';
export type { NumoraOptions, LocaleTag } from 'numora';
