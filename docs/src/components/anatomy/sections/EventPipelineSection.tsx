import { CodeBlock } from '@/components/CodeBlock';
import { EventPipelineDemo } from '../EventPipelineDemo';
import { EventPipelineDiagram } from '../diagrams';

export function EventPipelineSection() {
  return (
    <section id="event-pipeline" className="space-y-4 scroll-mt-24">
      <h2>The event pipeline</h2>
      <p>
        One keystroke fires four events on a focused <code>&lt;input&gt;</code>, always in the same
        order:
      </p>
      <CodeBlock language="text">{`keydown  →  beforeinput  →  [DOM mutation]  →  input  →  keyup`}</CodeBlock>
      <EventPipelineDiagram />
      <ul>
        <li>
          <strong>
            <code>keydown</code> (1996)
          </strong>{' '}
          fires first. It reports the <em>physical key</em>, not the resulting character.
        </li>
        <li>
          <strong>
            <code>beforeinput</code> (2016)
          </strong>{' '}
          fires after the browser has decided what the input <em>will</em> be, but before it
          touches the DOM. It is cancelable, which lets Numora replace the edit. It carries an <code>inputType</code> that names the
          action ("insertText", "deleteContentBackward", …) and a <code>data</code> field with the
          resolved character. <strong>This is the hook to format from.</strong>
        </li>
        <li>
          <strong>
            <code>input</code> (2009)
          </strong>{' '}
          fires after the value has changed. It is not cancelable. It fires for keyboard, paste,
          drag-and-drop, voice input and autocorrect. Setting <code>input.value</code> from code
          does not fire it.
        </li>
        <li>
          <strong>
            <code>keyup</code> (1996)
          </strong>{' '}
          fires when the key is released, after the value has already changed. Numora ignores it.
        </li>
      </ul>
      <p>
        Type below to see all four fire in order. <code>beforeinput</code> shows its{' '}
        <code>inputType</code> and <code>data</code>:
      </p>
      <EventPipelineDemo />
    </section>
  );
}
