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
      <p>The paste handler:</p>
      <ol>
        <li>
          Call <code>e.preventDefault()</code> to block the native paste. A read-only or disabled
          field stops here and takes nothing.
        </li>
        <li>
          Read the text with <code>e.clipboardData.getData('text/plain')</code>.
        </li>
        <li>Splice the clipboard text into the current value at the active selection.</li>
        <li>
          Run the combined value through the full pipeline with{' '}
          <code>shouldRemoveThousandSeparators: true</code>. This is unconditional, because the
          clipboard text and the current value (in blur mode) can both carry separators that must be
          parsed together.
        </li>
        <li>
          Stop if <code>isAllowed</code> refuses the result, or if the text holds scientific
          notation and <code>allowScientificNotation</code> is off. Otherwise write the result with{' '}
          <code>setRangeText</code> (via <code>writeValue</code>), then place the cursor.
        </li>
        <li>
          Call the change callback directly. In React that is <code>onChange</code>, where{' '}
          <code>e.target.value</code> is the raw value and <code>e.target.formattedValue</code> the
          display string. In vanilla it is <code>onValueChange</code>, which receives{' '}
          <code>{'{ value, formattedValue }'}</code>. No synthetic <code>input</code> event is
          dispatched.
        </li>
      </ol>
      <p>
        Pasted text may come from another locale, so Numora does not assume the field's own
        separators. Dropped and autofilled text is read the same way, except in a focused field that
        formats on change, which reads it as its own display text. When both <code>.</code> and{' '}
        <code>,</code> appear, the last one is the decimal mark and the rest is grouping, so a
        German <code>1.234,56</code> pasted into a field with <code>thousandSeparator=","</code> is
        read as <code>1234.56</code>. A mark that repeats is grouping. A single mark is the decimal
        mark when it is the field's own decimal separator. Otherwise it is grouping when the digits
        around it form valid groups (<code>1,234</code>), and the decimal mark when they do not.
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
