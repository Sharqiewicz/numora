import { Check, X } from 'lucide-react';
import { formatValue, parseValue } from 'numora';
import { DiagramFrame, demoInsetClass, useLoop } from './kit';

// One worst case at a time: a typed decimal multiplied as a Number, then the string Numora returns.
// Every result is computed here with real JavaScript and the real numora functions.
const SAMPLES: [typed: string, times: number][] = [
  ['0.1', 3],
  ['19.99', 100],
];
const FRAMES = 2;
const FRAME_MS = [2400, 0];
const HOLD_MS = 2600;

/** Exact decimal product of a typed string and a whole number, with BigInt (no floats). */
function exactTimes(s: string, k: number): string {
  const [w, f = ''] = s.split('.');
  const big = (BigInt(w + f) * BigInt(k)).toString().padStart(f.length + 1, '0');
  if (!f) return big;
  const out = `${big.slice(0, big.length - f.length)}.${big.slice(big.length - f.length)}`;
  return out.replace(/0+$/, '').replace(/\.$/, '');
}

/** Marks where `got` stops matching `want`: red wavy underline, plus the words in the status. */
function Marked({ want, got }: { want: string; got: string }) {
  let p = 0;
  while (p < got.length && got[p] === want[p]) p++;
  if (p === got.length && got.length === want.length) return <>{got}</>;
  return (
    <>
      {got.slice(0, p)}
      <span className="text-signal-red-fg underline decoration-wavy decoration-signal-red-line underline-offset-4">
        {got.slice(p)}
      </span>
    </>
  );
}

function Status({ ok, yes, no }: { ok: boolean; yes: string; no: string }) {
  const Icon = ok ? Check : X;
  return (
    <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground">
      <Icon
        className={`size-3.5 ${ok ? 'text-signal-green-fg' : 'text-signal-red-fg'}`}
        aria-hidden
      />
      {ok ? yes : no}
    </span>
  );
}

/** The 0.1 + 0.2 problem, shown on a value the user typed, then the string Numora keeps. */
export function NumberRoundTrip() {
  const loop = useLoop({ frames: FRAMES, frameMs: (f) => FRAME_MS[f] ?? 1000, holdMs: HOLD_MS });
  const [typed, k] = SAMPLES[loop.cycle % SAMPLES.length];
  const value = parseValue(formatValue(typed));
  const product = String(Number(value) * k);
  const exact = exactTimes(value, k);
  const showNumora = loop.frame >= 1;

  return (
    <DiagramFrame variant="demo">
      <div ref={loop.ref} className={`${demoInsetClass} space-y-4`}>
        <div>
          <div className="mb-1 flex items-center justify-between gap-2 text-muted-foreground">
            <span className="min-w-0 break-all">
              Number("{value}") * {k}
            </span>
            <Status ok={product === exact} yes="exact" no="wrong" />
          </div>
          <div className="truncate tabular-nums">
            <Marked want={exact} got={product} />
          </div>
          <div className="truncate tabular-nums text-muted-foreground">exact: {exact}</div>
        </div>
        <div
          aria-hidden={!showNumora}
          className={`transition-opacity duration-150 ease-out-expo motion-reduce:transition-none ${showNumora ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="mb-1 flex items-center justify-between gap-2 text-muted-foreground">
            <span>Numora: e.target.value</span>
            <Status ok yes="as typed" no="" />
          </div>
          <div className="min-h-5 break-all tabular-nums">"{value}"</div>
        </div>
      </div>
    </DiagramFrame>
  );
}
