import { type ReactNode, useEffect, useRef, useState } from 'react';
import { DEMO_CUE_EVENT, type DemoCue } from '@/hooks/use-typing-loop';
import { cn } from '@/lib/utils';

interface DemoFrameProps {
  /** id of the input inside `children`; wires the visible label to it. */
  inputId: string;
  /** Accessible name only; not shown. */
  label?: string;
  /** Small muted line under the card, e.g. "Blur the field to format." */
  hint?: string;
  /**
   * For demos whose typing loop runs in `blur` mode. Shows a pointer that clicks into the
   * field and away again, tagged with the event it caused, and an animated focus ring that
   * follows the loop's simulated focus as well as real focus. Without it, the reader cannot
   * tell that the formatting changed because of focus.
   */
  focusPointer?: boolean;
  className?: string;
  children: ReactNode;
}

/** Metrics of the demo field text. An overlay's box sets them once; both layers inherit. */
export const demoFieldMetrics =
  'text-2xl leading-8 font-sans tabular-nums tracking-normal text-left';
/** The one Numora field text style shared by every docs demo. */
export const demoFieldText = `${demoFieldMetrics} text-foreground`;
/** Container for overlay demos (transparent input over an animated display layer). */
export const demoOverlayBox = `relative flex items-center w-full min-h-[44px] overflow-hidden cursor-text ${demoFieldText}`;
/**
 * Class for the real input in an overlay demo: transparent text, no padding, and the box's
 * typography inherited, so the caret cannot drift from the display layer.
 */
export const demoOverlayInput = `[font:inherit] tracking-[inherit] text-left absolute inset-0 w-full h-full m-0 p-0 border-0 bg-transparent text-transparent placeholder-transparent outline-none focus:outline-none selection:bg-foreground/25`;

/**
 * approach: travelling to the field, which is still blurred
 * focused:  arrived and clicked; the ring is on
 * leaving:  travelling away from the field, which is still focused
 * away:     arrived outside and clicked; the ring is off
 * user:     the reader really focused the field, so the pointer hides
 */
type PointerState = 'approach' | 'focused' | 'leaving' | 'away' | 'user';

/**
 * The card + field surface shared by every docs demo (same classes as the field in
 * ExampleWithDemo), so integration demos read as editable fields too. `children` is the
 * field's content; for overlay demos it must be the positioned container, not a <label>.
 */
export function DemoFrame({
  inputId,
  label = 'Amount',
  hint,
  focusPointer = false,
  className,
  children,
}: DemoFrameProps) {
  const figureRef = useRef<HTMLElement>(null);
  const [pointer, setPointer] = useState<PointerState>('away');
  // Simulated clicks so far. 0 until the first, so nothing plays on mount.
  const [clicks, setClicks] = useState(0);

  useEffect(() => {
    const figure = figureRef.current;
    if (!focusPointer || !figure) return;
    const onCue = (event: Event) => {
      const cue = (event as CustomEvent<DemoCue>).detail;
      setPointer((state) =>
        state === 'user' ? state : cue === 'focus-soon' ? 'approach' : 'leaving'
      );
    };
    figure.addEventListener(DEMO_CUE_EVENT, onCue);
    return () => figure.removeEventListener(DEMO_CUE_EVENT, onCue);
  }, [focusPointer]);

  const fieldFocused = pointer === 'focused' || pointer === 'leaving' || pointer === 'user';

  return (
    <figure
      ref={figureRef}
      className={cn('not-prose relative mx-auto my-8 w-full max-w-lg', className)}
      // focusin/focusout bubble from real focus and from the typing loop's simulated focus;
      // only the simulated ones (untrusted) count as the pointer's clicks.
      onFocus={
        focusPointer
          ? (event) => {
              if (event.nativeEvent.isTrusted) return setPointer('user');
              setPointer('focused');
              setClicks((count) => count + 1);
            }
          : undefined
      }
      onBlur={
        focusPointer
          ? (event) => {
              setPointer('away');
              if (!event.nativeEvent.isTrusted) setClicks((count) => count + 1);
            }
          : undefined
      }
    >
      <div className="overflow-hidden rounded-xl bg-surface-1 shadow-border">
        <div className="p-4">
          <div
            data-focused={focusPointer && fieldFocused ? '' : undefined}
            className={cn(
              'rounded-md border border-surface-5 bg-surface-3 p-3 [@media(hover:hover)]:hover:bg-surface-5',
              focusPointer
                ? 'demo-focus-ring'
                : 'transition-colors has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-brand'
            )}
          >
            <label htmlFor={inputId} className="sr-only">
              {label}
            </label>
            {children}
          </div>
        </div>
      </div>
      {hint && <figcaption className="mt-2 text-sm text-muted-foreground">{hint}</figcaption>}
      {focusPointer && <DemoFocusPointer state={pointer} clicks={clicks} />}
    </figure>
  );
}

function DemoFocusPointer({ state, clicks }: { state: PointerState; clicks: number }) {
  const showFocus = state === 'focused' || state === 'leaving';
  const clicked = clicks > 0;
  return (
    <span className="demo-pointer" data-state={state} aria-hidden="true">
      {/* Keyed by the click count so each click replays the ripple and the press. */}
      {clicked && <span key={`ripple-${clicks}`} className="demo-pointer-ripple" />}
      <span key={clicks} className={clicked ? 'demo-pointer-press' : 'block'}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
          <path
            d="M3 2l11 5.5-4.6 1.6L7.6 14 3 2z"
            fill="var(--color-foreground)"
            stroke="var(--color-surface-1)"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {clicked && (
        <span
          key={showFocus ? 'focus' : `blur-${clicks}`}
          className="demo-pointer-tag"
          data-event={showFocus ? 'focus' : 'blur'}
        >
          {showFocus ? 'focus' : 'blur'}
        </span>
      )}
    </span>
  );
}
