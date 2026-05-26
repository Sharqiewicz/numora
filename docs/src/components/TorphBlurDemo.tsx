import { FormatOn, ThousandStyle } from 'numora';
import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react';
import { useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph';

export function TorphBlurDemo() {
  // Uncontrolled: passing `value` would re-trigger the input's controlled-value sync
  // effect on every keystroke, which in Blur mode reformats raw → formatted mid-typing
  // and desyncs the Torph overlay. See adr/0002-torph-blur-mode-bug.md.
  const [formatted, setFormatted] = useState('1,234,567');
  const [caretHidden, setCaretHidden] = useState(false);
  const displayRef = useRef<HTMLSpanElement>(null);
  const morphRef = useRef<TextMorph | null>(null);
  // True from focus → first morph-complete, so the focus-strip morph hides the caret
  // but later per-keystroke morphs do not (you need to see your caret while typing).
  const postFocusMorphPendingRef = useRef(false);

  useEffect(() => {
    if (!displayRef.current) return;

    displayRef.current.textContent = '';

    const morph = new TextMorph({
      element: displayRef.current,
      ease: { stiffness: 400, damping: 30 },
      onAnimationComplete: () => {
        if (postFocusMorphPendingRef.current) {
          postFocusMorphPendingRef.current = false;
          setCaretHidden(false);
        }
      },
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
          defaultValue="1234567"
          onChange={(e: NumoraInputChangeEvent) => {
            setFormatted(e.target.formattedValue || '');
          }}
          onFocus={() => {
            postFocusMorphPendingRef.current = true;
            setCaretHidden(true);
            // Fallback if no morph fires (e.g. value already has no separators).
            // Slightly longer than the expected morph duration so we don't reveal mid-flight.
            window.setTimeout(() => {
              if (postFocusMorphPendingRef.current) {
                postFocusMorphPendingRef.current = false;
                setCaretHidden(false);
              }
            }, 600);
          }}
          formatOn={FormatOn.Blur}
          maxDecimals={2}
          thousandSeparator=","
          thousandStyle={ThousandStyle.Thousand}
          aria-label="Amount (blur to format)"
          className={`absolute inset-0 w-full h-full m-0 p-0 border-0 bg-transparent text-transparent placeholder-transparent ${caretHidden ? 'caret-transparent' : 'caret-secondary'} outline-none focus:outline-none selection:bg-secondary/40 text-4xl font-mono leading-none`}
        />
      </label>
    </div>
  );
}
