import { FormatOn, NumoraInput, ThousandStyle } from 'numora';
import { useEffect, useRef } from 'react';
import { TextMorph } from 'torph';

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
    numora.getElement().setAttribute('aria-label', 'Amount (blur to format)');

    // setDefaultValue runs before onChange is wired (and never fires onChange anyway).
    // Prime the morph with the formatted initial value.
    morph.update(numora.value || '0');

    return () => {
      morph.destroy();
      numora.getElement().remove();
    };
  }, []);

  return (
    <>
      <style>{`
        .torph-vanilla-minimal-host input {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          border: 0;
          background: transparent;
          color: transparent;
          caret-color: var(--secondary);
          outline: none;
          font: inherit;
        }
        .torph-vanilla-minimal-host input::selection { background: color-mix(in oklch, var(--secondary) 40%, transparent); }
        .torph-vanilla-minimal-host input::placeholder { color: transparent; }
      `}</style>
      <div className="my-16 py-12 flex justify-center items-center">
        <label className="relative inline-flex items-center min-h-[44px] min-w-[6ch] text-4xl font-mono leading-none text-white">
          <span ref={displayRef} className="pointer-events-none whitespace-pre" aria-hidden="true">
            0
          </span>
          <div ref={hostRef} className="torph-vanilla-minimal-host absolute inset-0" />
        </label>
      </div>
    </>
  );
}
