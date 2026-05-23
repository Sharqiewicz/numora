import { FormatOn, NumoraInput, ThousandStyle } from 'numora';
import { useEffect, useRef } from 'react';
import { TextMorph } from 'torph';

export function TorphVanillaBlurDemo() {
  const displayRef = useRef<HTMLSpanElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!displayRef.current || !hostRef.current) return;

    displayRef.current.textContent = '';

    const numora = new NumoraInput(hostRef.current, {
      formatOn: FormatOn.Blur,
      decimalMaxLength: 2,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
      value: '1234567',
    });
    const input = numora.getElement();
    input.setAttribute('aria-label', 'Amount (blur to format)');

    const morph = new TextMorph({
      element: displayRef.current,
      ease: { stiffness: 400, damping: 30 },
    });

    const syncMorph = () => {
      morph.update(numora.value || '0');
    };

    syncMorph();

    const scheduleMorphSync = () => {
      queueMicrotask(syncMorph);
    };

    input.addEventListener('beforeinput', scheduleMorphSync);
    input.addEventListener('input', syncMorph);
    // FormatOn.Blur strips separators on focus and re-applies them on blur without input events.
    input.addEventListener('focus', syncMorph);
    input.addEventListener('blur', syncMorph);

    return () => {
      input.removeEventListener('beforeinput', scheduleMorphSync);
      input.removeEventListener('input', syncMorph);
      input.removeEventListener('focus', syncMorph);
      input.removeEventListener('blur', syncMorph);
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
          padding: 0;
          border: 0;
          background: transparent;
          color: transparent;
          caret-color: white;
          outline: none;
          font: inherit;
        }
        .torph-vanilla-input-host input::selection { background: rgba(255, 255, 255, 0.25); }
        .torph-vanilla-input-host input::placeholder { color: transparent; }
      `}</style>
      <div className="my-16 py-12 flex justify-center items-center">
        <label className="relative inline-flex items-center min-h-[44px] min-w-[6ch] text-4xl font-mono leading-none text-white">
          <span ref={displayRef} className="pointer-events-none whitespace-pre" aria-hidden="true">
            0
          </span>
          <div ref={hostRef} className="torph-vanilla-input-host absolute inset-0" />
        </label>
      </div>
    </>
  );
}
