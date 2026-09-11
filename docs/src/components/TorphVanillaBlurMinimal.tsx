import { FormatOn, NumoraInput, ThousandStyle } from 'numora';
import { useEffect, useRef } from 'react';
import { TextMorph } from 'torph';
import { startTypingLoop } from '@/hooks/use-typing-loop';

/**
 * The 3-line core integration for vanilla NumoraInput + Torph.
 *
 * The visible caret will briefly "float" during the focus-strip morph
 * (1,234,567 → 1234567) because the native caret lands at its final position
 * while the digits slide into theirs over ~400ms. See `TorphVanillaBlurDemo`
 * for the variant that hides the caret during that window.
 */
export function TorphVanillaBlurMinimal() {
  const displayRef = useRef<HTMLSpanElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!displayRef.current || !hostRef.current) return;
    displayRef.current.textContent = '';

    const morph = new TextMorph({
      element: displayRef.current,
      ease: { stiffness: 400, damping: 30 },
    });

    const numora = new NumoraInput(hostRef.current, {
      formatOn: FormatOn.Blur,
      decimalMaxLength: 2,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
      value: '1234567',
      onChange: (value) => morph.update(value || '0'),
    });
    const input = numora.getElement();
    input.setAttribute('aria-label', 'Amount (blur to format)');

    // setDefaultValue runs before onChange is wired (and never fires onChange anyway).
    // Prime the morph with the formatted initial value.
    morph.update(numora.value || '0');

    const stopTypingLoop = startTypingLoop(input, { mode: 'blur' });

    return () => {
      stopTypingLoop();
      morph.destroy();
      input.remove();
    };
  }, []);

  return (
    <>
      <style>{`
        .torph-vanilla-minimal-host input {
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
        .torph-vanilla-minimal-host input::selection { background: color-mix(in oklch, var(--secondary) 40%, transparent); }
        .torph-vanilla-minimal-host input::placeholder { color: transparent; }
      `}</style>
      <div className="my-12 w-full max-w-lg mx-auto">
        <label className="relative flex items-center justify-end w-full rounded-2xl border border-surface-3 bg-surface-1 overflow-hidden px-4 py-3 text-xl font-mono tracking-wide text-white cursor-text">
          <span ref={displayRef} className="pointer-events-none whitespace-pre" aria-hidden="true">
            0
          </span>
          <div ref={hostRef} className="torph-vanilla-minimal-host absolute inset-0" />
        </label>
      </div>
    </>
  );
}
