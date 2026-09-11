import { FormatOn } from 'numora';
import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react';
import { useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph';
import { useTypingLoop } from '@/hooks/use-typing-loop';

export function TorphDemo() {
  const [value, setValue] = useState('1234567');
  const [formatted, setFormatted] = useState('1,234,567');
  const displayRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const morphRef = useRef<TextMorph | null>(null);

  useTypingLoop(inputRef);

  useEffect(() => {
    const display = displayRef.current;
    if (!display) return;

    let morph = morphRef.current;
    if (!morph) {
      // The "0" rendered for SSR is a text node. Torph's createTextGroup only inspects
      // element children, so it would leave that text node alone and append new spans
      // beside it. Clear textContent so torph owns the span on first attach.
      display.textContent = '';
      morph = new TextMorph({
        element: display,
        ease: { stiffness: 400, damping: 30 },
      });
      morphRef.current = morph;
    }
    morph.update(formatted || '0');
  }, [formatted]);

  useEffect(
    () => () => {
      morphRef.current?.destroy();
      morphRef.current = null;
    },
    []
  );

  return (
    <div className="my-12 w-full max-w-lg mx-auto">
      <label className="relative flex items-center justify-end w-full rounded-2xl border border-surface-3 bg-surface-1 overflow-hidden px-4 py-3 text-xl font-mono tracking-wide text-white cursor-text">
        <span ref={displayRef} aria-hidden="true" className="pointer-events-none whitespace-pre">
          0
        </span>
        <NumoraInput
          ref={inputRef}
          enableCompactNotation
          value={value}
          onChange={(e: NumoraInputChangeEvent) => {
            setValue(e.target.value);
            setFormatted(e.target.formattedValue || '');
          }}
          formatOn={FormatOn.Change}
          maxDecimals={2}
          thousandSeparator=","
          aria-label="Amount"
          className="absolute inset-0 w-full h-full m-0 px-4 py-3 border-0 bg-transparent text-transparent placeholder-transparent caret-secondary outline-none focus:outline-none selection:bg-secondary/40 text-right text-xl font-mono tracking-wide"
        />
      </label>
    </div>
  );
}
