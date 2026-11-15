import { Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { formatValue } from 'numora';
import { handleOnKeyDownNumoraInput } from 'numora/internal';
import { useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { DiagramFrame, DUR, EASE, LoopFade, SPRING, SPRING_FAST, Typewriter, useLoop } from './kit';

// One worst-case press: Backspace with the caret right after the comma in 1,234 (1,|234).
const VALUE = '1,234';
const CARET = 2;
const OPTS = { formatOn: 'change', thousandSeparator: ',' } as const;

interface Edit {
  value: string;
  caret: number;
}

const digits = (s: string) => s.replace(/[^0-9]/g, '');
const group = (d: string) => (d === '' ? '' : formatValue(d, { thousandSeparator: ',' }));

function caretAfterDigits(formatted: string, n: number): number {
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/[0-9]/.test(formatted[i])) seen++;
    if (seen === n) return i + 1;
  }
  return n <= 0 ? 0 : formatted.length;
}

/** What the browser does with Backspace on a collapsed caret. */
const nativeBackspace = (e: Edit): Edit => ({
  value: e.value.slice(0, e.caret - 1) + e.value.slice(e.caret),
  caret: e.caret - 1,
});

/**
 * Both fields run real code. Naive: strip commas, regroup, keep the caret at the same distance
 * from the end. Numora: the library's own keydown handler, then the digit is deleted and the
 * value regrouped with the caret after the digits that stood left of it.
 */
function compute() {
  const start: Edit = { value: VALUE, caret: CARET };

  const raw = nativeBackspace(start);
  const fromEnd = raw.value.length - raw.caret;
  const naiveValue = group(digits(raw.value));
  const naiveAfter: Edit = { value: naiveValue, caret: Math.max(0, naiveValue.length - fromEnd) };

  const fake = {
    value: start.value,
    selectionStart: start.caret,
    selectionEnd: start.caret,
    setSelectionRange(s: number, e: number) {
      this.selectionStart = s;
      this.selectionEnd = e;
    },
  };
  handleOnKeyDownNumoraInput({ key: 'Backspace', target: fake } as unknown as KeyboardEvent, OPTS);
  const skipped: Edit = { value: start.value, caret: fake.selectionStart };
  const gone = nativeBackspace(skipped);
  const value = group(digits(gone.value));
  const numoraAfter: Edit = {
    value,
    caret: caretAfterDigits(value, digits(gone.value.slice(0, gone.caret)).length),
  };
  return { start, naiveRaw: raw, naiveAfter, skipped, numoraAfter };
}

// 0 idle | 1 key down | 2 naive settles | 3 switch | 4 key down | 5 Numora settles
const FRAMES = 6;
// Each frame brings one short sentence. The two verdict frames (2 and 5) get the longest read.
const TIMES = [2000, 2200, 2800, 2400, 2200, 2400];
/** How long the key stays pushed down at the start of a key-down frame. */
const PRESS_MS = 220;
const frameMs = (f: number) => TIMES[f];

/**
 * The value as plain field text with a drawn caret. Every digit of `VALUE` is different, so the
 * digit itself is the key: a deleted character fades out and the rest slide closed.
 */
function Field({ edit, tone, still }: { edit: Edit; tone: 'plain' | 'numora'; still: boolean }) {
  const fade = { duration: DUR.fast, ease: EASE.outExpo };
  const chars = [...edit.value].map((ch) => ({ ch, key: ch === ',' ? 'sep' : `d${ch}` }));
  const cell = (ch: string, key: string) => (
    <motion.span
      key={key}
      aria-hidden
      layout="position"
      initial={still ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: fade }}
      transition={{ layout: still ? { duration: 0 } : SPRING, ...fade }}
      className={cn('inline-block', ch === ',' ? 'text-muted-foreground' : 'text-foreground')}
    >
      {ch}
    </motion.span>
  );
  return (
    <div
      className="relative flex h-9 items-center font-mono text-2xl leading-none tabular-nums"
      role="img"
      aria-label={`${edit.value.slice(0, edit.caret)} caret ${edit.value.slice(edit.caret)}`.trim()}
    >
      <AnimatePresence initial={false} mode="popLayout">
        {chars.slice(0, edit.caret).map(({ ch, key }) => cell(ch, key))}
        {/* Zero width, so the caret never pushes the text. It moves with the characters. */}
        <motion.span
          key="caret"
          aria-hidden
          layout="position"
          transition={{ layout: still ? { duration: 0 } : SPRING_FAST }}
          className="relative inline-block h-7 w-0 flex-none"
        >
          <span
            className={cn(
              'absolute inset-y-0 -left-px w-0.5 rounded-full',
              tone === 'numora' ? 'bg-signal-violet-fg' : 'bg-foreground'
            )}
          />
        </motion.span>
        {chars.slice(edit.caret).map(({ ch, key }) => cell(ch, key))}
      </AnimatePresence>
    </div>
  );
}

