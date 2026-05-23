import { FormatOn, ThousandStyle } from 'numora';
import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react';
import { useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph';

export function TorphBlurDemo() {
  const [value, setValue] = useState('1234567');
  const [formatted, setFormatted] = useState('1,234,567');
  const displayRef = useRef<HTMLSpanElement>(null);
  const morphRef = useRef<TextMorph | null>(null);

  useEffect(() => {
    if (!displayRef.current) return;

    // SSR text node would confuse Torph's element-only child scan.
    displayRef.current.textContent = '';

    const morph = new TextMorph({
      element: displayRef.current,
      ease: { stiffness: 400, damping: 30 },
    });
    morph.update('1,234,567');
    morphRef.current = morph;

    return () => {
      morph.destroy();
      morphRef.current = null;
    };
  }, []);

  useEffect(() => {
    morphRef.current?.update(formatted || '0');
  }, [formatted]);

  return (
    <div className="my-16 py-12 flex justify-center items-center">
      <label className="relative inline-flex items-center min-h-[44px] min-w-[6ch] text-4xl font-mono leading-none text-white">
        <span ref={displayRef} aria-hidden="true" className="pointer-events-none whitespace-pre">
          0
        </span>
        <NumoraInput
          value={value}
          onChange={(e: NumoraInputChangeEvent) => {
            setValue(e.target.value);
            setFormatted(e.target.formattedValue || '');
          }}
          onFocus={(e) => {
            // FormatOn.Blur silently strips separators on focus without firing
            // onChange. Mirror the input's new raw display in the overlay.
            setFormatted(e.currentTarget.value);
          }}
          formatOn={FormatOn.Blur}
          maxDecimals={2}
          thousandSeparator=","
          thousandStyle={ThousandStyle.Thousand}
          aria-label="Amount (blur to format)"
          className="absolute inset-0 w-full h-full m-0 p-0 border-0 bg-transparent text-transparent placeholder-transparent caret-white outline-none focus:outline-none selection:bg-white/25 text-4xl font-mono leading-none"
        />
      </label>
    </div>
  );
}
