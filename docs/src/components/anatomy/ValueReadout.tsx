import { motion, useReducedMotion } from 'motion/react';
import { formatValue, NumoraInput, type NumoraInputChangeEvent } from 'numora-react';
import { type ReactNode, useState } from 'react';
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

const OPTIONS = {
  formatOn: 'change',
  thousandSeparator: ',',
  groupingStyle: 'thousand',
  decimalMaxLength: 2,
  allowCompactNotation: true,
} as const;
const START = '1234567.89';

export function ValueReadout() {
  const [rawValue, setRawValue] = useState(START);
  const [formattedValue, setFormattedValue] = useState(() => formatValue(START, OPTIONS));

  const handleChange = (e: NumoraInputChangeEvent) => {
    setRawValue(e.target.value);
    setFormattedValue(e.target.formattedValue);
  };

  return (
    <DiagramFrame variant="demo">
      <NumoraInput
        {...OPTIONS}
        aria-label="Type a number"
        defaultValue={START}
        onChange={handleChange}
        className={demoInputClass}
      />
      <div className={`${demoInsetClass} mt-4 space-y-3`}>
        <ReadoutRow name="e.target.formattedValue">
          <FlashValue value={formattedValue}>"{formattedValue}"</FlashValue>
        </ReadoutRow>
        <ReadoutRow name="e.target.value">
          <FlashValue value={rawValue}>"{rawValue}"</FlashValue>
        </ReadoutRow>
      </div>
    </DiagramFrame>
  );
}
