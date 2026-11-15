import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  expandCompactNotation,
  expandScientificNotation,
  filterMobileKeyboardArtifacts,
  normalizeDigits,
  prependLeadingZero,
  removeExtraDecimalSeparators,
  removeLeadingZeros,
  removeNonNumericCharacters,
  removeThousandSeparators,
  truncateToMaxLength,
} from 'numora/pipeline';
import { cn } from '@/lib/utils';
import {
  DiagramFrame,
  DUR,
  EASE,
  ROLE,
  readMs,
  SPRING,
  stepBarClass,
  Typewriter,
  useLoop,
} from './kit';

/**
 * Every conditional step switched on. A default field skips steps 4, 9 and 10: they run only
 * with `allowCompactNotation`, `padLeadingZero` and `maxLength`.
 */
const config = {
  thousandSeparator: ',',
  decimalSeparator: '.',
  allowNegative: false,
  maxLength: 20,
};

interface Step {
  name: string;
  /** What the step does, in one short sentence. */
  does: string;
  run: (s: string) => string;
}

/** The ten steps of `sanitizeNumoraInput` (packages/core/src/features/sanitization.ts), in order. */
const STEPS: Step[] = [
  {
    name: 'filterMobileKeyboardArtifacts',
    does: 'Removes spaces and invisible whitespace.',
    run: filterMobileKeyboardArtifacts,
  },
  {
    name: 'removeThousandSeparators',
    does: 'Removes the thousand separator.',
    run: (s) => removeThousandSeparators(s, config.thousandSeparator),
  },
  {
    name: 'normalizeDigits',
    does: 'Turns fullwidth and other native digits into 0-9.',
    run: normalizeDigits,
  },
  {
    name: 'expandCompactNotation',
    does: 'Expands k, m, b and t into zeros. Only with allowCompactNotation.',
    run: expandCompactNotation,
  },
  {
    name: 'expandScientificNotation',
    does: 'Expands e-notation into a plain decimal.',
    run: expandScientificNotation,
  },
  {
    name: 'removeNonNumericCharacters',
    does: 'Removes anything that is not a digit or the decimal separator.',
    run: (s) => removeNonNumericCharacters(s, config.allowNegative, config.decimalSeparator),
  },
  {
    name: 'removeExtraDecimalSeparators',
    does: 'Keeps the first decimal separator and removes the rest.',
    run: (s) => removeExtraDecimalSeparators(s, config.decimalSeparator),
  },
  { name: 'removeLeadingZeros', does: 'Removes leading zeros.', run: removeLeadingZeros },
  {
    name: 'prependLeadingZero',
    does: 'Adds a 0 before a bare decimal separator. Only with padLeadingZero.',
    run: (s) => prependLeadingZero(s, config.decimalSeparator),
  },
  {
    name: 'truncateToMaxLength',
    does: 'Cuts the value at maxLength. Only when maxLength is set.',
    run: (s) => truncateToMaxLength(s, config.maxLength, config.decimalSeparator),
  },
];

/** One value per cycle. Together they exercise steps 1, 2, 3, 6, 7, 8 and 9. */
const INPUTS = ['$1,234.56 USD', '００7.5.0', '$.75'];

const RAW_NOTE = 'Goes through ten steps, in order.';
const resultNote = (changed: number) =>
  `${changed} of the ${STEPS.length} steps changed it. The rest had nothing to do.`;

/**
 * How long each kind of frame stays up, in ms. A frame that brings a new sentence stays for as
 * long as the sentence takes to type and read (`readMs`), plus the extra below.
 */
const RAW_EXTRA_MS = 400;
/** The marked characters are the beat the reader has to catch. */
const MARK_EXTRA_MS = 400;
/** The value closing up. No new text to read. */
const APPLY_MS = 1300;
const RESULT_EXTRA_MS = 1000;

type Op = { t: 'keep' | 'del' | 'ins'; c: string };

