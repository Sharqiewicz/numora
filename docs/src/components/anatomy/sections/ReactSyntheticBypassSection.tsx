import { CodeBlock } from '@/components/CodeBlock';
import { WriteSuppressionDiagram } from '../diagrams/WriteSuppressionDiagram';

const code = `// (trimmed)
useEffect(() => {
  const input = internalInputRef.current
  if (!input) return

  const onBeforeInput = (e: InputEvent) => {
    const result = handleOnBeforeInputNumoraInput(
      e,
      stateRef.current.decimalMaxLength,
      stateRef.current.formattingOptions
    )

    switch (result.type) {
      case 'skip':
        return
      case 'reject':
        e.preventDefault()
        return
      case 'handled': {
        e.preventDefault()
        // setRangeText under the hood, so the browser's undo history survives.
        withInternalWrite(() =>
          writeValuePreservingUndo(input, result.formatted, result.cursorPos)
        )
        // Call onChange directly - guaranteed delivery, no dependency on
        // React's value-tracker diff or synthetic event pipeline.
        stateRef.current.onChange?.(createSyntheticChangeEvent(input, result.raw))
      }
    }
  }

  input.addEventListener('beforeinput', onBeforeInput)
  return () => input.removeEventListener('beforeinput', onBeforeInput)
}, [])`;

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
        through a ref updated via <code>useLayoutEffect</code> so prop changes never need a listener
        re-registration:
      </p>
      <CodeBlock language="tsx">{code}</CodeBlock>
      <h3 className="text-base">
        <code>suppressNextInputEventRef</code> - preventing double-fire
      </h3>
      <p>
        The handler writes the formatted value with <code>setRangeText</code> and calls{' '}
        <code>onChange</code> itself. No <code>input</code> event is dispatched afterwards. But
        some environments and polyfills fire a native <code>input</code> event on a programmatic
        write, and that event would reach the React-side <code>handleChange</code> and call{' '}
        <code>onChange</code> a <em>second</em> time.
      </p>
      <WriteSuppressionDiagram />
      <p>
        <code>withInternalWrite</code> is the gate: it sets <code>suppressNextInputEventRef</code>{' '}
        to <code>true</code> for the duration of the write, and <code>handleChange</code> returns
        early while the flag is up. Every internal write (typing, paste, focus-strip,
        blur-regroup) goes through it, so <code>handleChange</code> only ever sees browser-native
        edits such as undo, redo and autofill.
      </p>
    </section>
  );
}
