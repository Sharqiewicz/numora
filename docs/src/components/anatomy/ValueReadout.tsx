import { motion, useReducedMotion } from 'motion/react';
import { FormatOn, ThousandStyle } from 'numora';
import {
  type NumoraHTMLInputElement,
  NumoraInput,
  type NumoraInputChangeEvent,
} from 'numora-react';
import { type ReactNode, useId, useState } from 'react';
import { DiagramFrame, DUR, demoInputClass, demoInsetClass, EASE } from './kit';

/**
 * A value that flashes a neutral surface (opacity only, DUR.flash) when `value` changes.
 * Diff-based: unchanged values never flash. No flash on mount.
 */
export function FlashValue({ value, children }: { value: string | number; children: ReactNode }) {
  const reduced = useReducedMotion() ?? false;
  // Derive the flash key during render (no extra render / frame of lag).
  const [prev, setPrev] = useState(value);
  const [n, setN] = useState(0);
  if (prev !== value) {
    setPrev(value);
    setN((c) => c + 1);
  }
  return (
    <span className="relative -mx-1 inline-block rounded px-1 break-all">
      {n > 0 && !reduced && (
        <motion.span
          key={n}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded bg-surface-4"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 0 }}
          transition={{ duration: DUR.flash, ease: EASE.outExpo }}
        />
      )}
      <span className="relative">{children}</span>
    </span>
  );
}

/** One readout row: fixed key column, tabular-nums value. Keys muted, values foreground. */
export function ReadoutRow({
  name,
  note,
  children,
}: {
  name: string;
  note?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-x-4 gap-y-0.5 sm:grid-cols-[13rem_1fr]">
      <div className="text-muted-foreground">{name}</div>
      <div className="min-w-0 tabular-nums text-foreground">
        {children}
        {note && <span className="ml-2 text-muted-foreground">{note}</span>}
      </div>
    </div>
  );
}

export function ValueReadout() {
  const inputId = useId();
  const [rawValue, setRawValue] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [selectionStart, setSelectionStart] = useState<number | null>(0);

  const handleChange = (e: NumoraInputChangeEvent) => {
    const target = e.target as NumoraHTMLInputElement;
    setRawValue(target.value);
    setFormattedValue(target.formattedValue ?? '');
    setSelectionStart(target.selectionStart);
  };

  return (
    <DiagramFrame variant="demo">
      <label htmlFor={inputId} className="mb-2 block text-[13px] font-medium text-muted-foreground">
        Type a number
      </label>
      <NumoraInput
        id={inputId}
        formatOn={FormatOn.Change}
        thousandSeparator=","
        thousandStyle={ThousandStyle.Thousand}
        maxDecimals={2}
        enableCompactNotation
        onChange={handleChange}
        placeholder="1234567.89"
        className={demoInputClass}
      />
      <div className={`${demoInsetClass} mt-4 space-y-3`}>
        <ReadoutRow name="e.target.value" note="raw, no separators">
          <FlashValue value={rawValue}>"{rawValue}"</FlashValue>
        </ReadoutRow>
        <ReadoutRow name="e.target.formattedValue" note="display string">
          <FlashValue value={formattedValue}>"{formattedValue}"</FlashValue>
        </ReadoutRow>
        <ReadoutRow name="e.target.selectionStart">
          <FlashValue value={selectionStart ?? ''}>{selectionStart}</FlashValue>
        </ReadoutRow>
      </div>
    </DiagramFrame>
  );
}
