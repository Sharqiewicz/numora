import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { DemoInput, DiagramFrame, DUR, demoInsetClass, EASE } from './kit';

interface LogEntry {
  id: number;
  t: number;
  event: string;
  detail: string;
}

// Bar colours match EventPipelineDiagram: amber for beforeinput, neutral otherwise.
const BAR: Record<string, string> = {
  beforeinput: 'border-signal-amber-line',
};
const NAME: Record<string, string> = {
  beforeinput: 'text-signal-amber-fg',
  keyup: 'text-muted-foreground',
};

export function EventPipelineDemo() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(0);
  const reduced = useReducedMotion() ?? false;

  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const start = performance.now();

    const push = (event: string, detail: string) => {
      idRef.current += 1;
      setLog((prev) => [
        ...prev.slice(-19),
        { id: idRef.current, t: Math.round(performance.now() - start), event, detail },
      ]);
    };

    const onKeyDown = (e: KeyboardEvent) => push('keydown', `key="${e.key}"`);
    const onBeforeInput = (e: InputEvent) =>
      push('beforeinput', `${e.inputType}, data="${e.data ?? ''}"`);
    const onInput = (e: Event) => push('input', `value="${(e.target as HTMLInputElement).value}"`);
    const onKeyUp = (e: KeyboardEvent) => push('keyup', `key="${e.key}"`);

    input.addEventListener('keydown', onKeyDown);
    input.addEventListener('beforeinput', onBeforeInput);
    input.addEventListener('input', onInput);
    input.addEventListener('keyup', onKeyUp);
    return () => {
      input.removeEventListener('keydown', onKeyDown);
      input.removeEventListener('beforeinput', onBeforeInput);
      input.removeEventListener('input', onInput);
      input.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  const newestId = log.length ? log[log.length - 1].id : -1;

  useEffect(() => {
    const el = logRef.current;
    if (el && newestId >= 0) el.scrollTop = el.scrollHeight;
  }, [newestId]);

  return (
    <DiagramFrame variant="demo">
      <div className="space-y-3">
        <DemoInput
          ref={inputRef}
          type="text"
          aria-label="Event test input"
          placeholder="1234"
        />
        <section
          ref={logRef}
          // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard reachable
          tabIndex={0}
          aria-label="Event log"
          className={cn(
            demoInsetClass,
            'min-h-32 max-h-48 overflow-y-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          {log.length === 0 ? (
            <div className="text-muted-foreground">{'// event log: start typing'}</div>
          ) : (
            log.map((entry) => (
              <div
                key={entry.id}
                className={cn(
                  'relative grid grid-cols-[minmax(0,1fr)_auto] gap-x-2 border-l-2 py-0.5 pl-2 leading-relaxed sm:grid-cols-[6.5rem_4.5rem_minmax(0,1fr)]',
                  BAR[entry.event] ?? 'border-surface-7',
                )}
              >
                {entry.event === 'beforeinput' && (
                  <motion.span
                    aria-hidden
                    className="pointer-events-none absolute inset-0 bg-signal-amber-surface"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: reduced ? DUR.fast : DUR.flash, ease: EASE.outExpo }}
                  />
                )}
                <span className={cn('relative', NAME[entry.event] ?? 'text-foreground')}>
                  {entry.event}
                </span>
                <span className="relative text-right tabular-nums text-muted-foreground sm:text-left">
                  +{entry.t}ms
                </span>
                <span className="relative col-span-full min-w-0 text-muted-foreground [overflow-wrap:anywhere] sm:col-span-1">
                  {entry.detail}
                </span>
              </div>
            ))
          )}
        </section>
      </div>
    </DiagramFrame>
  );
}
