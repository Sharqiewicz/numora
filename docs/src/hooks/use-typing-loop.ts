import { type RefObject, useEffect } from 'react';

export type TypingLoopMode = 'change' | 'blur';

const TYPE_MS = 220;
const HOLD_MS = 1800;
/**
 * Time between the simulated focus and the first keystroke. The focus-strip morph
 * (1,234,567 → 1234567) takes ~400ms, so this lets it land before digits start
 * replacing it. Matches the caret-reveal fallback in the polished Blur demos.
 */
const FOCUS_SETTLE_MS = 600;
/** Pause on the finished raw value before the simulated blur re-groups it. */
const PRE_BLUR_MS = 700;

const DEFAULT_SEQUENCES: Record<TypingLoopMode, string[]> = {
  change: ['1234567.89', '0'],
  // Both values group, so every cycle shows a focus-strip AND a blur-regroup.
  // A separator-less value (e.g. "0") would make both morphs no-ops.
  blur: ['1234567.89', '2500'],
};

export interface TypingLoopOptions {
  /**
   * `change` types straight into the field - separators appear per keystroke.
   * `blur` plays the full Blur-mode cycle: simulated focus (strip), type, simulated
   * blur (regroup), hold.
   */
  mode?: TypingLoopMode;
  sequence?: string[];
}

type Phase = 'focus' | 'type' | 'blur' | 'hold';

/**
 * "Types" a scripted sequence into a real input through synthetic events, so the
 * reader watches Numora's own formatting path run without touching the field.
 *
 * Never takes real focus - `input.focus()` would steal the caret and scroll the page.
 * Focus/blur are simulated by dispatching the events Numora listens for: `focus`/`blur`
 * (what the vanilla NumoraInput binds directly on the element) and `focusin`/`focusout`
 * (what React delegates at the root for onFocus/onBlur). Each package reacts to exactly
 * one of the pair, so nothing double-fires.
 *
 * Pauses while the reader has the field focused, and restarts the current cycle from a
 * fresh simulated focus once they leave - so a value they interrupted mid-typing never
 * gets its remaining digits appended to whatever they left behind.
 *
 * Returns a stop function.
 */
export function startTypingLoop(
  input: HTMLInputElement,
  { mode = 'change', sequence = DEFAULT_SEQUENCES[mode] }: TypingLoopOptions = {}
): () => void {
  if (typeof window === 'undefined') return () => {};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;

  const firstPhase: Phase = mode === 'blur' ? 'focus' : 'type';

  let timer: ReturnType<typeof setTimeout> | undefined;
  let valueIndex = 0;
  let charIndex = 0;
  let phase: Phase = firstPhase;
  let restartCycle = false;
  let disposed = false;

  const dispatchFocus = () => {
    input.dispatchEvent(new FocusEvent('focus'));
    input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
  };

  const dispatchBlur = () => {
    input.dispatchEvent(new FocusEvent('blur'));
    input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
  };

  const typeChar = (char: string, replaceAll: boolean) => {
    // Numora repositions the caret via setRangeText; on a non-focused input that can
    // nudge the page's scroll position. Restore it after the write.
    const { scrollX, scrollY } = window;
    if (replaceAll) input.setSelectionRange(0, input.value.length);
    else input.setSelectionRange(input.value.length, input.value.length);

    const beforeInput = new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'insertText',
      data: char,
    });
    input.dispatchEvent(beforeInput);
    if (!beforeInput.defaultPrevented) {
      const next = replaceAll ? char : input.value + char;
      nativeSetter?.call(input, next);
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    }
    window.scrollTo(scrollX, scrollY);
  };

  const startCycle = () => {
    charIndex = 0;
    phase = firstPhase;
  };

  const tick = () => {
    if (disposed) return;

    if (document.activeElement === input) {
      // The reader is editing. Leave their value alone and replay this cycle from the
      // top once they're done.
      restartCycle = true;
      timer = setTimeout(tick, HOLD_MS);
      return;
    }

    if (restartCycle) {
      restartCycle = false;
      startCycle();
    }

    const target = sequence[valueIndex];

    if (phase === 'focus') {
      dispatchFocus();
      phase = 'type';
      timer = setTimeout(tick, FOCUS_SETTLE_MS);
      return;
    }

    if (phase === 'type') {
      typeChar(target[charIndex], charIndex === 0);
      charIndex += 1;
      if (charIndex < target.length) {
        timer = setTimeout(tick, TYPE_MS);
      } else {
        phase = mode === 'blur' ? 'blur' : 'hold';
        timer = setTimeout(tick, mode === 'blur' ? PRE_BLUR_MS : HOLD_MS);
      }
      return;
    }

    if (phase === 'blur') {
      dispatchBlur();
      phase = 'hold';
      timer = setTimeout(tick, HOLD_MS);
      return;
    }

    // hold: this value is done, move to the next one.
    valueIndex = (valueIndex + 1) % sequence.length;
    startCycle();
    timer = setTimeout(tick, 0);
  };

  timer = setTimeout(tick, HOLD_MS);

  return () => {
    disposed = true;
    if (timer) clearTimeout(timer);
  };
}

/** React wrapper around {@link startTypingLoop} for demos that own the input via a ref. */
export function useTypingLoop(
  inputRef: RefObject<HTMLInputElement | null>,
  options: TypingLoopOptions = {}
) {
  const { mode, sequence } = options;
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    return startTypingLoop(input, { mode, sequence });
  }, [inputRef, mode, sequence]);
}
