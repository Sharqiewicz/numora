import { CodeBlock } from '@/components/CodeBlock'
import { EventPipelineDemo } from '../EventPipelineDemo'

export function EventPipelineSection() {
  return (
    <section className="space-y-4">
      <h2>The event pipeline</h2>
      <p>
        A single keystroke fires four events on a focused <code>&lt;input&gt;</code> in a
        fixed order. Each one was added at a different moment in the platform's history,
        for a different reason:
      </p>
      <CodeBlock language="text">{`keydown  →  beforeinput  →  [DOM mutation]  →  input  →  keyup`}</CodeBlock>
      <ul>
        <li>
          <strong><code>keydown</code> (1996)</strong> - fires first, before anything
          else. Reports the <em>physical key</em>, not the resulting character. Cancelable,
          but cancelling it is a blunt instrument.
        </li>
        <li>
          <strong><code>beforeinput</code> (2016)</strong> - fires after the browser has
          decided what the input <em>will</em> be, but before it touches the DOM.
          Cancelable. Carries an <code>inputType</code> describing the semantic action
          ("insertText", "deleteContentBackward", …) and a <code>data</code> field with
          the resolved character. <strong>The correct hook for input formatting.</strong>
        </li>
        <li>
          <strong><code>input</code> (2009)</strong> - fires after the value has changed.
          Not cancelable. The universal "value changed" signal - fires for keyboard,
          paste, drag-and-drop, voice input, autocorrect, and programmatic changes alike.
        </li>
        <li>
          <strong><code>keyup</code> (1996)</strong> - fires when the key is released.
          Comes after the value has already mutated. Numora ignores it.
        </li>
      </ul>
      <p>Type below to see all four fire in order, with their <code>inputType</code> and the resolved <code>data</code>:</p>
      <EventPipelineDemo />
    </section>
  )
}
