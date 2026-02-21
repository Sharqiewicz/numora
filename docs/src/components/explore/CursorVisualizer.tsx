import { cn } from '@/lib/utils';

interface CursorVisualizerProps {
  value: string;
  cursorPosition: number;
  className?: string;
}

export function CursorVisualizer({
  value,
  cursorPosition,
  className,
}: CursorVisualizerProps) {
  const chars = value.split('');
  const validCursorPos = Math.min(Math.max(0, cursorPosition), chars.length);

  return (
    <div className={cn('mt-3', className)}>
      <div className="flex items-center gap-0.5 font-mono text-sm overflow-x-auto pb-2">
        {chars.length === 0 ? (
          <div className="relative">
            <div
              className={cn(
                'w-3 h-8 flex items-center justify-center border rounded',
                'border-dashed border-muted-foreground/30 text-muted-foreground/50'
              )}
            >
              _
            </div>
            {validCursorPos === 0 && (
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-secondary animate-pulse" />
            )}
          </div>
        ) : (
          chars.map((char, index) => (
            <div key={index} className="relative">
              {index === validCursorPos && (
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-secondary animate-pulse" />
              )}
              <div
                className={cn(
                  'w-6 h-8 flex items-center justify-center border rounded text-xs',
                  index === validCursorPos - 1 || index === validCursorPos
                    ? 'border-secondary/50 bg-secondary/10'
                    : 'border-border bg-muted/30'
                )}
              >
                {char === ' ' ? '\u00A0' : char}
              </div>
            </div>
          ))
        )}
        {chars.length > 0 && validCursorPos === chars.length && (
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-secondary animate-pulse" />
            <div className="w-1 h-8" />
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground mt-1">
        Cursor at position: <span className="font-mono text-secondary">{validCursorPos}</span>
        {chars.length > 0 && (
          <span className="ml-2">
            (after "{chars[validCursorPos - 1] || 'start'}")
          </span>
        )}
      </p>
    </div>
  );
}
