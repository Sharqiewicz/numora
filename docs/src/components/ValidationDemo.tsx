import { Pause, Play } from 'lucide-react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { DUR, EASE, useLoop } from '@/components/anatomy/kit';
import { cn } from '@/lib/utils';

type Scene = 'cap' | 'digits' | 'set';

type Frame = {
  scene: Scene;
  /** What the field holds. */
  value: string;
  /** A key Numora refused on this frame. */
  refused?: string;
  /** The value your code wrote, bypassing isAllowed. */
  written?: boolean;
  note: string;
  ms: number;
};

const CAP = 'A value above 100 is refused';
const DIGITS = 'Only digits are accepted';

const TIMELINE: Frame[] = [
  { scene: 'cap', value: '', note: '', ms: 500 },
  { scene: 'cap', value: '1', note: '', ms: 150 },
  { scene: 'cap', value: '10', note: '', ms: 200 },
  { scene: 'cap', value: '100', note: '', ms: 450 },
  { scene: 'cap', value: '100', refused: '5', note: CAP, ms: 2000 },
  { scene: 'digits', value: '', note: '', ms: 500 },
  { scene: 'digits', value: '1', note: '', ms: 150 },
  { scene: 'digits', value: '12', note: '', ms: 450 },
  { scene: 'digits', value: '12', refused: '.', note: DIGITS, ms: 2000 },
  { scene: 'set', value: '100', note: '', ms: 900 },
  { scene: 'set', value: '500', written: true, note: 'set', ms: 2200 },
];

const LABEL: Record<Exclude<Scene, 'set'>, { key: string; rest: string }> = {
  cap: { key: 'isAllowed', rest: ': raw <= 100' },
  digits: { key: 'isAllowed', rest: ': /^\\d{0,6}$/' },
};

/** How your code writes a value: a method call in core, a prop in React. */
const WRITE = {
  core: {
    label: { key: 'setValue', rest: "('500')" },
    note: 'A value set from code is never checked',
    aria: 'Calling setValue with 500 shows 500 even though isAllowed caps at 100',
  },
  react: {
    label: { key: 'value', rest: '="500"' },
    note: 'The value prop is never checked',
    aria: 'Passing 500 as the value prop shows 500 even though isAllowed caps at 100',
  },
};

const ARIA: Record<Exclude<Scene, 'set'>, string> = {
  cap: 'Typing 1005 with an isAllowed cap of 100 leaves 100',
  digits: 'Typing 12. with a digits-only isAllowed leaves 12',
};

/** Autoplays three scenes: a refused keystroke, a refused character, a value your code writes. */
export function ValidationDemo({ api = 'core' }: { api?: 'core' | 'react' }) {
  const loop = useLoop({
    frames: TIMELINE.length,
    frameMs: (frame) => TIMELINE[frame].ms,
    holdMs: 0,
  });
  const { scene, value, refused, written, note: frameNote } = TIMELINE[loop.frame];
  const write = WRITE[api];
  const label = scene === 'set' ? write.label : LABEL[scene];
  const note = frameNote === 'set' ? write.note : frameNote;
  const idle = value === '' || refused !== undefined;

  return (
    <figure className="not-prose my-8">
      <div ref={loop.ref} className="overflow-hidden rounded-xl bg-surface-1 shadow-border">
        <MotionConfig reducedMotion="user">
          <div className="flex items-center gap-2 py-4 pr-3 pl-4 sm:pl-6">
            <div className="min-w-0 flex-1">
              <code className="font-mono text-caption text-muted-foreground">
                <strong className="font-bold text-foreground">{label.key}</strong>
                {label.rest}
              </code>
              {/* A new scene fades in; keystrokes inside one scene just appear. */}
              <AnimatePresence initial={false} mode="wait">
                <motion.div
                  key={scene}
                  role="img"
                  aria-label={scene === 'set' ? write.aria : ARIA[scene]}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: DUR.fast, ease: EASE.outExpo }}
                  className="relative mt-2 flex h-10 items-center font-mono text-[1.75rem] leading-none font-medium text-foreground select-none sm:text-[2rem]"
                >
                  <span className={cn(written && 'text-signal-amber-fg')}>{value}</span>
                  {!written && (
                    <span
                      aria-hidden
                      className={cn(
                        'ml-px inline-block h-[1.15em] w-[1.5px] flex-none bg-foreground motion-reduce:hidden',
                        idle && 'animate-[demo-caret-blink_1.1s_steps(1)_infinite]'
                      )}
                    />
                  )}
                  {/* The refused key shows where it would have gone, then drops away. */}
                  {refused && (
                    <motion.span
                      key={refused}
                      aria-hidden
                      initial={{ opacity: 1, y: 0 }}
                      animate={{ opacity: 0, y: 6 }}
                      transition={{ duration: DUR.flash, ease: EASE.outExpo, delay: DUR.fast }}
                      className="ml-0.5 inline-block text-signal-red-fg"
                    >
                      {refused}
                    </motion.span>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {/* Nothing autoplays under reduced motion, so there is nothing to pause. */}
            {!loop.reduced && (
              <button
                type="button"
                data-loop-control
                onClick={loop.toggle}
                aria-label={loop.held ? 'Play animation' : 'Pause animation'}
                className="relative inline-flex size-8 flex-none cursor-pointer touch-manipulation items-center justify-center rounded-md text-muted-foreground transition-[color,background-color,scale] duration-150 ease-out-expo before:absolute before:-inset-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.96] motion-reduce:transition-none [@media(hover:hover)]:hover:bg-surface-4 [@media(hover:hover)]:hover:text-foreground"
              >
                {loop.held ? (
                  <Play className="size-4" aria-hidden />
                ) : (
                  <Pause className="size-4" aria-hidden />
                )}
              </button>
            )}
          </div>
        </MotionConfig>
        <p
          className={cn(
            'm-0 flex h-9 items-center border-t border-surface-3 px-4 text-sm text-muted-foreground sm:px-6',
            'transition-opacity duration-150 ease-out-expo motion-reduce:transition-none',
            note ? 'opacity-100' : 'opacity-0'
          )}
        >
          {note || ' '}
        </p>
      </div>
    </figure>
  );
}
