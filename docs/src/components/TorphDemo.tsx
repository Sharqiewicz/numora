import { FormatOn } from 'numora';
import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react';
import { useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph';

export function TorphDemo() {
  const [value, setValue] = useState('1234567');
  const [formatted, setFormatted] = useState('1,234,567');
  const displayRef = useRef<HTMLSpanElement>(null);
  const morphRef = useRef<TextMorph | null>(null);

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
    [],
  );

  return (
    <div className="my-16 py-12 flex justify-center items-center">
      <label className="relative inline-flex items-center min-h-[44px] min-w-[6ch] text-4xl font-mono leading-none text-white">
        <span ref={displayRef} aria-hidden="true" className="pointer-events-none whitespace-pre">
          0
        </span>
        <NumoraInput
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
          className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-transparent text-transparent placeholder-transparent caret-white outline-none focus:outline-none selection:bg-white/25 text-4xl font-mono leading-none"
        />
      </label>
    </div>
  );
}
