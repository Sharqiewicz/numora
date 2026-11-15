import { CodeBlock } from '@/components/CodeBlock';
import { EventPipelineLoop } from '../EventPipelineLoop';

export function EventPipelineSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="event-pipeline" className="space-y-4 scroll-mt-24">
      <h2>The event pipeline</h2>
      <p>
        One keystroke fires four events on a focused <code>&lt;input&gt;</code>, always in the same
        order:
      </p>
      <CodeBlock language="text">{`keydown  →  beforeinput  →  [DOM edit]  →  input  →  keyup`}</CodeBlock>
      <ul>
        <li>
          <code>keydown</code> fires first. It reports the physical key, not the resulting
          character.
        </li>
        <li>
          <code>beforeinput</code> fires once the browser has decided what the edit will be, but
          before it edits the DOM. It is cancelable. Numora formats here.
        </li>
        <li>
          <code>input</code> fires after the value has changed and cannot be canceled. Numora uses
          it as a fallback. It reformats what the browser changed on its own, such as autofill,
          drop, IME commits, undo and redo. If the new value is not allowed, it puts the previous
          one back.
        </li>
        <li>
          <code>keyup</code> fires when the key is released. Numora ignores it.
        </li>
      </ul>
      <p>
        In a Numora field, typing stops at <code>beforeinput</code>. Numora cancels the edit and
        writes the formatted value itself, so the browser never edits the DOM and <code>input</code>{' '}
        never fires:
      </p>
      <EventPipelineLoop />
    </section>
  );
}
