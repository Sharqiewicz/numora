import { useId, useRef, useState } from 'react';
import { PAIRED_LOOP, useTypingLoop } from '@/hooks/use-typing-loop';
import { DemoFrame, demoOverlayBox } from './DemoFrame';
import { TorphField } from './TorphField';

/**
 * `solo`: the demo stands alone, with no Blur demo beside it, so it types on its own
 * clock without the pointer.
 */
export function TorphDemo({ solo = false }: { solo?: boolean }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('1234567');

  useTypingLoop(inputRef, solo ? undefined : PAIRED_LOOP);

  return (
    <DemoFrame inputId={inputId} focusPointer={!solo}>
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
          demoCaret={!solo}
          className="caret-foreground"
        />
      </div>
    </DemoFrame>
  );
}
