import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { formatValue, type GroupingStyle } from 'numora';
import { cn } from '@/lib/utils';
import { DiagramFrame, DUR, EASE, SPRING, Typewriter, useLoop } from '../kit';

/** Eight different digits, so the reader sees them stay put while the separators move. */
const VALUE = '12345678';

/** One loop frame per style. The key beat (a style change) holds long enough to read. */
const STYLES: { id: GroupingStyle; label: string; rule: string }[] = [
  { id: 'none', label: 'None', rule: 'No separators.' },
  { id: 'thousand', label: 'Thousand', rule: 'Groups of 3 from the right.' },
  { id: 'lakh', label: 'Lakh', rule: '3 on the right, then groups of 2.' },
  { id: 'wan', label: 'Wan', rule: 'Groups of 4 from the right.' },
];

/** Long enough to watch the separators move, then read the rule and check it against the digits. */
const FRAME_MS = 2800;

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
  const loop = useLoop({ frames: STYLES.length, frameMs: FRAME_MS, holdMs: 0 });
  const active = STYLES[loop.frame];
  const { text, items } = layout(active.id);
  const move = reduced ? { duration: 0 } : SPRING;

  return (
    <DiagramFrame
      sceneRef={loop.ref}
      loop={loop}
      // The tabs are the step control: 44px tall around a 20px line of text.
      controls={
        <fieldset className="m-0 -ml-2 flex min-w-0 flex-1 flex-wrap gap-1 border-0 p-0">
          <legend className="sr-only">Grouping style</legend>
          {STYLES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={loop.frame === i}
              onClick={() => loop.goTo(i)}
              // 44px in both directions; the underline stays as wide as the word.
              className={cn(
                'inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-md px-2 text-[14px] font-medium transition-colors duration-150 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none',
                loop.frame === i ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span
                className={cn(
                  'border-b-2 py-2.5 transition-[border-color] duration-150 ease-out-expo motion-reduce:transition-none',
                  loop.frame === i ? 'border-foreground' : 'border-transparent'
                )}
              >
                {s.label}
              </span>
            </button>
          ))}
        </fieldset>
      }
    >
      <div className="flex min-h-12 items-center font-mono text-[28px] leading-none tabular-nums text-foreground sm:text-[32px]">
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
                  // The glyph is wider than its box. Centring it keeps the overhang even on both sides.
                  className="inline-flex w-[0.4em] justify-center font-bold text-signal-sky-fg"
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

      <p className="mt-2 text-caption text-muted-foreground">
        <Typewriter text={active.rule} />
      </p>
    </DiagramFrame>
  );
}
