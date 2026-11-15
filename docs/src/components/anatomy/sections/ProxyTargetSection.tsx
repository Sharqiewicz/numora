import { CodeBlock } from '@/components/CodeBlock';

const code = `import { type NumoraHTMLInputElement } from 'numora-react'

const ref = useRef<NumoraHTMLInputElement>(null)
ref.current?.formattedValue  // → "1,234.56"
// The DOM value, with no Proxy: formatted, except in a focused blur-mode field
ref.current?.value           // → "1,234.56"`;

export function ProxyTargetSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="proxy-target" className="space-y-4 scroll-mt-24">
      <h2>
        The Proxy on <code>e.target</code>
      </h2>
      <p>
        The <code>target</code> of a change event is a Proxy around the real{' '}
        <code>HTMLInputElement</code>. It does three things:
      </p>
      <ul>
        <li>
          A read of <code>target.value</code> returns the raw string. Every other read goes to the
          element, including <code>selectionStart</code> and <code>name</code>. So does{' '}
          <code>formattedValue</code>, a getter that Numora React defines on the input when it
          mounts, next to <code>rawValue</code> and <code>setValue</code>.
        </li>
        <li>
          A function it returns, such as <code>focus()</code>, is bound to the real input. A native
          method called on a Proxy would throw.
        </li>
        <li>
          A write is forwarded to the real input. Assigning <code>target.value</code> changes the
          field, and a later read of <code>target.value</code> still returns the raw string.
        </li>
      </ul>
      <p>
        The event object is built by hand. It is not a React synthetic event. Its{' '}
        <code>nativeEvent</code> is a new <code>Event('change')</code> that was never dispatched,
        its <code>isTrusted</code> is <code>false</code>, and <code>preventDefault()</code> and{' '}
        <code>stopPropagation()</code> do nothing.
      </p>
      <p>
        The Proxy only wraps <code>e.target</code> on change events. A forwarded ref points at the
        real DOM element, so read <code>ref.current.formattedValue</code> there:
      </p>
      <CodeBlock language="tsx">{code}</CodeBlock>
    </section>
  );
}
