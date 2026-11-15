import { Pause, Play } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { DUR, EASE, STAGGER, useLoop } from '@/components/anatomy/kit';
import { cn } from '@/lib/utils';

type Scene = 'type' | 'paste';

type Frame = {
  scene: Scene;
  /** What the field holds. */
  value: string;
  /** Pasted text that has not been cut yet. */
  pasted?: string;
  /** A key Numora refused on this frame. */
  refused?: string;
  note: string;
  ms: number;
};

const REFUSED = 'A fifth digit is refused';

const TIMELINE: Frame[] = [
  { scene: 'type', value: '', note: '', ms: 500 },
  { scene: 'type', value: '1', note: '', ms: 150 },
  { scene: 'type', value: '12', note: '', ms: 200 },
  { scene: 'type', value: '123', note: '', ms: 170 },
  { scene: 'type', value: '1,234', note: 'The comma is not counted', ms: 700 },
  { scene: 'type', value: '1,234', refused: '5', note: REFUSED, ms: 650 },
  { scene: 'type', value: '1,234', refused: '6', note: REFUSED, ms: 1600 },
  { scene: 'paste', value: '', note: '', ms: 500 },
  { scene: 'paste', value: '99999999', pasted: '99999999', note: 'Pasted', ms: 1000 },
  { scene: 'paste', value: '9,999', note: 'A paste is cut to 4 digits', ms: 2200 },
];

/** Autoplays two scenes: a refused fifth digit, then a paste that is cut to the limit. */
export function MaxLengthDemo() {
  const loop = useLoop({
    frames: TIMELINE.length,
    frameMs: (frame) => TIMELINE[frame].ms,
    holdMs: 0,
  });
  const { scene, value, pasted, refused, note } = TIMELINE[loop.frame];
  const idle = value === '' || refused !== undefined;

  return (
    <figure className="not-prose my-8">
      <div ref={loop.ref} className="overflow-hidden rounded-xl bg-surface-1 shadow-border">
        <MotionConfig reducedMotion="user">
          <div className="flex items-center gap-2 py-4 pr-3 pl-4 sm:pl-6">
            <div className="min-w-0 flex-1">
              <code className="font-mono text-caption text-muted-foreground">
                <strong className="font-bold text-foreground">maxLength</strong>: 4
              </code>
              {/* A new scene fades in; keystrokes inside one scene just appear. */}
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={scene}
                  role="img"
                  aria-label={
                    scene === 'type'
                      ? 'Typing 12345 with maxLength 4 leaves 1,234, and the comma is not counted'
                      : 'Pasting 99999999 with maxLength 4 is cut to 9,999'
                  }
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DUR.fast, ease: EASE.outExpo }}
                  className="relative mt-2 flex h-10 items-center font-mono text-[1.75rem] leading-none font-medium text-foreground select-none sm:text-[2rem]"
                >
                  {[...value].map((char, i) => {
                    // The separator is the only thing Numora adds. It appears with the digit that needs it.
                    const added = char === ',';
                    return (
                      <motion.span
                        // biome-ignore lint/suspicious/noArrayIndexKey: fixed string
                        key={i}
                        initial={added ? { opacity: 0, scale: 0.9 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: DUR.base,
                          ease: EASE.outExpo,
                          delay: STAGGER.tight,
                        }}
                        className={cn(
                          'inline-block',
                          added && 'text-signal-sky-fg',
                          pasted && 'text-signal-amber-fg'
                        )}
                      >
                        {char}
                      </motion.span>
                    );
                  })}
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
