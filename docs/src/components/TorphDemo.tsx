import { formatValue } from 'numora';
import { NumoraInput } from 'numora-react';
import { useId, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import { useTypingLoop } from '@/hooks/use-typing-loop';
import { DemoFrame, demoOverlayBox, demoOverlayInput } from './DemoFrame';

const OPTIONS = { formatOn: 'change', decimalMaxLength: 2, thousandSeparator: ',' } as const;
const EASE = { stiffness: 400, damping: 30 };

export function TorphDemo() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('1234567');
  // The first text: onFormattedValueChange does not fire on mount.
  const [text, setText] = useState(() => formatValue('1234567', OPTIONS));
  const [caret, setCaret] = useState<number>();

  useTypingLoop(inputRef);

  return (
    <DemoFrame inputId={inputId}>
      <div className={demoOverlayBox}>
        <span aria-hidden="true" className="pointer-events-none whitespace-pre">
          {/* The caret tells Torph where the edit was, so digits move instead of renumbering. */}
          <TextMorph cursorIndex={caret} ease={EASE}>
            {text || '0'}
          </TextMorph>
        </span>
        <NumoraInput
          id={inputId}
          ref={inputRef}
          allowCompactNotation
          value={value}
          onValueChange={({ value }) => setValue(value)}
          onFormattedValueChange={(next) => {
            setCaret(inputRef.current?.selectionStart ?? undefined);
            setText(next);
          }}
          {...OPTIONS}
          aria-label="Amount"
          className={`${demoOverlayInput} caret-foreground`}
        />
      </div>
    </DemoFrame>
  );
}
