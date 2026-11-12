import { NumoraInput } from 'numora-react';
import { useEffect, useId, useRef, useState } from 'react';
import { TextMorph } from 'torph';
import { useTypingLoop } from '@/hooks/use-typing-loop';
import { DemoFrame, demoOverlayBox, demoOverlayInput } from './DemoFrame';

export function TorphBlurDemo() {
  const inputId = useId();
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

  return (
    <DemoFrame inputId={inputId} hint="Blur the field to format.">
      <div className={demoOverlayBox}>
        <span ref={displayRef} aria-hidden="true" className="pointer-events-none whitespace-pre">
          0
        </span>
        <NumoraInput
          id={inputId}
          ref={inputRef}
          defaultValue="1234567"
          // Every rewrite of the field: typing, the focus strip and the blur regroup.
          onFormattedValueChange={(text) => morphRef.current?.update(text || '0')}
          onFocus={() => {
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
          formatOn="blur"
          decimalMaxLength={2}
          thousandSeparator=","
          groupingStyle="thousand"
          aria-label="Amount"
          className={`${demoOverlayInput} ${caretHidden ? 'caret-transparent' : 'caret-foreground'}`}
        />
      </div>
    </DemoFrame>
  );
}
