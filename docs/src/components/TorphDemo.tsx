import { FormatOn } from 'numora';
import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react';
import { type RefObject, useEffect, useRef, useState } from 'react';
import { TextMorph } from 'torph';

const TYPE_MS = 280;
const HOLD_MS = 1600;
const SEQUENCE = ['1234567.89', '0'];

/**
 * Loops through SEQUENCE, "typing" each value into the input one character at a time.
 * Each value starts by selecting the current content, so the first key replaces it -
 * exactly what a user does with ⌘A then a digit. Characters go through real
 * `beforeinput` events so Numora's formatting path (and therefore Torph's morph) runs.
 * Pauses while the user has the field focused.
 */
function useTypingLoop(inputRef: RefObject<HTMLInputElement | null>) {
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      'value'
    )?.set;

    let timer: ReturnType<typeof setTimeout> | undefined;
    let valueIndex = 0;
    let charIndex = 0;
    let disposed = false;

    const typeChar = (char: string, replaceAll: boolean) => {
      const { scrollX, scrollY } = window;
      if (replaceAll) input.setSelectionRange(0, input.value.length);
      else input.setSelectionRange(input.value.length, input.value.length);

      const beforeInput = new InputEvent('beforeinput', {
        bubbles: true,
        cancelable: true,
        inputType: 'insertText',
        data: char,
      });
      input.dispatchEvent(beforeInput);
      if (!beforeInput.defaultPrevented) {
        const next = replaceAll ? char : input.value + char;
        nativeSetter?.call(input, next);
        input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
      }
      window.scrollTo(scrollX, scrollY);
    };

    const tick = () => {
      if (disposed) return;
      if (document.activeElement === input) {
        // User is editing - check back later without touching their value.
        timer = setTimeout(tick, HOLD_MS);
        return;
      }

      const target = SEQUENCE[valueIndex];
      typeChar(target[charIndex], charIndex === 0);
      charIndex += 1;

      if (charIndex < target.length) {
        timer = setTimeout(tick, TYPE_MS);
      } else {
        charIndex = 0;
        valueIndex = (valueIndex + 1) % SEQUENCE.length;
        timer = setTimeout(tick, HOLD_MS);
      }
    };

    timer = setTimeout(tick, HOLD_MS);

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
    };
  }, [inputRef]);
}

export function TorphDemo() {
  const [value, setValue] = useState('1234567');
  const [formatted, setFormatted] = useState('1,234,567');
  const displayRef = useRef<HTMLSpanElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const morphRef = useRef<TextMorph | null>(null);

  useTypingLoop(inputRef);

  useEffect(() => {
    const display = displayRef.current;
    if (!display) return;

    let morph = morphRef.current;
    if (!morph) {
      // The "0" rendered for SSR is a text node. Torph's createTextGroup only inspects
      // element children, so it would leave that text node alone and append new spans
      // beside it. Clear textContent so torph owns the span on first attach.
      display.textContent = '';
      morph = new TextMorph({
        element: display,
        ease: { stiffness: 400, damping: 30 },
      });
      morphRef.current = morph;
    }
    morph.update(formatted || '0');
  }, [formatted]);

  useEffect(
    () => () => {
      morphRef.current?.destroy();
      morphRef.current = null;
    },
    []
  );

  return (
    <div className="my-12 w-full max-w-lg mx-auto">
      <label className="relative flex items-center justify-end w-full rounded-2xl border border-surface-3 bg-surface-1 overflow-hidden px-4 py-3 text-xl font-mono tracking-wide text-white cursor-text">
        <span ref={displayRef} aria-hidden="true" className="pointer-events-none whitespace-pre">
          0
        </span>
        <NumoraInput
          ref={inputRef}
          enableCompactNotation
          value={value}
          onChange={(e: NumoraInputChangeEvent) => {
            setValue(e.target.value);
            setFormatted(e.target.formattedValue || '');
          }}
          formatOn={FormatOn.Change}
          decimalMaxLength={2}
          thousandSeparator=","
          aria-label="Amount"
          className="absolute inset-0 w-full h-full m-0 px-4 py-3 border-0 bg-transparent text-transparent placeholder-transparent caret-secondary outline-none focus:outline-none selection:bg-secondary/40 text-right text-xl font-mono tracking-wide"
        />
      </label>
    </div>
  );
}
