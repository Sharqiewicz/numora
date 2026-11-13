import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { formatValue } from 'numora';
import { handleOnKeyDownNumoraInput } from 'numora/internal';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { DiagramFrame, SPRING_FAST, useLoop } from './kit';

// One worst-case press: Backspace with the caret right after the comma in 1,234 (1,|234).
const VALUE = '1,234';
const CARET = 2;
const OPTS = { formatOn: 'change', thousandSeparator: ',' } as const;
const CELLS = VALUE.length;

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
const TIMES = [700, 600, 1100, 800, 600, 1200];
const frameMs = (f: number) => TIMES[f];

function Field({
  edit,
  tone,
  bad,
  still,
}: {
  edit: Edit;
  tone: 'plain' | 'numora';
  bad: boolean;
  still: boolean;
}) {
  return (
    <div
      className="relative h-9 w-full max-w-[16rem] font-mono text-xl tabular-nums"
      role="img"
      aria-label={`${edit.value.slice(0, edit.caret)} caret ${edit.value.slice(edit.caret)}`.trim()}
    >
      {[...edit.value].map((ch, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed cells, position is identity
          key={i}
          aria-hidden
          className={cn(
            'absolute top-0 flex h-9 items-center justify-center',
            bad ? 'text-signal-red-fg' : ch === ',' ? 'text-muted-foreground' : 'text-foreground'
          )}
          style={{ left: `${(i / CELLS) * 100}%`, width: `${100 / CELLS}%` }}
        >
          {ch}
        </span>
      ))}
      <motion.span
        aria-hidden
        className="absolute inset-0"
        initial={false}
        animate={{ x: `${(edit.caret / CELLS) * 100}%` }}
        transition={still ? { duration: 0 } : SPRING_FAST}
      >
        <span
          className={cn(
            'absolute top-1 left-0 h-7 w-0.5 -translate-x-px rounded-full',
            tone === 'numora' ? 'bg-signal-violet-fg' : 'bg-foreground'
          )}
        />
      </motion.span>
    </div>
  );
}

/** Stuck, then fixed: the same Backspace in a naive field, then with Numora's keydown skip. */
export function BackspaceSkipFigure() {
  const loop = useLoop({ frames: FRAMES, frameMs, holdMs: 1500 });
  const s = useMemo(compute, []);
  const f = loop.frame;
  const fixed = f >= 3;
  const down = f === 1 || f === 4;

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
    <DiagramFrame title="Backspace after a comma">
      <div ref={loop.ref} className="space-y-3">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className={cn(
              'inline-flex min-w-[6.5rem] items-center justify-center rounded-md border px-3 py-1.5 font-mono text-caption transition-[transform,background-color,border-color,color] duration-100 ease-out-expo motion-reduce:transition-none',
              down
                ? 'translate-y-0.5 scale-[0.96] border-signal-amber-line bg-signal-amber-surface text-signal-amber-fg'
                : 'border-border bg-surface-4 text-foreground'
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
            {fixed ? 'With keydown skip' : 'Naive field'}
          </span>
        </div>
        <div className="rounded-lg border border-border bg-surface-1 p-3">
          <Field edit={edit} tone={fixed ? 'numora' : 'plain'} bad={f === 1} still={loop.reduced} />
          <p className="mt-1 flex h-5 items-center gap-1.5 text-caption text-muted-foreground">
            {verdict === 'bad' && (
              <X className="size-3.5 shrink-0 text-signal-red-fg" aria-hidden />
            )}
            {verdict === 'good' && (
              <Check className="size-3.5 shrink-0 text-signal-green-fg" aria-hidden />
            )}
            <span className="truncate">{note}</span>
          </p>
        </div>
      </div>
    </DiagramFrame>
  );
}
