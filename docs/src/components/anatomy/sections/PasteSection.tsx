import { useEffect, useRef, useState } from 'react';
import { NumoraInput } from 'numora-react';
import { DiagramFrame, demoInputClass } from '../kit';

const samples = [
  { label: 'US price with $', value: '$1,234.56 USD' },
  { label: 'Excel cell', value: '1,234.560000' },
  { label: 'Spaced digits', value: '1 234.56' },
  { label: 'Email body fragment', value: 'price: 2,500,000.00 USD' },
];

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
    <section id="paste" className="space-y-4 scroll-mt-24">
      <h2>Paste messy text</h2>
      <p>
        When the user pastes, <code>beforeinput</code> fires first with{' '}
        <code>inputType: 'insertFromPaste'</code>. Numora returns immediately. The dedicated{' '}
        <code>paste</code> handler takes over because it has the full <code>ClipboardData</code>{' '}
        object.
      </p>
      <p>The paste handler:</p>
      <ol>
        <li>
          Call <code>e.preventDefault()</code> to block the native paste.
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
          Write the result with <code>setRangeText</code> (via <code>writeValue</code>), then place
          the cursor.
        </li>
        <li>
          Call <code>onChange</code> directly. In React, <code>e.target.value</code> is the raw
          value and <code>e.target.formattedValue</code> the display string. In vanilla, the
          callback receives <code>{'{ value, formattedValue }'}</code>. No synthetic{' '}
          <code>input</code> event is dispatched.
        </li>
      </ol>
      <p>
        Numora does not convert separators between locales. It only knows the separators you
        configured. With <code>thousandSeparator=","</code>, a German <code>1.234,56</code> loses
        its comma and is read as <code>1.23456</code>, then trimmed to the decimal limit.
      </p>
      <p>Copy any of these strings, then paste it into the Numora input below:</p>
      <DiagramFrame variant="demo">
        <ul className="m-0 mb-4 list-none space-y-1 p-0">
          {samples.map((s) => {
            const state = copyState?.value === s.value ? copyState.status : null;
            return (
              <li key={s.label} className="m-0 p-0">
                <button
                  type="button"
                  onClick={() => copySample(s.value)}
                  className="inline-flex min-h-6 items-center py-1 text-left text-caption transition-[color,scale] duration-150 ease-out-expo hover:text-foreground active:scale-[0.97] motion-reduce:transition-none [@media(pointer:coarse)]:min-h-11"
                  aria-label={`${s.label}: ${s.value}. Copy`}
                >
                  <span className="text-muted-foreground">{s.label}: </span>
                  <span className="font-mono text-foreground underline decoration-border underline-offset-4 hover:decoration-foreground">
                    {s.value}
                  </span>
                  {state === 'copied' && (
                    <span aria-hidden className="ml-2 text-signal-green-fg">
                      Copied
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
        <output className="mb-2 block min-h-4 text-caption text-muted-foreground">
          {copyState?.status === 'failed'
            ? 'Copy failed. Select the text and copy it manually'
            : copyState?.status === 'copied'
              ? `Copied ${samples.find((x) => x.value === copyState.value)?.label ?? ''}`
              : ''}
        </output>
        <NumoraInput
          formatOn="change"
          thousandSeparator=","
          groupingStyle="thousand"
          decimalMaxLength={2}
          allowCompactNotation
          aria-label="Paste test input"
          placeholder="$1,234.56 USD"
          className={demoInputClass}
        />
      </DiagramFrame>
    </section>
  );
}
