import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { formatValue, type GroupingStyle } from 'numora';
import { cn } from '@/lib/utils';
import { DiagramFrame, DUR, EASE, SPRING, useLoop } from '../kit';

const VALUE = '10000000';

/** One loop frame per style. The key beat (a style change) holds long enough to read. */
const STYLES: { id: GroupingStyle; label: string; rule: string }[] = [
  { id: 'none', label: 'None', rule: 'No separators.' },
  { id: 'thousand', label: 'Thousand', rule: 'Groups of 3 from the right.' },
  { id: 'lakh', label: 'Lakh', rule: '3 on the right, then groups of 2.' },
  { id: 'wan', label: 'Wan', rule: 'Groups of 4 from the right.' },
];

const frameMs = (f: number) => (f === 0 ? 900 : 1400);

/** The real formatter's output, split into digits (stable keys) and the separators it put between them. */
function layout(style: GroupingStyle) {
  const text = formatValue(VALUE, { groupingStyle: style, thousandSeparator: ',' });
  const items: { key: string; ch: string }[] = [];
  let digit = 0;
  for (const ch of text) {
    if (ch === ',') items.push({ key: `sep-${digit}`, ch });
    else items.push({ key: `d-${digit++}`, ch });
  }
  return { text, items };
}

export function GroupingStylesDiagram() {
  const reduced = useReducedMotion() ?? false;
  const loop = useLoop({ frames: STYLES.length, frameMs, holdMs: 1500 });
  const active = STYLES[loop.frame];
  const { text, items } = layout(active.id);
  const move = reduced ? { duration: 0 } : SPRING;

  return (
    <DiagramFrame sceneRef={loop.ref}>
      <fieldset className="m-0 flex min-w-0 flex-wrap gap-x-5 gap-y-1 border-0 p-0">
        <legend className="sr-only">Grouping style</legend>
        {STYLES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={loop.frame === i}
            onClick={() => loop.goTo(i)}
            className={cn(
              'min-h-11 border-b-2 px-0.5 text-[14px] font-medium transition-colors duration-150 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
              loop.frame === i
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {s.label}
          </button>
        ))}
      </fieldset>

      <div className="mt-5 flex min-h-12 items-center font-mono text-[28px] leading-none tabular-nums text-foreground sm:text-[32px]">
        <div aria-hidden className="flex items-baseline">
          <AnimatePresence mode="popLayout" initial={false}>
            {items.map((it) =>
              it.ch === ',' ? (
                <motion.span
                  key={it.key}
                  layout="position"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    layout: move,
                    opacity: { duration: reduced ? 0 : DUR.base, ease: EASE.outExpo },
                  }}
                  className="inline-block w-[0.4em] text-center font-bold text-signal-sky-fg"
                >
                  ,
                </motion.span>
              ) : (
                <motion.span
                  key={it.key}
                  layout="position"
                  transition={{ layout: move }}
                  className="inline-block w-[0.62em] text-center"
                >
                  {it.ch}
                </motion.span>
              )
            )}
          </AnimatePresence>
        </div>
        <output className="sr-only">{`${active.label} grouping: ${text}`}</output>
      </div>

      <p className="mt-3 text-caption text-muted-foreground">{active.rule}</p>
    </DiagramFrame>
  );
}
