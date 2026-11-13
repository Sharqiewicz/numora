import { formatValue } from 'numora';
import { NumoraInput } from 'numora-react';
import { useId, useRef, useState } from 'react';
import { TextMorph } from 'torph/react';
import { useTypingLoop } from '@/hooks/use-typing-loop';
import { DemoFrame, demoOverlayBox, demoOverlayInput } from './DemoFrame';

const OPTIONS = {
  formatOn: 'blur',
  decimalMaxLength: 2,
  thousandSeparator: ',',
  groupingStyle: 'thousand',
} as const;
const EASE = { stiffness: 400, damping: 30 };

/**
 * The core integration: NumoraInput → onFormattedValueChange → <TextMorph>.
 *
 * The visible cursor drifts during the focus-strip morph
 * (1,234,567 → 1234567) because the native cursor lands at its final position
 * while the digits slide into theirs over ~400ms. See `TorphBlurDemo` for the
 * variant that hides the cursor during that window.
 */
export function TorphBlurMinimal() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  // The first text: onFormattedValueChange does not fire on mount.
  const [text, setText] = useState(() => formatValue('1234567', OPTIONS));
  const [caret, setCaret] = useState<number>();

  useTypingLoop(inputRef, { mode: 'blur' });

  return (
    <DemoFrame inputId={inputId} hint="Blur the field to format.">
      <div className={demoOverlayBox}>
        <span aria-hidden="true" className="pointer-events-none whitespace-pre">
          <TextMorph cursorIndex={caret} ease={EASE}>
            {text || '0'}
          </TextMorph>
        </span>
        <NumoraInput
          id={inputId}
          ref={inputRef}
          defaultValue="1234567"
          // Every rewrite of the field: typing, the focus strip and the blur regroup.
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
