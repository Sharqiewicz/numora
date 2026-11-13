import { Check, X } from 'lucide-react';
import { type NumoraHTMLInputElement, NumoraInput } from 'numora-react';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { DemoInput, DiagramFrame, demoInputClass, useLoop } from './kit';

// Texts a naive parse gets wrong: a symbol and letters, a comma decimal.
const SAMPLES = ['$1,234.56abc', '1.234,56'];
const FRAMES = 2;

/** Pastes `text` over the whole field through a real `paste` event, the path a human paste takes. */
function pasteInto(el: HTMLInputElement, text: string) {
  el.setSelectionRange(0, el.value.length);
  let event: Event;
  try {
    const data = new DataTransfer();
    data.setData('text/plain', text);
    event = new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true });
  } catch {
    event = new Event('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
  }
  el.dispatchEvent(event);
}

/** What the app gets from `Number(value)`: a real naive parse, never a hand-typed result. */
function Parsed({ value, show: frameShows }: { value: string; show: boolean }) {
  // Before the first paste lands the field is empty, and Number('') would read as a clean 0.
  const show = frameShows && value !== '';
  const n = Number(value);
  const bad = Number.isNaN(n);
  return (
    <div
      className={cn(
        'min-h-10 font-mono text-caption',
        // Fades in; hides instantly so a new sample's text never shows while the old result fades out.
        show
          ? 'opacity-100 transition-opacity duration-200 ease-out-expo motion-reduce:transition-none'
          : 'opacity-0'
      )}
      aria-hidden={!show}
    >
      <div className="break-all text-muted-foreground">{`Number("${value}")`}</div>
      <div
        className={cn(
          'inline-flex items-center gap-1 tabular-nums',
          bad ? 'text-signal-red-fg' : 'text-foreground'
        )}
      >
        {bad ? (
          <X className="size-3.5" aria-hidden />
        ) : (
          <Check className="size-3.5 text-signal-green-fg" aria-hidden />
        )}
        {bad ? 'NaN' : String(n)}
      </div>
    </div>
  );
}

function Lane({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0 space-y-2">
      <div className="text-caption font-medium text-foreground">{title}</div>
      {children}
    </div>
  );
}

/**
 * One text pasted into a plain input and a NumoraInput, then what the app's `Number(value)`
 * makes of each. Loops by itself; the last frame is the readable result.
 */
export function PlainVsNumoraFigure() {
  const loop = useLoop({ frames: FRAMES, frameMs: 1400, holdMs: 2400 });
  const sample = SAMPLES[loop.cycle % SAMPLES.length];
  const [plain, setPlain] = useState('');
  const [raw, setRaw] = useState('');
  const numora = useRef<NumoraHTMLInputElement>(null);

  // Each sample is pasted over whatever the fields held, so the restart never shows empty fields.
  useEffect(() => {
    const n = numora.current;
    if (!n) return;
    pasteInto(n, sample);
    setPlain(sample);
  }, [sample]);

  return (
    <DiagramFrame variant="demo" sceneRef={loop.ref} title="Paste the same text into both">
      <div className="grid gap-4 sm:grid-cols-2">
        <Lane title="Plain <input>">
          <DemoInput
            type="text"
            value={plain}
            onChange={(e) => setPlain(e.target.value)}
            aria-label="Plain text input"
          />
          <Parsed value={plain} show={loop.frame >= 1} />
        </Lane>
        <Lane title="NumoraInput">
          <NumoraInput
            ref={numora}
            formatOn="change"
            thousandSeparator=","
            groupingStyle="thousand"
            decimalMaxLength={2}
            allowCompactNotation
            onChange={(e) => setRaw(e.target.value)}
            aria-label="Numora input"
            className={demoInputClass}
          />
          <Parsed value={raw} show={loop.frame >= 1} />
        </Lane>
      </div>
    </DiagramFrame>
  );
}
