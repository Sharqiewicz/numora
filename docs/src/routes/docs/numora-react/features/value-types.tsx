import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora-react/features/value-types')({
  head: () => ({
    meta: [
      { title: 'Value Types | numora-react' },
      { name: 'description', content: 'Learn how numora-react always emits formatted strings via e.target.value, how to access the raw value via e.target.rawValue, and when to use valueAsNumber as an escape hatch.' },
      { property: 'og:title', content: 'Value Types | numora-react' },
      { property: 'og:description', content: 'Learn how numora-react always emits formatted strings via e.target.value, how to access raw values via e.target.rawValue, and when to use valueAsNumber.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora-react/features/value-types' },
      { name: 'twitter:title', content: 'Value Types | numora-react' },
      { name: 'twitter:description', content: 'numora-react always emits formatted strings via e.target.value. Access raw values via e.target.rawValue on NumoraHTMLInputElement.' },
    ],
  }),
  component: ValueTypes,
})

function ValueTypes() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Value Types</h1>
      <p className="text-lg text-muted-foreground">
        Numora always works with strings. <code>e.target.value</code> is always the
        formatted display string. The raw numeric string is available separately.
      </p>

      <h2>e.target.value - formatted</h2>
      <p>
        <code>onChange</code> fires a standard React <code>ChangeEvent</code>.{' '}
        <code>e.target.value</code> is the formatted display string - the same value
        shown in the input, including thousand separators.
      </p>
      <CodeBlock language="tsx">
{`import { NumoraInput } from 'numora-react'

<NumoraInput
  thousandSeparator=","
  maxDecimals={2}
  onChange={(e) => {
    console.log(e.target.value) // "1,234.56"
  }}
/>`}
      </CodeBlock>

      <h2>Raw value</h2>
      <p>
        The raw numeric string (separators stripped) is available two ways. Use{' '}
        <code>onRawValueChange</code> for the simplest approach:
      </p>
      <CodeBlock language="tsx">
{`<NumoraInput
  thousandSeparator=","
  maxDecimals={2}
  onRawValueChange={(raw) => {
    console.log(raw) // "1234.56"
  }}
/>`}
      </CodeBlock>
      <p>
        Or read <code>e.target.rawValue</code> from inside <code>onChange</code> by
        casting the target to <code>NumoraHTMLInputElement</code>:
      </p>
      <CodeBlock language="tsx">
{`import { NumoraInput, NumoraHTMLInputElement } from 'numora-react'

<NumoraInput
  thousandSeparator=","
  maxDecimals={2}
  onChange={(e) => {
    const raw = (e.target as NumoraHTMLInputElement).rawValue
    console.log(raw) // "1234.56"
  }}
/>`}
      </CodeBlock>

      <h2>valueAsNumber</h2>
      <p>
        Need a <code>number</code>? Access <code>valueAsNumber</code> via a ref. It
        strips separators and calls <code>parseFloat</code> internally.
      </p>
      <CodeBlock language="tsx">
{`import { useRef } from 'react'
import { NumoraInput } from 'numora-react'

function App() {
  const ref = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    console.log((ref.current as any).valueAsNumber) // 1234.56
  }

  return <NumoraInput ref={ref} thousandSeparator="," maxDecimals={2} />
}`}
      </CodeBlock>
      <p>
        <strong>Precision warning:</strong> <code>parseFloat</code> is subject to IEEE 754
        limits. Integers above <code>Number.MAX_SAFE_INTEGER</code> and long decimals may
        silently lose precision. For financial arithmetic, use the string from{' '}
        <code>onRawValueChange</code> with a decimal library such as <code>decimal.js</code>.
      </p>
    </div>
  )
}
