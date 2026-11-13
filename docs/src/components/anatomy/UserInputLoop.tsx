import { X } from 'lucide-react';
import { sanitizeNumoraInput } from 'numora/internal';
import { normalizeForeignFormat } from 'numora/pipeline';
import { DiagramFrame, ROLE, useLoop } from './kit';

const OPTS = {
  allowCompactNotation: true,
  allowNegative: true,
  allowLeadingZeros: false,
  decimalSeparator: '.',
  thousandSeparator: ',',
} as const;

/** The usual fix, verbatim. */
const regexClean = (s: string) => s.replace(/[^0-9.]/g, '');

/** Pasted text goes through foreign-format detection first, as the paste handler does. */
const numoraRead = (s: string, pasted: boolean) =>
  sanitizeNumoraInput(pasted ? normalizeForeignFormat(s, OPTS) : s, OPTS);

const SAMPLES = [
  { text: '1.5e-7', pasted: false },
  { text: '1.234,56', pasted: true },
];
const FRAMES = 6;
const FADE = 'transition-opacity duration-150 ease-out-expo motion-reduce:transition-none';

function Lane({ label, value, numora }: { label: string; value: string; numora?: boolean }) {
  return (
    <div className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
      <span
        className={`text-caption font-medium ${numora ? ROLE.numora.text : 'text-muted-foreground'}`}
      >
        {label}
      </span>
      <div
        className={`flex h-10 items-center overflow-hidden rounded-lg border px-3 font-mono text-base tabular-nums ${
          numora ? `${ROLE.numora.border} ${ROLE.numora.bg}` : 'border-border bg-surface-1'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

/** A value is typed or pasted. The regex and Numora answer after every keystroke. */
export function UserInputLoop() {
  const loop = useLoop({ frames: FRAMES, frameMs: 600, holdMs: 2000 });
  const s = SAMPLES[loop.cycle % SAMPLES.length];
  const chars = [...s.text];
  const typed = s.pasted
    ? loop.frame === 0
      ? 0
      : chars.length
    : Math.ceil((chars.length * loop.frame) / (FRAMES - 1));
  const shown = chars.slice(0, typed).join('');
  const regex = regexClean(shown);
  const numora = numoraRead(shown, s.pasted && typed > 0);
  const done = loop.frame === FRAMES - 1;
  const wrong = regex !== numora;

  return (
    <DiagramFrame>
      <div ref={loop.ref} className="space-y-3">
        <div
          className="flex h-10 items-center overflow-hidden rounded-lg border border-muted-icon bg-surface-1 px-3 font-mono text-base tabular-nums"
          role="img"
          aria-label={`${s.pasted ? 'Pasted' : 'Typed'}: ${s.text}`}
        >
          {shown || (
            <span className="font-sans text-muted-foreground">{s.pasted ? 'Paste' : 'Type'}</span>
          )}
        </div>
        <Lane label="Regex" value={regex} />
        <div
          className={`flex h-5 items-center gap-1 pl-[5.25rem] text-caption font-medium ${ROLE.bad.text} ${FADE} ${done && wrong ? 'opacity-100' : 'opacity-0'}`}
          aria-hidden={!(done && wrong)}
        >
          <X className="size-3.5" aria-hidden />
          Different number
        </div>
        <Lane label="Numora" value={numora} numora />
      </div>
    </DiagramFrame>
  );
}