/** Character diff (LCS). Inputs here are short. */
function diff(a: string[], b: string[]): Op[] {
  const n = a.length;
  const m = b.length;
  const w = m + 1;
  const dp = new Uint16Array((n + 1) * w);
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      dp[i * w + j] =
        a[i] === b[j]
          ? dp[(i + 1) * w + j + 1] + 1
          : Math.max(dp[(i + 1) * w + j], dp[i * w + j + 1]);
  const ops: Op[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ t: 'keep', c: a[i] });
      i++;
      j++;
    } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) ops.push({ t: 'del', c: a[i++] });
    else ops.push({ t: 'ins', c: b[j++] });
  }
  while (i < n) ops.push({ t: 'del', c: a[i++] });
  while (j < m) ops.push({ t: 'ins', c: b[j++] });
  return ops;
}

/**
 * One character of the value. The id follows the character through every step, so a kept
 * character glides to its new place instead of being redrawn.
 *
 * - `del`: the step is about to remove it
 * - `sub`: the step is about to replace it in place
 * - `new`: the step just wrote it
 */
type Cell = { id: string; char: string; mark?: 'del' | 'sub' | 'new' };

interface Frame {
  kind: 'raw' | 'mark' | 'apply' | 'result';
  /** 1-based step. 0 before the pipeline, 11 after it. */
  step: number;
  cells: Cell[];
  ms: number;
}

/**
 * Raw value, then two frames per step that changes it (what it will touch, then the value
 * without it), then the result. Computed with the real functions.
 */
function buildSample(input: string, index: number) {
  let uid = 0;
  let cells: Cell[] = [...input].map((char) => ({ id: `c${uid++}`, char }));
  const frames: Frame[] = [{ kind: 'raw', step: 0, cells, ms: readMs(RAW_NOTE) + RAW_EXTRA_MS }];
  /** Frame (within this sample) to show for each step that changes the value, by 1-based step. */
  const markFrame: Record<number, number> = {};

  STEPS.forEach((step, i) => {
    const before = cells.map((c) => c.char);
    const after = [...step.run(before.join(''))];
    if (after.join('') === before.join('')) return;

    const marked: Cell[] = [];
    const next: Cell[] = [];
    // Removed characters not yet matched to a written one. A match is a replacement in place.
    let removed: number[] = [];
    let at = 0;
    for (const op of diff(before, after)) {
      if (op.t === 'keep') {
        marked.push(cells[at]);
        next.push(cells[at++]);
        removed = [];
      } else if (op.t === 'del') {
        removed.push(marked.push({ ...cells[at++], mark: 'del' }) - 1);
      } else {
        const swap = removed.shift();
        if (swap !== undefined) marked[swap] = { ...marked[swap], mark: 'sub' };
        const id = swap !== undefined ? marked[swap].id : `c${uid++}`;
        next.push({ id, char: op.c, mark: 'new' });
      }
    }

    markFrame[i + 1] = frames.length;
    frames.push({
      kind: 'mark',
      step: i + 1,
      cells: marked,
      ms: readMs(step.does) + MARK_EXTRA_MS,
    });
    frames.push({ kind: 'apply', step: i + 1, cells: next, ms: APPLY_MS });
    cells = next.map(({ id, char }) => ({ id, char }));
  });

  const changed = Object.keys(markFrame).length;
  frames.push({
    kind: 'result',
    step: STEPS.length + 1,
    cells,
    ms: readMs(resultNote(changed)) + RESULT_EXTRA_MS,
  });
  return { index, input, frames, markFrame, changed, result: cells.map((c) => c.char).join('') };
}

const SAMPLES = INPUTS.map(buildSample);
/** Every sample back to back: one loop cycle shows them all. */
const TIMELINE = SAMPLES.flatMap((sample) => sample.frames.map((frame) => ({ sample, frame })));
/** Where each sample starts in the timeline. */
const OFFSET = SAMPLES.map((_, i) =>
  SAMPLES.slice(0, i).reduce((sum, sample) => sum + sample.frames.length, 0)
);

/**
 * A messy value passes through the ten steps. Each step that changes it first marks what it
 * will touch, then the value closes up without it. The rail under the field is the pipeline.
 */
