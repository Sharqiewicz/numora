import { motion } from 'motion/react';
import { DiagramFrame, DUR, EASE, ROLE, useScene } from '../kit';

/** Absolute start times in seconds. The scene ends under SCENE_MAX. */
const BEATS = {
  node1: 0.1,
  node2: 0.5,
  node3: 0.9,
  node4: 1.3,
  flagOn: 0.5,
  flagOff: 1.7,
  ignored: 1.45,
  ghost: 1.55,
  ghostBadge: 1.89,
} as const;

// The flag stays up from flagOn until flagOff, fading in and out over DUR.fast.
const FLAG_SPAN = BEATS.flagOff + DUR.fast - BEATS.flagOn;
const FLAG_TIMES = [0, DUR.fast / FLAG_SPAN, (BEATS.flagOff - BEATS.flagOn) / FLAG_SPAN, 1];

const appear = {
  hidden: { opacity: 0, y: 6 },
  shown: (at: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: at, duration: DUR.base, ease: EASE.outExpo },
  }),
};

const fade = {
  hidden: { opacity: 0 },
  shown: (at: number) => ({
    opacity: 1,
    transition: { delay: at, duration: DUR.base, ease: EASE.outExpo },
  }),
};

const flagOn = {
  hidden: { opacity: 0 },
  shown: {
    opacity: [0, 1, 1, 0],
    transition: { delay: BEATS.flagOn, duration: FLAG_SPAN, times: FLAG_TIMES, ease: EASE.outExpo },
  },
};

const NODES = [
  { name: 'beforeinput', note: 'handler', at: BEATS.node1, tone: 'focus' },
  { name: 'setRangeText', note: 'inside withInternalWrite', at: BEATS.node2, tone: 'numora' },
  { name: 'input event', note: 'fires synchronously', at: BEATS.node3, tone: 'plain' },
  { name: 'handleChange', note: 'flag is true: returns', at: BEATS.node4, tone: 'numora' },
] as const;

const toneClass = {
  focus: `${ROLE.focus.bg} ${ROLE.focus.border} ${ROLE.focus.text}`,
  numora: `${ROLE.numora.bg} ${ROLE.numora.border} ${ROLE.numora.text}`,
  plain: 'bg-surface-3 border-border text-foreground',
} as const;

const GRID = 'grid grid-cols-1 gap-2 sm:grid-cols-4';

export function WriteSuppressionDiagram() {
  const scene = useScene();

  return (
    <DiagramFrame
      sceneRef={scene.ref}
      onReplay={scene.replay}
      canReplay={scene.canReplay}
      replayLabel="write suppression"
    >
      <p className="sr-only">
        One keystroke in four steps. The beforeinput handler writes the formatted value with
        setRangeText inside withInternalWrite, which sets suppressNextInputEventRef to true. The
        native input event fires synchronously and reaches handleChange, which sees the flag and
        returns, then the flag is reset to false in a finally block. Without the flag, onChange
        would fire a second time.
      </p>
      <motion.div
        key={scene.playId}
        aria-hidden
        className="space-y-4"
        initial={scene.phase === 'final' ? false : 'hidden'}
        animate={scene.phase === 'hidden' ? 'hidden' : 'shown'}
      >
        <div className="flex flex-wrap items-center gap-2 font-mono text-[13px]">
          <span className="text-muted-foreground">suppressNextInputEventRef</span>
          <span className="inline-grid rounded-md border border-border bg-surface-3 px-2 py-0.5">
            <span className="col-start-1 row-start-1 text-center text-foreground">false</span>
            <motion.span
              variants={flagOn}
              className={`col-start-1 row-start-1 -mx-2 -my-0.5 rounded-md border px-2 py-0.5 text-center ${ROLE.numora.bg} ${ROLE.numora.border} ${ROLE.numora.text}`}
            >
              true
            </motion.span>
          </span>
          <span className="font-sans text-[12px] text-muted-foreground">true during the write, false after</span>
        </div>

        <div className={GRID}>
          {NODES.map((n) => (
            <motion.div
              key={n.name}
              custom={n.at}
              variants={appear}
              className={`rounded-lg border px-3 py-2 ${toneClass[n.tone]}`}
            >
              <div className="font-mono text-[13px] font-medium">{n.name}</div>
              <div className="text-[12px] text-muted-foreground">{n.note}</div>
            </motion.div>
          ))}
        </div>

        <motion.div custom={BEATS.ignored} variants={fade} className="sm:grid sm:grid-cols-4">
          <div
            className={`rounded-md border px-2 py-0.5 text-[12px] sm:col-start-4 sm:justify-self-start ${ROLE.numora.bg} ${ROLE.numora.border} ${ROLE.numora.text}`}
          >
            event ignored, onChange not repeated
          </div>
        </motion.div>

        <motion.div custom={BEATS.ghost} variants={fade}>
         <div className="space-y-2 opacity-60">
          <div className="text-[12px] text-muted-foreground">without the flag</div>
          <div className={GRID}>
            {NODES.map((n, i) => (
              <div
                key={n.name}
                className={`rounded-lg border border-dashed px-3 py-2 ${
                  i === 3 ? `${ROLE.bad.bg} ${ROLE.bad.border} ${ROLE.bad.text}` : 'border-border text-muted-foreground'
                }`}
              >
                <div className="font-mono text-[13px]">{n.name}</div>
                <div className="text-[12px]">{i === 3 ? 'runs in full' : n.note}</div>
              </div>
            ))}
          </div>
          <motion.div
            custom={BEATS.ghostBadge}
            variants={appear}
            className={`inline-block rounded-md border px-2 py-0.5 text-[12px] ${ROLE.bad.bg} ${ROLE.bad.border} ${ROLE.bad.text}`}
          >
            onChange fires twice
          </motion.div>
         </div>
        </motion.div>
      </motion.div>
    </DiagramFrame>
  );
}
