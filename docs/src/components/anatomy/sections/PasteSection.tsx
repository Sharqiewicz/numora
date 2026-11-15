import { NumoraInput } from 'numora-react';
import { useEffect, useRef, useState } from 'react';
import { DiagramFrame, demoInputClass } from '../kit';

const samples = ['$1,234.56 USD', '1,234.560000', '1.234,56'];

type CopyState = { value: string; status: 'copied' | 'failed' } | null;

export function PasteSection() {
  const [copyState, setCopyState] = useState<CopyState>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(clearTimer.current), []);

  const copySample = async (value: string) => {
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
      setCopyState({ value, status: 'copied' });
    } catch {
      setCopyState({ value, status: 'failed' });
    }
    clearTimeout(clearTimer.current);
    clearTimer.current = setTimeout(() => setCopyState(null), 4000);
  };

  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="paste" className="space-y-4 scroll-mt-24">
      <h2>Paste messy text</h2>
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
          It runs the combined value through the full pipeline. Thousand separators are always
          removed, because the clipboard text and the current value can both carry them.
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
        Copy a string, then paste it into the Numora input. Clear the input before each one, because
        a paste is inserted into the text already there:
      </p>
      <DiagramFrame variant="demo">
        <div className="mb-2 flex flex-wrap gap-2">
          {samples.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => copySample(s)}
              aria-label={`Copy ${s}`}
              className="inline-flex min-h-9 items-center rounded-md border border-border bg-surface-1 px-2.5 font-mono text-caption text-foreground transition-[background-color,scale] duration-150 ease-out-expo hover:bg-surface-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.97] motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11"
            >
              {s}
            </button>
          ))}
        </div>
        <output className="mb-2 block min-h-5 text-caption text-muted-foreground">
          {copyState?.status === 'failed'
            ? 'Copy failed. Select the text instead.'
            : copyState?.status === 'copied'
              ? `Copied ${copyState.value}`
              : ''}
        </output>
        <NumoraInput
          formatOn="change"
          thousandSeparator=","
          groupingStyle="thousand"
          decimalMaxLength={2}
          allowCompactNotation
          aria-label="Paste test input"
          placeholder="Paste here"
          className={demoInputClass}
        />
      </DiagramFrame>
    </section>
  );
}
