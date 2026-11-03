import { RotateCcw } from 'lucide-react';
import { MotionConfig, motion, useInView, useReducedMotion } from 'motion/react';
import { type ReactNode, type Ref, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { DUR, EASE } from './tokens';

interface DiagramFrameProps {
  /** Short figure title shown top-left (13px, muted). */
  title?: ReactNode;
  /** Caption under the figure. */
  caption?: ReactNode;
  /** Shows an icon-only Replay button top-right when provided and `canReplay`. */
  onReplay?: () => void;
  canReplay?: boolean;
  /**
   * Minimum canvas width in px. Fixed-width SVGs get horizontal scroll on narrow screens
   * instead of shrinking their text. Omit for fluid HTML content.
   */
  minWidth?: number;
  /** Accessible name for the Replay button when `title` is not a string. */
  replayLabel?: string;
  /** Ref for the scene's in-view detection (from useScene). */
  sceneRef?: Ref<HTMLDivElement>;
  /**
   * `diagram` (default): filled surface-2 slab for illustrations / scenes.
   * `demo`: outline only, no fill, for live interactive demos, so the two kinds read differently.
   */
  variant?: 'diagram' | 'demo';
  /**
   * Opt-in one-time opacity reveal as the frame scrolls in. Off by default: frames that hold
   * a live input or run their own useScene beats must not also fade (one effect per trigger).
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
  onReplay,
  canReplay,
  replayLabel,
  minWidth,
  sceneRef,
  variant = 'diagram',
  reveal = false,
  className,
  children,
}: DiagramFrameProps) {
  const label = replayLabel ?? (typeof title === 'string' ? title : undefined);

  // One-time frame reveal. SSR / reduced motion / already-on-screen-at-mount render the final state.
  const figureRef = useRef<HTMLElement>(null);
  const reduced = useReducedMotion() ?? false;
  const inView = useInView(figureRef, { once: true, margin: '0px 0px -15% 0px' });
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!reveal || reduced || !figureRef.current || typeof IntersectionObserver === 'undefined') return;
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
        className,
      )}
    >
      {title && (
        <div className="mb-4 flex min-h-8 items-center pr-10 text-[13px] font-medium text-muted-foreground">
          {title}
        </div>
      )}
      {onReplay && canReplay && (
        // Absolutely placed so a title-less frame doesn't get an empty header row.
        <button
          type="button"
          onClick={onReplay}
          aria-label={label ? `Replay: ${label}` : 'Replay animation'}
          title="Replay"
          className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,transform] duration-150 ease-out-expo hover:bg-surface-4 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] motion-reduce:transition-none sm:top-5 sm:right-5"
        >
          <RotateCcw className="size-4" aria-hidden />
        </button>
      )}
      <div
        ref={sceneRef}
        className={
          minWidth
            ? '-mx-4 overflow-x-auto px-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mx-0 sm:px-0'
            : undefined
        }
        {...(minWidth
          ? { tabIndex: 0, role: 'group', 'aria-label': label ?? 'Diagram' }
          : {})}
      >
        <div style={minWidth ? { minWidth } : undefined}>{children}</div>
      </div>
      {caption && (
        <figcaption className="mt-4 text-[13px] leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </motion.figure>
    </MotionConfig>
  );
}
