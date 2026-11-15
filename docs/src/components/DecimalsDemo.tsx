import { Pause, Play } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { DUR, EASE, STAGGER, useLoop } from '@/components/anatomy/kit';
import { cn } from '@/lib/utils';

type Frame = {
  option: string;
  /** What the field holds. */
  value: string;
  /** A key Numora refused on this frame. */
  refused?: string;
  /** Zeros added on blur. */
  padded?: string;
  note: string;
  ms: number;
};

const MAX = 'decimalMaxLength: 2';
const MIN = 'decimalMinLength: 2';
const REFUSED = 'A third decimal digit is refused';

const TIMELINE: Frame[] = [
  { option: MAX, value: '', note: '', ms: 500 },
  { option: MAX, value: '1', note: '', ms: 150 },
  { option: MAX, value: '12', note: '', ms: 200 },
  { option: MAX, value: '12.', note: '', ms: 170 },
  { option: MAX, value: '12.3', note: '', ms: 150 },
  { option: MAX, value: '12.34', note: '', ms: 450 },
  { option: MAX, value: '12.34', refused: '5', note: REFUSED, ms: 650 },
  { option: MAX, value: '12.34', refused: '6', note: REFUSED, ms: 1600 },
  { option: MIN, value: '', note: '', ms: 500 },
  { option: MIN, value: '7', note: '', ms: 900 },
  { option: MIN, value: '7', padded: '.00', note: 'Padded when the field loses focus', ms: 2200 },
];

/** Autoplays two scenes: a refused third decimal, then padding on blur. */
export function DecimalsDemo() {
  const loop = useLoop({
    frames: TIMELINE.length,
    frameMs: (frame) => TIMELINE[frame].ms,
    holdMs: 0,
  });
  const { option, value, refused, padded, note } = TIMELINE[loop.frame];
  const blurred = padded !== undefined;
  const idle = value === '' || refused !== undefined;

  return (
    <figure className="not-prose my-8">
      <div ref={loop.ref} className="overflow-hidden rounded-xl bg-surface-1 shadow-border">
        <MotionConfig reducedMotion="user">
          <div className="flex items-center gap-2 py-4 pr-3 pl-4 sm:pl-6">
            <div className="min-w-0 flex-1">
              <code className="font-mono text-caption text-muted-foreground">
                decimal
                <strong className="font-bold text-foreground">
                  {option === MAX ? 'Max' : 'Min'}
                </strong>
                Length: 2
              </code>
              {/* A new scene fades in; keystrokes inside one scene just appear. */}
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={option}
                  role="img"
                  aria-label={
                    option === MAX
                      ? 'Typing 12.3456 with decimalMaxLength 2 leaves 12.34'
                      : 'Typing 7 with decimalMinLength 2 becomes 7.00 on blur'
                  }
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DUR.fast, ease: EASE.outExpo }}
                  className="relative mt-2 flex h-10 items-center font-mono text-[1.75rem] leading-none font-medium text-foreground select-none sm:text-[2rem]"
                >
                  <span>{value}</span>
                  {[...(padded ?? '')].map((char, i) => (
                    <motion.span
                      // biome-ignore lint/suspicious/noArrayIndexKey: fixed string
                      key={i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        duration: DUR.base,
                        ease: EASE.outExpo,
                        delay: i * STAGGER.tight,
                      }}
                      className="inline-block text-signal-sky-fg"
                    >
                      {char}
                    </motion.span>
                  ))}
                  {!blurred && (
                    <span
                      aria-hidden
                      className={cn(
                        'ml-px inline-block h-[1.15em] w-[1.5px] flex-none bg-foreground motion-reduce:hidden',
                        idle && 'animate-[demo-caret-blink_1.1s_steps(1)_infinite]'
                      )}
                    />
                  )}
                  {/* The refused key shows where it would have gone, then drops away. */}
                  {refused && (
                    <motion.span
                      key={refused}
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
