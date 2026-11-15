import { MotionConfig, motion, useInView, useReducedMotion } from 'motion/react';
import { type ReactNode, type Ref, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { FigureLabel, figureFooterClass, figureShellClass } from './LoopFigure';
import { LoopToggle, StepCount } from './LoopToggle';
import { DUR, EASE } from './tokens';
import type { Loop } from './useLoop';

interface DiagramFrameProps {
  /** Short figure title shown top-left (13px, muted). */
  title?: ReactNode;
  /** Caption under the figure. */
  caption?: ReactNode;
  /**
   * The scene's loop (from useLoop). Adds a pause / play button under the scene, so a reader can
   * stop the motion. Not shown under reduced motion, where nothing autoplays.
   */
  loop?: Pick<Loop, 'frame' | 'frames' | 'held' | 'reduced' | 'toggle' | 'goTo'>;
  /**
   * With `loop`: one step button per frame, next to the pause button. They show progress and let
   * the reader step through, which is the only way to see every frame under reduced motion.
   * Leave off when the scene has its own step buttons.
   */
  steps?: boolean;
  /**
   * With `loop`: the scene's own step control, in the row next to the pause button. Replaces
   * `steps` when the steps are not one per frame. Stays under reduced motion.
   */
  controls?: ReactNode;
  /**
   * Minimum canvas width in px. Fixed-width SVGs get horizontal scroll on narrow screens
   * instead of shrinking their text. Omit for fluid HTML content.
   */
  minWidth?: number;
  /** Accessible name for a scrollable canvas when `title` is not a string. */
  label?: string;
  /** Ref for the scene root (from useLoop), when the frame's own scene wrapper should carry it. */
  sceneRef?: Ref<HTMLDivElement>;
  /**
   * With `controls`: what goes where the "2 / 5" count sits, when the scene's steps are not one
   * per frame. `steps` fills it in on its own.
   */
  count?: { current: number; total: number };
  /**
   * Opt-in one-time opacity reveal as the frame scrolls in. Off by default: frames that hold
   * a live input or run their own loop must not also fade (one effect per trigger).
   */
  reveal?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * One segment of a step rail. The current step is the tallest and brightest, done steps are
 * mid-grey, steps still to come are dim. A segment the reader cannot click (`clickable` false)
 * is thinner and never lights on hover.
 */
export function stepBarClass(index: number, current: number, clickable: boolean) {
  return cn(
    'w-full rounded-full transition-[background-color,height] duration-150 ease-out-expo motion-reduce:transition-none',
    index === current
      ? 'h-1.5 bg-foreground'
      : cn(
          clickable ? 'h-1' : 'h-0.5',
          index < current ? 'bg-muted-foreground' : clickable ? 'bg-surface-7' : 'bg-surface-5'
        ),
    clickable &&
      'group-focus-visible:ring-2 group-focus-visible:ring-ring [@media(hover:hover)]:group-hover:bg-foreground'
  );
}

/**
 * The one frame every diagram and live demo sits in. Same card as `LoopFigure`: scene on top,
 * and for a looping scene a bottom row with the steps on the left and the pause button on the
 * right. Never nest frames.
 */
export function DiagramFrame({
  title,
  caption,
  loop,
  steps = false,
  controls,
  label: labelProp,
  minWidth,
  sceneRef,
  count,
  reveal = false,
  className,
  children,
}: DiagramFrameProps) {
  const label = labelProp ?? (typeof title === 'string' ? title : undefined);

  // One-time frame reveal. SSR / reduced motion / already-on-screen-at-mount render the final state.
  const figureRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(figureRef, { once: true, margin: '0px 0px -15% 0px' });
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!reveal || reduced || !figureRef.current || typeof IntersectionObserver === 'undefined')
      return;
    const rect = figureRef.current.getBoundingClientRect();
    // Arm only when fully off screen, so SSR-visible content is never hidden after hydration.
    if (rect.top > window.innerHeight || rect.bottom < 0) setArmed(true);
  }, [reduced, reveal]);
  // Printing: reveal everything.
  const [printing, setPrinting] = useState(false);
  useEffect(() => {
    const on = () => setPrinting(true);
    const off = () => setPrinting(false);
    window.addEventListener('beforeprint', on);
    window.addEventListener('afterprint', off);
    return () => {
      window.removeEventListener('beforeprint', on);
      window.removeEventListener('afterprint', off);
    };
  }, []);
  const hidden = armed && !inView && !printing;

  return (
    <MotionConfig reducedMotion="user">
      <motion.figure
        ref={figureRef}
        initial={false}
        animate={{ opacity: hidden ? 0 : 1 }}
        transition={hidden ? { duration: 0 } : { duration: DUR.base, ease: EASE.outExpo }}
        className={cn('not-prose relative my-8', figureShellClass, className)}
      >
        <div className="p-4 sm:p-6">
          {title && <FigureLabel className="mb-4">{title}</FigureLabel>}
          <div
            ref={sceneRef}
            className={
              minWidth
                ? '-mx-4 overflow-x-auto px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mx-0 sm:px-0'
                : undefined
            }
            {...(minWidth ? { tabIndex: 0, role: 'group', 'aria-label': label ?? 'Diagram' } : {})}
          >
            <div style={minWidth ? { minWidth } : undefined}>{children}</div>
          </div>
          {caption && (
            <figcaption className="mt-4 text-caption leading-relaxed text-muted-foreground">
              {caption}
            </figcaption>
          )}
        </div>
        {loop && (steps || controls || !loop.reduced) && (
          <div className={figureFooterClass}>
            {steps ? (
              <ol className="m-0 flex min-w-0 flex-1 list-none gap-1 p-0" aria-label="Steps">
                {Array.from({ length: loop.frames }, (_, i) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: frames are positional
                  <li key={i} className="m-0 min-w-0 flex-1 p-0">
                    <button
                      type="button"
                      aria-label={`Step ${i + 1} of ${loop.frames}`}
                      aria-current={loop.frame === i ? 'step' : undefined}
                      onClick={() => loop.goTo(i)}
                      // 44px tall hit area around the bar; the row itself stays 32px.
                      className="group -my-1.5 flex h-11 w-full cursor-pointer items-center focus-visible:outline-none"
                    >
                      <span className={stepBarClass(i, loop.frame, true)} />
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              (controls ?? <span className="flex-1" />)
            )}
            {steps ? (
              <StepCount current={loop.frame + 1} total={loop.frames} />
            ) : (
              count && <StepCount {...count} />
            )}
            <LoopToggle loop={loop} />
          </div>
        )}
      </motion.figure>
    </MotionConfig>
  );
}
