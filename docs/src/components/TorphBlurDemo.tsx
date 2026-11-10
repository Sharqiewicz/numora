import { FormatOn, GroupingStyle } from 'numora';
import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react';
import { useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph';
import { useTypingLoop } from '@/hooks/use-typing-loop';

export function TorphBlurDemo() {
  // Uncontrolled: passing `value` would re-trigger the input's controlled-value sync
  // effect on every keystroke, which in Blur mode reformats raw → formatted mid-typing
  // and desyncs the Torph overlay. See adr/0002-torph-blur-mode-bug.md.
  const [formatted, setFormatted] = useState('1,234,567');
  const [caretHidden, setCaretHidden] = useState(false);
  const displayRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const morphRef = useRef<TextMorph | null>(null);
  // True from focus → first morph-complete, so the focus-strip morph hides the cursor
  // but later per-keystroke morphs do not (you need to see your cursor while typing).
  const postFocusMorphPendingRef = useRef(false);
  const caretTimeoutRef = useRef<number | undefined>(undefined);

  useTypingLoop(inputRef, { mode: 'blur' });

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
      window.clearTimeout(caretTimeoutRef.current);
      morph.destroy();
      morphRef.current = null;
    };
  }, []);

  useEffect(() => {
    morphRef.current?.update(formatted || '0');
  }, [formatted]);

  return (
    <div className="my-12 w-full max-w-lg mx-auto">
      <label className="relative flex items-center justify-end w-full rounded-2xl has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-muted-foreground border border-surface-3 bg-surface-1 overflow-hidden px-4 py-3 text-xl font-mono tracking-wide text-white cursor-text">
        <span ref={displayRef} aria-hidden="true" className="pointer-events-none whitespace-pre">
          0
        </span>
        <NumoraInput
          ref={inputRef}
          defaultValue="1234567"
          onChange={(e: NumoraInputChangeEvent) => {
            setFormatted(e.target.formattedValue || '');
          }}
          // The focus-strip doesn't fire onChange (the number didn't change), so read the
          // stripped text from the DOM: keyboard focus strips before onFocus, mouse focus on click.
          onClick={(e) => setFormatted(e.currentTarget.value)}
          onFocus={(e) => {
            setFormatted(e.currentTarget.value);
            postFocusMorphPendingRef.current = true;
            setCaretHidden(true);
            // Fallback if no morph fires (e.g. value already has no separators), so the caret
            // is never left hidden. Slightly longer than the expected morph duration so we don't reveal mid-flight.
            window.clearTimeout(caretTimeoutRef.current);
            caretTimeoutRef.current = window.setTimeout(() => {
              if (postFocusMorphPendingRef.current) {
                postFocusMorphPendingRef.current = false;
                setCaretHidden(false);
              }
            }, 600);
          }}
          formatOn={FormatOn.Blur}
          decimalMaxLength={2}
          thousandSeparator=","
          groupingStyle={GroupingStyle.Thousand}
          aria-label="Amount"
          className={`absolute inset-0 w-full h-full m-0 px-4 py-3 border-0 bg-transparent text-transparent placeholder-transparent ${caretHidden ? 'caret-transparent' : 'caret-secondary'} outline-none focus:outline-none selection:bg-secondary/40 text-right text-xl font-mono tracking-wide`}
        />
      </label>
      <p className="mt-2 text-center text-sm text-muted-foreground">Blur the field to format.</p>
    </div>
  );
}
