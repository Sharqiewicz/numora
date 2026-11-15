import { ClipboardPaste } from 'lucide-react';
import { NumoraInput } from 'numora-react';
import { useEffect, useRef, useState } from 'react';
import { DiagramFrame, demoInputClass, FigureLabel } from '../kit';

const samples = ['$1,234.56 USD', '1,234.560000', '1.234,56'];

type Result =
  | { sample: string; status: 'pasted'; shown: string }
  | { sample: string; status: 'copied' | 'failed' }
  | null;

/**
 * Runs a real paste event through the field, over whatever it holds, so Numora's own paste
 * handler does the work. Returns false when the browser will not carry text in a scripted paste.
 */
function pasteOver(el: HTMLInputElement, text: string) {
  try {
    const data = new DataTransfer();
    data.setData('text/plain', text);
    const event = new ClipboardEvent('paste', {
      clipboardData: data,
      bubbles: true,
      cancelable: true,
    });
    if (event.clipboardData?.getData('text/plain') !== text) return false;
    el.focus({ preventScroll: true });
    // A paste goes in at the selection. Selecting everything makes each sample start clean.
    el.setSelectionRange(0, el.value.length);
    el.dispatchEvent(event);
    return true;
  } catch {
    return false;
  }
}

export function PasteSection() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<Result>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(clearTimer.current), []);

  const pasteSample = async (sample: string) => {
    clearTimeout(clearTimer.current);
    const el = inputRef.current;
    if (el && pasteOver(el, sample)) {
      setResult({ sample, status: 'pasted', shown: el.value });
      return;
    }
    // No scripted paste here: copy the sample, and the reader pastes it by hand.
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(sample);
      setResult({ sample, status: 'copied' });
      el?.focus({ preventScroll: true });
      el?.select();
    } catch {
      setResult({ sample, status: 'failed' });
    }
    clearTimer.current = setTimeout(() => setResult(null), 6000);
  };

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="paste" className="space-y-4 scroll-mt-24">
      <h2>Paste messy text</h2>
      <p>Pick a messy value. It is pasted into the field, over whatever the field holds:</p>
      <DiagramFrame>
        <FigureLabel className="mb-2">Paste into the field</FigureLabel>
        <div className="mb-3 flex flex-wrap gap-2">
          {samples.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => pasteSample(s)}
              aria-label={`Paste ${s} into the field`}
              className="inline-flex min-h-9 cursor-pointer touch-manipulation items-center gap-1.5 rounded-md border border-surface-5 bg-surface-3 pr-2.5 pl-2 font-mono text-caption text-foreground transition-[background-color,scale] duration-150 ease-out-expo focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.97] motion-reduce:transition-none [@media(hover:hover)]:hover:bg-surface-4 [@media(pointer:coarse)]:min-h-11"
            >
              <ClipboardPaste className="size-3.5 flex-none text-muted-foreground" aria-hidden />
              {s}
            </button>
          ))}
        </div>
        <NumoraInput
          ref={inputRef}
          formatOn="change"
          thousandSeparator=","
          groupingStyle="thousand"
          decimalMaxLength={2}
          allowCompactNotation
          aria-label="Paste test input"
          placeholder="Or paste your own text here"
          className={demoInputClass}
        />
        <output className="mt-2 block min-h-5 text-caption text-muted-foreground">
          {result?.status === 'pasted' && (
            <>
              Pasted <span className="font-mono text-foreground">{result.sample}</span>. The field
              holds <span className="font-mono text-foreground">{result.shown}</span>
            </>
          )}
          {result?.status === 'copied' &&
            `Copied ${result.sample}. Paste it into the field with Ctrl/Cmd+V`}
          {result?.status === 'failed' && 'Copy failed. Select the text and copy it yourself'}
        </output>
      </DiagramFrame>
      <p>
        When the user pastes, the <code>paste</code> event fires first, and it carries the full{' '}
        <code>ClipboardData</code> object. Numora handles the paste there and cancels the event, so
        the browser never sends a <code>beforeinput</code> with{' '}
        <code>inputType: 'insertFromPaste'</code> for it.
      </p>
      <p>The paste handler then does five things:</p>
      <ol>
        <li>
          It reads the clipboard's plain text, works out what each separator in it means (the rules
          are below) and rewrites the text with the field's own separators. A read-only or disabled
          field takes nothing.
        </li>
        <li>It splices that text into the current value at the selection.</li>
        <li>
          It stops if the combined value holds scientific notation and{' '}
          <code>allowScientificNotation</code> is off.
        </li>
        <li>
          It runs the combined value through <a href="#sanitization">the full pipeline</a>. Thousand
          separators are always removed, because the clipboard text and the current value can both
          carry them.
        </li>
        <li>
          It stops if <code>isAllowed</code> refuses the result, or if the result is what the field
          already shows. Otherwise it writes the result with <code>setRangeText</code>, places the
          cursor and calls your change callback with the raw value and the formatted value. No
          synthetic <code>input</code> event is dispatched.
        </li>
      </ol>
      <p>
        Pasted text may come from another locale, so Numora does not assume the field's own
        separators. It decides what each <code>.</code> and <code>,</code> means:
      </p>
      <ul>
        <li>
          Both appear. The last one is the decimal mark and the rest is grouping. A German{' '}
          <code>1.234,56</code> pasted into a field with <code>thousandSeparator=","</code> is read
          as <code>1234.56</code>.
        </li>
        <li>One mark repeats. It is grouping.</li>
        <li>
          One mark appears once. It is the decimal mark when it is the field's own decimal
          separator. Otherwise it is grouping when the digits around it form valid groups (
          <code>1,234</code>), and the decimal mark when they do not.
        </li>
      </ul>
      <p>
        Dropped and autofilled text is read the same way, except in a focused field that formats on
        change, which reads it as text in its own format.
      </p>
      <p>
        A paste is inserted into the text already there, at the selection. The demo selects the
        whole field first, so each value starts clean.
      </p>
    </section>
  );
}
