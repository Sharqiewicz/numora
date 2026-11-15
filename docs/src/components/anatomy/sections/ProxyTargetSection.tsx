import { CodeBlock } from '@/components/CodeBlock';

const code = `import { type NumoraHTMLInputElement } from 'numora-react'

const ref = useRef<NumoraHTMLInputElement>(null)
ref.current?.formattedValue  // → "1,234.56"
ref.current?.value           // → "1,234.56"  (DOM value: formatted, except in a focused blur-mode field; no Proxy here)`;

export function ProxyTargetSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="proxy-target" className="space-y-4 scroll-mt-24">
      <h2>
        The Proxy on <code>e.target</code>
      </h2>
      <p>
        The <code>target</code> of a change event is a Proxy around the real{' '}
        <code>HTMLInputElement</code>. It intercepts one read: <code>target.value</code> returns the
        raw string. Everything else passes through to the element, including{' '}
        <code>selectionStart</code>, <code>focus()</code> and <code>name</code>. So does{' '}
        <code>formattedValue</code>, a getter that Numora React defines on the input when it mounts,
        next to <code>rawValue</code> and <code>setValue</code>.
      </p>
      <p>
        The Proxy only wraps <code>e.target</code> on change events. A forwarded ref points at the
        real DOM element, so read <code>ref.current.formattedValue</code> there:
      </p>
      <CodeBlock language="tsx">{code}</CodeBlock>
    </section>
  );
}
