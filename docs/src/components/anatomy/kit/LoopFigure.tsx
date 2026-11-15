import { MotionConfig } from 'motion/react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { LoopToggle, StepCount } from './LoopToggle';
import type { Loop } from './useLoop';

/** The one card every docs figure sits on: animations, diagrams and live demos alike. */
export const figureShellClass = 'overflow-hidden rounded-xl bg-surface-1 shadow-border';

/** The bottom row of a figure: text or controls on the left, the pause button on the right. */
export const figureFooterClass =
  'flex min-h-11 items-center gap-3 border-t border-surface-3 py-1.5 pr-2 pl-4 sm:pl-6';

/**
 * The one label style for a figure: 13px, muted, sans. Wrap option names and other code in
 * `<code>`, and the part that changes between scenes in `<strong>`.
 */
export function FigureLabel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'text-caption leading-5 font-medium text-muted-foreground [&_code]:font-mono [&_code]:font-normal [&_strong]:font-semibold [&_strong]:text-foreground',
        className
      )}
    >
      {children}
    </div>
  );
}

interface LoopFigureProps {
  loop: Loop;
  /** One line under the scene. Its row keeps its height when the note is empty. */
  note?: ReactNode;
  /** Defaults to "shown when there is a note". Pass it when the note is JSX that is always built. */
  noteShown?: boolean;
  /** For a scene the reader can step through: shows "2 / 5" next to the pause button. */
  step?: { current: number; total: number };
  children: ReactNode;
}

/**
 * An autoplaying scene with one line of commentary: the label and the value on top, the note
 * and the pause button in the bottom row.
 */
export function LoopFigure({ loop, note, noteShown, step, children }: LoopFigureProps) {
  const shown = noteShown ?? Boolean(note);
  return (
    <figure className="not-prose my-8">
      <div ref={loop.ref} className={figureShellClass}>
        <MotionConfig reducedMotion="user">
          <div className="min-w-0 px-4 py-4 sm:px-6">{children}</div>
        </MotionConfig>
        <div className={figureFooterClass}>
          <p
            className={cn(
              'm-0 min-w-0 flex-1 text-sm text-muted-foreground transition-opacity duration-150 ease-out-expo motion-reduce:transition-none',
              shown ? 'opacity-100' : 'opacity-0'
            )}
          >
            {note || ' '}
          </p>
          {step && <StepCount {...step} />}
          <LoopToggle loop={loop} />
        </div>
      </div>
    </figure>
  );
}
