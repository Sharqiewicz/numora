import { useId, useRef } from 'react';
import { useTypingLoop } from '@/hooks/use-typing-loop';
import { DemoFrame, demoOverlayBox } from './DemoFrame';
import { TorphField } from './TorphField';

export function TorphBlurDemo() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useTypingLoop(inputRef, { mode: 'blur' });

  return (
    <DemoFrame inputId={inputId} hint="Blur the field to format." focusPointer>
      <div className={demoOverlayBox}>
        <TorphField
          id={inputId}
          ref={inputRef}
          defaultValue="1234567"
          formatOn="blur"
          decimalMaxLength={2}
          thousandSeparator=","
          groupingStyle="thousand"
          aria-label="Amount"
          // caret-hold: the caret appears once the focus-strip morph has settled.
          className="caret-foreground caret-hold"
        />
      </div>
    </DemoFrame>
  );
}
