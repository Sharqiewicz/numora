import { useInView, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Scene phases for a one-shot diagram animation.
 *
 * - `final`  : render the static final frame, no animation. Used for SSR, reduced motion,
 *              and when the diagram is already on screen at mount (avoids a flash of hidden content).
 * - `hidden` : armed and waiting below the fold. Render the initial (pre-animation) state.
 * - `play`   : run the beats. Restarted with a new `playId` on replay.
 */
const START_DELAY_MS = 120;

export type ScenePhase = 'final' | 'hidden' | 'play';

export interface Scene<T extends Element = HTMLDivElement> {
  ref: React.RefObject<T | null>;
  phase: ScenePhase;
  /** Changes on every (re)play. Use as a React `key` to restart motion trees. */
  playId: number;
  /** Restart the scene from frame 0. No-op under reduced motion. */
  replay: () => void;
  /** True once hydrated and motion is allowed, i.e. a Replay control makes sense. */
  canReplay: boolean;
  reduced: boolean;
}

/**
 * One-shot, scroll-triggered scene. Plays once when `amount` of the element is visible,
 * then settles on the final frame. SSR and reduced motion always get the final frame.
 *
 * Usage with motion variants:
 *   const scene = useScene();
 *   <motion.g key={scene.playId}
 *     initial={scene.phase === 'final' ? false : 'hidden'}
 *     animate={scene.phase === 'hidden' ? 'hidden' : 'shown'} variants={...} />
 */
export function useScene<T extends Element = HTMLDivElement>(
  { amount = 'some' }: { amount?: 'some' | 'all' | number } = {},
): Scene<T> {
  const ref = useRef<T>(null);
  const reduced = useReducedMotion() ?? false;
  // Same -15% bottom margin as DiagramFrame's reveal, so the scene starts as the frame lands.
  // `amount: 'some'` stays reachable for elements taller than the viewport.
  const inView = useInView(ref, { once: true, amount, margin: '0px 0px -15% 0px' });
  const [phase, setPhase] = useState<ScenePhase>('final');
  const [playId, setPlayId] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // After hydration: arm the scene only if it starts off screen, so on-screen diagrams never flash.
  // biome-ignore lint/correctness/useExhaustiveDependencies: arm once at mount
  useEffect(() => {
    setHydrated(true);
    if (reduced || !ref.current || typeof IntersectionObserver === 'undefined') return;
    const rect = ref.current.getBoundingClientRect();
    // Same arming rule as DiagramFrame: only content fully below the viewport is hidden.
    const offscreen = rect.top > window.innerHeight || rect.bottom < 0;
    if (offscreen) setPhase('hidden');
  }, []);

  useEffect(() => {
    if (reduced) {
      setPhase('final');
      return;
    }
    if (!inView) return;
    // Short delay so beats begin as the frame's own reveal lands.
    const id = setTimeout(() => setPhase((p) => (p === 'hidden' ? 'play' : p)), START_DELAY_MS);
    return () => clearTimeout(id);
  }, [inView, reduced]);

  const replay = useCallback(() => {
    if (reduced) return;
    setPlayId((n) => n + 1);
    setPhase('play');
  }, [reduced]);

  return { ref, phase, playId, replay, canReplay: hydrated && !reduced, reduced };
}
