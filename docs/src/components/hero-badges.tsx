import NumberFlow, { usePrefersReducedMotion } from '@number-flow/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';

import { Badge } from '@/components/ui/badge';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

/** Where the countdown starts. Numora ships with zero runtime dependencies. */
const COUNTDOWN_FROM = 100;

/**
 * The value is stepped through intermediate numbers on an eased timeline -
 * NumberFlow alone would animate 100 → 0 per digit, and the ones digit is 0
 * on both sides, so nothing would visibly count. Cubic ease-out: big jumps at
 * first, then single steps (3, 2, 1, 0) that the eye can follow as it settles.
 */
const COUNTDOWN_MS = 1500;

/** Minimum gap between value updates so NumberFlow isn't re-measured every frame. */
const STEP_MS = 40;

/** Each step's digit roll. Short, so consecutive steps chain instead of fighting. */
const SPIN_MS = 260;

/** Width collapse from three digits to one, and the sliding of `dependencies`. */
const LAYOUT_MS = 500;

/** Pause after the 0 lands before the word slides in. */
const REVEAL_GAP_MS = 250;

/**
 * On replay the number rolls back up to 100 while the word slides out. Let
 * that register before the counting starts, or the reset reads as a glitch.
 */
const REWIND_MS = 350;

/** Strong ease-out: instant movement, long deceleration. */
const EASE_OUT = 'cubic-bezier(0.23, 1, 0.32, 1)';

/**
 * The badge fades in 500ms after mount over 1.5s. The countdown waits until
 * the badge is legible; when the intro is skipped it starts almost at once.
 */
const INTRO_MS = 1100;
const SKIP_INTRO_MS = 300;

/** Poke the badge this many times and it complains. */
const OUCH_AFTER_CLICKS = 8;

/** How long the badge stays red. Every further click restarts the clock. */
const OUCH_MS = 3000;

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

interface HeroBadgesProps {
  skipIntro?: boolean;
}

