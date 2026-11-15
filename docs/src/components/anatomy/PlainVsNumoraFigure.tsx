import { Pause, Play } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { formatValue, parseValue } from 'numora';
import { cn } from '@/lib/utils';
import { DUR, EASE, useLoop } from './kit';

type Scene = 'plain' | 'numora';

/** The options the real NumoraInput gets in the docs. */
const OPTIONS = {
  formatOn: 'change',
  thousandSeparator: ',',
  groupingStyle: 'thousand',
  decimalMaxLength: 2,
  allowCompactNotation: true,
} as const;

const PASTED = '$1,234.56abc';
// Measured from the library, never typed in. A real paste into NumoraInput gives the same two
// strings: the field shows DISPLAY, and the change callback hands your code RAW.
const RAW = parseValue(PASTED, OPTIONS);
const DISPLAY = formatValue(RAW, OPTIONS);

type Frame = {
  scene: Scene;
  /** What the field holds. */
  value: string;
  /** The text was just pasted and has not been cleaned yet. */
  pasted?: boolean;
  /** The string your code reads, shown under the field. Empty until the paste has landed. */
  got?: string;
  ms: number;
};

const TIMELINE: Frame[] = [
  { scene: 'plain', value: '', ms: 500 },
  { scene: 'plain', value: PASTED, pasted: true, ms: 1000 },
  { scene: 'plain', value: PASTED, got: PASTED, ms: 2200 },
  { scene: 'numora', value: '', ms: 500 },
  { scene: 'numora', value: PASTED, pasted: true, ms: 1000 },
  { scene: 'numora', value: DISPLAY, got: RAW, ms: 2200 },
];

/** Autoplays one paste into a plain input, then into Numora, and the string your code gets from each. */
export function PlainVsNumoraFigure() {
  const loop = useLoop({
    frames: TIMELINE.length,
    frameMs: (frame) => TIMELINE[frame].ms,
    holdMs: 0,
  });
  const { scene, value, pasted, got } = TIMELINE[loop.frame];
  const noted = pasted || got !== undefined;

  return (
    <figure className="not-prose my-8">
      <div ref={loop.ref} className="overflow-hidden rounded-xl bg-surface-1 shadow-border">
        <MotionConfig reducedMotion="user">
          <div className="flex items-center gap-2 py-4 pr-3 pl-4 sm:pl-6">
            <div className="min-w-0 flex-1">
              {/* The caption fades with its scene, so it never names Numora over the plain field. */}
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={scene}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DUR.fast, ease: EASE.outExpo }}
                >
                  <code className="font-mono text-caption text-muted-foreground">
                    {scene === 'plain' ? (
                      <>
                        <strong className="font-bold text-foreground">Plain</strong> {'<input>'}
                      </>
                    ) : (
                      <>
                        <strong className="font-bold text-foreground">Numora</strong>Input
                      </>
                    )}
                  </code>
                  <div
                    role="img"
                    aria-label={
                      scene === 'plain'
                        ? `Pasting ${PASTED} into a plain input keeps it as it is, and your code gets ${PASTED}`
                        : `Pasting ${PASTED} into NumoraInput shows ${DISPLAY}, and your code gets ${RAW}`
                    }
                    className="mt-2 flex h-10 items-center font-mono text-[1.75rem] leading-none font-medium text-foreground select-none sm:text-[2rem]"
                  >
                    {[...value].map((char, i) => (
                      <span
                        // biome-ignore lint/suspicious/noArrayIndexKey: fixed string
                        key={i}
                        className={cn(
                          pasted && 'text-signal-amber-fg',
                          !pasted && scene === 'numora' && char === ',' && 'text-muted-foreground'
                        )}
                      >
                        {char}
                      </span>
                    ))}
                    <span
                      aria-hidden
                      className="ml-px inline-block h-[1.15em] w-[1.5px] flex-none animate-[demo-caret-blink_1.1s_steps(1)_infinite] bg-foreground motion-reduce:hidden"
                    />
                  </div>
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
            noted ? 'opacity-100' : 'opacity-0'
          )}
        >
          {/* One flex child, so the spaces between the note's parts survive. */}
          <span>
            {got === undefined ? (
              'Pasted'
            ) : (
              <>
                Your code gets{' '}
                <span
                  className={cn(
                    'font-mono',
                    scene === 'plain' ? 'text-signal-red-fg' : 'text-foreground'
                  )}
                >
                  "{got}"
                </span>
              </>
            )}
          </span>
        </p>
      </div>
    </figure>
  );
}
