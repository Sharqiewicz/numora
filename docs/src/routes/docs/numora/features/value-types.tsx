import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/value-types')({
  head: () => ({
    meta: [
      { title: 'Raw vs Formatted Value - JavaScript Numeric Input Output Types | Numora' },
      { name: 'description', content: 'Learn how Numora always emits string values from onChange, what rawValueMode does, and when to use valueAsNumber as an escape hatch.' },
      { property: 'og:title', content: 'Raw vs Formatted Value - JavaScript Numeric Input Output Types | Numora' },
      { property: 'og:description', content: 'Learn how Numora always emits string values from onChange, what rawValueMode does, and when to use valueAsNumber.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/value-types' },
      { name: 'twitter:title', content: 'Raw vs Formatted Value - JavaScript Numeric Input Output Types | Numora' },
      { name: 'twitter:description', content: 'Numora always emits strings from onChange. Learn about rawValueMode and the valueAsNumber escape hatch.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/value-types' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "Value Types in Numora - Raw vs Formatted Numeric Input Values", "description": "Understand value types in the Numora JavaScript numeric input library. Raw string values for math operations, formatted display strings for the UI.", "url": "https://numeric-input.com/docs/numora/features/value-types", "author": { "@type": "Person", "name": "Kacper Szarkiewicz", "url": "https://x.com/sharqiewicz" } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora JS", "item": "https://numeric-input.com/docs/numora" }, { "@type": "ListItem", "position": 3, "name": "Value Types", "item": "https://numeric-input.com/docs/numora/features/value-types" }] }]) },
    ],
  }),
  component: ValueTypes,
})

function ValueTypes() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Value Types</h1>
      <p className="text-lg text-muted-foreground">
        Numora always works with strings. <code>onChange</code> emits a string on every
        change. Two modes control <em>which</em> string you receive.
      </p>

      <h2>Default: formatted string</h2>
      <p>
        By default <code>onChange</code> receives the display value - the same string
        shown in the input, including thousand separators.
      </p>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  thousandSeparator: ',',
  onChange: (value) => {
    console.log(value) // "1,234.56"
  },
})`}
      </CodeBlock>

      <h2>rawValueMode: raw string</h2>
      <p>
        Set <code>rawValueMode: true</code> and <code>onChange</code> receives the plain
        numeric string with thousand separators stripped. The input still displays the
        formatted value. <code>instance.value</code> also returns the raw string in this
        mode.
      </p>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  thousandSeparator: ',',
  rawValueMode: true,
  onChange: (value) => {
    console.log(value)                    // "1234.56" ← no separators
    console.log(numoraInput.getElement().value) // "1,234.56" ← display value
  },
})`}
      </CodeBlock>

      <h2>valueAsNumber</h2>
      <p>
        <code>valueAsNumber</code> converts the current value to a JavaScript{' '}
        <code>number</code> via <code>parseFloat</code>. Use it as an escape hatch when
        you need a number type, not as the primary way to read the value.
      </p>
      <CodeBlock language="typescript">
{`const num = numoraInput.valueAsNumber
console.log(typeof num) // "number"
console.log(num)        // 1234.56
console.log(isNaN(numoraInput.valueAsNumber)) // true when input is empty`}
      </CodeBlock>
      <p>
        <strong>Precision warning:</strong> <code>parseFloat</code> is subject to IEEE 754
        limits. Integers above <code>Number.MAX_SAFE_INTEGER</code> and long decimals may
        silently lose precision. For financial arithmetic, keep working with the string
        from <code>onChange</code> and use a decimal library such as <code>decimal.js</code>.
      </p>
    </div>
  )
}
