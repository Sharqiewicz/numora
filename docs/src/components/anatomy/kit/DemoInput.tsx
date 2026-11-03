import { cn } from '@/lib/utils';

/**
 * The single input style for every Anatomy demo (plain <input> and <NumoraInput> alike).
 * Sits on the DiagramFrame's surface-2; uses surface-1 so the contrast jump is gentle.
 */
/**
 * Focus carries the page's caret signature: violet caret + violet border (Numora's colour role),
 * with a full-strength violet ring (WCAG non-text contrast); outline-hidden keeps a forced-colors outline.
 */
export const demoInputClass =
  'w-full rounded-lg border border-muted-icon bg-surface-1 px-3 py-2 font-mono text-[15px] text-foreground tabular-nums caret-signal-violet-fg outline-hidden transition-[border-color,box-shadow] duration-150 ease-out-expo placeholder:text-muted-foreground focus:border-signal-violet-fg focus:ring-2 focus:ring-signal-violet motion-reduce:transition-none';

/** Large size for the Hero input. Append to demoInputClass instead of `!text-lg` overrides. */
export const demoInputLgClass = 'px-4 py-3 text-lg';

export function DemoInput({
  className,
  size = 'md',
  ...props
}: Omit<React.ComponentProps<'input'>, 'size'> & { size?: 'md' | 'lg' }) {
  return (
    <input className={cn(demoInputClass, size === 'lg' && demoInputLgClass, className)} {...props} />
  );
}

/** Inset panel for readouts / logs inside a frame (one level only, never deeper). */
export const demoInsetClass =
  'rounded-lg border border-border bg-surface-1 p-3 font-mono text-[13px] text-foreground';
