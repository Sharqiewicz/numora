import { formatValue } from 'numora';
import { NumoraInput } from 'numora-react';
import { useEffect, useId, useRef, useState } from 'react';
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

export function TorphBlurDemo() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  // The first text: onFormattedValueChange does not fire on mount.
  const [text, setText] = useState(() => formatValue('1234567', OPTIONS));
  const [caret, setCaret] = useState<number>();
  const [caretHidden, setCaretHidden] = useState(false);
  // True from focus → first morph-complete, so the focus-strip morph hides the cursor
  // but later per-keystroke morphs do not (you need to see your cursor while typing).
  const postFocusMorphPendingRef = useRef(false);
  const caretTimeoutRef = useRef<number | undefined>(undefined);

  useTypingLoop(inputRef, { mode: 'blur' });

  useEffect(() => () => window.clearTimeout(caretTimeoutRef.current), []);

  return (
    <DemoFrame inputId={inputId} hint="Blur the field to format.">
      <div className={demoOverlayBox}>
        <span aria-hidden="true" className="pointer-events-none whitespace-pre">
          <TextMorph
            cursorIndex={caret}
            ease={EASE}
            onAnimationComplete={() => {
              if (postFocusMorphPendingRef.current) {
                postFocusMorphPendingRef.current = false;
                setCaretHidden(false);
              }
            }}
          >
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
          onFocus={() => {
            postFocusMorphPendingRef.current = true;
            setCaretHidden(true);
            // Fallback if no morph fires (e.g. value already has no separators), so the caret
            // is never left hidden. Slightly longer than the expected morph duration so we don't reveal mid-flight.
            window.clearTimeout(caretTimeoutRef.current);
            caretTimeoutRef.current = window.setTimeout(() => {
              if (postFocusMorphPendingRef.current) {
                postFocusMorphPendingRef.current = false;
                setCaretHidden(false);
              }
            }, 600);
          }}
          {...OPTIONS}
          aria-label="Amount"
          className={`${demoOverlayInput} ${caretHidden ? 'caret-transparent' : 'caret-foreground'}`}
        />
      </div>
    </DemoFrame>
  );
}
