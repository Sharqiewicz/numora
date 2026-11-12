import type { ReactNode } from 'react';
import { ROLE } from './kit';

type Props =
  | { mode: 'blur'; focused: boolean | null }
  | { mode: 'change'; keystrokes: number };

const base =
  'flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs transition-colors duration-150 ease-out-expo motion-reduce:transition-none';
const on = `${ROLE.numora.bg} ${ROLE.numora.border} ${ROLE.numora.text}`;
const off = 'border-border text-muted-foreground';

/** One timing cell. The active one carries a dot (non-colour cue) and an sr-only "current". */
function Cell({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <div className={`${base} flex-1 ${active ? on : off}`}>
      <span
        aria-hidden
        className={`size-1.5 shrink-0 rounded-full bg-current ${active ? '' : 'opacity-0'}`}
      />
      <span>{children}</span>
      {active && <span className="sr-only"> (current)</span>}
    </div>
  );
}

/** Static "when formatting happens" strip. Highlight follows the live input's focus / keystrokes. */
export function FormatTimingStrip(props: Props) {
  if (props.mode === 'change') {
    return (
      <div className="flex gap-2">
        <Cell active={props.keystrokes > 0}>every keystroke: grouped</Cell>
      </div>
    );
  }
  return (
    <div className="flex gap-2">
      <Cell active={props.focused === true}>focused: raw</Cell>
      <Cell active={props.focused === false}>blur: grouped</Cell>
    </div>
  );
}