export function HeroBadges({ skipIntro = false }: HeroBadgesProps) {
  // Reports `false` during hydration (server snapshot), which is the safe
  // direction: it only ever turns the animation off once it is truly `true`.
  const reduceMotion = usePrefersReducedMotion();
  const [count, setCount] = useState(COUNTDOWN_FROM);
  const [revealed, setRevealed] = useState(false);
  const [ouch, setOuch] = useState(false);
  // On short viewports the badge sits below the fold. Counting down unseen
  // wastes the moment, so wait until it is in view. `triggerOnce: false` so a
  // transient intersection during initial layout (sections above are still
  // mounting and push the badge down) cancels the pending countdown.
  const { ref, isVisible } = useScrollReveal({ threshold: 1, triggerOnce: false });
  const [mountedAt] = useState(() => Date.now());
  const started = useRef(false);
  const clicks = useRef(0);
  const frame = useRef<number | undefined>(undefined);
  const rewindTimer = useRef<number | undefined>(undefined);
  const revealTimer = useRef<number | undefined>(undefined);
  const ouchTimer = useRef<number | undefined>(undefined);

  const stopCountdown = useCallback(() => {
    if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    frame.current = undefined;
    window.clearTimeout(rewindTimer.current);
    window.clearTimeout(revealTimer.current);
  }, []);

  /**
   * Resets to 100 and counts down again. Safe to call mid-count: the running
   * loop is dropped and the number simply rolls to wherever the new one is.
   */
  const runCountdown = useCallback(() => {
    stopCountdown();
    const replay = started.current;
    started.current = true;
    setCount(COUNTDOWN_FROM);
    setRevealed(false);

    const start = () => {
      let startedAt: number | undefined;
      let lastUpdate = -Infinity;
      let lastValue = COUNTDOWN_FROM;
      const tick = (now: number) => {
        startedAt ??= now;
        const progress = Math.min(1, (now - startedAt) / COUNTDOWN_MS);
        const value = Math.round(COUNTDOWN_FROM * (1 - easeOutCubic(progress)));
        // The final 0 always lands, even if the previous step was a frame ago.
        if (value !== lastValue && (value === 0 || now - lastUpdate >= STEP_MS)) {
          lastValue = value;
          lastUpdate = now;
          setCount(value);
        }
        if (value > 0) {
          frame.current = requestAnimationFrame(tick);
          return;
        }
        frame.current = undefined;
        revealTimer.current = window.setTimeout(() => setRevealed(true), SPIN_MS + REVEAL_GAP_MS);
      };
      frame.current = requestAnimationFrame(tick);
    };

    // First run starts from a static 100; a replay first has to get back there.
    if (replay) rewindTimer.current = window.setTimeout(start, REWIND_MS);
    else start();
  }, [stopCountdown]);

  // The countdown loop and timers outlive the scheduling effect below:
  // scrolling the badge out of view mid-count re-runs that effect, and the
  // count must still finish and the word still appear.
  useEffect(
    () => () => {
      stopCountdown();
      window.clearTimeout(ouchTimer.current);
    },
    [stopCountdown]
  );

  useEffect(() => {
    // Reduced motion: no odometer, no reveal - just the final state.
    if (reduceMotion) {
      setCount(0);
      setRevealed(true);
      return;
    }
    if (!isVisible || started.current) return;
    // If the badge was in view from the start, respect the intro choreography.
    // If the user scrolled to it later, the fade-in already ran - go now.
    const elapsed = Date.now() - mountedAt;
    const delay = Math.max(0, (skipIntro ? SKIP_INTRO_MS : INTRO_MS) - elapsed);
    const countdownId = window.setTimeout(runCountdown, delay);
    return () => window.clearTimeout(countdownId);
  }, [reduceMotion, isVisible, mountedAt, skipIntro, runCountdown]);

  const handleClick = () => {
    clicks.current += 1;
    if (clicks.current < OUCH_AFTER_CLICKS) {
      if (!reduceMotion) runCountdown();
      return;
    }
    // Enough. Freeze on the final state underneath so there is nothing to
    // catch up on when the red fades, and (re)start the 3s complaint.
    stopCountdown();
    setCount(0);
    setRevealed(true);
    setOuch(true);
    window.clearTimeout(ouchTimer.current);
    ouchTimer.current = window.setTimeout(() => setOuch(false), OUCH_MS);
  };

  const collapse = (open: boolean, shift: number) => ({
    gridTemplateColumns: open ? '1fr' : '0fr',
    opacity: open ? 1 : 0,
    transform: open ? 'none' : `translateX(${shift}px)`,
    transitionDuration: `${LAYOUT_MS}ms`,
    transitionTimingFunction: EASE_OUT,
  });

  return (
    <div
      ref={ref}
      className="flex flex-wrap items-center justify-center lg:justify-start gap-3 my-6"
    >
      <button
        type="button"
        onClick={handleClick}
        aria-label={ouch ? 'ouch!' : `${count} dependencies`}
        className="cursor-pointer rounded-full transition-transform duration-[160ms] ease-[cubic-bezier(0.23,1,0.32,1)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Badge variant={ouch ? 'red' : 'green'}>
          {/* The badge never changes size: an invisible copy of the widest
              state reserves the width, and the live content is centred over
              it. What moves is the content re-centring as it changes. */}
          <span aria-hidden className="grid place-items-center tabular-nums">
            <span className="invisible col-start-1 row-start-1 whitespace-nowrap">
              <span className="pr-1">0</span>dependencies
            </span>
            <span className="col-start-1 row-start-1 inline-flex items-center">
              <span
                className="grid motion-safe:transition-[grid-template-columns,opacity,transform] motion-reduce:transition-none"
                style={collapse(!ouch, 6)}
              >
                <span className="min-w-0 overflow-hidden">
                  <NumberFlow
                    value={count}
                    trend={-1}
                    spinTiming={{ duration: SPIN_MS, easing: EASE_OUT }}
                    transformTiming={{ duration: LAYOUT_MS, easing: EASE_OUT }}
                    opacityTiming={{ duration: 200, easing: 'ease-out' }}
                    className="pr-1"
                  />
                </span>
              </span>
              <span
                className="grid motion-safe:transition-[grid-template-columns,opacity,transform] motion-reduce:transition-none"
                style={collapse(revealed, -6)}
              >
                <span className="min-w-0 overflow-hidden whitespace-nowrap">
                  <TextMorph duration={400} ease={EASE_OUT}>
                    {ouch ? 'ouch!' : 'dependencies'}
                  </TextMorph>
                </span>
              </span>
            </span>
          </span>
        </Badge>
      </button>
    </div>
  );
}
