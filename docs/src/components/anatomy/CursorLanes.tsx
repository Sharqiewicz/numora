import { Check, X } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { formatValue } from 'numora';
import { cn } from '@/lib/utils';
import { DiagramFrame, SPRING, useLoop } from './kit';

// One keystroke pair, an 8 then a 9 typed after the 3 in 1,234,567, drawn for a naive formatter
// and for Numora. The caret is drawn, so nothing needs focus. Every frame is computed below from
// a real naive regroup and the real `formatValue` + caret walk, not written out by hand.

const RAW = '1234567';
const RANK = 3;
const [D1, D2] = ['8', '9'];
const SEP = ',';

const isDigit = (ch: string) => ch >= '0' && ch <= '9';
const digitsOf = (s: string) => s.replace(/\D/g, '');
const format = (raw: string) =>
  formatValue(raw, { thousandSeparator: SEP, groupingStyle: 'thousand' });
const naiveGroup = (s: string) => digitsOf(s).replace(/\B(?=(\d{3})+(?!\d))/g, SEP);

/** Index just after the `n`th digit of `text`. */
function afterDigit(text: string, n: number) {
  let seen = 0;
  for (let i = 0; i < text.length; i++) {
    if (isDigit(text[i]) && ++seen === n) return i + 1;
  }
  return n === 0 ? 0 : text.length;
}

/**
 * Same walk as `positionAfterMatchedPrefix` in packages/core/src/features/formatting/rank-select.ts
 * (numora does not export it): step through `formatted` and `prefix` together, skipping separators,
 * and return the index after the last character of `prefix` that still matches.
 */
function positionAfterMatchedPrefix(formatted: string, prefix: string, separator: string) {
  let j = 0;
  let pos = 0;
  for (let i = 0; i < formatted.length; i++) {
    const ch = formatted[i];
    if (ch === separator) continue;
    while (prefix[j] === separator) j++;
    if (prefix[j] !== ch) break;
    j++;
    pos = i + 1;
  }
  return pos;
}

/** Numora's keystroke: insert at `rank`, format, put the caret after `rank + 1` digits again. */
function numoraType(raw: string, rank: number, digit: string) {
  const next = raw.slice(0, rank) + digit + raw.slice(rank);
  const text = format(next);
  return {
    raw: next,
    rank: rank + 1,
    text,
    caret: positionAfterMatchedPrefix(text, next.slice(0, rank + 1), SEP),
  };
}

interface Snap {
  text: string;
  caret: number;
  /** Index of the digit just typed. */
  fresh?: number;
}

function buildFrames() {
  const start = format(RAW);
  const c0 = afterDigit(start, RANK);
  const s0: Snap = { text: start, caret: c0 };

  // Naive: the browser inserts at the caret, the formatter regroups, the caret lands at the end.
  const n1 = naiveGroup(start.slice(0, c0) + D1 + start.slice(c0));
  const n2 = naiveGroup(n1 + D2);
  const naive: Snap[] = [
    s0,
    { text: n1, caret: n1.length, fresh: afterDigit(n1, RANK + 1) - 1 },
    { text: n2, caret: n2.length, fresh: n2.length - 1 },
  ];

  const r1 = numoraType(RAW, RANK, D1);
  const r2 = numoraType(r1.raw, r1.rank, D2);
  const numora: Snap[] = [
    s0,
    { text: r1.text, caret: r1.caret, fresh: r1.caret - 1 },
    { text: r2.text, caret: r2.caret, fresh: r2.caret - 1 },
  ];
  return { naive, numora, meant: format(RAW.slice(0, RANK) + D1 + D2 + RAW.slice(RANK)) };
}

const { naive: NAIVE, numora: NUMORA, meant: MEANT } = buildFrames();

const NOTES = [
  `Caret after the ${RAW[RANK - 1]}. Type ${D1}, then ${D2}. You mean ${MEANT}.`,
  `After ${D1}: naive drops the caret at the end. Numora keeps it after the ${D1}.`,
  `The ${D2} lands at the end in naive. Numora puts it after the ${D1}.`,
];
const TIMES = [1400, 1900, 1000];

const W_DIGIT = 20;
const W_SEP = 10;
const cw = (ch: string) => (isDigit(ch) ? W_DIGIT : W_SEP);
const xAt = (s: string, n: number) => [...s].slice(0, n).reduce((a, ch) => a + cw(ch), 0);

function Lane({
  name,
  snap,
  caretClass,
  verdict,
}: {
  name: string;
  snap: Snap;
  caretClass: string;
  verdict?: 'right' | 'wrong';
}) {
  const reduced = useReducedMotion() ?? false;
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-caption font-medium text-foreground">
        {name}
        <span className="inline-flex size-4 items-center justify-center">
          {verdict === 'wrong' && (
            <X className="size-3.5 text-signal-red-fg" aria-label="Wrong number" />
          )}
          {verdict === 'right' && (
            <Check className="size-3.5 text-signal-green-fg" aria-label="Right number" />
          )}
        </span>
      </p>
      <div
        role="img"
        aria-label={`${name}: ${snap.text}`}
        className="rounded-lg border border-border bg-surface-2 px-3 py-2.5"
      >
        <div className="relative flex h-8">
          {[...snap.text].map((ch, i) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: characters are positional
              key={i}
              className="flex h-8 shrink-0 items-center justify-center"
              style={{ width: cw(ch) }}
            >
              {isDigit(ch) ? (
                <span
                  className={cn(
                    'flex h-8 w-[18px] items-center justify-center rounded-md font-mono text-base leading-none text-foreground',
                    i === snap.fresh ? 'bg-surface-7' : 'bg-surface-4'
                  )}
                >
                  {ch}
                </span>
              ) : (
                <span className="font-mono text-base leading-none text-muted-foreground">{ch}</span>
              )}
            </span>
          ))}
          <motion.span
            className={cn('absolute -top-0.5 -left-px h-9 w-0.5 rounded-full', caretClass)}
            initial={false}
            animate={{ transform: `translateX(${xAt(snap.text, snap.caret)}px)` }}
            transition={reduced ? { duration: 0 } : SPRING}
          />
        </div>
      </div>
    </div>
  );
}

export function CursorLanes() {
  const loop = useLoop({ frames: NOTES.length, frameMs: (f) => TIMES[f], holdMs: 1800 });
  const f = loop.frame;
  const last = f === NOTES.length - 1;

  return (
    <DiagramFrame variant="diagram">
      <div ref={loop.ref} className="space-y-4">
        <Lane
          name="Naive formatter"
          snap={NAIVE[f]}
          caretClass={f >= 1 ? 'bg-signal-red-fg' : 'bg-foreground'}
          verdict={last ? 'wrong' : undefined}
        />
        <Lane
          name="NumoraInput"
          snap={NUMORA[f]}
          caretClass="bg-signal-violet-fg"
          verdict={last ? 'right' : undefined}
        />
        {/* All notes share one grid cell, so the tallest sets the height. */}
        <div className="grid text-caption text-pretty text-muted-foreground">
          {NOTES.map((note, n) => (
            <p
              key={note}
              aria-hidden={n !== f}
              className={cn('col-start-1 row-start-1', n !== f && 'invisible')}
            >
              {note}
            </p>
          ))}
        </div>
      </div>
    </DiagramFrame>
  );
}
