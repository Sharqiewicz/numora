import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { DiagramFrame, demoInputClass, demoInsetClass, SPRING_FAST } from './kit';
import { FlashValue, ReadoutRow } from './ValueReadout';

// The pattern the vanilla NumoraInput class sets by default (decimalSeparator '.', no negatives).
const VANILLA_PATTERN = '^[0-9]*[\\.]?[0-9]*$';

// Input horizontal offset: 1px border + px-3 (12px).
const INPUT_INSET = 13;

export function AnnotatedInput() {
  const inputId = useId();
  const reduced = useReducedMotion() ?? false;
  const markerTransition = reduced ? { duration: 0 } : SPRING_FAST;
  const [value, setValue] = useState('1234.56');
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [caretX, setCaretX] = useState(0);
  const [selWidth, setSelWidth] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  const sync = () => {
    const input = inputRef.current;
    if (!input) return;
    setSelectionStart(input.selectionStart ?? 0);
    setSelectionEnd(input.selectionEnd ?? 0);
  };

  useEffect(() => {
    const onSelectionChange = () => {
      const input = inputRef.current;
      if (!input || document.activeElement !== input) return;
      setSelectionStart(input.selectionStart ?? 0);
      setSelectionEnd(input.selectionEnd ?? 0);
    };
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  // Measure the caret / selection offset in the same monospace font as the input.
  useLayoutEffect(() => {
    const m = measureRef.current;
    if (!m) return;
    m.textContent = value.slice(0, selectionStart);
    const start = m.getBoundingClientRect().width;
    m.textContent = value.slice(0, selectionEnd);
    const end = m.getBoundingClientRect().width;
    setCaretX(start);
    setSelWidth(Math.max(0, end - start));
  }, [value, selectionStart, selectionEnd]);

  return (
    <DiagramFrame>
      <label
        htmlFor={inputId}
        className="mb-2 block text-caption font-medium text-muted-foreground"
      >
        Plain input. Type or click
      </label>
      <input
        id={inputId}
        ref={inputRef}
        type="text"
        inputMode="decimal"
        pattern={VANILLA_PATTERN}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          sync();
        }}
        onSelect={sync}
        onKeyUp={sync}
        onClick={sync}
        className={demoInputClass}
      />
      {/* Caret-marker strip: mirrors selectionStart / selectionEnd. The input itself never animates. */}
      <div className="relative mt-1.5 h-4" aria-hidden>
        <span
          ref={measureRef}
          className="invisible absolute top-0 left-0 whitespace-pre font-mono text-base"
        />
        <motion.span
          className="absolute top-0 left-0 h-4 w-px origin-left bg-signal-violet-line"
          style={{ marginLeft: INPUT_INSET }}
          initial={false}
          animate={{ x: caretX, scaleX: Math.max(selWidth, 0), opacity: selWidth > 0 ? 1 : 0 }}
          transition={markerTransition}
        />
        <motion.span
          className="absolute top-0 left-0 h-4 w-0.5 -translate-x-px rounded-full bg-signal-violet-fg"
          style={{ marginLeft: INPUT_INSET }}
          initial={false}
          animate={{ x: caretX }}
          transition={markerTransition}
        />
      </div>
      <div className={`${demoInsetClass} mt-3 space-y-3`}>
        <ReadoutRow name="value">
          <FlashValue value={value}>"{value}"</FlashValue>
        </ReadoutRow>
        <ReadoutRow name="selectionStart">{selectionStart}</ReadoutRow>
        <ReadoutRow name="selectionEnd">{selectionEnd}</ReadoutRow>
        <ReadoutRow name="type">"text"</ReadoutRow>
        <ReadoutRow name="inputMode" note="mobile numeric pad">
          "decimal"
        </ReadoutRow>
        <ReadoutRow
          name="pattern"
          note="the pattern vanilla Numora sets (this input is plain, so Numora is not running)"
        >
          <span className="break-all">"{VANILLA_PATTERN}"</span>
        </ReadoutRow>
      </div>
    </DiagramFrame>
  );
}
