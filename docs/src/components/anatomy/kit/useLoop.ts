// Shared autoplay loop: every looping anatomy scene runs on this clock.
import { useInView, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface LoopOptions {
  /** Number of frames in one cycle. Frame indexes run 0 … frames - 1. */
  frames: number;
  /** How long a frame stays up, in ms. A function gives per-frame timing (slow down the key beat). */
  frameMs?: number | ((frame: number) => number);
  /** Extra hold on the last frame before the cycle restarts, in ms. The reader reads the result here. */
  holdMs?: number;
  /** After the reader stops interacting, wait this long, then resume the loop. */
  resumeAfterMs?: number;
}

export interface Loop<T extends Element = HTMLDivElement> {
  /** Put on the scene root. Drives in-view detection and interaction pausing. */
  ref: React.RefObject<T | null>;
  /** Current frame, 0 … frames - 1. Under reduced motion it is the last frame until the reader steps. */
  frame: number;
  /** How many full cycles have finished. Use to rotate through sample values between cycles. */
  cycle: number;
  /** True while the loop is advancing on its own. */
  playing: boolean;
  /** True while the reader has taken over (pointer or keyboard activity inside the scene). */
  interacting: boolean;
  /** Frames in one cycle, as passed in. */
  frames: number;
  /** True while the reader holds the loop: paused with `toggle`, or still interacting. */
  held: boolean;
  /** Pause when playing, play when held. For the frame's pause button. */
  toggle: () => void;
  /** True on the last frame of a playing loop. Drives `LoopFade`, which softens the restart. */
  leaving: boolean;
  /** How long into the last frame the fade-out starts, in ms. */
  leaveDelayMs: number;
  reduced: boolean;
  /** Jump to a frame. Counts as interaction: the loop pauses, then resumes after `resumeAfterMs`. */
  goTo: (frame: number) => void;
  /** Call from any custom control that should hold the loop (typing, dragging a slider). */
  touch: () => void;
  /** Restart the cycle from frame 0 and play. */
  restart: () => void;
}

/**
 * Autoplaying, looping scene clock.
 *
 * - Plays only while the scene is on screen and the tab is visible. When several scenes are on
 *   screen, only the one nearest the middle of the viewport plays.
 * - Pauses the moment the reader interacts inside `ref` (pointer down, a key, tabbing in), and
 *   resumes on its own `resumeAfterMs` after the last interaction, once focus has left the scene.
 * - `toggle` pauses until the reader plays it again. Pass the loop to `DiagramFrame` for the button.
 * - Reduced motion: never autoplays. `frame` starts on the last frame (the result); `goTo` still works,
 *   so give the scene a manual step control.
 * - SSR and first paint render the last frame, so there is no flash of an empty scene.
 */
/** The restart fade (see `LoopFade`) takes the last `LEAVE_MS` of the hold. */
const LEAVE_MS = 200;

// Scenes on screen. Only the one nearest the middle of the viewport plays, so two figures never
// animate side by side on separate clocks.
const onScreen = new Map<Element, (front: boolean) => void>();
let pickFrame = 0;

function pickFront() {
  pickFrame = 0;
  const mid = window.innerHeight / 2;
  let front: Element | null = null;
  let nearest = Number.POSITIVE_INFINITY;
  for (const el of onScreen.keys()) {
    const r = el.getBoundingClientRect();
    const d = Math.abs(r.top + r.height / 2 - mid);
    if (d < nearest) [front, nearest] = [el, d];
  }
  for (const [el, set] of onScreen) set(el === front);
}

function schedulePick() {
  if (!pickFrame) pickFrame = requestAnimationFrame(pickFront);
}

function joinScreen(el: Element, set: (front: boolean) => void) {
  if (onScreen.size === 0) {
    document.addEventListener('scroll', schedulePick, { passive: true, capture: true });
    window.addEventListener('resize', schedulePick);
  }
  onScreen.set(el, set);
  schedulePick();
  return () => {
    onScreen.delete(el);
    if (onScreen.size === 0) {
      document.removeEventListener('scroll', schedulePick, { capture: true });
      window.removeEventListener('resize', schedulePick);
    }
    schedulePick();
  };
}

export function useLoop<T extends Element = HTMLDivElement>({
  frames,
  frameMs = 900,
  holdMs = 1800,
  resumeAfterMs = 4000,
}: LoopOptions): Loop<T> {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(ref, { amount: 0.3 });
  const [frame, setFrame] = useState(frames - 1);
  const [cycle, setCycle] = useState(0);
  const [started, setStarted] = useState(false);
  const [interacting, setInteracting] = useState(false);
  const [paused, setPaused] = useState(false);
  const [front, setFront] = useState(false);
  const held = paused || interacting;
  const heldRef = useRef(held);
  heldRef.current = held;
  const [tabVisible, setTabVisible] = useState(true);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameMsRef = useRef(frameMs);
  frameMsRef.current = frameMs;

  // Start from frame 0 once mounted (unless motion is reduced).
  useEffect(() => {
    if (reduced) return;
    setFrame(0);
    setStarted(true);
  }, [reduced]);

  useEffect(() => {
    const onVis = () => setTabVisible(document.visibilityState === 'visible');
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!inView || !el) {
      setFront(false);
      return;
    }
    return joinScreen(el, setFront);
  }, [inView]);

  const scheduleResume = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      const el = ref.current;
      // Keep holding while the reader's focus is still inside the scene (e.g. caret in an input).
      if (el?.contains(document.activeElement)) {
        scheduleResume();
        return;
      }
      setInteracting(false);
    }, resumeAfterMs);
  }, [resumeAfterMs]);

  const touch = useCallback(() => {
    setInteracting(true);
    scheduleResume();
  }, [scheduleResume]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Only trusted events count, so a scene that drives its own inputs does not pause itself.
    // The pause button is left out: it holds the loop through `toggle`, not as an interaction.
    const onUser = (e: Event) => {
      if (!e.isTrusted) return;
      if (e.target instanceof Element && e.target.closest('[data-loop-control]')) return;
      touch();
    };
    // `keyup` catches tabbing in: the Tab keydown fires on the element focus is leaving.
    const events = ['pointerdown', 'keydown', 'keyup', 'paste'];
    for (const type of events) el.addEventListener(type, onUser);
    return () => {
      for (const type of events) el.removeEventListener(type, onUser);
      if (resumeTimer.current) clearTimeout(resumeTimer.current);
    };
  }, [touch]);

  const playing = started && !reduced && inView && front && tabVisible && !held;

  useEffect(() => {
    if (!playing) return;
    const ms = frameMsRef.current;
    const base = typeof ms === 'function' ? ms(frame) : ms;
    const last = frame >= frames - 1;
    const id = setTimeout(
      () => {
        if (last) {
          setCycle((c) => c + 1);
          setFrame(0);
        } else {
          setFrame(frame + 1);
        }
      },
      base + (last ? holdMs : 0)
    );
    return () => clearTimeout(id);
  }, [playing, frame, frames, holdMs]);

  const goTo = useCallback(
    (f: number) => {
      setFrame(Math.max(0, Math.min(frames - 1, f)));
      touch();
    },
    [frames, touch]
  );

  const restart = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setInteracting(false);
    setFrame(0);
  }, []);

  const toggle = useCallback(() => {
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    setInteracting(false);
    setPaused(!heldRef.current);
  }, []);

  const lastMs = typeof frameMs === 'function' ? frameMs(frames - 1) : frameMs;

  return {
    ref,
    frame,
    cycle,
    playing,
    interacting,
    reduced,
    goTo,
    touch,
    restart,
    frames,
    held,
    toggle,
    leaving: playing && frame >= frames - 1,
    leaveDelayMs: Math.max(0, lastMs + holdMs - LEAVE_MS),
  };
}
