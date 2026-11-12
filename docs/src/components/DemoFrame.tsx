import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface DemoFrameProps {
  /** id of the input inside `children`; wires the visible label to it. */
  inputId: string;
  /** Accessible name only; not shown. */
  label?: string;
  /** Small muted line under the card, e.g. "Blur the field to format." */
  hint?: string;
  className?: string;
  children: ReactNode;
}

/** Metrics of the demo field text; identical on an overlay's display layer and its input layer. */
export const demoFieldMetrics =
  'text-2xl leading-8 font-sans tabular-nums tracking-normal text-left';
/** The one Numora field text style shared by every docs demo. */
export const demoFieldText = `${demoFieldMetrics} text-foreground`;
/** Container for overlay demos (transparent input over an animated display layer). */
export const demoOverlayBox = `relative flex items-center w-full min-h-[44px] overflow-hidden cursor-text ${demoFieldText}`;
/** Class for the real input in an overlay demo: same metrics, transparent text, no padding. */
export const demoOverlayInput = `${demoFieldMetrics} absolute inset-0 w-full h-full m-0 p-0 border-0 bg-transparent text-transparent placeholder-transparent outline-none focus:outline-none selection:bg-foreground/25`;

/**
 * The card + field surface shared by every docs demo (same classes as the field in
 * ExampleWithDemo), so integration demos read as editable fields too. `children` is the
 * field's content; for overlay demos it must be the positioned container, not a <label>.
 */
export function DemoFrame({
  inputId,
  label = 'Amount',
  hint,
  className,
  children,
}: DemoFrameProps) {
  return (
    <figure className={cn('not-prose mx-auto my-8 w-full max-w-lg', className)}>
      <div className="overflow-hidden rounded-xl bg-surface-1 shadow-border">
        <div className="p-4">
          <div className="rounded-md border border-surface-5 bg-surface-3 p-3 transition-colors [@media(hover:hover)]:hover:bg-surface-5 has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-brand">
            <label htmlFor={inputId} className="sr-only">
              {label}
            </label>
            {children}
          </div>
        </div>
      </div>
      {hint && <figcaption className="mt-2 text-sm text-muted-foreground">{hint}</figcaption>}
    </figure>
  );
}
