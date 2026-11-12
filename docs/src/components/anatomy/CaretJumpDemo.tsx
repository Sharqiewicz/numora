import { Check, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DiagramFrame, SPRING } from './kit';

// One keystroke, an 8 typed after the 3 in 1,234,567, in fixed steps for both formatters.
// No live input: every frame is written out, so the two lanes can be compared step by step.

interface Side {
  text: string;
  /** Caret position as a character index. */
  caret: number;
  /** Index of the digit just typed. */
  fresh?: number;
  note: string;
  verdict?: 'right' | 'wrong';
}
interface Step {
  title: string;
  naive: Side;
  numora: Side;
}

const STEPS: Step[] = [
  {
    title: 'Click after the 3',
    naive: { text: '1,234,567', caret: 4, note: 'The caret sits after 3 digits.' },
    numora: { text: '1,234,567', caret: 4, note: 'The caret sits after 3 digits.' },
  },
  {
    title: 'Type 8',
    naive: {
      text: '1,2384,567',
      caret: 5,
      fresh: 4,
      note: 'The browser inserts the 8. The caret is right, the grouping is not.',
    },
    numora: {
      text: '1,234,567',
      caret: 4,
      note: 'Numora catches beforeinput. Nothing is written yet.',
    },
  },
  {
    title: 'Regroup',
    naive: {
      text: '12,384,567',
      caret: 10,
      fresh: 4,
      note: 'The formatter sets a new value, so the browser drops the caret at the end.',
      verdict: 'wrong',
    },
    numora: {
      text: '12,384,567',
      caret: 5,
      fresh: 4,
      note: 'Numora writes the grouped value and puts the caret after 4 digits.',
      verdict: 'right',
    },
  },
  {
    title: 'Type 9',
    naive: {
      text: '123,845,679',
      caret: 11,
      fresh: 10,
      note: 'The 9 lands at the end. You meant 123,894,567.',
      verdict: 'wrong',
    },
    numora: {
      text: '123,894,567',
      caret: 6,
      fresh: 5,
      note: 'The 9 lands after the 8, where you were typing.',
      verdict: 'right',
    },
  },
];

type Tone = 'naive' | 'numora';

// Same chip metrics as CursorAnchorDiagram, so the two figures read as one family.
const DIGIT_W = 26;
const SEP_W = 12;
const CHIP_H = 36;
const isDigit = (ch: string) => ch >= '0' && ch <= '9';
const charW = (ch: string) => (isDigit(ch) ? DIGIT_W : SEP_W);
const xAt = (s: string, index: number) =>
  [...s].slice(0, index).reduce((n, ch) => n + charW(ch), 0);

const buttonBase =
  'inline-flex h-10 items-center rounded-lg px-3 text-caption font-medium transition-[color,background-color,transform,opacity] duration-150 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.96] aria-disabled:cursor-default aria-disabled:opacity-50 aria-disabled:active:scale-100 motion-reduce:transition-none [@media(pointer:coarse)]:h-11';
const primaryButton = `${buttonBase} border border-border bg-surface-3 text-foreground hover:bg-surface-4`;
const quietButton = `${buttonBase} text-muted-foreground hover:bg-surface-4 hover:text-foreground aria-disabled:hover:bg-transparent aria-disabled:hover:text-muted-foreground`;
// 32px tall to the eye, 40px to the pointer: the ::before extends the hit area into the row gap.
const stepButton =
  'relative inline-flex h-8 items-center rounded-md px-2 text-caption font-medium tabular-nums text-muted-foreground transition-[color,background-color] duration-150 ease-out-expo before:absolute before:inset-x-0 before:-inset-y-1 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=step]:bg-surface-3 aria-[current=step]:text-foreground motion-reduce:transition-none [@media(pointer:coarse)]:h-11 [@media(pointer:coarse)]:before:hidden';

