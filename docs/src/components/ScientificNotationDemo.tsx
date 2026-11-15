import { AnimatePresence, motion } from 'motion/react';
import { formatValue } from 'numora';
import { DUR, EASE, FigureLabel, LoopFigure, STAGGER, useLoop } from '@/components/anatomy/kit';
import { cn } from '@/lib/utils';

type Cell = { char: string; kind: 'digit' | 'fill' | 'comma' };

/**
 * The expanded value, with what the expansion added marked as `fill`: the leading `0.000` of a
 * negative exponent, the trailing zeros of a positive one.
 */
function expandedCells(mantissa: string, exponent: number, expanded: string): Cell[] {
  const significant = mantissa.replace('.', '').length;
  let digits = 0;
  let started = false;
  return [...expanded].map((char): Cell => {
    if (char === ',') return { char, kind: 'comma' };
    if (exponent < 0) {
      if (!started && (char === '0' || char === '.')) return { char, kind: 'fill' };
      started = true;
      return { char, kind: 'digit' };
    }
    if (char !== '.') digits += 1;
    return { char, kind: digits > significant ? 'fill' : 'digit' };
  });
}

/** A small, a large and a capital-E value. The longest result still fits a phone. */
const ITEMS = ['1.5e-7', '2e+5', '1.23E-4'].map((pasted) => {
  const [mantissa, power] = pasted.split(/e/i);
  const exponent = Number(power);
  const expanded = formatValue(pasted, { decimalMaxLength: 18, thousandSeparator: ',' });
  return {
    pasted,
    mantissa,
    /** The `e-7` part, as pasted. */
    suffix: pasted.slice(mantissa.length),
    exponent,
    expanded,
    cells: expandedCells(mantissa, exponent, expanded),
  };
});

const SUPERSCRIPT: Record<string, string> = {
  '-': '⁻',
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
};
const superscript = (n: number) => [...String(n)].map((char) => SUPERSCRIPT[char]).join('');

type Step = 'empty' | 'pasted' | 'expanded';
const STEPS: { step: Step; ms: number; note: string }[] = [
  { step: 'empty', ms: 500, note: '' },
  { step: 'pasted', ms: 1000, note: 'Pasted' },
  { step: 'expanded', ms: 2200, note: 'Expanded to decimal notation' },
];
const TIMELINE = ITEMS.flatMap((item) => STEPS.map((step) => ({ item, ...step })));

/** Autoplays three pastes: the token lands in the field, then expands to decimal notation. */
export function ScientificNotationDemo() {
  const loop = useLoop({
    frames: TIMELINE.length,
    frameMs: (frame) => TIMELINE[frame].ms,
    holdMs: 0,
  });
  const { item, step, note } = TIMELINE[loop.frame];
  const fills = item.cells.filter((cell) => cell.kind !== 'digit');

  return (
    <LoopFigure loop={loop} note={note}>
      <FigureLabel>
        <code>
          {item.mantissa} × <strong>10{superscript(item.exponent)}</strong>
        </code>
      </FigureLabel>
      {/* A new value fades in; the paste and the expansion inside it just happen. */}
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={item.pasted}
          role="img"
          aria-label={`Pasting ${item.pasted} becomes ${item.expanded}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: DUR.fast, ease: EASE.outExpo }}
          className="mt-2 flex h-10 items-center font-mono text-[1.75rem] leading-none font-medium text-foreground select-none sm:text-[2rem]"
        >
          {step === 'pasted' && (
            <>
              <span>{item.mantissa}</span>
              <span className="text-signal-amber-fg">{item.suffix}</span>
            </>
          )}
          {step === 'expanded' &&
            item.cells.map((cell, i) => {
              // The pasted digits stay put. Only what the expansion adds animates in.
              const order = fills.indexOf(cell);
              return (
                <motion.span
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed string
                  key={i}
                  initial={order >= 0 ? { opacity: 0, scale: 0.9 } : false}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: DUR.base,
                    ease: EASE.outExpo,
                    delay: Math.max(0, order) * STAGGER.tight,
                  }}
                  className={cn(
                    'inline-block',
                    cell.kind === 'fill' && 'text-signal-sky-fg',
                    cell.kind === 'comma' && 'text-muted-foreground'
                  )}
                >
                  {cell.char}
                </motion.span>
              );
            })}
          <span
            aria-hidden
            className="ml-px inline-block h-[1.15em] w-[1.5px] flex-none animate-[demo-caret-blink_1.1s_steps(1)_infinite] bg-foreground motion-reduce:hidden"
          />
        </motion.div>
      </AnimatePresence>
    </LoopFigure>
  );
}
