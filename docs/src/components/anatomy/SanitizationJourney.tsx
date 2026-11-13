import { motion, useReducedMotion } from 'motion/react';
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
import { DiagramFrame, DUR, EASE, ROLE, useLoop } from './kit';

/** Every conditional step switched on. */
const config = {
  thousandSeparator: ',',
  decimalSeparator: '.',
  allowNegative: false,
  maxLength: 20,
};

/** The ten steps of `sanitizeNumoraInput` (packages/core/src/features/sanitization.ts), in order. */
const STEPS: [string, (s: string) => string][] = [
  ['filterMobileKeyboardArtifacts', filterMobileKeyboardArtifacts],
  ['removeThousandSeparators', (s) => removeThousandSeparators(s, config.thousandSeparator)],
  ['normalizeDigits', normalizeDigits],
  ['expandCompactNotation', expandCompactNotation],
  ['expandScientificNotation', expandScientificNotation],
  [
    'removeNonNumericCharacters',
    (s) => removeNonNumericCharacters(s, config.allowNegative, config.decimalSeparator),
  ],
  ['removeExtraDecimalSeparators', (s) => removeExtraDecimalSeparators(s, config.decimalSeparator)],
  ['removeLeadingZeros', removeLeadingZeros],
  ['prependLeadingZero', (s) => prependLeadingZero(s, config.decimalSeparator)],
  ['truncateToMaxLength', (s) => truncateToMaxLength(s, config.maxLength, config.decimalSeparator)],
];

const SAMPLE = '$1,234.56abc';

type Op = { t: 'keep' | 'del' | 'ins'; s: string };

/** Character diff (LCS). Inputs here are short. */
function diff(a: string, b: string): Op[] {
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
  const push = (t: Op['t'], c: string) => {
    const last = ops[ops.length - 1];
    if (last?.t === t) last.s += c;
    else ops.push({ t, s: c });
  };
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      push('keep', a[i]);
      i++;
      j++;
    } else if (dp[(i + 1) * w + j] >= dp[i * w + j + 1]) push('del', a[i++]);
    else push('ins', b[j++]);
  }
  while (i < n) push('del', a[i++]);
  while (j < m) push('ins', b[j++]);
  return ops;
}

interface Frame {
  kind: 'raw' | 'step' | 'result';
  /** 1-based position of the step. */
  step?: number;
  name?: string;
  /** 1-based position of the previous step that changed the value. */
  from?: number;
  ops: Op[];
  text: string;
}

/** Raw value, then only the steps that changed it, then the result. Computed with the real functions. */
function buildFrames(input: string): Frame[] {
  const frames: Frame[] = [{ kind: 'raw', ops: [{ t: 'keep', s: input }], text: input }];
  let v = input;
  let from = 0;
  STEPS.forEach(([name, fn], i) => {
    const next = fn(v);
    if (next !== v) {
      frames.push({ kind: 'step', step: i + 1, name, from, ops: diff(v, next), text: next });
      from = i + 1;
    }
    v = next;
  });
  frames.push({ kind: 'result', ops: [{ t: 'keep', s: v }], text: v });
  return frames;
}

const FRAMES = buildFrames(SAMPLE);
const RESULT = FRAMES[FRAMES.length - 1].text;
/** Raw, each changing step (key beat), result. */
const frameMs = (f: number) => (f === 0 ? 900 : f === FRAMES.length - 1 ? 600 : 1400);

/** One value passes through the ten steps. Each step starts from the previous step's output. */
export function SanitizationJourney() {
  const reduced = useReducedMotion() ?? false;
  const loop = useLoop({ frames: FRAMES.length, frameMs, holdMs: 1600 });
  const f = FRAMES[loop.frame];
  const changed = FRAMES.filter((x) => x.kind === 'step')
    .map((x) => x.step)
    .join(' and ');

  return (
    <DiagramFrame sceneRef={loop.ref}>
      <p className="sr-only">
        {`"${SAMPLE}" goes through ten steps in order. Steps ${changed} change it. The result is "${RESULT}".`}
      </p>
      <div aria-hidden className="space-y-3">
        <motion.div
          key={reduced ? 'static' : loop.frame}
          initial={reduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: DUR.base, ease: EASE.outExpo }}
        >
          <div
            className={cn(
              'flex h-14 items-center overflow-hidden whitespace-nowrap rounded-lg border border-border bg-surface-1 px-4 font-mono text-2xl tabular-nums',
              f.kind === 'result' && ROLE.good.text
            )}
          >
            {f.ops.map((o, i) => (
              <span
                // biome-ignore lint/suspicious/noArrayIndexKey: ops are positional
                key={i}
                className={cn(
                  o.t === 'del' && cn(ROLE.bad.text, 'line-through decoration-2'),
                  o.t === 'ins' && cn(ROLE.numora.text, 'underline decoration-2 underline-offset-4')
                )}
              >
                {o.s}
              </span>
            ))}
          </div>
          <div className="mt-3 h-10 text-caption leading-snug">
            <div className="truncate font-mono text-foreground">
              {f.kind === 'raw' && 'Raw input'}
              {f.kind === 'step' && f.name}
              {f.kind === 'result' && 'Sanitized'}
            </div>
            <div className="truncate text-muted-foreground">
              {f.kind === 'raw' && 'Enters step 1 as plain text.'}
              {f.kind === 'step' &&
                (f.from
                  ? `Step ${f.step} of 10. Gets the output of step ${f.from}.`
                  : `Step ${f.step} of 10.`)}
              {f.kind === 'result' && 'Output of step 10.'}
            </div>
          </div>
        </motion.div>

        <div className="flex gap-1">
          {FRAMES.map((x, i) => (
            <span
              key={`${x.kind}${x.step ?? ''}`}
              className={cn(
                'h-1 flex-1 rounded-full transition-[background-color] duration-150 ease-out-expo motion-reduce:transition-none',
                i <= loop.frame ? 'bg-muted-foreground' : 'bg-surface-4',
                i === loop.frame && 'bg-foreground'
              )}
            />
          ))}
        </div>
      </div>
    </DiagramFrame>
  );
}
