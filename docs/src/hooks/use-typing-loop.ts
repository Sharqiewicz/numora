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
/**
 * A metered loop types every value over this span, whatever its length, so each cycle
 * lasts the same and the loop keeps a steady beat. Ten characters land at TYPE_MS apart.
 */
const TYPE_SPAN_MS = TYPE_MS * 9;

/**
 * Blur mode announces each simulated focus and blur this long before it happens, as a
 * bubbling {@link DEMO_CUE_EVENT} on the input. DemoFrame's pointer uses the lead as its
 * travel time, so it arrives exactly when the focus or blur fires. The lead is taken out
 * of the pause before it, so the cycle length is unchanged.
 */
export const DEMO_CUE_LEAD_MS = 450;
export const DEMO_CUE_EVENT = 'numora-demo-cue';
export type DemoCue = 'focus-soon' | 'blur-soon';

const DEFAULT_SEQUENCES: Record<TypingLoopMode, string[]> = {
  change: ['1234567.89', '0'],
  // Both values group, so every cycle shows a focus-strip AND a blur-regroup.
  // A separator-less value (e.g. "0") would make both morphs no-ops.
  blur: ['1234567.89', '2500'],
};

export interface TypingLoopOptions {
  /**
   * `change` types straight into the field - separators appear per keystroke.
   * `blur` plays the full staged cycle: simulated focus (strip), type, simulated
   * blur (regroup), hold. A `formatOn: 'change'` field can run it too; it then shows
   * the click in and out around the same per-keystroke formatting.
   */
  mode?: TypingLoopMode;
  sequence?: string[];
  /** Type every value over the same span, so all cycles are the same length. */
  metered?: boolean;
  /**
   * Fields that share a group share one clock: each receives the same simulated focus,
   * keystroke and blur at the same instant. The first field to join sets the options.
   */
  group?: string;
}

/**
 * The Change and Blur demos shown as a pair: one clock, the same numbers, the same
 * keystrokes. All three values group, and the last is the longest amount the field carries.
 */
export const PAIRED_LOOP: TypingLoopOptions = {
  mode: 'blur',
  group: 'format-on-pair',
  metered: true,
  sequence: ['1234567.89', '2500', '987654321012.5'],
};

type Phase = 'cue-focus' | 'focus' | 'type' | 'cue-blur' | 'blur' | 'hold';

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
  options: TypingLoopOptions = {}
): () => void {
  if (typeof window === 'undefined') return () => {};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

  const { group } = options;
  if (!group) return runTypingLoop(new Set([input]), options).stop;

  let shared = groups.get(group);
  if (shared) {
    shared.inputs.add(input);
    // A field that joins late starts with the others at the top of a cycle.
    shared.loop.restart();
  } else {
    const inputs = new Set([input]);
    shared = { inputs, loop: runTypingLoop(inputs, options) };
    groups.set(group, shared);
  }
  const joined = shared;

  return () => {
    joined.inputs.delete(input);
    if (joined.inputs.size > 0) return;
    joined.loop.stop();
    if (groups.get(group) === joined) groups.delete(group);
  };
}

interface TypingLoop {
  stop: () => void;
  restart: () => void;
}

const groups = new Map<string, { inputs: Set<HTMLInputElement>; loop: TypingLoop }>();

/** One clock for every field in `inputs`; the set may grow and shrink while it runs. */
function runTypingLoop(
  inputs: Set<HTMLInputElement>,
  { mode = 'change', sequence = DEFAULT_SEQUENCES[mode], metered = false }: TypingLoopOptions
): TypingLoop {
  const nativeSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    'value'
  )?.set;

  const firstPhase: Phase = mode === 'blur' ? 'cue-focus' : 'type';

  let timer: ReturnType<typeof setTimeout> | undefined;
  let valueIndex = 0;
  let charIndex = 0;
  let phase: Phase = firstPhase;
  let restartCycle = false;
  let disposed = false;

  const dispatchFocus = () => {
    for (const input of inputs) {
      input.dispatchEvent(new FocusEvent('focus'));
      input.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
    }
  };

  const dispatchBlur = () => {
    for (const input of inputs) {
      input.dispatchEvent(new FocusEvent('blur'));
      input.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
    }
  };

  const dispatchCue = (cue: DemoCue) => {
    for (const input of inputs) {
      input.dispatchEvent(new CustomEvent<DemoCue>(DEMO_CUE_EVENT, { bubbles: true, detail: cue }));
    }
  };

  const typeChar = (input: HTMLInputElement, char: string, replaceAll: boolean) => {
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

    if (inputs.has(document.activeElement as HTMLInputElement)) {
      // The reader is editing. Leave every field alone and replay this cycle from the
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

    if (phase === 'cue-focus') {
      dispatchCue('focus-soon');
      phase = 'focus';
      timer = setTimeout(tick, DEMO_CUE_LEAD_MS);
      return;
    }

    if (phase === 'focus') {
      dispatchFocus();
      phase = 'type';
      timer = setTimeout(tick, FOCUS_SETTLE_MS);
      return;
    }

    if (phase === 'type') {
      for (const input of inputs) typeChar(input, target[charIndex], charIndex === 0);
      charIndex += 1;
      if (charIndex < target.length) {
        timer = setTimeout(tick, metered ? TYPE_SPAN_MS / Math.max(1, target.length - 1) : TYPE_MS);
      } else {
        phase = mode === 'blur' ? 'cue-blur' : 'hold';
        timer = setTimeout(tick, mode === 'blur' ? PRE_BLUR_MS - DEMO_CUE_LEAD_MS : HOLD_MS);
      }
      return;
    }

    if (phase === 'cue-blur') {
      dispatchCue('blur-soon');
      phase = 'blur';
      timer = setTimeout(tick, DEMO_CUE_LEAD_MS);
      return;
    }

    if (phase === 'blur') {
      dispatchBlur();
      phase = 'hold';
      timer = setTimeout(tick, HOLD_MS - DEMO_CUE_LEAD_MS);
      return;
    }

    // hold: this value is done, move to the next one.
    valueIndex = (valueIndex + 1) % sequence.length;
    startCycle();
    timer = setTimeout(tick, 0);
  };

  timer = setTimeout(tick, mode === 'blur' ? HOLD_MS - DEMO_CUE_LEAD_MS : HOLD_MS);

  return {
    stop() {
      disposed = true;
      if (timer) clearTimeout(timer);
    },
    restart() {
      restartCycle = true;
    },
  };
}

/** React wrapper around {@link startTypingLoop} for demos that own the input via a ref. */
export function useTypingLoop(
  inputRef: RefObject<HTMLInputElement | null>,
  options: TypingLoopOptions = {}
) {
  const { mode, sequence, metered, group } = options;
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    return startTypingLoop(input, { mode, sequence, metered, group });
  }, [inputRef, mode, sequence, metered, group]);
}