function Lane({ name, tone, index }: { name: string; tone: Tone; index: number }) {
  const reduced = useReducedMotion() ?? false;
  const side = STEPS[index][tone];
  const caretColor =
    tone === 'numora'
      ? 'bg-signal-violet-fg'
      : side.verdict === 'wrong'
        ? 'bg-signal-red-fg'
        : 'bg-foreground';

  return (
    <div className="grid gap-x-4 gap-y-2 @md:grid-cols-[8.5rem_1fr]">
      {/* 58px = the field's height, so the name centres on it. */}
      <p className="flex items-center gap-1.5 whitespace-nowrap text-caption font-medium text-foreground @md:h-[58px]">
        {name}
        {side.verdict === 'wrong' && <X className="size-3.5 text-signal-red-fg" aria-hidden />}
        {side.verdict === 'right' && (
          <Check className="size-3.5 text-signal-green-fg" aria-hidden />
        )}
      </p>
      <div className="min-w-0">
        {/* Drawn as a field, so the chips read as the input's text. */}
        <div
          aria-hidden
          className="pointer-events-none select-none rounded-lg border border-border bg-surface-2 px-3 py-2.5"
        >
          <div className="relative flex" style={{ height: CHIP_H }}>
            {[...side.text].map((ch, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: characters are positional
                key={i}
                className="flex shrink-0 items-center justify-center"
                style={{ width: charW(ch), height: CHIP_H }}
              >
                {isDigit(ch) ? (
                  <span
                    className={cn(
                      'flex h-9 w-[22px] items-center justify-center rounded-lg font-mono text-xl leading-none text-foreground',
                      i === side.fresh ? 'bg-surface-7' : 'bg-surface-4'
                    )}
                  >
                    {ch}
                  </span>
                ) : (
                  <span className="font-mono text-xl leading-none text-muted-foreground">{ch}</span>
                )}
              </span>
            ))}
            <motion.span
              className={cn('absolute -top-1 -left-px h-11 w-0.5 rounded-full', caretColor)}
              initial={false}
              animate={{ transform: `translateX(${xAt(side.text, side.caret)}px)` }}
              transition={reduced ? { duration: 0 } : SPRING}
            />
          </div>
        </div>
        {/* Every step's note shares one grid cell, so the tallest one sets the height and stepping never shifts the layout. */}
        <div className="mt-2 grid text-caption text-pretty text-muted-foreground">
          {STEPS.map((s, n) => (
            <p
              key={s.title}
              aria-hidden={n !== index}
              className={cn('col-start-1 row-start-1', n !== index && 'invisible')}
            >
              {s[tone].note}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CaretJumpDemo() {
  const [i, setI] = useState(0);
  const step = STEPS[i];
  const first = i === 0;
  const last = i === STEPS.length - 1;

  return (
    <DiagramFrame
      variant="demo"
      caption="One keystroke in slow motion, then the keystroke after it."
    >
      <div className="@container">
        <ol className="-mx-2 mb-5 flex flex-wrap gap-x-1 gap-y-2">
          {STEPS.map((s, n) => (
            <li key={s.title}>
              <button
                type="button"
                onClick={() => setI(n)}
                aria-current={n === i ? 'step' : undefined}
                className={stepButton}
              >
                {n + 1}. {s.title}
              </button>
            </li>
          ))}
        </ol>

        <div className="space-y-5">
          <Lane name="Naive formatter" tone="naive" index={i} />
          <Lane name="NumoraInput" tone="numora" index={i} />
        </div>
      </div>

      {/* Back comes first and keeps its width, so the label swap on the last step moves nothing. */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => !first && setI(i - 1)}
          aria-disabled={first}
          className={quietButton}
        >
          Back
        </button>
        <button type="button" onClick={() => setI(last ? 0 : i + 1)} className={primaryButton}>
          {last ? 'Start over' : 'Next step'}
        </button>
      </div>

      <p aria-live="polite" className="sr-only">
        Step {i + 1} of {STEPS.length}: {step.title}. Naive formatter: {step.naive.note}{' '}
        NumoraInput: {step.numora.note}
      </p>
    </DiagramFrame>
  );
}
