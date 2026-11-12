import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { DiagramFrame, DUR, EASE, SPRING, useScene } from '../kit';

type StyleId = 'none' | 'thousand' | 'lakh' | 'wan';

/** Absolute start times (s) of the autoplay tour. */
const BEATS = { thousand: 0.5 } as const;
const ms = (s: number) => Math.round(s * 1000);

const DIGITS = '10000000';

/** Mirrors packages/core/src/features/formatting/thousand-grouping.ts: sizes are counted from the right. */
const STYLES: { id: StyleId; label: string; rule: string; first: number; rest: number }[] = [
  { id: 'none', label: 'None', rule: 'No separators. The value stays as typed.', first: 0, rest: 0 },
  { id: 'thousand', label: 'Thousand', rule: 'Groups of 3 from the right (Western).', first: 3, rest: 3 },
  { id: 'lakh', label: 'Lakh', rule: '3 on the right, then groups of 2 (Indian).', first: 3, rest: 2 },
  { id: 'wan', label: 'Wan', rule: 'Groups of 4 from the right (East Asian, the myriad).', first: 4, rest: 4 },
];

/** Group sizes left-to-right, e.g. lakh of 8 digits -> [1, 2, 2, 3]. */
function groupSizes(len: number, first: number, rest: number): number[] {
  if (!first || len <= first) return [len];
  const out = [first];
  let left = len - first;
  while (left > 0) {
    const n = Math.min(rest, left);
    out.unshift(n);
    left -= n;
  }
  return out;
}

function layoutFor(id: StyleId) {
  const s = STYLES.find((x) => x.id === id) ?? STYLES[0];
  const sizes = groupSizes(DIGITS.length, s.first, s.rest);
  // For each digit: where it sits in its group. Separators precede digit i when i is a group start.
  const pos: { start: boolean; end: boolean }[] = [];
  const starts = new Set<number>();
  let i = 0;
  for (const size of sizes) {
    for (let k = 0; k < size; k++) {
      pos.push({ start: k === 0, end: k === size - 1 });
      if (k === 0 && i > 0) starts.add(i);
      i++;
    }
  }
  return { sizes, pos, seps: starts, grouped: id !== 'none' };
}

const formatted = (id: StyleId) => {
  const { seps } = layoutFor(id);
  return [...DIGITS].map((d, i) => (seps.has(i) ? `,${d}` : d)).join('');
};

export function GroupingStylesDiagram() {
  const scene = useScene();
  const reduced = useReducedMotion() ?? false;
  const [style, setStyle] = useState<StyleId>('thousand');
  const timers = useRef<number[]>([]);
  // Live-region text. Stays empty until the user picks a style, so the autoplay tour is silent.
  const [announce, setAnnounce] = useState('');

  const clear = useCallback(() => {
    for (const t of timers.current) window.clearTimeout(t);
    timers.current = [];
  }, []);

  useEffect(() => {
    clear();
    if (scene.phase === 'hidden') setStyle('none');
    if (scene.phase === 'play') {
      // One-shot tour: None -> Thousand, ending on the same frame SSR renders.
      setAnnounce('');
      setStyle('none');
      timers.current.push(window.setTimeout(() => setStyle('thousand'), ms(BEATS.thousand)));
    }
    return clear;
  }, [scene.phase, clear]);

  const pick = (id: StyleId) => {
    clear();
    setStyle(id);
    const label = STYLES.find((s) => s.id === id)?.label ?? id;
    setAnnounce(`${label} grouping: ${formatted(id)}`);
  };

  const { pos, seps, grouped } = layoutFor(style);
  const active = STYLES.find((s) => s.id === style) ?? STYLES[0];
  const digitTransition = reduced ? { duration: 0 } : SPRING;

  const row: React.ReactNode[] = [];
  [...DIGITS].forEach((d, i) => {
    if (seps.has(i)) {
      row.push(
        <motion.span
          // biome-ignore lint/suspicious/noArrayIndexKey: digit positions are the stable identity
          key={`sep-${i}`}
          layout="position"
          transition={{ layout: digitTransition, opacity: { duration: DUR.fast, ease: EASE.outExpo } }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="inline-block w-[0.55em] text-center text-signal-sky-fg"
        >
          ,
        </motion.span>,
      );
    }
    const p = pos[i];
    row.push(
      <motion.span
        // biome-ignore lint/suspicious/noArrayIndexKey: digit positions are the stable identity
        key={`d-${i}`}
        layout="position"
        transition={{ layout: digitTransition }}
        className="relative inline-block w-[0.62em] pb-2 text-center"
      >
        {d}
        {grouped && (
          <span
            aria-hidden
            className={cn(
              'absolute inset-x-0 bottom-0 h-1.5 border-b-2 border-muted-foreground',
              p.start && 'rounded-bl-sm border-l-2',
              p.end && 'rounded-br-sm border-r-2',
            )}
          />
        )}
      </motion.span>,
    );
  });

  return (
    <DiagramFrame
      sceneRef={scene.ref}
    >
      <fieldset className="m-0 flex min-w-0 flex-wrap gap-x-5 gap-y-1 border-0 p-0">
        <legend className="sr-only">Grouping style</legend>
        {STYLES.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={style === s.id}
            onClick={() => pick(s.id)}
            className={cn(
              'relative -mb-px min-h-11 border-b-2 px-0.5 text-[14px] font-medium transition-colors duration-150 ease-out-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none sm:min-h-9',
              style === s.id
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {s.label}
          </button>
        ))}
      </fieldset>

      <div className="relative mt-6 flex min-h-[4.5rem] items-end">
        <div
          aria-hidden
          className="flex items-end font-mono text-[28px] leading-none tabular-nums text-foreground sm:text-[32px]"
        >
          <AnimatePresence mode="popLayout" initial={false}>
            {row}
          </AnimatePresence>
        </div>
      </div>
      <output className="sr-only">{announce}</output>

      <div className="mt-3 flex min-h-10 flex-col gap-1 text-caption text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>{active.rule}</span>
      </div>
    </DiagramFrame>
  );
}
