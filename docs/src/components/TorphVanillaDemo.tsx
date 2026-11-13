import { NumoraInput } from 'numora';
import { useEffect, useId, useRef } from 'react';
import { TextMorph } from 'torph';
import { startTypingLoop } from '@/hooks/use-typing-loop';
import { DemoFrame, demoOverlayBox } from './DemoFrame';

export function TorphVanillaDemo() {
  const inputId = useId();
  const displayRef = useRef<HTMLSpanElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!displayRef.current || !hostRef.current) return;

    // The "0" rendered for SSR is a text node, not an element. Torph's createTextGroup
    // only inspects element children, so it would add new spans next to that text node
    // instead of replacing it. Clear textContent so torph owns the span.
    displayRef.current.textContent = '';

    const morph = new TextMorph({
      element: displayRef.current,
      ease: { stiffness: 400, damping: 30 },
    });

    const numora = new NumoraInput(hostRef.current, {
      formatOn: 'change',
      decimalMaxLength: 2,
      thousandSeparator: ',',
      defaultValue: '1234567',
      groupingStyle: 'thousand',
      // The caret is the second argument: Torph then matches digits around the edit.
      onFormattedValueChange: (text) =>
        morph.update(text || '0', numora.element.selectionStart ?? undefined),
    });
    const input = numora.element;
    input.id = inputId;
    input.setAttribute('aria-label', 'Amount');

    // Creation fires no callback, so show the first text here.
    morph.update(numora.formattedValue || '0');

    const stopTypingLoop = startTypingLoop(input, { mode: 'change' });

    return () => {
      stopTypingLoop();
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
        .torph-vanilla-input-host input::selection { background: color-mix(in oklch, var(--color-foreground) 25%, transparent); }
        .torph-vanilla-input-host input::placeholder { color: transparent; }
      `}</style>
      <DemoFrame inputId={inputId}>
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
