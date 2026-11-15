import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { formatValue } from 'numora';
import { DUR, EASE, LoopToggle, SPRING, STAGGER, useLoop } from '@/components/anatomy/kit';
import { cn } from '@/lib/utils';

const ZEROS: Record<string, number> = { k: 3, m: 6, b: 9, t: 12 };

/**
 * One per suffix. `1.2345k` has more decimals than places to move, so the point lands inside
 * the number; `2.5T` is the longest value the figure has to fit.
 */
const ITEMS = ['1.5m', '2.5T', '1.2345k', '2B'].map((typed) => ({
  typed,
  number: typed.slice(0, -1),
  suffix: typed.slice(-1),
  zeros: ZEROS[typed.slice(-1).toLowerCase()],
  formatted: formatValue(typed, {
    allowCompactNotation: true,
    decimalMaxLength: 18,
    thousandSeparator: ',',
  }),
}));
type Item = (typeof ITEMS)[number];

type Cell = { key: string; char: string; kind: 'digit' | 'zero' | 'point' | 'suffix' | 'comma' };

/** The shorthand, one cell per keystroke. Keys are stable, so a digit glides instead of swapping. */
function typedCells(item: Item): Cell[] {
  const [int, frac = ''] = item.number.split('.');
  const out: Cell[] = [...int].map((char, i): Cell => ({ key: `i${i}`, char, kind: 'digit' }));
  if (frac) out.push({ key: 'point', char: '.', kind: 'point' });
  out.push(...[...frac].map((char, i): Cell => ({ key: `f${i}`, char, kind: 'digit' })));
  return [...out, { key: 'suffix', char: item.suffix, kind: 'suffix' }];
}

/** What the field holds once the suffix lands: point moved, zeros filled in, digits grouped. */
function expandedCells(item: Item): Cell[] {
  const [int, frac = ''] = item.number.split('.');
  const pad = Math.max(0, item.zeros - frac.length);
  const out: Cell[] = [
    ...[...int].map((char, i): Cell => ({ key: `i${i}`, char, kind: 'digit' })),
    ...[...frac].map((char, i): Cell => ({ key: `f${i}`, char, kind: 'digit' })),
    ...Array.from({ length: pad }, (_, i): Cell => ({ key: `z${i}`, char: '0', kind: 'zero' })),
  ];
  const intLength = int.length + item.zeros;
  for (let at = intLength - 3; at > 0; at -= 3) {
    out.splice(at, 0, { key: `c${intLength - at}`, char: ',', kind: 'comma' });
  }
  if (frac.length > item.zeros) {
    const at = out.findIndex((cell) => cell.key === `f${item.zeros}`);
    out.splice(at, 0, { key: 'point', char: '.', kind: 'point' });
  }
  return out;
}

/**
 * How long each key waits before it is pressed, in ms. Digits run together, the point takes a
 * little longer, and the hand travels to the letter row for the suffix.
 */
const DIGIT_MS = [150, 120, 170];
const POINT_MS = 200;
const REACH_MS = 300;
/** The empty field before the first key, the beat on the suffix, and the result. */
const EMPTY_MS = 500;
const SUFFIX_MS = 300;
const RESULT_MS = 2200;

/** Seconds into the expansion. The suffix is fading out first, so the zeros do not land on it. */
const FILL_AT = DUR.instant;
/** Every zero and comma has started by here, however long the number is. */
const FILL_SPREAD = 0.24;

/** The pause after key `i`, set by the key that comes next. */
function pause(item: Item, i: number) {
  const next = item.typed[i + 1];
  if (i === item.typed.length - 1) return SUFFIX_MS;
  if (next === item.suffix) return REACH_MS;
  if (next === '.') return POINT_MS;
  return DIGIT_MS[i % DIGIT_MS.length];
}

type Frame = { item: Item; typed: number; expanded: boolean; ms: number };

/** One example: an empty field, a frame per keystroke, then the expansion. */
const TIMELINE: Frame[] = ITEMS.flatMap((item) => {
  const keys = item.typed.length;
  return [
    { item, typed: 0, expanded: false, ms: EMPTY_MS },
    ...Array.from({ length: keys }, (_, i) => ({
      item,
      typed: i + 1,
      expanded: false,
      ms: pause(item, i),
    })),
    { item, typed: keys, expanded: true, ms: RESULT_MS },
  ];
});

/**
 * Autoplays someone typing a shorthand value into a field. The moment the suffix lands it
 * expands: the decimal point moves, the empty places fill with zeros, the digits group.
 */
export function CompactNotationDemo() {
  const loop = useLoop({
    frames: TIMELINE.length,
    frameMs: (frame) => TIMELINE[frame].ms,
    holdMs: 0,
  });
  const { item, typed, expanded } = TIMELINE[loop.frame];
  const shown = expanded ? expandedCells(item) : typedCells(item).slice(0, typed);
  // What the expansion adds arrives left to right, inside one fixed window.
  const added = shown.filter((cell) => cell.kind === 'zero' || cell.kind === 'comma');
  const fillStep = Math.min(STAGGER.tight, FILL_SPREAD / Math.max(1, added.length - 1));
  // A caret blinks only while nothing is being typed.
  const idle = expanded || typed === 0;

  return (
    <figure className="not-prose my-8">
      <div
        ref={loop.ref}
        className="flex items-center gap-2 overflow-hidden rounded-xl bg-surface-1 py-5 pr-3 pl-4 shadow-border sm:pl-6"
      >
        <MotionConfig reducedMotion="user">
          <div className="h-10 min-w-0 flex-1">
            {/* A new example fades in; only the steps inside one example move characters. */}
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={item.typed}
                role="img"
                aria-label={`${item.typed} becomes ${item.formatted}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DUR.fast, ease: EASE.outExpo }}
                className="flex h-10 items-center font-mono text-[1.375rem] leading-none font-medium text-foreground select-none sm:text-[2rem]"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {shown.map((cell) => {
                    // Typed characters just appear. Only what the expansion adds animates in.
                    const order = added.indexOf(cell);
                    return (
                      <motion.span
                        key={cell.key}
                        layout="position"
                        initial={order >= 0 ? { opacity: 0, scale: 0.9 } : false}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{
                          opacity: 0,
                          transition: { duration: DUR.fast, ease: EASE.outExpo },
                        }}
                        transition={{
                          layout: SPRING,
                          duration: DUR.base,
                          ease: EASE.outExpo,
                          delay: order >= 0 ? FILL_AT + order * fillStep : 0,
                        }}
                        className={cn(
                          'inline-block',
                          cell.kind === 'suffix' && 'text-signal-amber-fg',
                          cell.kind === 'zero' && 'text-signal-sky-fg',
                          cell.kind === 'comma' && 'text-muted-foreground'
                        )}
                      >
                        {cell.char}
                      </motion.span>
                    );
                  })}
                  {/* Jumps with each keystroke, glides with the digits when the value expands. */}
                  <motion.span
                    key="caret"
                    aria-hidden
                    layout="position"
                    transition={{ layout: expanded ? SPRING : { duration: 0 } }}
                    className={cn(
                      'ml-px inline-block h-[1.15em] w-[1.5px] flex-none bg-foreground motion-reduce:hidden',
                      idle && 'animate-[demo-caret-blink_1.1s_steps(1)_infinite]'
                    )}
                  />
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>
          </div>
        </MotionConfig>
        <LoopToggle loop={loop} />
      </div>
    </figure>
  );
}
