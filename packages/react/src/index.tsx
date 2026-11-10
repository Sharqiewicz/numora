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
  type InputHTMLAttributes,
} from 'react';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

// Public types/enums come from the package root; the shared DOM-event steps come from the
// internal subpath.
import {
  formatValueForDisplay,
  sanitizeNumoraInput,
  type NumoraOptions,
  type NumoraValues,
} from 'numora';
import {
  applyBeforeInput,
  applyBlur,
  applyInputFallback,
  applyPaste,
  attachFocusStrip,
  formatForDisplay,
  handleOnKeyDownNumoraInput,
  writeValuePreservingUndo,
  resolveOptions,
  type ResolvedNumoraOptions,
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

// Bundlers replace `process.env.NODE_ENV`; the package has no @types/node.
declare const process: { env?: { NODE_ENV?: string } } | undefined;

// v4 props renamed/removed in v5. Not aliased (deliberate break): warned about in
// development and kept off the DOM, where they would be silently ignored.
const RENAMED: Record<string, string> = {
  maxDecimals: 'decimalMaxLength',
  thousandStyle: 'groupingStyle',
  rawValueMode: 'e.target.value (always raw)',
};

// `activeElement` of the input's own root: `document.activeElement` is the host inside a
// shadow root or the iframe element for a portaled input, never the input.
const isFocused = (el: HTMLElement) => (el.getRootNode() as Document | ShadowRoot).activeElement === el;

export interface NumoraInputProps
  extends NumoraOptions,
    Omit<
      InputHTMLAttributes<HTMLInputElement>,
      'onChange' | 'type' | 'inputMode' | 'onFocus' | 'onBlur' | 'maxLength'
    > {
  onChange?: (e: NumoraInputChangeEvent) => void;
  /**
   * Plain-object value callback: `{ value, formattedValue }`, fired on every change
   * alongside `onChange`. An alternative to the synthetic event for consumers who prefer a
   * data callback (mirrors react-number-format's `onValueChange`).
   */
  onValueChange?: (values: NumoraValues) => void;
  onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
}

const NumoraInput = forwardRef<HTMLInputElement, NumoraInputProps>((props, ref) => {
  const {
    decimalMaxLength,
    onChange,
    onValueChange,
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
    enableCompactNotation,
    enableScientificNotation,
    enableNegative,
    enableLeadingZeros,
    autoAddLeadingZero,
    maxLength,
    isAllowed,
    value: controlledValue,
    defaultValue,
    ...rest
  } = props;

  const stale = Object.keys(RENAMED).filter((k) => k in props && delete (rest as Record<string, unknown>)[k]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: callbacks are read via stateRef; a new onChange/isAllowed identity must not re-resolve options.
  const formattingOptions: ResolvedNumoraOptions = useMemo(() => {
    // Same resolver as the vanilla class: locale, defaults, then validation of the resolved
    // options against this render's real `isAllowed`/`onChange`, so a wrong type still throws.
    const options = resolveOptions({
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
      isAllowed,
      onChange,
    });
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
    enableCompactNotation,
    enableScientificNotation,
    enableNegative,
    enableLeadingZeros,
    autoAddLeadingZero,
    maxLength,
  ]);

  const internalInputRef = useRef<HTMLInputElement>(null);
  // Latest props for the mount-only DOM listeners and the stable `isAllowed` wrapper,
  // refreshed every render by the layout effect below.
  const stateRef = useRef({ onChange, onValueChange, isAllowed, formattingOptions });

  // The one place both React callbacks fire. Every caller first wrote the field, so the
  // element's `formattedValue` mirror is refreshed here too.
  const emit = (el: NumoraHTMLInputElement, values?: NumoraValues) => {
    el.formattedValue = el.value;
    if (!values) return;
    const { onChange: cb, onValueChange: vcb } = stateRef.current;
    cb?.(createSyntheticChangeEvent(el, values.value));
    vcb?.({ value: values.value, formattedValue: values.formattedValue });
  };

  // Computed once on mount. Uncontrolled defaultValue lets React leave the DOM value alone
  // on re-renders, which is what allows undo to work. Uses the resting format, so a Blur-mode
  // field paints with separators like vanilla and the first focus has separators to strip.
  // App-supplied values are canonical raw values ('1234.5', never locale text).
  const [initialDisplayValue] = useState(
    () => formatForDisplay(String(controlledValue ?? defaultValue ?? ''), formattingOptions, 'canonical').formatted
  );

  // External ref -> internal input (function and object refs; nulled on unmount).
  useImperativeHandle(ref, () => internalInputRef.current as HTMLInputElement, []);

  // Layout effect 2: refresh stateRef every render so mount-only DOM listeners see the
  // latest props; re-sync the DOM value when controlled `value` changes. Runs on every
  // render. Equality guard short-circuits the common echo-back case. When the value
  // differs, route through writeValuePreservingUndo so external updates don't wipe undo.
  useIsomorphicLayoutEffect(() => {
    const prev = stateRef.current.formattingOptions;
    stateRef.current = { onChange, onValueChange, isAllowed, formattingOptions };

    const input = internalInputRef.current as NumoraHTMLInputElement;
    // Options changed (locale, separators): the DOM text is still in the OLD format, so it
    // can't be compared under the new one. Repaint, reading an uncontrolled field's number
    // under the old options.
    const changed = prev !== formattingOptions;
    if (controlledValue === undefined && !changed) return;
    const controlledValueString = String(controlledValue ?? formatForDisplay(input.value, prev).raw);

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
      const { formatted } =
        isFocused(input)
          ? formatValueForDisplay(controlledValueString, formattingOptions.decimalMaxLength, formattingOptions, 'canonical')
          : formatForDisplay(controlledValueString, formattingOptions, 'canonical');
      if (formatted !== input.value) writeValuePreservingUndo(input, formatted, formatted.length);
    }
    input.formattedValue = input.value;
  });

  // Mount-only native listeners. `beforeinput` must be native: React's synthetic one fires
  // while bubbling, too late to cancel. The focus strip's mousedown/click/focus sequence is
  // native too, so React's batching can't reorder it. Options come from stateRef.
  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only; emit reads the latest props via stateRef.
  useEffect(() => {
    const input = internalInputRef.current as NumoraHTMLInputElement;
    input.formattedValue = input.value;
    // Dev-only, like core's locale warning; `?.` covers a `process` without `env`.
    if (typeof process === 'undefined' || process.env?.NODE_ENV !== 'production')
      for (const k of stale) console.warn(`[numora] ${k} is removed in v5; use ${RENAMED[k]}`);
    const onBeforeInput = (e: InputEvent) => {
      const values = applyBeforeInput(e, stateRef.current.formattingOptions);
      if (values) emit(input, values);
    };
    input.addEventListener('beforeinput', onBeforeInput);
    // A strip only removes separators, so the raw value is unchanged: refresh the mirror,
    // report nothing.
    const detach = attachFocusStrip(input, () => stateRef.current.formattingOptions, () => emit(input));
    return () => {
      input.removeEventListener('beforeinput', onBeforeInput);
      detach();
    };
  }, []);

  // `input` fallback: undo/redo, autofill, drop, IME commit. `formattedValue` still holds
  // the last value Numora wrote, which a refused scientific-notation insert restores.
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target as NumoraHTMLInputElement;
    const inputType = (e.nativeEvent as InputEvent).inputType;
    // Mid-composition text is the IME's: the final non-composing `input` reconciles it.
    if ((e.nativeEvent as InputEvent).isComposing) return;
    const focused = isFocused(el);
    emit(el, applyInputFallback(el, inputType, focused, el.formattedValue as string, formattingOptions));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    handleOnKeyDownNumoraInput(e.nativeEvent, formattingOptions);
    onKeyDown?.(e);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget as NumoraHTMLInputElement;
    const values = applyPaste(e.nativeEvent, formattingOptions);
    // Nothing reaches a readOnly or disabled field, so its `onPaste` doesn't run either.
    if (el.readOnly || el.disabled) return;
    el.formattedValue = el.value;
    onPaste?.(e);
    emit(el, values);
  };

  // Blur reports display-only changes too (regrouping), unlike vanilla, so anything that
  // mirrors `formattedValue` from onChange stays in sync with the field.
  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    emit(e.target, applyBlur(e.target, formattingOptions));
    onBlur?.(e);
  };

  return (
    <input
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
      spellCheck={false}
      autoComplete="off"
    />
  );
});

NumoraInput.displayName = 'NumoraInput';

export { NumoraInput };
export { FormatOn, GroupingStyle, InputType } from 'numora';
export type { NumoraOptions, LocaleTag } from 'numora';