/** Stuck, then fixed: the same Backspace in a naive field, then with Numora's keydown skip. */
export function BackspaceSkipFigure() {
  const loop = useLoop({ frames: FRAMES, frameMs, holdMs: 800 });
  const s = useMemo(compute, []);
  const f = loop.frame;
  const fixed = f >= 3;
  const down = f === 1 || f === 4;
  // The key goes down and comes back up, while the frame stays long enough to read.
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    if (!down) return;
    setPressed(true);
    const id = setTimeout(() => setPressed(false), PRESS_MS);
    return () => {
      clearTimeout(id);
      setPressed(false);
    };
  }, [down]);

  let edit = s.start;
  let note = 'Caret sits after the comma.';
  let verdict: 'bad' | 'good' | null = null;
  if (f === 1) [edit, note] = [s.naiveRaw, 'Backspace deletes the comma.'];
  if (f === 2)
    [edit, note, verdict] = [s.naiveAfter, 'It comes straight back. Nothing changed.', 'bad'];
  if (f === 3) note = 'Same field, now with the keydown skip.';
  if (f === 4) [edit, note] = [s.skipped, 'The caret hops over the comma.'];
  if (f === 5) [edit, note, verdict] = [s.numoraAfter, 'The 1 is deleted.', 'good'];

  return (
    <DiagramFrame title="Backspace after a comma" loop={loop} steps>
      <div ref={loop.ref} className="space-y-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              'inline-flex min-w-[6.5rem] items-center justify-center rounded-md border px-3 py-1.5 font-mono text-caption transition-[transform,background-color,border-color,color] duration-100 ease-out-expo motion-reduce:transition-none',
              down
                ? 'border-signal-amber-line bg-signal-amber-surface text-signal-amber-fg'
                : 'border-border bg-surface-4 text-foreground',
              pressed && 'translate-y-0.5 scale-[0.96]'
            )}
          >
            Backspace
          </span>
          <span
            className={cn(
              'rounded-md border px-2 py-0.5 text-xs font-medium',
              fixed
                ? 'border-signal-violet-line bg-signal-violet-surface text-signal-violet-fg'
                : 'border-border bg-surface-4 text-foreground'
            )}
          >
            <LoopFade loop={loop}>{fixed ? 'With keydown skip' : 'Naive field'}</LoopFade>
          </span>
        </div>
        <div className="rounded-lg border border-border bg-surface-1 p-3">
          <LoopFade loop={loop} block>
            {/* The caret jumps back on the first frame: the restart is a cut under the fade. */}
            <Field edit={edit} tone={fixed ? 'numora' : 'plain'} still={loop.reduced || f === 0} />
            <p className="mt-1 flex h-5 items-center gap-1.5 text-caption text-muted-foreground">
              {verdict === 'bad' && (
                <X className="size-3.5 shrink-0 text-signal-red-fg" aria-hidden />
              )}
              {verdict === 'good' && (
                <Check className="size-3.5 shrink-0 text-signal-green-fg" aria-hidden />
              )}
              <Typewriter text={note} className="truncate" />
            </p>
          </LoopFade>
        </div>
      </div>
    </DiagramFrame>
  );
}
