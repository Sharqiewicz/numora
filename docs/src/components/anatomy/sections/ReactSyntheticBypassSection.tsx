import { CodeBlock } from '@/components/CodeBlock'

const code = `useEffect(() => {
  const input = internalInputRef.current
  if (!input) return

  const handler = (e: InputEvent) => {
    if (e.inputType === 'insertFromPaste' || e.inputType === 'insertFromDrop') return

    const result = handleNumoraOnBeforeInput(e, {
      decimalMaxLength: maxDecimalsRef.current,
      formattingOptions: formattingOptionsRef.current,
    })
    if (result !== null) {
      const numInput = input as NumoraHTMLInputElement
      numInput.formattedValue = result.value

      // Call onChange directly - guaranteed delivery, no dependency on
      // React's value-tracker diff or synthetic event pipeline.
      onChangeRef.current?.(createSyntheticChangeEvent(numInput, result.rawValue ?? ''))

      // Dispatch a native 'input' to keep React's value tracker in sync.
      isHandledByBeforeInputRef.current = true
      input.dispatchEvent(new Event('input', { bubbles: true }))
      isHandledByBeforeInputRef.current = false
    }
  }

  input.addEventListener('beforeinput', handler)
  return () => input.removeEventListener('beforeinput', handler)
}, [])`

export function ReactSyntheticBypassSection() {
  return (
    <section className="space-y-4">
      <h2>Why <code>beforeinput</code> bypasses React's synthetic event system</h2>
      <p>
        React's event system uses <strong>delegation</strong>: a single listener at the
        root container fires handlers during the bubbling phase. For most events this is
        fine. For <code>beforeinput</code> it is fatal - by the time bubbling reaches
        the root, the browser has already committed the character to the DOM. Calling{' '}
        <code>e.nativeEvent.preventDefault()</code> at that point is a no-op.
      </p>
      <p>
        This was verified empirically: switching to React's <code>onBeforeInput</code>{' '}
        prop caused all validation and sanitisation to silently fail - any character
        could be typed. ProseMirror, Slate, and Lexical hit the same constraint and all
        use native <code>addEventListener</code> for <code>beforeinput</code>.
      </p>
      <p>
        The listener is registered once at mount on the actual element. Mutable options
        are read through refs updated via <code>useLayoutEffect</code> so prop changes
        never need a listener re-registration:
      </p>
      <CodeBlock language="tsx">{code}</CodeBlock>
      <h3 className="text-base"><code>isHandledByBeforeInputRef</code> - preventing double-fire</h3>
      <p>
        The native handler calls <code>onChange</code> directly with a synthetic{' '}
        <code>ChangeEvent</code>, then dispatches a real <code>input</code> event so
        React's value tracker stays in sync. That dispatched event flows through React's
        normal pipeline and would trigger the React-side <code>handleChange</code> →{' '}
        <code>onChange</code> a <em>second</em> time, firing every callback twice per
        keystroke.
      </p>
      <p>
        <code>isHandledByBeforeInputRef</code> is the gate: it is set to{' '}
        <code>true</code> synchronously around <code>dispatchEvent</code>, and because{' '}
        <code>dispatchEvent</code> is synchronous, the React-side handler runs to
        completion while the flag is up. It reads the flag, sees that{' '}
        <code>onChange</code> has already been called, and exits without re-emitting.
      </p>
    </section>
  )
}
