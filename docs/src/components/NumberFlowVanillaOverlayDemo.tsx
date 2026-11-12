import { NumoraInput } from 'numora';
import 'number-flow';
import { useEffect, useId, useRef } from 'react';
import { DemoFrame, demoOverlayBox } from './DemoFrame';

export function NumberFlowVanillaOverlayDemo() {
  const inputId = useId();
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
      formatOn: 'change',
      decimalMaxLength: 2,
      thousandSeparator: ',',
      defaultValue: '1234567',
      groupingStyle: 'thousand',
      // NumberFlow formats the canonical raw `value` itself, so syncing on raw
      // changes is enough - separator-only rewrites don't change what it shows.
      onValueChange: ({ value }) => syncFlow(value),
    });
    const input = numora.element;
    input.id = inputId;
    input.setAttribute('aria-label', 'Amount');

    // The initial value does not fire onValueChange, so prime the display.
    syncFlow(numora.rawValue);

    return () => {
      flow.remove();
      input.remove();
    };
  }, [inputId]);

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
          caret-color: var(--color-foreground);
          outline: none;
          font: inherit;
        }
        .nf-vanilla-input-host input::selection { background: color-mix(in oklab, var(--color-foreground) 25%, transparent); }
        .nf-vanilla-input-host input::placeholder { color: transparent; }
      `}</style>
      <DemoFrame inputId={inputId}>
        <div className={demoOverlayBox}>
          <span ref={displayRef} className="pointer-events-none whitespace-pre" aria-hidden="true">
            1,234,567
          </span>
          <div ref={hostRef} className="nf-vanilla-input-host absolute inset-0" />
        </div>
      </DemoFrame>
    </>
  );
}
