import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';
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
import { DemoInput, DiagramFrame, DUR, EASE, ROLE, SCAN_STEP, useScene } from './kit';

interface Step {
  name: string;
  description: string;
  /** Plain-language condition that gates this step. Absent = always runs. */
  option?: string;
  output: string;
}

/** The options this live demo runs with. Every conditional step is switched on. */
const config = {
  thousandSeparator: ',',
  decimalSeparator: '.',
  allowCompactNotation: true,
  allowNegative: false,
  allowLeadingZeros: false,
  padLeadingZero: true,
  maxLength: 20,
};

/** Mirrors `sanitizeNumoraInput` in packages/core/src/features/sanitization.ts, step for step. */
function pipeline(input: string): Step[] {
  const steps: Step[] = [];
  let v = input;
  const run = (
    name: string,
    description: string,
    fn: (s: string) => string,
    option?: string,
  ) => {
    v = fn(v);
    steps.push({ name, description, option, output: v });
  };

  run(
    'filterMobileKeyboardArtifacts',
    'Remove non-breaking spaces and Unicode whitespace',
    filterMobileKeyboardArtifacts,
  );
  run(
    'removeThousandSeparators',
    'Remove the grouping character, since it is formatting and not data',
    (s) => removeThousandSeparators(s, config.thousandSeparator),
    'runs when thousandSeparator is set',
  );
  run(
    'normalizeDigits',
    'Turn "１２３" or "١٢٣" into "123" (full-width and other Unicode digits)',
    normalizeDigits,
  );
  run(
    'expandCompactNotation',
    'Expand "1k" to "1000" and "2.5M" to "2500000"',
    expandCompactNotation,
    'runs when allowCompactNotation is on',
  );
  run(
    'expandScientificNotation',
    'Expand "1.5e-7" to "0.00000015"',
    expandScientificNotation,
  );
  run(
    'removeNonNumericCharacters',
    'Remove everything that is not a digit or the decimal separator',
    (s) => removeNonNumericCharacters(s, config.allowNegative, config.decimalSeparator),
  );
  run(
    'removeExtraDecimalSeparators',
    'Remove every decimal separator after the first',
    (s) => removeExtraDecimalSeparators(s, config.decimalSeparator),
  );
  run(
    'removeLeadingZeros',
    'Turn "007" into "7"',
    removeLeadingZeros,
    'skipped when allowLeadingZeros is on',
  );
  run(
    'prependLeadingZero',
    'Turn ".5" into "0.5"',
    (s) => prependLeadingZero(s, config.decimalSeparator),
    'runs when padLeadingZero is on',
  );
  run(
    'truncateToMaxLength',
    `Cut the raw value to ${config.maxLength} characters`,
    (s) => truncateToMaxLength(s, config.maxLength, config.decimalSeparator),
    'runs when maxLength is set',
  );

  return steps;
}

/** The slice of `prev` that `next` dropped or replaced (common prefix/suffix diff). */
function removedRange(prev: string, next: string): [number, number] | null {
  if (prev === next) return null;
  let p = 0;
  const max = Math.min(prev.length, next.length);
  while (p < max && prev[p] === next[p]) p++;
  let s = 0;
  while (s < max - p && prev[prev.length - 1 - s] === next[next.length - 1 - s]) s++;
  const end = prev.length - s;
  return end > p ? [p, end] : null;
}

function Output({ text, range, marked }: { text: string; range: [number, number] | null; marked: boolean }) {
  if (!text) return '""';
  if (!range) return <>"{text}"</>;
  const [a, b] = range;
  return (
    <>
      "{text.slice(0, a)}
      <span
        className={cn(
          marked && cn(ROLE.bad.text, 'line-through'),
        )}
      >
        {text.slice(a, b)}
      </span>
      {text.slice(b)}"
    </>
  );
}

const PRESETS = ['$1,234.56abc', '１２３', '1.5e-7', '1k', '007.5', '1.2.3.4', '.5'];

interface Flash {
  id: number;
  rows: Set<number>;
  wave: boolean;
}

/** How long the removed-chars mark stays, derived from the flash token. */
const MARK_MS = Math.round(DUR.flash * 2 * 1000);

