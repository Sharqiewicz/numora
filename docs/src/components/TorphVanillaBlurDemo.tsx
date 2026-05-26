import { FormatOn, NumoraInput, ThousandStyle } from 'numora';
import { useEffect, useRef } from 'react';
import { TextMorph } from 'torph';

export function TorphVanillaBlurDemo() {
  const displayRef = useRef<HTMLSpanElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!displayRef.current || !hostRef.current) return;

    displayRef.current.textContent = '';

    // True from focus → first morph-complete, so the focus-strip morph hides the caret
    // but later per-keystroke morphs do not (you need to see your caret while typing).
    let postFocusMorphPending = false;
    const updateCaret = (hidden: boolean) => {
      hostRef.current?.classList.toggle('caret-suppressed', hidden);
    };

    const morph = new TextMorph({
      element: displayRef.current,
      ease: { stiffness: 400, damping: 30 },
      onAnimationComplete: () => {
        if (postFocusMorphPending) {
          postFocusMorphPending = false;
          updateCaret(false);
        }
      },
    });

    // Drive the morph via NumoraInput's onChange option. setRangeText fires a synchronous
    // `input` event during writes, but withInternalWrite suppresses NumoraInput's own
    // handler - DOM `input` listeners would be racy in that window. onChange fires once
    // per logical value change (typing, paste, focus-strip, blur-reformat).
    const numora = new NumoraInput(hostRef.current, {
      formatOn: FormatOn.Blur,
      decimalMaxLength: 2,
      thousandSeparator: ',',
      thousandStyle: ThousandStyle.Thousand,
      value: '1234567',
      onChange: (value) => morph.update(value || '0'),
    });
    const input = numora.getElement();
    input.setAttribute('aria-label', 'Amount (blur to format)');

    // The constructor's setDefaultValue runs before onChange is wired (and never fires
    // onChange anyway), so prime the morph with the formatted initial value here.
    morph.update(numora.value || '0');

    const handleFocus = () => {
      postFocusMorphPending = true;
      updateCaret(true);
      // Fallback if no morph fires (e.g. value already has no separators).
      window.setTimeout(() => {
        if (postFocusMorphPending) {
          postFocusMorphPending = false;
          updateCaret(false);
        }
      }, 600);
    };

    input.addEventListener('focus', handleFocus);

    return () => {
      input.removeEventListener('focus', handleFocus);
      morph.destroy();
      input.remove();
    };
  }, []);

  return (
    <>
      <style>{`
        .torph-vanilla-input-host input {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
          border: 0;
          background: transparent;
          color: transparent;
          caret-color: var(--secondary);
          outline: none;
          font: inherit;
        }
        .torph-vanilla-input-host.caret-suppressed input { caret-color: transparent; }
        .torph-vanilla-input-host input::selection { background: color-mix(in oklch, var(--secondary) 40%, transparent); }
        .torph-vanilla-input-host input::placeholder { color: transparent; }
      `}</style>
      <div className="my-16 py-12 flex justify-center items-center">
        <label className="relative inline-flex items-center min-h-[44px] min-w-[6ch] text-4xl font-mono leading-none text-white">
          <span ref={displayRef} className="pointer-events-none whitespace-pre" aria-hidden="true">
            0
          </span>
          <div ref={hostRef} className="torph-vanilla-input-host absolute inset-0" />
        </label>
      </div>
    </>
  );
}
