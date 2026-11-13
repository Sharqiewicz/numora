import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { DiagramFrame, SPRING, useLoop } from './kit';

// One worst-case edit: type "8" in the middle of an already grouped number.
const VALUE = '1,234,567';
const CARET = 5;
const KEY = '8';
// What the browser writes: the old value with the character spliced in at the caret.
const NEXT = VALUE.slice(0, CARET) + KEY + VALUE.slice(CARET);

const EVENTS = ['keydown', 'beforeinput', 'DOM edit', 'input', 'keyup'] as const;

const CAPTIONS = [
  'keydown: the key goes down. Nothing has changed yet.',
  'beforeinput: the field still holds the old value. This is the last moment to cancel the edit.',
  'The browser writes the new value. It is too late to cancel.',
  'input: the edit is done.',
  'keyup: the key comes up. The value was already final.',
];

/** The label of "beforeinput" may wrap after "before" in a narrow cell. */
function label(e: (typeof EVENTS)[number]) {
  return e === 'beforeinput' ? (
    <>
      before
      <wbr />
      input
    </>
  ) : (
    e
  );
}

/** One keystroke, looping: the five steps light up in order and the field waits at beforeinput. */
export function EventPipelineLoop() {
  const loop = useLoop({
    frames: EVENTS.length,
    frameMs: (f) => (f === 1 ? 1600 : 750),
    holdMs: 1500,
  });
  const f = loop.frame;
  const written = f >= 2;
  const caret = written ? CARET + KEY.length : CARET;
  const value = written ? NEXT : VALUE;

  return (
    <DiagramFrame variant="diagram" title="One keystroke">
      <div ref={loop.ref} className="space-y-3">
        <ol className="grid grid-cols-5 gap-1" aria-label="Event order">
          {EVENTS.map((e, i) => {
            const amber = e === 'beforeinput';
            return (
              <li
                key={e}
                aria-current={f === i ? 'step' : undefined}
                className={cn(
                  'relative flex h-12 min-w-0 items-center justify-center rounded-md border px-0.5 text-center font-mono text-[11px] leading-tight sm:text-caption',
                  amber ? 'border-signal-amber-line text-signal-amber-fg' : 'border-border',
                  e === 'DOM edit' && 'border-dashed',
                  f === i && amber && 'bg-signal-amber-surface',
                  f === i && !amber && 'bg-surface-4 text-foreground',
                  f !== i && !amber && (f > i ? 'text-foreground' : 'text-muted-foreground')
                )}
              >
                {label(e)}
                {f === i && (
                  <motion.span
                    layoutId="pipeline-marker"
                    transition={SPRING}
                    aria-hidden
                    className={cn(
                      'absolute inset-x-1 -bottom-px h-0.5 rounded-full',
                      amber ? 'bg-signal-amber-fg' : 'bg-foreground'
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>

        <div className="rounded-lg border border-muted-icon bg-surface-1 px-3 py-2 font-mono text-base tabular-nums text-foreground">
          <span aria-hidden>
            {value.slice(0, caret)}
            <span className="mx-px inline-block h-[1.1em] w-0.5 translate-y-[0.2em] bg-signal-violet-fg align-baseline" />
            {value.slice(caret)}
          </span>
          <span className="sr-only">{value}</span>
        </div>

        <div className="grid text-pretty text-caption leading-relaxed text-muted-foreground">
          {CAPTIONS.map((c, i) => (
            <p
              key={c}
              aria-hidden={i !== f}
              className={cn(
                'col-start-1 row-start-1',
                i !== f && 'invisible',
                i === 1 && f === 1 && 'text-signal-amber-fg'
              )}
            >
              {c}
            </p>
          ))}
        </div>
      </div>
    </DiagramFrame>
  );
}
