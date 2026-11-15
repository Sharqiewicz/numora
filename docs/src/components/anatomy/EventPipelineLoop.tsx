import { formatValue } from 'numora';
import type { ReactNode } from 'react';
import { LoopFigure, useLoop } from '@/components/anatomy/kit';
import { cn } from '@/lib/utils';

// One worst-case edit in a Numora field: type "8" in the middle of an already grouped number.
const BEFORE = '1,234,567';
const CARET = 5;
const KEY = '8';

/** What the browser would write on its own: the key spliced in at the caret. */
const SPLICED = BEFORE.slice(0, CARET) + KEY + BEFORE.slice(CARET);
/** What Numora writes instead, from the library. */
const AFTER = formatValue(SPLICED.replaceAll(',', ''), { thousandSeparator: ',' });

/** Index in `AFTER` just past the typed digit: the same count of digits sits left of it. */
const KEY_END = (() => {
  let digits = SPLICED.slice(0, CARET + 1).replaceAll(',', '').length;
  let i = 0;
  while (digits > 0) if (AFTER[i++] !== ',') digits--;
  return i;
})();

const mono = (text: string) => <span className="font-mono text-foreground">{text}</span>;

type Step = {
  name: string;
  /** Numora cancelled the edit at beforeinput, so this step never happens. */
  skipped?: boolean;
  note: ReactNode;
  ms: number;
};

// Each frame stays up long enough to read its note; beforeinput, the key beat, holds longest.
const STEPS: Step[] = [
  { name: 'keydown', note: 'Key down. Nothing changes yet', ms: 1300 },
  {
    name: 'beforeinput',
    note: <>Numora writes {mono(AFTER)} itself</>,
    ms: 2600,
  },
  {
    name: 'DOM edit',
    skipped: true,
    note: <>Skipped, so no {mono(SPLICED)}</>,
    ms: 2200,
  },
  {
    name: 'input',
    skipped: true,
    note: 'Never fires after a cancelled edit',
    ms: 1800,
  },
  { name: 'keyup', note: 'Key up. Numora ignores it', ms: 2000 },
];

/** Commas are separators, not digits: they sit back from the numbers. */
function Chars({ text }: { text: string }) {
  return [...text].map((char, i) => (
    // biome-ignore lint/suspicious/noArrayIndexKey: fixed string
    <span key={i} className={cn(char === ',' && 'text-muted-foreground')}>
      {char}
    </span>
  ));
}

/**
 * One keystroke in a Numora field, looping: the five steps of a keypress, and which of them still
 * happen once Numora cancels the edit at beforeinput. Each step name is a button, so the reader
 * can go through at their own pace (and under reduced motion, where nothing autoplays).
 */
export function EventPipelineLoop() {
  const loop = useLoop({
    frames: STEPS.length,
    frameMs: (frame) => STEPS[frame].ms,
    holdMs: 0,
  });
  const f = loop.frame;
  const written = f >= 1;

  return (
    <LoopFigure loop={loop} note={STEPS[f].note} step={{ current: f + 1, total: STEPS.length }}>
      {/* The buttons carry their own padding for a tall hit area; the list pulls it back. */}
      <ol
        aria-label="Event order"
        className="-my-2.5 -ml-1.5 flex list-none flex-wrap items-center p-0 font-mono text-caption leading-5 text-muted-foreground"
      >
        {STEPS.map((step, i) => (
          <li key={step.name} className="flex items-center">
            {i > 0 && <span aria-hidden>›</span>}
            <button
              type="button"
              aria-current={f === i ? 'step' : undefined}
              aria-label={step.skipped ? `${step.name}, skipped` : undefined}
              onClick={() => loop.goTo(i)}
              className="group cursor-pointer touch-manipulation bg-transparent px-0.5 py-2.5 font-mono text-caption focus-visible:outline-none"
            >
              {/* The pill is the state; the button around it is the 44px hit area. */}
              <span
                className={cn(
                  'block rounded-sm px-1 py-0.5 transition-colors duration-150 ease-out-expo group-focus-visible:ring-2 group-focus-visible:ring-ring motion-reduce:transition-none',
                  f === i
                    ? 'bg-foreground text-background'
                    : step.skipped && written
                      ? // Struck through from the moment the edit is cancelled.
                        'text-muted-foreground line-through [@media(hover:hover)]:group-hover:text-foreground'
                      : i < f
                        ? 'text-foreground'
                        : 'text-muted-foreground [@media(hover:hover)]:group-hover:text-foreground'
                )}
              >
                {step.name}
              </span>
            </button>
          </li>
        ))}
      </ol>
      <div
        role="img"
        aria-label={
          written
            ? `Numora wrote ${AFTER}. The browser's own edit, ${SPLICED}, never happened`
            : `The field holds ${BEFORE} with the caret after ${BEFORE.slice(0, CARET)}`
        }
        className="relative mt-2 flex h-10 items-center font-mono text-[1.75rem] leading-none font-medium text-foreground select-none sm:text-[2rem]"
      >
        {written ? (
          <>
            <Chars text={AFTER.slice(0, KEY_END - 1)} />
            <span className="text-signal-amber-fg">{KEY}</span>
          </>
        ) : (
          <Chars text={BEFORE.slice(0, CARET)} />
        )}
        <span
          aria-hidden
          className={cn(
            'ml-px inline-block h-[1.15em] w-[1.5px] flex-none bg-foreground motion-reduce:hidden',
            // Solid on the beat where the value was just written.
            f !== 1 && 'animate-[demo-caret-blink_1.1s_steps(1)_infinite]'
          )}
        />
        <Chars text={written ? AFTER.slice(KEY_END) : BEFORE.slice(CARET)} />
      </div>
    </LoopFigure>
  );
}
