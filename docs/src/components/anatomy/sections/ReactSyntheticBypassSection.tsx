import { CodeBlock } from '@/components/CodeBlock';
import { WriteSuppressionDiagram } from '../diagrams/WriteSuppressionDiagram';

const code = `// (trimmed)
useEffect(() => {
  const input = internalInputRef.current
  if (!input) return

  const onBeforeInput = (e: InputEvent) => {
    const result = handleOnBeforeInputNumoraInput(
      e,
      stateRef.current.maxDecimals,
      stateRef.current.formattingOptions
    )

    switch (result.type) {
      case 'skip':   // paste/drop and unknown inputTypes: let the browser handle it
        return
      case 'reject': // second decimal, decimal cap, maxLength, isAllowed
        e.preventDefault()
        return
      case 'handled': {
        e.preventDefault()
        const numInput = input as NumoraHTMLInputElement
        // setRangeText fires an 'input' event; withInternalWrite suppresses it
        withInternalWrite(() =>
          writeValuePreservingUndo(input, result.formatted, result.cursorPos)
        )
        numInput.formattedValue = result.formatted

        // Call onChange directly with the raw value. This does not depend on
        // React's value-tracker diff or synthetic event pipeline.
        const cb = stateRef.current.onChange
        if (cb) cb(createSyntheticChangeEvent(numInput, result.raw))
        break
      }
    }
  }

  input.addEventListener('beforeinput', onBeforeInput)
  return () => input.removeEventListener('beforeinput', onBeforeInput)
}, [withInternalWrite])`;

export function ReactSyntheticBypassSection() {
  return (
    <section id="react-synthetic-bypass" className="space-y-4 scroll-mt-24">
      <h2>
        Why <code>beforeinput</code> bypasses React's synthetic event system
      </h2>
      <p>
        React's event system uses <strong>delegation</strong>: a single listener at the root
        container fires handlers during the bubbling phase. That works for most events, but not for{' '}
        <code>beforeinput</code>. React's <code>onBeforeInput</code> is not the native event. React
        synthesizes it from <code>textInput</code>, <code>keypress</code> and composition events,
        so it cannot reliably cancel the edit before the browser applies it.
      </p>
      <p>
        Switching to React's <code>onBeforeInput</code> prop broke validation and sanitization, and
        any character could be typed. So Numora React registers the native listener itself.
      </p>
      <p>
        The listener is registered once at mount on the actual element. Mutable options are read
        through a <code>stateRef</code>, which a layout effect refreshes on every render. Prop
        changes therefore never need the listener to be re-registered:
      </p>
      <CodeBlock language="tsx">{code}</CodeBlock>
      <h3 className="text-base">
        <code>suppressNextInputEventRef</code> prevents a double fire
      </h3>
      <p>
        The native handler calls <code>onChange</code> directly with a synthetic{' '}
        <code>ChangeEvent</code>. Writing the formatted value with <code>setRangeText</code>{' '}
        also fires an <code>input</code> event, synchronously, and React routes it to its own{' '}
        <code>handleChange</code>. That would call <code>onChange</code> a <em>second</em>{' '}
        time, so every callback would run twice per keystroke.
      </p>
      <WriteSuppressionDiagram />
      <p>
        <code>withInternalWrite</code> prevents that. It sets{' '}
        <code>suppressNextInputEventRef</code> to <code>true</code> around the write, and because
        the <code>input</code> event is dispatched synchronously, <code>handleChange</code> runs
        while the flag is up, sees it, and returns without re-emitting. The flag is cleared in a{' '}
        <code>finally</code> block as soon as the write completes. Numora never dispatches a
        synthetic <code>input</code> event itself.
      </p>
    </section>
  );
}
