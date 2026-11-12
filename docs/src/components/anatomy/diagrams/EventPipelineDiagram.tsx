import { motion } from 'motion/react';
import { DiagramFrame, DUR, EASE, ROLE, STAGGER, SVG, useScene } from '../kit';

const SLOT = 112;
const cx = (i: number) => SLOT / 2 + SLOT * i;
const RAIL_Y = 98;
const NODE_W = 104;
const NODE_H = 34;
const NODE_Y = 36;

type Kind = 'normal' | 'focus' | 'ghost';

const EVENTS: { label: string; kind: Kind; note: [string, string] }[] = [
  { label: 'keydown', kind: 'normal', note: ['physical key', 'cancelable'] },
  { label: 'beforeinput', kind: 'focus', note: ['inputType, data', 'cancelable'] },
  { label: 'DOM mutation', kind: 'ghost', note: ['replaced by', 'setRangeText'] },
  { label: 'input', kind: 'normal', note: ['new value', 'not cancelable'] },
  { label: 'keyup', kind: 'normal', note: ['key released', 'ignored'] },
];

/** Absolute start times (s). Scene ends near 1.2s. */
const BEATS = {
  rail: 0,
  nodes: 0.4, // after the rail has drawn
  callout: 0.9,
} as const;

const nodeVariants = {
  hidden: { opacity: 0, y: 6 },
  shown: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: BEATS.nodes + i * STAGGER.base, duration: DUR.base, ease: EASE.outExpo },
  }),
};

const railVariants = {
  hidden: { pathLength: 0 },
  shown: {
    pathLength: 1,
    transition: { delay: BEATS.rail, duration: DUR.draw, ease: EASE.outExpo },
  },
};

const calloutVariants = {
  hidden: { opacity: 0 },
  shown: {
    opacity: 1,
    transition: { delay: BEATS.callout, duration: DUR.base, ease: EASE.outExpo },
  },
};

const CALLOUT = 'preventDefault() cancels here';

export function EventPipelineDiagram() {
  const scene = useScene();

  return (
    <DiagramFrame
      sceneRef={scene.ref}
    >
      <ol className="space-y-2 sm:hidden">
        {EVENTS.map((e) => {
          const focus = e.kind === 'focus';
          const ghost = e.kind === 'ghost';
          return (
            <li
              key={e.label}
              className={`rounded-lg border px-3 py-2 ${
                focus
                  ? `${ROLE.focus.bg} ${ROLE.focus.border}`
                  : ghost
                    ? 'border-dashed border-border'
                    : 'border-border bg-surface-3'
              }`}
            >
              <div
                className={`font-mono text-caption ${
                  focus ? ROLE.focus.text : ghost ? 'text-muted-foreground' : 'text-foreground'
                }`}
              >
                {e.label}
              </div>
              <div className="text-xs text-muted-foreground">{e.note.join(', ')}</div>
              {focus && (
                <div className={`mt-1 font-mono text-xs ${ROLE.focus.text}`}>{CALLOUT}</div>
              )}
            </li>
          );
        })}
      </ol>
      {/* The list above and this SVG are mutually exclusive via display:none, so only one is announced. */}
      <section
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard reachable
        tabIndex={0}
        aria-label="Event pipeline diagram"
        className="hidden overflow-x-auto rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:block"
      >
      <svg
        viewBox="0 0 560 150"
        role="img"
        aria-label="Five steps for one keystroke, in order: keydown, beforeinput, DOM mutation, input, keyup. beforeinput is the cancellation point: preventDefault() there stops the DOM mutation, which Numora replaces with setRangeText."
        className="block w-full min-w-[520px]"
      >
        <motion.g
          key={scene.playId}
          initial={scene.phase === 'final' ? false : 'hidden'}
          animate={scene.phase === 'hidden' ? 'hidden' : 'shown'}
        >
          <motion.path
            d={`M8 ${RAIL_Y} H546`}
            fill="none"
            className="stroke-border"
            strokeWidth={SVG.stroke.rail}
            variants={railVariants}
          />

          {EVENTS.map((e, i) => {
            const x = cx(i);
            const ghost = e.kind === 'ghost';
            const focus = e.kind === 'focus';
            return (
              <motion.g key={e.label} custom={i} variants={nodeVariants}>
                <line
                  x1={x}
                  y1={NODE_Y + NODE_H}
                  x2={x}
                  y2={RAIL_Y}
                  className={focus ? ROLE.focus.stroke : 'stroke-border'}
                  strokeWidth={focus ? SVG.stroke.emphasis : SVG.stroke.hair}
                  strokeDasharray={ghost ? SVG.dash : undefined}
                />
                <circle
                  cx={x}
                  cy={RAIL_Y}
                  r={3}
                  className={focus ? 'fill-signal-amber-fg' : 'fill-surface-7'}
                />
                <rect
                  x={x - NODE_W / 2}
                  y={NODE_Y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={SVG.radius.chip}
                  className={
                    focus
                      ? `${ROLE.focus.fill} ${ROLE.focus.stroke}`
                      : ghost
                        ? 'fill-transparent stroke-border'
                        : 'fill-surface-3 stroke-border'
                  }
                  strokeWidth={focus ? SVG.stroke.emphasis : SVG.stroke.hair}
                  strokeDasharray={ghost ? SVG.dash : undefined}
                />
                <text
                  x={x}
                  y={NODE_Y + NODE_H / 2 + 4.5}
                  textAnchor="middle"
                  fontSize={SVG.font.body}
                  className={`font-mono ${
                    focus
                      ? ROLE.focus.textFill
                      : ghost
                        ? 'fill-muted-foreground'
                        : 'fill-foreground'
                  }`}
                >
                  {e.label}
                </text>
                <text
                  textAnchor="middle"
                  fontSize={SVG.font.note}
                  className="fill-muted-foreground"
                >
                  <tspan x={x} y={RAIL_Y + 24}>
                    {e.note[0]}
                  </tspan>
                  <tspan x={x} y={RAIL_Y + 39}>
                    {e.note[1]}
                  </tspan>
                </text>
              </motion.g>
            );
          })}

          <motion.g variants={calloutVariants}>
            <text
              x={cx(1)}
              y={16}
              textAnchor="middle"
              fontSize={SVG.font.note}
              className={`font-mono ${ROLE.focus.textFill}`}
            >
              {CALLOUT}
            </text>
            <line
              x1={cx(1)}
              y1={21}
              x2={cx(1)}
              y2={NODE_Y - 2}
              className={ROLE.focus.stroke}
              strokeWidth={SVG.stroke.hair}
            />
          </motion.g>
        </motion.g>
      </svg>
      </section>
    </DiagramFrame>
  );
}
