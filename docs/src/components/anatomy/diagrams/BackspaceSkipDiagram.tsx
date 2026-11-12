import { Check, X } from 'lucide-react';
import { motion } from 'motion/react';
import { type ReactNode, useEffect, useState } from 'react';
import { DiagramFrame, DUR, EASE, SPRING, STAGGER, useScene } from '../kit';
import type { ScenePhase } from '../kit';

// Value "1,234" with the caret right after the comma (1,|234), then Backspace.
// Matches skipOverThousandSeparatorOnDelete: the caret moves left of the comma first, so the "1" is deleted.
const VALUE = '1,234';
const DIGIT_W = 26;
const COMMA_W = 12;
const CHIP_H = 36;
const CARET_START = 2; // 1,|234
const CARET_SKIPPED = 1; // 1|,234
const SHIFT = DIGIT_W + COMMA_W; // "234" slides left over the removed "1,"

const cellW = (ch: string) => (ch === ',' ? COMMA_W : DIGIT_W);
const xAt = (s: string, idx: number) => [...s].slice(0, idx).reduce((n, ch) => n + cellW(ch), 0);
const WIDTH = xAt(VALUE, VALUE.length);

// Absolute start times (s). The scene ends at numoraDelete + STAGGER.hold + DUR.base, under SCENE_MAX.
const BEATS = {
  show: 0.05,
  nativeDelete: 0.35,
  nativeRestore: 0.85,
  numoraSkip: 1.0, // after the native row has settled
  numoraDelete: 1.5,
} as const;

const ms = (s: number) => s * 1000;

function Chip({ ch, left, bad }: { ch: string; left: number; bad?: boolean }) {
  const comma = ch === ',';
  return (
    <span
      className="absolute top-0 flex items-center justify-center"
      style={{ left, width: cellW(ch), height: CHIP_H }}
    >
      {comma ? (
        <span className="font-mono text-xl leading-none text-muted-foreground">,</span>
      ) : (
        <span
          className={`flex h-9 w-[22px] items-center justify-center rounded-lg font-mono text-xl leading-none ${
            bad ? 'bg-signal-red-surface text-signal-red-fg' : 'bg-surface-3 text-foreground'
          }`}
        >
          {ch}
        </span>
      )}
    </span>
  );
}

function Verdict({
  show,
  good,
  delay = 0,
  children,
}: {
  show: boolean;
  good?: boolean;
  delay?: number;
  children: ReactNode;
}) {
  return (
    <motion.span
      className={`inline-flex items-center gap-1 text-xs ${good ? 'text-signal-green-fg' : 'text-signal-red-fg'}`}
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={{ duration: DUR.base, ease: EASE.outExpo, delay }}
    >
      {good ? <Check className="size-3.5" aria-hidden /> : <X className="size-3.5" aria-hidden />}
      {children}
    </motion.span>
  );
}

function Row({
  label,
  sub,
  verdict,
  children,
}: {
  label: string;
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
      <div className="relative" style={{ width: WIDTH, height: CHIP_H }}>
        {children}
      </div>
      <div className="mt-1.5 min-h-5">{verdict}</div>
    </div>
  );
}

const caretClass = 'pointer-events-none absolute -top-1 left-0 h-[44px] w-0.5 rounded-full';

function Scenario({ phase }: { phase: ScenePhase }) {
  const fin = phase === 'final';
  // native: 0 idle, 1 comma deleted (red 1234), 2 the formatter put it back.
  // numora: 0 idle, 1 caret skipped the comma, 2 the 1 was deleted.
  const [native, setNative] = useState(0);
  const [numora, setNumora] = useState(0);

  useEffect(() => {
    if (phase !== 'play') return;
    const ids = [
      setTimeout(() => setNative(1), ms(BEATS.nativeDelete)),
      setTimeout(() => setNative(2), ms(BEATS.nativeRestore)),
      setTimeout(() => setNumora(1), ms(BEATS.numoraSkip)),
      setTimeout(() => setNumora(2), ms(BEATS.numoraDelete)),
    ];
    return () => {
      for (const id of ids) clearTimeout(id);
    };
  }, [phase]);

  const n = fin ? 2 : native;
  const m = fin ? 2 : numora;
  const wrapper = {
    initial: fin ? false : { opacity: 0 },
    animate: { opacity: phase === 'hidden' ? 0 : 1 },
    transition: { duration: DUR.base, ease: EASE.outExpo, delay: BEATS.show },
  } as const;
  const swap = { duration: DUR.fast, ease: EASE.outExpo } as const;
  const caretX = [xAt(VALUE, CARET_START), xAt(VALUE, CARET_SKIPPED), 0][m];

  return (
    <div className="space-y-3">
      <Row
        label="Native"
        sub="Backspace deletes the comma"
        verdict={<Verdict show={n === 2}>comma removed, then re-added: nothing happens</Verdict>}
      >
        <motion.div className="absolute inset-0" {...wrapper}>
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: n === 1 ? 0 : 1 }}
            transition={swap}
          >
            {[...VALUE].map((ch, i) => (
              <Chip key={`b${i}-${ch}`} ch={ch} left={xAt(VALUE, i)} />
            ))}
          </motion.div>
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: n === 1 ? 1 : 0 }}
            transition={swap}
          >
            {[...'1234'].map((ch, i) => (
              <Chip key={`r${i}-${ch}`} ch={ch} left={i * DIGIT_W} bad />
            ))}
          </motion.div>
          <motion.span
            className={`${caretClass} bg-foreground`}
            initial={false}
            animate={{ x: n === 1 ? DIGIT_W : xAt(VALUE, CARET_START) }}
            transition={swap}
          />
        </motion.div>
      </Row>

      <Row
        label="Numora"
        sub="caret skips the comma first"
        verdict={
          <Verdict show={m === 2} good delay={STAGGER.hold}>
            deletes the 1
          </Verdict>
        }
      >
        <motion.div className="absolute inset-0" {...wrapper}>
          {[...VALUE].map((ch, i) => {
            const gone = i < 2; // the "1" and the comma
            return (
              <motion.span
                key={`n${i}-${ch}`}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: gone && m === 2 ? 0 : 1, x: !gone && m === 2 ? -SHIFT : 0 }}
                transition={gone ? swap : SPRING}
              >
                <Chip ch={ch} left={xAt(VALUE, i)} />
              </motion.span>
            );
          })}
          <motion.span
            className={`${caretClass} bg-signal-violet-fg`}
            initial={false}
            animate={{ x: caretX }}
            transition={SPRING}
          />
        </motion.div>
      </Row>
    </div>
  );
}

export function BackspaceSkipDiagram() {
  const scene = useScene();
  return (
    <DiagramFrame
      sceneRef={scene.ref}
      onReplay={scene.replay}
      canReplay={scene.canReplay}
      replayLabel="Replay Backspace over a comma"
    >
      <div
        role="img"
        aria-label="The caret sits after the comma in 1,234. A native input deletes the comma, the formatter puts it back, and nothing changes. Numora first moves the caret to the left of the comma, so Backspace deletes the 1 and leaves 234."
      >
        <Scenario key={scene.playId} phase={scene.phase} />
      </div>
    </DiagramFrame>
  );
}