export function SanitizationStepper() {
  const inputId = useId();
  const reduced = useReducedMotion() ?? false;
  const scene = useScene();
  const [value, setValue] = useState('$1,234.56abc');
  const [flash, setFlash] = useState<Flash>({ id: 0, rows: new Set(), wave: false });
  const [marked, setMarked] = useState(false);
  const markTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const steps = useMemo(() => pipeline(value), [value]);

  useEffect(() => () => clearTimeout(markTimer.current), []);

  function update(next: string, wave: boolean) {
    const nextSteps = pipeline(next);
    const rows = new Set<number>();
    nextSteps.forEach((s, i) => {
      if (s.output !== steps[i].output) rows.add(i);
    });
    setValue(next);
    setFlash((f) => ({ id: f.id + 1, rows, wave: wave && !reduced }));
    setMarked(true);
    clearTimeout(markTimer.current);
    markTimer.current = setTimeout(() => setMarked(false), MARK_MS);
  }

  const traveling = scene.phase === 'play';

  return (
    <DiagramFrame variant="demo" sceneRef={scene.ref}>
      <label htmlFor={inputId} className="mb-2 block text-sm font-medium">
        Type a messy value. Every step runs live as you type:
      </label>
      <DemoInput
        id={inputId}
        type="text"
        value={value}
        onChange={(e) => update(e.target.value, false)}
        placeholder="$1,234.56abc"
        autoComplete="off"
        spellCheck={false}
      />
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => update(preset, true)}
            aria-label={`Use example ${preset}`}
            aria-current={value === preset ? 'true' : undefined}
            className={cn(
              'inline-flex min-h-6 items-center py-1 font-mono text-caption underline-offset-4 transition-colors duration-150 ease-out-expo hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11',
              value === preset
                ? 'text-foreground underline decoration-border'
                : 'text-muted-foreground',
            )}
          >
            {preset}
          </button>
        ))}
      </div>

      <ol
        className="relative mt-6 space-y-1"
        aria-label="Sanitization steps"
      >
        <span aria-hidden className="pointer-events-none absolute bottom-3 left-[15px] top-3 w-px bg-border" />

        <li className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 min-[560px]:grid-cols-[2rem_minmax(0,1fr)_minmax(7rem,10rem)] px-1 py-1.5">
          <span className="relative z-10 flex h-6 items-center justify-center bg-surface-2 font-mono text-xs text-muted-foreground">
            in
          </span>
          <span className="self-center text-caption text-muted-foreground">Raw input</span>
          <div className="col-start-2 min-w-0 font-mono text-caption text-muted-foreground [overflow-wrap:anywhere] min-[560px]:col-start-3 min-[560px]:text-right">
            <Output text={value} range={removedRange(value, steps[0].output)} marked={marked} />
          </div>
        </li>

        {steps.map((step, i) => {
          const prev = i === 0 ? value : steps[i - 1].output;
          const changed = prev !== step.output;
          const next = i < steps.length - 1 ? steps[i + 1].output : null;
          const range = next === null ? null : removedRange(step.output, next);
          const flashing = flash.rows.has(i);
          const delay = flash.wave ? i * SCAN_STEP : 0;
          return (
            <li
              key={step.name}
              className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3 min-[560px]:grid-cols-[2rem_minmax(0,1fr)_minmax(7rem,10rem)] rounded-lg px-1 py-2"
            >
              {flashing && (
                <motion.span
                  key={flash.id}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-lg bg-surface-4"
                  initial={{ opacity: delay ? 0 : 0.6 }}
                  animate={{ opacity: [0.6, 0] }}
                  transition={{ duration: reduced ? DUR.fast : DUR.flash, delay, ease: EASE.outExpo }}
                />
              )}
              {traveling && (
                <motion.span
                  key={`t${scene.playId}`}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-lg bg-surface-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{
                    duration: DUR.flash,
                    delay: (i + 1) * SCAN_STEP,
                    times: [0, 0.3, 1],
                    ease: EASE.outExpo,
                  }}
                />
              )}
              <span
                className={cn(
                  'relative z-10 flex h-6 items-center justify-center bg-surface-2 font-mono text-xs',
                  changed ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {i + 1}
              </span>
              <div className="relative min-w-0">
                <div className="flex flex-wrap items-center gap-x-2">
                  <span
                    className={cn(
                      'whitespace-nowrap font-mono text-caption',
                      changed ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    {step.name}
                  </span>
                </div>
                <div className="text-caption leading-snug text-muted-foreground">
                  {step.description}
                </div>
                {step.option && (
                  <div className="text-xs text-muted-foreground">
                    {step.option}
                  </div>
                )}
              </div>
              <div
                className={cn(
                  'relative col-start-2 mt-1 min-w-0 font-mono text-caption [overflow-wrap:anywhere] min-[560px]:col-start-3 min-[560px]:mt-0 min-[560px]:self-center min-[560px]:text-right',
                  i === steps.length - 1 ? ROLE.good.text : changed ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                <Output text={step.output} range={range} marked={marked} />
              </div>
            </li>
          );
        })}
      </ol>
    </DiagramFrame>
  );
}
