import { Pause, Play } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { DUR, EASE, useLoop } from '@/components/anatomy/kit';
import { cn } from '@/lib/utils';

type Frame = {
  /** The option value on show, which also keys the scene. */
  allow: boolean;
  /** What the field holds. */
  value: string;
  /** A key Numora refused on this frame. */
  refused?: string;
  note: string;
  ms: number;
};

const REMOVED = 'Leading zeros are removed';
const KEPT = 'Leading zeros are kept';

const TIMELINE: Frame[] = [
  { allow: false, value: '', note: '', ms: 500 },
  { allow: false, value: '0', note: '', ms: 300 },
  { allow: false, value: '0', refused: '0', note: 'A second zero is refused', ms: 700 },
  { allow: false, value: '7', note: REMOVED, ms: 2000 },
  { allow: true, value: '', note: '', ms: 500 },
  { allow: true, value: '0', note: '', ms: 300 },
  { allow: true, value: '00', note: '', ms: 300 },
  { allow: true, value: '007', note: KEPT, ms: 2200 },
];

/** Autoplays two scenes: leading zeros removed as you type, then kept with allowLeadingZeros. */
export function LeadingZerosDemo() {
  const loop = useLoop({
    frames: TIMELINE.length,
    frameMs: (frame) => TIMELINE[frame].ms,
    holdMs: 0,
  });
  const { allow, value, refused, note } = TIMELINE[loop.frame];
  const idle = value === '' || refused !== undefined;
  // Under allowLeadingZeros the zeros before the first digit are the focal token.
  const zeros = allow ? (value.match(/^0*(?=\d)/)?.[0] ?? '') : '';

  return (
    <figure className="not-prose my-8">
      <div ref={loop.ref} className="overflow-hidden rounded-xl bg-surface-1 shadow-border">
        <MotionConfig reducedMotion="user">
          <div className="flex items-center gap-2 py-4 pr-3 pl-4 sm:pl-6">
            <div className="min-w-0 flex-1">
              <code className="font-mono text-caption text-muted-foreground">
                allowLeadingZeros:{' '}
                <strong className="font-bold text-foreground">{allow ? 'true' : 'false'}</strong>
              </code>
              {/* A new scene fades in; keystrokes inside one scene just appear. */}
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={String(allow)}
                  role="img"
                  aria-label={
                    allow
                      ? 'Typing 007 with allowLeadingZeros true leaves 007'
                      : 'Typing 007 with allowLeadingZeros false leaves 7'
                  }
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DUR.fast, ease: EASE.outExpo }}
                  className="relative mt-2 flex h-10 items-center font-mono text-[1.75rem] leading-none font-medium text-foreground select-none sm:text-[2rem]"
                >
                  <span aria-hidden>
                    <span className="text-signal-amber-fg">{zeros}</span>
                    {value.slice(zeros.length)}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      'ml-px inline-block h-[1.15em] w-[1.5px] flex-none bg-foreground motion-reduce:hidden',
                      idle && 'animate-[demo-caret-blink_1.1s_steps(1)_infinite]'
                    )}
                  />
                  {/* The refused key shows where it would have gone, then drops away. */}
                  {refused && (
                    <motion.span
                      key={`${value}${refused}`}
                      aria-hidden
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 0, y: 6 }}
                      transition={{ duration: DUR.flash, ease: EASE.outExpo, delay: DUR.fast }}
                      className="ml-0.5 inline-block text-signal-red-fg"
                    >
                      {refused}
                    </motion.span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Nothing autoplays under reduced motion, so there is nothing to pause. */}
            {!loop.reduced && (
              <button
                type="button"
                data-loop-control
                onClick={loop.toggle}
                aria-label={loop.held ? 'Play animation' : 'Pause animation'}
                className="relative inline-flex size-8 flex-none cursor-pointer touch-manipulation items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,scale] duration-150 ease-out-expo before:absolute before:-inset-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.96] motion-reduce:transition-none [@media(hover:hover)]:hover:bg-surface-4 [@media(hover:hover)]:hover:text-foreground"
              >
                {loop.held ? (
                  <Play className="size-4" aria-hidden />
                ) : (
                  <Pause className="size-4" aria-hidden />
                )}
              </button>
            )}
          </div>
        </MotionConfig>
        <p
          className={cn(
            'm-0 flex h-9 items-center border-t border-surface-3 px-4 text-sm text-muted-foreground sm:px-6',
            'transition-opacity duration-150 ease-out-expo motion-reduce:transition-none',
            note ? 'opacity-100' : 'opacity-0'
          )}
        >
          {note || ' '}
        </p>
      </div>
    </figure>
  );
}
