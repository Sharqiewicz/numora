import { motion } from 'motion/react';
import { Check, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { DiagramFrame, DUR, EASE, SPRING, STAGGER, useScene } from '../kit';

// The user clicks after "1,23" in 1,234,567 and types 8: the digits become 12384567.
const BEFORE = '1,234,567';
const AFTER = '12,384,567';
const DIGIT_W = 26;
const COMMA_W = 12;
const CHIP_H = 36;
const BEFORE_CARET = 4; // after "1,23"
const AFTER_CARET = 5; // after "12,38" (4th digit)
const NEW_DIGIT = 4; // index of the typed 8 in AFTER

// Absolute start times (s) of each beat. The scene ends at numoraVerdict + DUR.base, under SCENE_MAX.
const BEATS = {
  before: 0.05,
  hint: 0.3,
  naive: 0.35,
  naiveCaret: 0.4,
  naiveMove: 0.65,
  naiveVerdict: 1.0,
  numora: 1.15,
  numoraMove: 1.65,
  numoraVerdict: 1.85,
} as const;

// Duration (s) of the naive caret's travel to the end.
const NAIVE_TRAVEL = DUR.flash;

const cellW = (ch: string) => (ch === ',' ? COMMA_W : DIGIT_W);
const xAt = (s: string, idx: number) => [...s].slice(0, idx).reduce((n, ch) => n + cellW(ch), 0);

type Fade = { opacity: number; y?: number; x?: number };
const hide: Fade = { opacity: 0 };
const dropHide: Fade = { opacity: 0, y: -10 };
const show: Fade = { opacity: 1, y: 0 };

function Row({
  label,
  sub,
  verdict,
  children,
}: {
  label: ReactNode;
  sub: string;
  verdict: ReactNode;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline gap-x-2">
        <span className="text-[14px] font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{sub}</span>
      </div>
      <div className="relative flex" style={{ width: xAt(AFTER, AFTER.length), height: CHIP_H }}>
        {children}
      </div>
      <div className="mt-1.5 min-h-5">{verdict}</div>
    </div>
  );
}

function useBeats(phase: 'final' | 'hidden' | 'play') {
  const fin = phase === 'final';
  return {
    initial: (h: Fade = hide) => (fin ? false : h),
    animate: (on: Fade, off: Fade = hide) => (phase === 'hidden' ? off : on),
    // Hidden retarget is instant; beat delays only apply when playing.
    t: <T extends object>(tr: T) => (phase === 'hidden' ? { duration: 0 } : tr),
  };
}

export function CursorAnchorDiagram() {
  const scene = useScene();
  const b = useBeats(scene.phase);
  const endX = xAt(AFTER, AFTER.length);
  const numoraX = xAt(AFTER, AFTER_CARET);
  const fade = (delay: number) => ({ duration: DUR.base, ease: EASE.outExpo, delay });

  // Row of chips; `counted` digits (by index) get a sky underline, drawn left to right from `t0`.
  const chips = (s: string, counted: number, t0: number, drop?: number) => {
    let seen = 0;
    return [...s].map((ch, i) => {
      const comma = ch === ',';
      const n = comma ? -1 : seen++;
      const isCounted = !comma && n < counted;
      return (
        <motion.span
          key={`${i}-${ch}`}
          className="relative flex shrink-0 items-center justify-center"
          style={{ width: cellW(ch), height: CHIP_H }}
          initial={b.initial(i === drop ? { opacity: 0, y: -10 } : hide)}
          animate={b.animate(show, i === drop ? dropHide : hide)}
          transition={b.t(i === drop ? { duration: DUR.base, ease: EASE.outExpo, delay: t0 } : fade(t0))}
        >
          {comma ? (
            <span className="font-mono text-xl leading-none text-muted-foreground">,</span>
          ) : (
            <span className="flex h-9 w-[22px] items-center justify-center rounded-lg bg-surface-3 font-mono text-xl leading-none text-foreground">
              {ch}
            </span>
          )}
          {isCounted && (
            <motion.span
              aria-hidden
              className="absolute bottom-0 h-0.5 w-[22px] rounded-full bg-signal-sky-line"
              initial={b.initial({ opacity: 0 })}
              animate={b.animate({ opacity: 1 }, { opacity: 0 })}
              transition={b.t({ duration: DUR.fast, ease: EASE.outExpo, delay: t0 + STAGGER.base * n })}
            />
          )}
        </motion.span>
      );
    });
  };

  const caret = (cls: string) => `pointer-events-none absolute -top-1 left-0 h-[44px] w-0.5 rounded-full ${cls}`;

  return (
    <DiagramFrame
      title="Where the caret lands after typing 8"
      sceneRef={scene.ref}
      onReplay={scene.replay}
      canReplay={scene.canReplay}
      caption="Naive code remembers a character index. Numora remembers how many digits sit before the caret."
    >
      <div
        key={scene.playId}
        role="img"
        aria-label="Before: the caret sits after the third digit of 1,234,567. The user types 8, making 12,384,567. The naive formatter leaves the caret at the very end. Numora counts four digits before the caret and places it after the fourth digit."
        className="space-y-3"
      >
        <Row label="Before" sub="3 digits before the caret" verdict={null}>
          {chips(BEFORE, 3, BEATS.before)}
          <motion.span
            className={caret('bg-foreground')}
            style={{ x: xAt(BEFORE, BEFORE_CARET) }}
            initial={b.initial()}
            animate={b.animate(show)}
            transition={b.t(fade(BEATS.before))}
          />
        </Row>

        <motion.div
          className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground"
          initial={b.initial()}
          animate={b.animate(show)}
          transition={b.t(fade(BEATS.hint))}
          style={{ paddingLeft: xAt(BEFORE, BEFORE_CARET) - 4 }}
        >
          then type 8
        </motion.div>

        <Row
          label="Naive"
          sub="index-based"
          verdict={
            <motion.span
              className="inline-flex items-center gap-1 text-xs text-signal-red-fg"
              initial={b.initial()}
              animate={b.animate(show)}
              transition={b.t(fade(BEATS.naiveVerdict))}
            >
              <X className="size-3.5" aria-hidden />
              caret at end
            </motion.span>
          }
        >
          {chips(AFTER, 0, BEATS.naive, NEW_DIGIT)}
          <motion.span
            className={caret('bg-signal-red-fg')}
            initial={b.initial({ opacity: 0, x: xAt(AFTER, AFTER_CARET) })}
            animate={b.animate({ opacity: 1, x: endX }, { opacity: 0, x: xAt(AFTER, AFTER_CARET) })}
            transition={b.t({
              opacity: { duration: DUR.instant, delay: BEATS.naiveCaret },
              x: { duration: NAIVE_TRAVEL, ease: EASE.move, delay: BEATS.naiveMove },
            })}
          />
        </Row>

        <Row
          label="Numora"
          sub="4 digits before the caret"
          verdict={
            <motion.span
              className="inline-flex items-center gap-1 text-xs text-signal-green-fg"
              initial={b.initial()}
              animate={b.animate(show)}
              transition={b.t(fade(BEATS.numoraVerdict))}
            >
              <Check className="size-3.5" aria-hidden />
              after the 4th digit
            </motion.span>
          }
        >
          {chips(AFTER, 4, BEATS.numora)}
          <motion.span
            className={caret('bg-signal-violet-fg')}
            initial={b.initial({ opacity: 0, x: endX })}
            animate={b.animate({ opacity: 1, x: numoraX }, { opacity: 0, x: endX })}
            transition={b.t({
              opacity: { duration: DUR.instant, delay: BEATS.numora },
              x: { ...SPRING, delay: BEATS.numoraMove },
            })}
          />
        </Row>
      </div>
    </DiagramFrame>
  );
}
