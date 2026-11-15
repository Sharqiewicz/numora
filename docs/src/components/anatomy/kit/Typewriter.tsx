import { useReducedMotion } from 'motion/react';
import { useEffect, useState } from 'react';

/** Time per typed character, in ms. */
export const TYPE_MS = 18;
/** Reading time per character once it is on screen, plus a beat to let the sentence land. */
const READ_MS = 28;
const SETTLE_MS = 700;

/** How long a frame has to stay up for `text` to be typed out and read, in ms. */
export const readMs = (text: string) => text.length * (TYPE_MS + READ_MS) + SETTLE_MS;

/**
 * Types `text` out one character at a time whenever it changes. The untyped rest is laid out
 * but invisible, so the line never reflows and wraps where the finished sentence wraps.
 * The first render and reduced motion show the whole text at once.
 */
export function Typewriter({ text, className }: { text: string; className?: string }) {
  const reduced = useReducedMotion() ?? false;
  const [state, setState] = useState({ text, typed: text.length });
  let typed = state.typed;
  // New text restarts in the same render, so the finished sentence never flashes first.
  if (state.text !== text) {
    typed = reduced ? text.length : 0;
    setState({ text, typed });
  }

  useEffect(() => {
    if (typed >= text.length) return;
    const id = setTimeout(() => setState({ text, typed: typed + 1 }), TYPE_MS);
    return () => clearTimeout(id);
  }, [text, typed]);

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, typed)}
        <span className="invisible">{text.slice(typed)}</span>
      </span>
    </span>
  );
}
