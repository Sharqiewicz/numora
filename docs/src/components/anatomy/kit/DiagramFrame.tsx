import { Pause, Play } from 'lucide-react';
import { MotionConfig, motion, useInView, useReducedMotion } from 'motion/react';
import { type ReactNode, type Ref, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
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
   * `diagram` (default): filled surface-2 slab for illustrations / scenes.
   * `demo`: outline only, no fill, for live interactive demos, so the two kinds read differently.
   */
  variant?: 'diagram' | 'demo';
  /**
   * Opt-in one-time opacity reveal as the frame scrolls in. Off by default: frames that hold
   * a live input or run their own loop must not also fade (one effect per trigger).
   */
  reveal?: boolean;
  className?: string;
  children: ReactNode;
}

/**
 * The one frame every Anatomy diagram and demo sits in, so they read as one family.
 * Replaces the old `rounded-lg border bg-muted/30 p-4` card. Never nest frames.
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
  variant = 'diagram',
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
        className={cn(
          'not-prose relative my-8 rounded-xl border p-4 sm:p-6',
          variant === 'demo' ? 'border-border bg-transparent' : 'border-border bg-surface-2',
          className
        )}
      >
        {title && (
          <div className="mb-4 flex min-h-8 items-center text-caption font-medium text-muted-foreground">
            {title}
          </div>
        )}
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
        {loop && (steps || controls || !loop.reduced) && (
          <div className="mt-3 flex items-center gap-3">
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
                      // 44px tall hit area around a 4px bar; the row itself stays 32px.
                      className="group -my-1.5 flex h-11 w-full cursor-pointer items-center focus-visible:outline-none"
                    >
                      <span
                        className={cn(
                          'h-1 w-full rounded-full transition-[background-color] duration-150 ease-out-expo group-hover:bg-foreground group-focus-visible:ring-2 group-focus-visible:ring-ring motion-reduce:transition-none',
                          i === loop.frame
                            ? 'bg-foreground'
                            : i < loop.frame
                              ? 'bg-muted-foreground'
                              : 'bg-surface-7'
                        )}
                      />
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              (controls ?? <span className="flex-1" />)
            )}
            {!loop.reduced && (
              <button
                type="button"
                data-loop-control
                onClick={loop.toggle}
                aria-label={loop.held ? 'Play animation' : 'Pause animation'}
                // 32px button, 44px hit area.
                className="relative inline-flex size-8 flex-none cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,scale] duration-150 ease-out-expo before:absolute before:-inset-1.5 hover:bg-surface-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] motion-reduce:transition-none"
              >
                {loop.held ? (
                  <Play className="size-4" aria-hidden />
                ) : (
                  <Pause className="size-4" aria-hidden />
                )}
              </button>
            )}
          </div>
        )}
        {caption && (
          <figcaption className="mt-4 text-caption leading-relaxed text-muted-foreground">
            {caption}
          </figcaption>
        )}
      </motion.figure>
    </MotionConfig>
  );
}
