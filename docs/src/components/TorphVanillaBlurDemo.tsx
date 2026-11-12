import { NumoraInput } from 'numora';
import { useEffect, useId, useRef } from 'react';
import { TextMorph } from 'torph';
import { startTypingLoop } from '@/hooks/use-typing-loop';
import { DemoFrame, demoOverlayBox } from './DemoFrame';

export function TorphVanillaBlurDemo() {
  const inputId = useId();
  const displayRef = useRef<HTMLSpanElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!displayRef.current || !hostRef.current) return;

    displayRef.current.textContent = '';

    // True from focus → first morph-complete, so the focus-strip morph hides the cursor
    // but later per-keystroke morphs do not (you need to see your cursor while typing).
    let postFocusMorphPending = false;
    const updateCaret = (hidden: boolean) => {
      hostRef.current?.classList.toggle('caret-suppressed', hidden);
    };

    const morph = new TextMorph({
      element: displayRef.current,
      ease: { stiffness: 400, damping: 30 },
      onAnimationComplete: () => {
        if (postFocusMorphPending) {
          postFocusMorphPending = false;
          updateCaret(false);
        }
      },
    });

    // onFormattedValueChange fires on every rewrite of the field: typing, paste, undo/redo,
    // the focus strip and the blur regroup.
    const numora = new NumoraInput(hostRef.current, {
      formatOn: 'blur',
      decimalMaxLength: 2,
      thousandSeparator: ',',
      groupingStyle: 'thousand',
      defaultValue: '1234567',
      onFormattedValueChange: (text) => morph.update(text || '0'),
    });
    const input = numora.element;
    input.id = inputId;
    input.setAttribute('aria-label', 'Amount');

    // Creation fires no callback, so show the first text here.
    morph.update(numora.formattedValue || '0');

    let caretTimeout: number | undefined;
    const handleFocus = () => {
      postFocusMorphPending = true;
      updateCaret(true);
      // Fallback if no morph fires (e.g. value already has no separators), so the caret
      // is never left hidden. Slightly longer than the morph duration to avoid revealing mid-flight.
      window.clearTimeout(caretTimeout);
      caretTimeout = window.setTimeout(() => {
        if (postFocusMorphPending) {
          postFocusMorphPending = false;
          updateCaret(false);
        }
      }, 600);
    };

    input.addEventListener('focus', handleFocus);

    const stopTypingLoop = startTypingLoop(input, { mode: 'blur' });

    return () => {
      stopTypingLoop();
      window.clearTimeout(caretTimeout);
      input.removeEventListener('focus', handleFocus);
      morph.destroy();
      input.remove();
    };
  }, [inputId]);

  return (
    <>
      <style>{`
        .torph-vanilla-input-host input {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          border: 0;
          text-align: left;
          background: transparent;
          color: transparent;
          caret-color: var(--color-foreground);
          outline: none;
          font: inherit;
        }
        .torph-vanilla-input-host.caret-suppressed input { caret-color: transparent; }
        .torph-vanilla-input-host input::selection { background: color-mix(in oklch, var(--color-foreground) 25%, transparent); }
        .torph-vanilla-input-host input::placeholder { color: transparent; }
      `}</style>
      <DemoFrame inputId={inputId} hint="Blur the field to format.">
        <div className={demoOverlayBox}>
          <span ref={displayRef} className="pointer-events-none whitespace-pre" aria-hidden="true">
            0
          </span>
          <div ref={hostRef} className="torph-vanilla-input-host absolute inset-0" />
        </div>
      </DemoFrame>
    </>
  );
}
