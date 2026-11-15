import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Loop } from './useLoop';

/**
 * Wraps what a looping scene resets between cycles. It fades out at the end of the last frame's
 * hold and back in on the first frame, so the loop never restarts on a hard cut. While the loop
 * is held (paused, off screen, reduced motion) it stays fully visible.
 */
export function LoopFade({
  loop,
  block,
  className,
  children,
}: {
  loop: Pick<Loop, 'leaving' | 'leaveDelayMs'>;
  /** Render a `div`. The default is an inline `span`. */
  block?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const Tag = block ? 'div' : 'span';
  return (
    <Tag
      className={cn(
        'transition-opacity duration-150 ease-out-expo motion-reduce:transition-none',
        loop.leaving ? 'opacity-0' : 'opacity-100',
        className
      )}
      style={loop.leaving ? { transitionDelay: `${loop.leaveDelayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
