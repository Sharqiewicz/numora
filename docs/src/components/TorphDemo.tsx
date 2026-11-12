import { NumoraInput } from 'numora-react';
import { useEffect, useId, useRef, useState } from 'react';
import { TextMorph } from 'torph';
import { useTypingLoop } from '@/hooks/use-typing-loop';
import { DemoFrame, demoOverlayBox, demoOverlayInput } from './DemoFrame';

export function TorphDemo() {
  const inputId = useId();
  const [value, setValue] = useState('1234567');
  const displayRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const morphRef = useRef<TextMorph | null>(null);

  useTypingLoop(inputRef);

  useEffect(() => {
    const display = displayRef.current;
    if (!display) return;

    // The "0" rendered for SSR is a text node. Torph's createTextGroup only inspects
    // element children, so it would leave that text node alone and append new spans
    // beside it. Clear textContent so torph owns the span on first attach.
    display.textContent = '';
    const morph = new TextMorph({
      element: display,
      ease: { stiffness: 400, damping: 30 },
    });
    // The first text: onFormattedValueChange does not fire on mount.
    morph.update('1,234,567');
    morphRef.current = morph;
    return () => {
      morph.destroy();
      morphRef.current = null;
    };
  }, []);

  return (
    <DemoFrame inputId={inputId}>
      <div className={demoOverlayBox}>
        <span ref={displayRef} aria-hidden="true" className="pointer-events-none whitespace-pre">
          0
        </span>
        <NumoraInput
          id={inputId}
          ref={inputRef}
          allowCompactNotation
          value={value}
          onValueChange={({ value }) => setValue(value)}
          onFormattedValueChange={(text) => morphRef.current?.update(text || '0')}
          formatOn="change"
          decimalMaxLength={2}
          thousandSeparator=","
          aria-label="Amount"
          className={`${demoOverlayInput} caret-foreground`}
        />
      </div>
    </DemoFrame>
  );
}
