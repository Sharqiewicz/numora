import { useId, useRef, useState } from 'react';
import { useTypingLoop } from '@/hooks/use-typing-loop';
import { DemoFrame, demoOverlayBox } from './DemoFrame';
import { TorphField } from './TorphField';

export function TorphDemo() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('1234567');

  useTypingLoop(inputRef);

  return (
    <DemoFrame inputId={inputId}>
      <div className={demoOverlayBox}>
        <TorphField
          id={inputId}
          ref={inputRef}
          allowCompactNotation
          value={value}
          onValueChange={({ value }) => setValue(value)}
          formatOn="change"
          decimalMaxLength={2}
          thousandSeparator=","
          aria-label="Amount"
          className="caret-foreground"
        />
      </div>
    </DemoFrame>
  );
}
