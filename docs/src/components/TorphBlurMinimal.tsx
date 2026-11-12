import { NumoraInput } from 'numora-react';
import { useEffect, useId, useRef } from 'react';
import { TextMorph } from 'torph';
import { useTypingLoop } from '@/hooks/use-typing-loop';
import { DemoFrame, demoOverlayBox, demoOverlayInput } from './DemoFrame';

/**
 * The core integration: NumoraInput → onFormattedValueChange → TextMorph.update.
 *
 * The visible cursor drifts during the focus-strip morph
 * (1,234,567 → 1234567) because the native cursor lands at its final position
 * while the digits slide into theirs over ~400ms. See `TorphBlurDemo` for the
 * variant that hides the cursor during that window.
 */
export function TorphBlurMinimal() {
  const inputId = useId();
  const displayRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const morphRef = useRef<TextMorph | null>(null);

  useTypingLoop(inputRef, { mode: 'blur' });

  useEffect(() => {
    if (!displayRef.current) return;
    displayRef.current.textContent = '';
    const morph = new TextMorph({
      element: displayRef.current,
      ease: { stiffness: 400, damping: 30 },
    });
    morph.update('1,234,567');
    morphRef.current = morph;
    return () => {
      morph.destroy();
      morphRef.current = null;
    };
  }, []);

  return (
    <DemoFrame inputId={inputId} hint="Blur the field to format.">
      <div className={demoOverlayBox}>
        <span ref={displayRef} aria-hidden="true" className="pointer-events-none whitespace-pre">
          0
        </span>
        <NumoraInput
          id={inputId}
          ref={inputRef}
          defaultValue="1234567"
          // Every rewrite of the field: typing, the focus strip and the blur regroup.
          onFormattedValueChange={(text) => morphRef.current?.update(text || '0')}
          formatOn="blur"
          decimalMaxLength={2}
          thousandSeparator=","
          groupingStyle="thousand"
          aria-label="Amount"
          className={`${demoOverlayInput} caret-foreground`}
        />
      </div>
    </DemoFrame>
  );
}
