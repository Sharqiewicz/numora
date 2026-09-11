import { FormatOn, NumoraInput, ThousandStyle } from 'numora';
import { useEffect, useRef } from 'react';
import { TextMorph } from 'torph';
import { startTypingLoop } from '@/hooks/use-typing-loop';

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

    const stopTypingLoop = startTypingLoop(input, { mode: 'change' });

    return () => {
      stopTypingLoop();
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
        .torph-vanilla-input-host input::selection { background: color-mix(in oklch, var(--secondary) 40%, transparent); }
        .torph-vanilla-input-host input::placeholder { color: transparent; }
      `}</style>
      <div className="my-12 w-full max-w-lg mx-auto">
        <label className="relative flex items-center justify-end w-full rounded-2xl border border-surface-3 bg-surface-1 overflow-hidden px-4 py-3 text-xl font-mono tracking-wide text-white cursor-text">
          <span ref={displayRef} className="pointer-events-none whitespace-pre" aria-hidden="true">
            0
          </span>
          <div ref={hostRef} className="torph-vanilla-input-host absolute inset-0" />
        </label>
      </div>
    </>
  );
}
