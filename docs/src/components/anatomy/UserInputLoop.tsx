import { Pause, Play } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { formatValue } from 'numora';
import { sanitizeNumoraInput } from 'numora/internal';
import { normalizeForeignFormat } from 'numora/pipeline';
import { cn } from '@/lib/utils';
import { DUR, EASE, useLoop } from './kit';

const OPTS = {
  allowCompactNotation: true,
  allowNegative: true,
  allowLeadingZeros: false,
  decimalSeparator: '.',
  thousandSeparator: ',',
} as const;

/** The usual fix, verbatim. */
const regexClean = (s: string) => s.replace(/[^0-9.]/g, '');

/** What a Numora field shows after a paste: foreign-format check, sanitize, then grouping. */
const numoraPaste = (s: string) =>
  formatValue(sanitizeNumoraInput(normalizeForeignFormat(s, OPTS), OPTS), {
    decimalMaxLength: 18,
    thousandSeparator: ',',
  });

// Both values are pasted, because that is where Numora reads them whole. Typed one key at a
// time, `e` and `-` are refused as they arrive.
const SCENES = [
  {
    by: 'Regex',
    pasted: '1.5e-7',
    result: regexClean('1.5e-7'),
    note: 'About ten million times too big',
  },
  {
    by: 'Numora',
    pasted: '1.5e-7',
    result: numoraPaste('1.5e-7'),
    note: 'Read as scientific notation',
  },
  {
    by: 'Regex',
    pasted: '1.234,56',
    result: regexClean('1.234,56'),
    note: 'A thousand times too small',
  },
  {
    by: 'Numora',
    pasted: '1.234,56',
    result: numoraPaste('1.234,56'),
    note: 'Read as German format',
  },
].map((scene, id) => ({ ...scene, id, wrong: scene.by === 'Regex' }));

type Step = 'empty' | 'pasted' | 'result';
const STEPS: { step: Step; ms: number }[] = [
  { step: 'empty', ms: 500 },
  { step: 'pasted', ms: 1000 },
  { step: 'result', ms: 2200 },
];
const TIMELINE = SCENES.flatMap((scene) => STEPS.map((step) => ({ scene, ...step })));

/** Autoplays the same paste through a regex and through Numora, for two kinds of number. */
export function UserInputLoop() {
  const loop = useLoop({
    frames: TIMELINE.length,
    frameMs: (frame) => TIMELINE[frame].ms,
    holdMs: 0,
  });
  const { scene, step } = TIMELINE[loop.frame];
  const value = step === 'empty' ? '' : step === 'pasted' ? scene.pasted : scene.result;
  const note = step === 'empty' ? '' : step === 'pasted' ? 'Pasted' : scene.note;

  return (
    <figure className="not-prose my-8">
      <div ref={loop.ref} className="overflow-hidden rounded-xl bg-surface-1 shadow-border">
        <MotionConfig reducedMotion="user">
          <div className="flex items-center gap-2 py-4 pr-3 pl-4 sm:pl-6">
            <div className="min-w-0 flex-1">
              {/* The caption fades with its scene, so it never names Numora over a regex result. */}
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={scene.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DUR.fast, ease: EASE.outExpo }}
                >
                  <code className="font-mono text-caption text-muted-foreground">
                    <strong className="font-bold text-foreground">{scene.by}</strong>: pasting{' '}
                    {scene.pasted}
                  </code>
                  <div
                    role="img"
                    aria-label={`Pasting ${scene.pasted} with ${scene.by === 'Regex' ? 'a regex' : 'Numora'} leaves ${scene.result}`}
                    className="mt-2 flex h-10 items-center font-mono text-[1.75rem] leading-none font-medium text-foreground select-none sm:text-[2rem]"
                  >
                    {[...value].map((char, i) => (
                      <span
                        // biome-ignore lint/suspicious/noArrayIndexKey: fixed string
                        key={i}
                        className={cn(
                          step === 'pasted' && 'text-signal-amber-fg',
                          step === 'result' && scene.wrong && 'text-signal-red-fg',
                          step === 'result' &&
                            !scene.wrong &&
                            char === ',' &&
                            'text-muted-foreground'
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
            note ? 'opacity-100' : 'opacity-0'
          )}
        >
          {note || ' '}
        </p>
      </div>
    </figure>
  );
}
