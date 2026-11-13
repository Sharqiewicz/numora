import { CodeBlock } from '@/components/CodeBlock';

const code = `// (trimmed)
useEffect(() => {
  const input = internalInputRef.current
  if (!input) return

  const onBeforeInput = (e: InputEvent) => {
    // Decides skip / reject / handled. When it handles the edit it calls
    // preventDefault() and writes the field with setRangeText: no input event,
    // no React value tracker. It returns the new values, or nothing.
    const values = applyBeforeInput(e, stateRef.current.formattingOptions)
    // Call onChange directly - guaranteed delivery, no dependency on
    // React's value-tracker diff or synthetic event pipeline.
    if (values) emit(input, values)
  }

  input.addEventListener('beforeinput', onBeforeInput)
  return () => input.removeEventListener('beforeinput', onBeforeInput)
}, [])`;

export function ReactSyntheticBypassSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="react-synthetic-bypass" className="space-y-4 scroll-mt-24">
      <h2>
        Why <code>beforeinput</code> bypasses React's synthetic event system
      </h2>
      <p>
        React's event system uses <strong>delegation</strong>. A single listener at the root
        container fires handlers during the bubbling phase. That works for most events, but not for{' '}
        <code>beforeinput</code>. React's <code>onBeforeInput</code> is not the native event. React
        synthesizes it from <code>textInput</code>, <code>keypress</code> and composition events, so
        it cannot reliably cancel the edit before the browser applies it.
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
        Why <code>onChange</code> fires only once
      </h3>
      <p>
        The handler writes the formatted value with <code>setRangeText</code> and calls{' '}
        <code>onChange</code> itself. <code>setRangeText</code> dispatches no <code>input</code>{' '}
        event. The HTML spec says so, and Chrome and jsdom both follow it. Nothing reaches React's{' '}
        <code>handleChange</code> afterwards. <code>handleChange</code> only ever sees edits the
        browser makes itself, such as autofill, drop, IME commits, undo and redo.
      </p>
    </section>
  );
}