export function SanitizationJourney() {
  const reduced = useReducedMotion() ?? false;
  const loop = useLoop({
    frames: TIMELINE.length,
    frameMs: (frame) => TIMELINE[frame].frame.ms,
    holdMs: 0,
  });
  const { sample, frame: f } = TIMELINE[loop.frame];
  const step = STEPS[f.step - 1];
  const { changed } = sample;
  const note = f.kind === 'raw' ? RAW_NOTE : step ? step.does : resultNote(changed);
  const fadeIn = reduced ? false : { opacity: 0 };
  const fade = { duration: DUR.base, ease: EASE.outExpo };

  return (
    <DiagramFrame
      sceneRef={loop.ref}
      loop={loop}
      count={step ? { current: f.step, total: STEPS.length } : undefined}
      controls={
        <ol className="m-0 flex min-w-0 flex-1 list-none gap-1 p-0" aria-label="Pipeline steps">
          {STEPS.map((s, i) => {
            const n = i + 1;
            const target = sample.markFrame[n];
            const bar = <span className={stepBarClass(n, f.step, target !== undefined)} />;
            return (
              <li key={s.name} className="m-0 flex min-w-0 flex-1 items-center p-0">
                {target === undefined ? (
                  bar
                ) : (
                  <button
                    type="button"
                    aria-label={`Step ${n} of ${STEPS.length}, ${s.name}`}
                    aria-current={n === f.step ? 'step' : undefined}
                    onClick={() => loop.goTo(OFFSET[sample.index] + target)}
                    // 44px tall hit area around a 4px bar; the row itself stays 32px.
                    className="group -my-1.5 flex h-11 w-full cursor-pointer items-center focus-visible:outline-none"
                  >
                    {bar}
                  </button>
                )}
              </li>
            );
          })}
        </ol>
      }
    >
      <p className="sr-only">
        {`"${sample.input}" goes through ten steps in order. ${changed} of them change it. The result is "${sample.result}".`}
      </p>
      <div aria-hidden>
        <div className="flex h-14 items-center overflow-hidden rounded-lg border border-border bg-surface-1 px-4 font-mono text-2xl text-foreground tabular-nums">
          {/* A new value fades in. Inside one value only the characters a step touches move. */}
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={sample.index}
              initial={fadeIn}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DUR.fast, ease: EASE.outExpo }}
              className={cn(
                'relative whitespace-nowrap select-none',
                f.kind === 'result' && ROLE.good.text
              )}
            >
              <AnimatePresence initial={false} mode="popLayout">
                {f.cells.map((cell) => (
                  <motion.span
                    key={cell.id}
                    layout="position"
                    initial={fadeIn}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, transition: { duration: DUR.fast, ease: EASE.outExpo } }}
                    transition={{ layout: SPRING, ...fade }}
                    className={cn(
                      'inline-block rounded-[3px] whitespace-pre transition-colors duration-150 ease-out-expo motion-reduce:transition-none',
                      cell.mark === 'del' && cn(ROLE.bad.text, ROLE.bad.bg),
                      cell.mark === 'sub' && cn(ROLE.numora.text, ROLE.numora.bg),
                      cell.mark === 'new' && ROLE.numora.text
                    )}
                  >
                    {cell.char}
                  </motion.span>
                ))}
              </AnimatePresence>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* Reserved for the longest caption, so the rail under it never moves. */}
        <div className="mt-3 h-14 text-caption leading-snug sm:h-10">
          <AnimatePresence initial={false}>
            <motion.div
              key={`${sample.index}-${f.step}`}
              initial={fadeIn}
              animate={{ opacity: 1 }}
              transition={fade}
              className="truncate font-mono text-foreground"
            >
              {f.kind === 'raw' && 'Raw input'}
              {step && `${f.step}. ${step.name}`}
              {f.kind === 'result' && 'Sanitized'}
            </motion.div>
          </AnimatePresence>
          {/* Outside the keyed title, so it stays mounted and types each new sentence. */}
          <Typewriter text={note} className="block text-muted-foreground" />
        </div>
      </div>
    </DiagramFrame>
  );
}
