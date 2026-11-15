import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Loop } from './useLoop';

/**
 * The one pause / play button for every looping figure. It always sits at the right end of the
 * figure's bottom row, so the reader finds it in the same place on every page.
 * Renders nothing under reduced motion, where nothing autoplays.
 */
export function LoopToggle({
  loop,
  className,
}: {
  loop: Pick<Loop, 'held' | 'reduced' | 'toggle'>;
  className?: string;
}) {
  if (loop.reduced) return null;
  return (
    <button
      type="button"
      data-loop-control
      onClick={loop.toggle}
      aria-label={loop.held ? 'Play animation' : 'Pause animation'}
      // 32px button, 44px hit area.
      className={cn(
        'relative inline-flex size-8 flex-none cursor-pointer touch-manipulation items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,scale] duration-150 ease-out-expo before:absolute before:-inset-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.96] motion-reduce:transition-none [@media(hover:hover)]:hover:bg-surface-4 [@media(hover:hover)]:hover:text-foreground',
        className
      )}
    >
      {loop.held ? (
        <Play className="size-4" aria-hidden />
      ) : (
        <Pause className="size-4" aria-hidden />
      )}
    </button>
  );
}

/** "2 / 5": where the reader is in a stepped figure. Sits just left of the pause button. */
export function StepCount({ current, total }: { current: number; total: number }) {
  return (
    <span
      aria-hidden
      className="flex-none font-mono text-caption whitespace-nowrap text-muted-foreground tabular-nums"
    >
      <span className="text-foreground">{current}</span> / {total}
    </span>
  );
}
