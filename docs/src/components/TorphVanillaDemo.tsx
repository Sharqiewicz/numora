import { FormatOn, NumoraInput, ThousandStyle } from 'numora';
import { useEffect, useRef } from 'react';
import { TextMorph } from 'torph';

export function TorphVanillaDemo() {
  const displayRef = useRef<HTMLSpanElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!displayRef.current || !hostRef.current) return;

    // The "0" rendered for SSR is a text node, not an element. Torph's createTextGroup
    // only inspects element children, so it would add new spans next to that text node
    // instead of replacing it. Clear textContent so torph owns the span.
    displayRef.current.textContent = '';

    const numora = new NumoraInput(hostRef.current, {
      formatOn: FormatOn.Change,
      decimalMaxLength: 2,
      thousandSeparator: ',',
      value: '1234567',
      thousandStyle: ThousandStyle.Thousand,
    });
    const input = numora.getElement();
    input.setAttribute('aria-label', 'Amount');

    const morph = new TextMorph({
      element: displayRef.current,
      ease: { stiffness: 400, damping: 30 },
    });

    const syncMorph = () => {
      morph.update(numora.value || '0');
    };

    syncMorph();

    // Numora applies formatted values in beforeinput via setRangeText. Sync after that
    // handler runs; an input listener alone is not guaranteed in every environment.
    const scheduleMorphSync = () => {
      queueMicrotask(syncMorph);
    };

    input.addEventListener('beforeinput', scheduleMorphSync);
    input.addEventListener('input', syncMorph);

    return () => {
      input.removeEventListener('beforeinput', scheduleMorphSync);
      input.removeEventListener('input', syncMorph);
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
          caret-color: var(--secondary);
          outline: none;
          font: inherit;
        }
        .torph-vanilla-input-host input::selection { background: color-mix(in oklch, var(--secondary) 40%, transparent); }
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
