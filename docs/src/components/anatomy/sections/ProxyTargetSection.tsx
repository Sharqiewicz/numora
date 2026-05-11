import { CodeBlock } from '@/components/CodeBlock'

const code = `import { type NumoraHTMLInputElement, type NumoraInputChangeEvent } from 'numora-react'

// From any onChange handler:
onChange={(e: NumoraInputChangeEvent) => {
  e.target.value           // → "1234.56"   (raw, via Proxy)
  e.target.formattedValue  // → "1,234.56"  (display string)
  e.target.selectionStart  // → caret position (real HTMLInputElement)
}}

// Or off a forwarded ref:
const ref = useRef<NumoraHTMLInputElement>(null)
ref.current?.formattedValue  // → "1,234.56"
ref.current?.value           // → "1,234.56"  (DOM value, formatted - no Proxy here)`

export function ProxyTargetSection() {
  return (
    <section className="space-y-4">
      <h2>The Proxy on <code>e.target</code></h2>
      <p>
        Every formatting cycle produces two strings: a formatted display value and a
        raw numeric value. The vanilla <code>NumoraInput</code> class emits one or the
        other through <code>onChange</code> based on <code>rawValueMode</code>. The
        React component does something different: it always exposes both on the change
        event's <code>target</code>.
      </p>
      <p>
        It does this with a Proxy. The synthetic <code>ChangeEvent</code>'s{' '}
        <code>target</code> wraps the real <code>HTMLInputElement</code> - reads to{' '}
        <code>target.value</code> are intercepted and return the raw string;{' '}
        <code>target.formattedValue</code> reads through to a custom property the
        library writes after each format pass; everything else (
        <code>selectionStart</code>, <code>focus()</code>, <code>name</code>, …) passes
        through to the underlying element.
      </p>
      <CodeBlock language="tsx">{code}</CodeBlock>
      <p>
        Note: the Proxy only wraps <code>e.target</code> on change events. A forwarded
        ref points at the real DOM element, so <code>ref.current.value</code> returns
        the formatted string (because that's what's in the DOM input). Use{' '}
        <code>ref.current.formattedValue</code> when reading from a ref.
      </p>
    </section>
  )
}
