import { CodeBlock } from '@/components/CodeBlock';

const code = `import { type NumoraHTMLInputElement, type NumoraInputChangeEvent } from 'numora-react'

// From any onChange handler:
onChange={(e: NumoraInputChangeEvent) => {
  e.target.value           // → "1234.56"   (raw, via Proxy)
  e.target.formattedValue  // → "1,234.56"  (display string)
  e.target.selectionStart  // → cursor position (real HTMLInputElement)
}}

// Or off a forwarded ref:
const ref = useRef<NumoraHTMLInputElement>(null)
ref.current?.formattedValue  // → "1,234.56"
ref.current?.value           // → "1,234.56"  (DOM value: formatted unless Blur mode and focused; no Proxy here)`;

export function ProxyTargetSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="proxy-target" className="space-y-4 scroll-mt-24">
      <h2>
        The Proxy on <code>e.target</code>
      </h2>
      <p>
        The React component exposes both the raw and the formatted string on the change event's{' '}
        <code>target</code> through a Proxy. The synthetic <code>ChangeEvent</code>'s{' '}
        <code>target</code> wraps the real <code>HTMLInputElement</code>. Reads of{' '}
        <code>target.value</code> are intercepted and return the raw string.{' '}
        <code>target.formattedValue</code> is a getter that Numora React defines once on the input
        when it mounts, next to <code>rawValue</code> and <code>setValue</code>. The Proxy passes it
        through, like everything else (<code>selectionStart</code>, <code>focus()</code>,{' '}
        <code>name</code>, …) on the underlying element.
      </p>
      <CodeBlock language="tsx">{code}</CodeBlock>
      <p>
        The Proxy only wraps <code>e.target</code> on change events. A forwarded ref points at the
        real DOM element, so read <code>ref.current.formattedValue</code> there.
      </p>
    </section>
  );
}
