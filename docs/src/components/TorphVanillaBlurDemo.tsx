import { FormatOn, NumoraInput, GroupingStyle } from 'numora';
import { useEffect, useRef } from 'react';
import { TextMorph } from 'torph';
import { startTypingLoop } from '@/hooks/use-typing-loop';

export function TorphVanillaBlurDemo() {
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

    // Drive the morph via NumoraInput's onChange option, which fires when the raw value
    // changes (typing, paste, undo/redo). In Blur mode the focus-strip and blur-regroup
    // leave the raw value unchanged, so focus/blur listeners below sync the morph too.
    const numora = new NumoraInput(hostRef.current, {
      formatOn: FormatOn.Blur,
      decimalMaxLength: 2,
      thousandSeparator: ',',
      groupingStyle: GroupingStyle.Thousand,
      value: '1234567',
      onChange: ({ formattedValue }) => morph.update(formattedValue || '0'),
    });
    const input = numora.getElement();
    input.setAttribute('aria-label', 'Amount');

    // The constructor's setDefaultValue runs before onChange is wired (and never fires
    // onChange anyway), so prime the morph with the formatted initial value here.
    morph.update(numora.getFormattedValue() || '0');

    let caretTimeout: number | undefined;
    const handleFocus = () => {
      postFocusMorphPending = true;
      updateCaret(true);
      // Numora's own focus handler (bound in the constructor) already stripped separators.
      morph.update(numora.getFormattedValue() || '0');
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

    const handleBlur = () => {
      morph.update(numora.getFormattedValue() || '0');
    };

    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);

    const stopTypingLoop = startTypingLoop(input, { mode: 'blur' });

    return () => {
      stopTypingLoop();
      window.clearTimeout(caretTimeout);
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
      morph.destroy();
      input.remove();
    };
  }, []);

  return (
    <>
      <style>{`
        .torph-vanilla-input-host input {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0.75rem 1rem;
          box-sizing: border-box;
          border: 0;
          text-align: right;
          background: transparent;
          color: transparent;
          caret-color: var(--secondary);
          outline: none;
          font: inherit;
        }
        .torph-vanilla-input-host.caret-suppressed input { caret-color: transparent; }
        .torph-vanilla-input-host input::selection { background: color-mix(in oklch, var(--secondary) 40%, transparent); }
        .torph-vanilla-input-host input::placeholder { color: transparent; }
      `}</style>
      <div className="my-12 w-full max-w-lg mx-auto">
        <label className="relative flex items-center justify-end w-full rounded-2xl has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-muted-foreground border border-surface-3 bg-surface-1 overflow-hidden px-4 py-3 text-xl font-mono tracking-wide text-white cursor-text">
          <span ref={displayRef} className="pointer-events-none whitespace-pre" aria-hidden="true">
            0
          </span>
          <div ref={hostRef} className="torph-vanilla-input-host absolute inset-0" />
        </label>
        <p className="mt-2 text-center text-sm text-muted-foreground">Blur the field to format.</p>
      </div>
    </>
  );
}
