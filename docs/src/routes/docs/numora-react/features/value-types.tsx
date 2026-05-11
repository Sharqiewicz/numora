import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora-react/features/value-types')({
  head: () => ({
    meta: [
      { title: 'Raw vs Formatted Value - React Numeric Input Output Types | numora-react' },
      { name: 'description', content: 'Learn how numora-react emits the raw numeric string via e.target.value and exposes the formatted display value via e.target.formattedValue.' },
      { property: 'og:title', content: 'Raw vs Formatted Value - React Numeric Input Output Types | numora-react' },
      { property: 'og:description', content: 'numora-react emits the raw numeric string via e.target.value in onChange. Access the formatted display value via e.target.formattedValue or a ref.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react/features/value-types' },
      { name: 'twitter:title', content: 'Raw vs Formatted Value - React Numeric Input Output Types | numora-react' },
      { name: 'twitter:description', content: 'numora-react emits the raw numeric string via e.target.value. Access the formatted display value via e.target.formattedValue.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/features/value-types' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "Raw vs Formatted Value in numora-react - React Numeric Input Output Types", "description": "Understand value types in numora-react. e.target.value returns raw numeric strings for math; e.target.formattedValue returns the display string with separators.", "url": "https://numeric-input.com/docs/numora-react/features/value-types", "author": { "@type": "Person", "name": "Kacper Szarkiewicz", "url": "https://x.com/sharqiewicz" } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora React", "item": "https://numeric-input.com/docs/numora-react" }, { "@type": "ListItem", "position": 3, "name": "Value Types", "item": "https://numeric-input.com/docs/numora-react/features/value-types" }] }]) },
    ],
  }),
  component: ValueTypes,
})

function ValueTypes() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Value Types</h1>
      <p className="text-lg text-muted-foreground">
        Numora always works with strings. <code>e.target.value</code> in <code>onChange</code> is
        always the <strong>raw numeric string</strong> - separators stripped, ready to parse or store.
        The formatted display string lives in <code>e.target.formattedValue</code>.
      </p>

      <h2>e.target.value - raw numeric string</h2>
      <p>
        <code>onChange</code> fires a <code>NumoraInputChangeEvent</code> (structurally compatible with
        React's <code>ChangeEvent&lt;HTMLInputElement&gt;</code>). <code>e.target.value</code> returns
        the raw numeric string - separators removed - so you can pass it directly to a form library
        or state setter without post-processing.
      </p>
      <CodeBlock language="tsx">
{`import { NumoraInput } from 'numora-react'

<NumoraInput
  thousandSeparator=","
  maxDecimals={2}
  onChange={(e) => {
    console.log(e.target.value) // "1234.56" - no separators
  }}
/>`}
      </CodeBlock>

      <h2>e.target.formattedValue - formatted display string</h2>
      <p>
        The formatted value (with separators) is available as <code>e.target.formattedValue</code> via
        the typed <code>NumoraHTMLInputElement</code> export. This is the same string visible in the input.
      </p>
      <CodeBlock language="tsx">
{`import { NumoraInput, type NumoraHTMLInputElement } from 'numora-react'

<NumoraInput
  thousandSeparator=","
  maxDecimals={2}
  onChange={(e) => {
    console.log(e.target.value)                                   // "1234.56" - raw
    console.log((e.target as NumoraHTMLInputElement).formattedValue) // "1,234.56" - formatted
  }}
/>`}
      </CodeBlock>

      <h2>Reading the formatted value via ref</h2>
      <p>
        You can also read the formatted value at any time via a ref - useful when you need it outside
        of an <code>onChange</code> handler:
      </p>
      <CodeBlock language="tsx">
{`import { useRef } from 'react'
import { NumoraInput, type NumoraHTMLInputElement } from 'numora-react'

function App() {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <NumoraInput
      ref={ref}
      thousandSeparator=","
      maxDecimals={2}
      onChange={() => {
        console.log((ref.current as NumoraHTMLInputElement).formattedValue) // "1,234.56"
      }}
    />
  )
}`}
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
        <code>e.target.value</code> with a decimal library such as <code>decimal.js</code>.
      </p>
    </div>
  )
}
