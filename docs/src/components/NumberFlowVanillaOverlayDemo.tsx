import { FormatOn, NumoraInput, ThousandStyle } from 'numora';
import 'number-flow';
import { useEffect, useRef } from 'react';

export function NumberFlowVanillaOverlayDemo() {
  const displayRef = useRef<HTMLSpanElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!displayRef.current || !hostRef.current) return;

    // The "1,234,567" rendered for SSR is a plain text node. <number-flow> needs to be
    // a sibling element, not a child of the span, so clear the span and append.
    displayRef.current.textContent = '';

    const flow = document.createElement('number-flow');
    displayRef.current.appendChild(flow);

    const numora = new NumoraInput(hostRef.current, {
      formatOn: FormatOn.Change,
      decimalMaxLength: 2,
      thousandSeparator: ',',
      value: '1234567',
      thousandStyle: ThousandStyle.Thousand,
    });
    const input = numora.getElement();
    input.setAttribute('aria-label', 'Amount');

    const syncFlow = () => {
      const raw = numora.value;
      const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
      // Mirror typed decimals so trailing zeros line up under the caret.
      flow.format = {
        useGrouping: true,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      };
      flow.update(raw === '' ? 0 : Number(raw));
    };

    syncFlow();

    // Numora applies formatted values in beforeinput via setRangeText. The input event
    // is not guaranteed to follow on every path, so sync via a beforeinput microtask too.
    const scheduleFlowSync = () => {
      queueMicrotask(syncFlow);
    };

    input.addEventListener('beforeinput', scheduleFlowSync);
    input.addEventListener('input', syncFlow);

    return () => {
      input.removeEventListener('beforeinput', scheduleFlowSync);
      input.removeEventListener('input', syncFlow);
      flow.remove();
      input.remove();
    };
  }, []);

  return (
    <>
      <style>{`
        .nf-vanilla-input-host input {
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
        .nf-vanilla-input-host input::selection { background: rgba(255, 255, 255, 0.25); }
        .nf-vanilla-input-host input::placeholder { color: transparent; }
      `}</style>
      <div className="my-16 py-12 flex justify-center items-center">
        <label className="relative inline-flex items-center min-h-[44px] min-w-[6ch] text-4xl font-mono leading-none text-white">
          <span ref={displayRef} className="pointer-events-none whitespace-pre tabular-nums" aria-hidden="true">
            1,234,567
          </span>
          <div ref={hostRef} className="nf-vanilla-input-host absolute inset-0" />
        </label>
      </div>
    </>
  );
}
