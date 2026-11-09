import { Check, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { DiagramFrame } from './kit';

interface PaneProps {
  label: string;
  tone?: 'neutral' | 'bad' | 'good';
  input: ReactNode;
  note?: ReactNode;
}

interface InputPairProps {
  left: PaneProps;
  right: PaneProps;
}

/** Icon + word verdict. Colour sits on the icon only; the word stays neutral, so one chip, one signal. */
export function Verdict({ tone }: { tone: 'bad' | 'good' }) {
  const bad = tone === 'bad';
  const Icon = bad ? X : Check;
  return (
    <span
      className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground"
    >
      <Icon
        className={`size-3.5 ${bad ? 'text-signal-red-fg' : 'text-signal-green-fg'}`}
        aria-hidden
      />
      {bad ? 'Wrong' : 'Right'}
    </span>
  );
}

export function InputPair({ left, right }: InputPairProps) {
  return (
    <DiagramFrame variant="demo">
      <div className="grid gap-6 md:grid-cols-2">
        {[left, right].map((pane) => (
          <div key={pane.label} className="space-y-2">
            {/* biome-ignore lint/a11y/noLabelWithoutControl: the input is passed in as pane.input */}
            <label className="block space-y-2">
              <span className="flex items-center justify-between gap-2 text-[13px] font-medium text-foreground">
                {pane.label}
                {pane.tone && pane.tone !== 'neutral' && (
                  <span aria-hidden>
                    <Verdict tone={pane.tone} />
                  </span>
                )}
              </span>
              {pane.input}
            </label>
            {pane.note && <div className="text-[13px] text-muted-foreground">{pane.note}</div>}
          </div>
        ))}
      </div>
    </DiagramFrame>
  );
}
