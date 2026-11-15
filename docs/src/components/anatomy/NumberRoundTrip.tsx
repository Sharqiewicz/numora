import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { DUR, EASE, FigureLabel, LoopFigure, useLoop } from './kit';

/** Exact decimal product of a typed string and a whole number, with BigInt (no floats). */
function exactTimes(s: string, k: number): string {
  const [w, f = ''] = s.split('.');
  const big = (BigInt(w + f) * BigInt(k)).toString().padStart(f.length + 1, '0');
  if (!f) return big;
  const out = `${big.slice(0, big.length - f.length)}.${big.slice(big.length - f.length)}`;
  return out.replace(/0+$/, '').replace(/\.$/, '');
}

/** Index where the float product stops matching the exact answer. */
function diffAt(want: string, got: string) {
  let p = 0;
  while (p < got.length && got[p] === want[p]) p++;
  return p;
}

// Two sums a financial UI really does: a ratio times three, a price turned into cents.
// The field always holds what the user typed. The line below it is what the code computed.
const ITEMS = [
  { typed: '0.1', times: 3 },
  { typed: '19.99', times: 100 },
].map(({ typed, times }) => {
  const product = String(Number(typed) * times);
  const exact = exactTimes(typed, times);
  return { typed, times, product, exact, wrongFrom: diffAt(exact, product) };
});

type Frame = {
  item: (typeof ITEMS)[number];
  /** What the field holds. */
  value: string;
  /** True once the product shows under the field. */
  result: boolean;
  ms: number;
};

const TIMELINE: Frame[] = ITEMS.flatMap((item) => {
  const frames: Frame[] = [{ item, value: '', result: false, ms: 500 }];
  for (let i = 1; i <= item.typed.length; i++) {
    frames.push({
      item,
      value: item.typed.slice(0, i),
      result: false,
      ms: i === item.typed.length ? 650 : 170,
    });
  }
  frames.push({ item, value: item.typed, result: true, ms: 2600 });
  return frames;
});

/** Types a decimal, then shows what multiplying it as a Number gives. */
export function NumberRoundTrip() {
  const loop = useLoop({
    frames: TIMELINE.length,
    frameMs: (frame) => TIMELINE[frame].ms,
    holdMs: 0,
  });
  const { item, value, result } = TIMELINE[loop.frame];
  const idle = value === '' || result;

  return (
    <LoopFigure
      loop={loop}
      note={
        <>
          Gives{' '}
          <span className="font-mono text-foreground">
            {item.product.slice(0, item.wrongFrom)}
            <span className="text-signal-red-fg">{item.product.slice(item.wrongFrom)}</span>
          </span>
          , not <span className="font-mono text-foreground">{item.exact}</span>
        </>
      }
      noteShown={result}
    >
      <FigureLabel>
        <code>
          Number(value) <strong>* {item.times}</strong>
        </code>
      </FigureLabel>
      {/* A new value fades in; keystrokes inside one scene just appear. */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={item.typed}
          role="img"
          aria-label={`Typing ${item.typed} and multiplying it as a Number by ${item.times} gives ${item.product}, not ${item.exact}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.fast, ease: EASE.outExpo }}
          className="mt-2 flex h-10 items-center font-mono text-[1.75rem] leading-none font-medium text-foreground select-none sm:text-[2rem]"
        >
          <span>{value}</span>
          <span
            aria-hidden
            className={cn(
              'ml-px inline-block h-[1.15em] w-[1.5px] flex-none bg-foreground motion-reduce:hidden',
              idle && 'animate-[demo-caret-blink_1.1s_steps(1)_infinite]'
            )}
          />
        </motion.div>
      </AnimatePresence>
    </LoopFigure>
  );
}
