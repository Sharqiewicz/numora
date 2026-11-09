import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora-react/features/value-types')({
  head: () => ({
    meta: [
      { title: 'Value types | Numora React' },
      {
        name: 'description',
        content:
          'How Numora React emits the raw numeric string in e.target.value and exposes the formatted display value in e.target.formattedValue.',
      },
      {
        property: 'og:title',
        content: 'Value types | Numora React',
      },
      {
        property: 'og:description',
        content:
          'How Numora React emits the raw numeric string in e.target.value and exposes the formatted display value in e.target.formattedValue.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/value-types',
      },
      {
        name: 'twitter:title',
        content: 'Value types | Numora React',
      },
      {
        name: 'twitter:description',
        content:
          'How Numora React emits the raw numeric string in e.target.value and exposes the formatted display value in e.target.formattedValue.',
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://numeric-input.com/docs/numora-react/features/value-types',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Value types | Numora React',
            description:
              'Value types in Numora React. e.target.value is the raw numeric string for math; e.target.formattedValue is the display string with separators.',
            url: 'https://numeric-input.com/docs/numora-react/features/value-types',
            author: {
              '@type': 'Person',
              name: 'Kacper Szarkiewicz',
              url: 'https://x.com/sharqiewicz',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://numeric-input.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Numora React',
                item: 'https://numeric-input.com/docs/numora-react',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Value types',
                item: 'https://numeric-input.com/docs/numora-react/features/value-types',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: ValueTypes,
});

function ValueTypes() {
  return (
    <div className="docs-prose max-w-[40rem]">
      <h1>Value types</h1>
      <p>
        Numora React always works with strings. In <code>onChange</code>,{' '}
        <code>e.target.value</code> is always the <strong>canonical raw value</strong>: ASCII digits,{' '}
        <code>.</code> as the decimal mark, <code>-</code> as the sign and no grouping, in every
        locale and with any <code>decimalSeparator</code>. The formatted display string is in{' '}
        <code>e.target.formattedValue</code>. You always get both, with no mode to choose.
      </p>

      <h2>e.target.value and e.target.formattedValue</h2>
      <p>
        <code>onChange</code> fires a <code>NumoraInputChangeEvent</code> (structurally compatible
        with React's <code>ChangeEvent&lt;HTMLInputElement&gt;</code>). <code>e.target.value</code>{' '}
        is the raw numeric string, so you can pass it to a form library or state setter without
        post-processing. <code>e.target.formattedValue</code>, available through the typed{' '}
        <code>NumoraHTMLInputElement</code> export, is the string the input shows.
      </p>
      <CodeBlock language="tsx">
        {`import { NumoraInput, type NumoraHTMLInputElement } from 'numora-react'

<NumoraInput
  onChange={(e) => {
    console.log(e.target.value)                                      // "1234.56" (raw)
    console.log((e.target as NumoraHTMLInputElement).formattedValue) // "1,234.56" (formatted)
  }}
/>`}
      </CodeBlock>

      <h2>Reading the formatted value via ref</h2>
      <p>
        You can also read the formatted value at any time through a ref, for example outside an{' '}
        <code>onChange</code> handler:
      </p>
      <CodeBlock language="tsx">
        {`import { useRef } from 'react'
import { NumoraInput, type NumoraHTMLInputElement } from 'numora-react'

function App() {
  const ref = useRef<HTMLInputElement>(null)

  return (
    <NumoraInput
      ref={ref}
      onChange={() => {
        console.log((ref.current as NumoraHTMLInputElement).formattedValue) // "1,234.56"
      }}
    />
  )
}`}
      </CodeBlock>

      <h2>Native form submission</h2>
      <p>
        A plain <code>&lt;form&gt;</code> submit or <code>new FormData(form)</code> reads the
        input's DOM value, which is the display string (<code>"1,234.56"</code>, or{' '}
        <code>"1.234,56"</code> in de-DE). To submit the raw value, leave the visible input without
        a <code>name</code> and mirror <code>e.target.value</code> into a hidden input:
      </p>
      <CodeBlock language="tsx">
        {`const [amount, setAmount] = useState('')

<form action="/pay">
  <NumoraInput value={amount} onChange={(e) => setAmount(e.target.value)} />
  <input type="hidden" name="amount" value={amount} />
</form>`}
      </CodeBlock>

      <h2>Parsing the value</h2>
      <p>
        Numora React does not provide a numeric value such as <code>valueAsNumber</code>. The raw
        value is canonical in every locale (<code>.</code> decimal, no grouping), so parse{' '}
        <code>e.target.value</code> yourself with a decimal library:
      </p>
      <CodeBlock language="tsx">
        {`import Decimal from 'decimal.js'
import { NumoraInput } from 'numora-react'

<NumoraInput
  onChange={(e) => {
    const raw = e.target.value
    // skip intermediate states such as "", "-" or "."
    if (!/^-?\\d+(\\.\\d+)?$/.test(raw)) return
    const amount = new Decimal(raw) // exact, no float rounding
    console.log(amount.toString())
  }}
/>`}
      </CodeBlock>
      <p>
        Avoid <code>Number()</code> and <code>parseFloat</code>.
        They are subject to IEEE 754 limits, so integers above{' '}
        <code>Number.MAX_SAFE_INTEGER</code> and long decimals may silently lose precision.
      </p>

      <h2>Numeric value and defaultValue props</h2>
      <p>
        <code>value</code> and <code>defaultValue</code> accept a <code>string</code> or a{' '}
        <code>number</code>. Both are the canonical raw value: ASCII digits, <code>.</code> as the
        decimal mark, no grouping, in every locale. <code>value={'{1234.5}'}</code> and{' '}
        <code>{'value="1234.5"'}</code> under <code>locale="de-DE"</code> both display{' '}
        <code>1.234,5</code>. Prefer strings when the value comes from a decimal library.
      </p>
    </div>
  );
}
