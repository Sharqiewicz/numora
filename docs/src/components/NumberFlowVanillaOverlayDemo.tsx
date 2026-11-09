import { FormatOn, NumoraInput, GroupingStyle } from 'numora';
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

    const syncFlow = (raw: string) => {
      const decimals = raw.includes('.') ? raw.split('.')[1].length : 0;
      // Mirror typed decimals so trailing zeros line up under the cursor.
      flow.format = {
        useGrouping: true,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      };
      flow.update(Number(raw) || 0);
    };

    const numora = new NumoraInput(hostRef.current, {
      formatOn: FormatOn.Change,
      decimalMaxLength: 2,
      thousandSeparator: ',',
      value: '1234567',
      groupingStyle: GroupingStyle.Thousand,
      // NumberFlow formats the canonical raw `value` itself, so syncing on raw
      // changes is enough - separator-only rewrites don't change what it shows.
      onChange: ({ value }) => syncFlow(value),
    });
    const input = numora.getElement();
    input.setAttribute('aria-label', 'Amount');

    // The initial value does not fire onChange, so prime the display.
    syncFlow(numora.value);

    return () => {
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
        <label className="relative inline-flex items-center min-h-[44px] min-w-[6ch] rounded-md has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-muted-foreground text-4xl font-mono leading-none text-white">
          <span
            ref={displayRef}
            className="pointer-events-none whitespace-pre tabular-nums"
            aria-hidden="true"
          >
            1,234,567
          </span>
          <div ref={hostRef} className="nf-vanilla-input-host absolute inset-0" />
        </label>
      </div>
    </>
  );
}
