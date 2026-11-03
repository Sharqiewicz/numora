// Shared motion + diagram tokens for the Anatomy page.
// Personality: "precise instrument": crisp, calm, no bounce.
// Mirrors the CSS easing tokens in src/styles.css (`--ease-out-expo`, `--ease-drawer`, `--ease-move`).

/** Durations in seconds (motion/react units). */
export const DUR = {
  /** Demo value / character feedback. Never slower than this for keystroke feedback. */
  instant: 0.1,
  /** Hover, press, row highlight. */
  fast: 0.15,
  /** Element enter, color change. */
  base: 0.25,
  /** Line / path draw. */
  draw: 0.6,
  /** A "changed" flash fading out. */
  flash: 0.4,
} as const;

/**
 * Per-row scan step for rails / waves that sweep a list (stepper rows, digit tours).
 * Linear is allowed only for these constant-speed sweeps.
 */
export const SCAN_STEP = 0.08;

/**
 * Rules (round 2):
 * - No JS easing strings ('easeOut', 'linear'...) except `ease: 'linear'` with SCAN_STEP. Use EASE.*.
 * - No literal numbers in `transition` props: use DUR / STAGGER / SCAN_STEP, or a named `BEATS`
 *   const at the top of the component (absolute start times in s, summing under SCENE_MAX).
 * - One effect per trigger. A frame with its own scene never also fades in.
 * - SPRING_FAST is only for markers tracking a live caret; everything else uses SPRING.
 */

/** Hard cap for a whole diagram scene (all beats). */
export const SCENE_MAX = 2.4;

/** Stagger between sibling items. Keep total stagger under 0.6s. */
export const STAGGER = {
  tight: 0.04,
  base: 0.06,
  /** Extra hold before the key beat of a scene. */
  hold: 0.12,
} as const;

export const EASE = {
  /** Entrances, reveals, draws. */
  outExpo: [0.16, 1, 0.3, 1],
  /** Panel / row expand. */
  drawer: [0.32, 0.72, 0, 1],
  /** On-screen moves (caret, travelling dot). */
  move: [0.645, 0.045, 0.355, 1],
} as const satisfies Record<string, [number, number, number, number]>;

/** Retargetable, bounce-free spring for caret / row moves. */
export const SPRING = { type: 'spring', duration: 0.3, bounce: 0 } as const;

/**
 * Colour roles. One meaning each, used across every diagram and demo.
 * Text uses `-fg`, strokes `-line`, fills `-surface`. Never `/NN` opacity on text.
 *
 * - neutral  : structure (surface-3 fill, border / surface-7 stroke, foreground / muted-foreground text)
 * - amber    : the focal point: `beforeinput`, the cancellation point
 * - violet   : Numora's behaviour (e.g. Numora's caret)
 * - sky      : structural highlight (digit groups, counted digits)
 * - green    : ONLY the final clean result of a pipeline / the "right" outcome. Plain values are neutral.
 * - red      : wrong / naive / removed
 */
export const ROLE = {
  focus: {
    text: 'text-signal-amber-fg',
    fill: 'fill-signal-amber-surface',
    stroke: 'stroke-signal-amber-line',
    textFill: 'fill-signal-amber-fg',
    bg: 'bg-signal-amber-surface',
    border: 'border-signal-amber-line',
  },
  numora: {
    text: 'text-signal-violet-fg',
    fill: 'fill-signal-violet-surface',
    stroke: 'stroke-signal-violet-line',
    textFill: 'fill-signal-violet-fg',
    bg: 'bg-signal-violet-surface',
    border: 'border-signal-violet-line',
  },
  group: {
    text: 'text-signal-sky-fg',
    fill: 'fill-signal-sky-surface',
    stroke: 'stroke-signal-sky-line',
    textFill: 'fill-signal-sky-fg',
    bg: 'bg-signal-sky-surface',
    border: 'border-signal-sky-line',
  },
  good: {
    text: 'text-signal-green-fg',
    fill: 'fill-signal-green-surface',
    stroke: 'stroke-signal-green-line',
    textFill: 'fill-signal-green-fg',
    bg: 'bg-signal-green-surface',
    border: 'border-signal-green-line',
  },
  bad: {
    text: 'text-signal-red-fg',
    fill: 'fill-signal-red-surface',
    stroke: 'stroke-signal-red-line',
    textFill: 'fill-signal-red-fg',
    bg: 'bg-signal-red-surface',
    border: 'border-signal-red-line',
  },
} as const;

/**
 * SVG type scale and stroke weights. Use with a fixed-width canvas inside
 * <DiagramFrame minWidth={...}> so text never shrinks below 12px on phones.
 */
export const SVG = {
  font: { label: 14, body: 13, note: 12, digit: 20 },
  stroke: { hair: 1, rail: 1.5, emphasis: 2 },
  radius: { chip: 8, frame: 12 },
  dash: '4 3',
} as const;

/** Fast spring for markers that must track a live caret without lagging. */
export const SPRING_FAST = { type: 'spring', duration: 0.15, bounce: 0 } as const;
