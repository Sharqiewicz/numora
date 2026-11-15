import { Check, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { formatValue } from 'numora';
import { cn } from '@/lib/utils';
import {
  DiagramFrame,
  DUR,
  EASE,
  type Loop,
  LoopFade,
  readMs,
  SPRING,
  Typewriter,
  useLoop,
} from './kit';

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
  /** One id per digit, in order. A digit keeps its id, so it glides when the value regroups. */
  ids: string[];
}

/** The digits the field starts with, then the two typed ones. */
const START_IDS = [...RAW].map((_, i) => `o${i}`);
const [T1, T2] = ['t1', 't2'];
const isTyped = (id: string) => id === T1 || id === T2;
const insert = (ids: string[], at: number, id: string) => [
  ...ids.slice(0, at),
  id,
  ...ids.slice(at),
];

function buildFrames() {
  const start = format(RAW);
  const c0 = afterDigit(start, RANK);
  const s0: Snap = { text: start, caret: c0, ids: START_IDS };
  const afterFirst = insert(START_IDS, RANK, T1);

  // Naive: the browser inserts at the caret, the formatter regroups, the caret lands at the end.
  const n1 = naiveGroup(start.slice(0, c0) + D1 + start.slice(c0));
  const n2 = naiveGroup(n1 + D2);
  const naive: Snap[] = [
    s0,
    { text: n1, caret: n1.length, ids: afterFirst },
    { text: n2, caret: n2.length, ids: [...afterFirst, T2] },
  ];

  const r1 = numoraType(RAW, RANK, D1);
  const r2 = numoraType(r1.raw, r1.rank, D2);
  const numora: Snap[] = [
    s0,
    { text: r1.text, caret: r1.caret, ids: afterFirst },
    { text: r2.text, caret: r2.caret, ids: insert(afterFirst, RANK + 1, T2) },
  ];
  return { naive, numora, meant: format(RAW.slice(0, RANK) + D1 + D2 + RAW.slice(RANK)) };
}

const { naive: NAIVE, numora: NUMORA, meant: MEANT } = buildFrames();

const NOTES = [
  `Caret after the ${RAW[RANK - 1]}. Type ${D1}, then ${D2}. You mean ${MEANT}.`,
  `After ${D1}: naive drops the caret at the end. Numora keeps it after the ${D1}.`,
  `The ${D2} lands at the end in naive. Numora puts it after the ${D1}.`,
];
/** Each note is typed and read, then the reader gets a beat to compare the two lanes. */
const COMPARE_MS = 900;
const TIMES = NOTES.map((note) => readMs(note) + COMPARE_MS);

const W_DIGIT = 20;
const W_SEP = 10;
const cw = (ch: string) => (isDigit(ch) ? W_DIGIT : W_SEP);
const xAt = (s: string, n: number) => [...s].slice(0, n).reduce((a, ch) => a + cw(ch), 0);

function Lane({
  name,
  snap,
  caretClass,
  verdict,
  loop,
}: {
  name: string;
  snap: Snap;
  caretClass: string;
  verdict?: 'right' | 'wrong';
  loop: Loop;
}) {
  const reduced = useReducedMotion() ?? false;
  // The restart is a cut under the fade: nothing glides back on the first frame.
  const still = reduced || loop.frame === 0;
  const fade = { duration: DUR.fast, ease: EASE.outExpo };
  let digit = 0;
  const cells = [...snap.text].map((ch) =>
    isDigit(ch)
      ? { ch, id: snap.ids[digit++] }
      : // A separator is named by the digits to its right, so it stays put while digits pass it.
        { ch, id: `s${snap.ids.length - digit}` }
  );
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-caption font-medium text-foreground">
        {name}
        <span className="inline-flex size-4 items-center justify-center">
          {verdict === 'wrong' && (
            <X className="size-3.5 text-signal-red-fg" role="img" aria-label="Wrong number" />
          )}
          {verdict === 'right' && (
            <Check className="size-3.5 text-signal-green-fg" role="img" aria-label="Right number" />
          )}
        </span>
      </p>
      <div
        role="img"
        aria-label={`${name}: ${snap.text}`}
        className="rounded-lg border border-border bg-surface-1 px-3 py-2.5"
      >
        <LoopFade loop={loop} block className="relative flex h-8">
          <AnimatePresence initial={false} mode="popLayout">
            {cells.map(({ ch, id }) => (
              <motion.span
                key={id}
                layout="position"
                initial={still ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: DUR.instant, ease: EASE.outExpo } }}
                transition={{ layout: still ? { duration: 0 } : SPRING, ...fade }}
                className="flex h-8 shrink-0 items-center justify-center"
                style={{ width: cw(ch) }}
              >
                {isDigit(ch) ? (
                  <span
                    className={cn(
                      'flex h-8 w-[18px] items-center justify-center rounded-md font-mono text-base leading-none',
                      // The two typed digits keep their colour, so the reader can find them again.
                      isTyped(id)
                        ? 'bg-signal-amber-surface text-signal-amber-fg'
                        : 'bg-surface-4 text-foreground'
                    )}
                  >
                    {ch}
                  </span>
                ) : (
                  <span className="font-mono text-base leading-none text-muted-foreground">
                    {ch}
                  </span>
                )}
              </motion.span>
            ))}
          </AnimatePresence>
          <motion.span
            className={cn('absolute -top-0.5 -left-px h-9 w-0.5 rounded-full', caretClass)}
            initial={false}
            animate={{ transform: `translateX(${xAt(snap.text, snap.caret)}px)` }}
            transition={still ? { duration: 0 } : SPRING}
          />
        </LoopFade>
      </div>
    </div>
  );
}

export function CursorLanes() {
  const loop = useLoop({ frames: NOTES.length, frameMs: (f) => TIMES[f], holdMs: 800 });
  const f = loop.frame;
  const last = f === NOTES.length - 1;

  return (
    <DiagramFrame variant="diagram" loop={loop} steps>
      <div ref={loop.ref} className="space-y-4">
        <Lane
          name="Naive formatter"
          snap={NAIVE[f]}
          caretClass={f >= 1 ? 'bg-signal-red-fg' : 'bg-foreground'}
          verdict={last ? 'wrong' : undefined}
          loop={loop}
        />
        <Lane
          name="NumoraInput"
          snap={NUMORA[f]}
          caretClass="bg-signal-violet-fg"
          verdict={last ? 'right' : undefined}
          loop={loop}
        />
        {/* Every note is laid out in one grid cell, so the tallest sets the height. */}
        <div className="grid text-caption text-pretty text-muted-foreground">
          {NOTES.map((note) => (
            <p key={note} aria-hidden className="invisible col-start-1 row-start-1">
              {note}
            </p>
          ))}
          <p className="col-start-1 row-start-1">
            <Typewriter text={NOTES[f]} />
          </p>
        </div>
      </div>
    </DiagramFrame>
  );
}
