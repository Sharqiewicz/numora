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
    <div className="docs-prose max-w-[36rem]">
      <h1>Value types</h1>
      <p>
        Numora React works with strings. <code>onValueChange</code> gives you{' '}
        <code>{'{ value, formattedValue }'}</code>, and <code>onChange</code> gives you the same two
        strings on an event, for form libraries. In both, <code>value</code> (
        <code>e.target.value</code>) is the <strong>canonical raw value</strong>: ASCII digits,{' '}
        <code>.</code> as the decimal mark, <code>-</code> as the sign and no grouping, in every
        locale and with any <code>decimalSeparator</code>. The formatted display string is in{' '}
        <code>formattedValue</code> (<code>e.target.formattedValue</code>). You get both on every
        change. There is no mode to choose.
      </p>

      <h2>The raw value format</h2>
      <p>
        The raw value is the one to store and do math on. It has one format, and the locale and the
        separators do not change it:
      </p>
      <ul>
        <li>
          ASCII digits <code>0</code> to <code>9</code>, even if the user types Arabic-Indic or
          fullwidth digits
        </li>
        <li>
          <code>.</code> as the decimal mark, even if the field shows <code>,</code>
        </li>
        <li>
          a leading <code>-</code> for a negative number, which needs <code>allowNegative</code>
        </li>
        <li>no thousand separators and no spaces</li>
      </ul>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Props</th>
              <th>The field shows</th>
              <th>Raw value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>none</td>
              <td>1,234,567.89</td>
              <td>"1234567.89"</td>
            </tr>
            <tr>
              <td>locale="de-DE"</td>
              <td>1.234.567,89</td>
              <td>"1234567.89"</td>
            </tr>
            <tr>
              <td>locale="fr-FR"</td>
              <td>{'1 234 567,89'}</td>
              <td>"1234567.89"</td>
            </tr>
            <tr>
              <td>locale="en-IN"</td>
              <td>12,34,567.89</td>
              <td>"1234567.89"</td>
            </tr>
            <tr>
              <td>locale="ar-EG"</td>
              <td>1٬234٫5</td>
              <td>"1234.5"</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The raw value is what the user has typed so far, so it is not always a complete number. It
        can be <code>""</code> (empty field), <code>"-"</code>, <code>"."</code>, <code>"1."</code>{' '}
        or <code>".5"</code>. Check for these before you parse it. Numora keeps trailing zeros, so{' '}
        <code>0.50</code> stays <code>"0.50"</code>. With <code>decimalMinLength</code> it pads on
        blur and the padding is part of the raw value, so <code>5</code> becomes <code>"5.00"</code>
        .
      </p>
      <p>
        The <code>value</code> and <code>defaultValue</code> props take this same format, so the
        value you get from <code>onValueChange</code> can go straight back into <code>value</code>.
      </p>

      <h2>onValueChange</h2>
      <p>
        Use <code>onValueChange</code> in your own components. It has the same shape as the vanilla
        package's callback.
      </p>
      <CodeBlock language="tsx">
        {`import { NumoraInput } from 'numora-react'

<NumoraInput
  onValueChange={({ value, formattedValue }) => {
    console.log(value)          // "1234.56" (raw)
    console.log(formattedValue) // "1,234.56" (formatted)
  }}
/>`}
      </CodeBlock>

      <h2>e.target.value and e.target.formattedValue</h2>
      <p>
        Use <code>onChange</code> where a library expects a change event, such as React Hook Form's{' '}
        <code>field.onChange</code>. It fires a <code>NumoraInputChangeEvent</code> (structurally
        compatible with React's <code>ChangeEvent&lt;HTMLInputElement&gt;</code>).{' '}
        <code>e.target.value</code> is the raw numeric string, so you can pass it to a form library
        or state setter without post-processing. <code>e.target.formattedValue</code> is the string
        the input shows.
      </p>
      <CodeBlock language="tsx">
        {`import { NumoraInput } from 'numora-react'

<NumoraInput
  onChange={(e) => {
    console.log(e.target.value)          // "1234.56" (raw)
    console.log(e.target.formattedValue) // "1,234.56" (formatted)
  }}
/>`}
      </CodeBlock>

      <h2>Reading values via ref</h2>
      <p>
        The ref is the <code>&lt;input&gt;</code> element with two extra read-only properties.{' '}
        <code>rawValue</code> is the raw value and <code>formattedValue</code> is the display
        string. <code>ref.current.value</code> is the DOM value, so it is the display string too.
        Only <code>e.target.value</code> inside <code>onChange</code> is raw. Type the ref as{' '}
        <code>NumoraHTMLInputElement</code> and no cast is needed.
      </p>
      <CodeBlock language="tsx">
        {`import { useRef } from 'react'
import { NumoraInput, type NumoraHTMLInputElement } from 'numora-react'

function App() {
  const ref = useRef<NumoraHTMLInputElement>(null)

  return (
    <NumoraInput
      ref={ref}
      onChange={() => {
        console.log(ref.current?.rawValue)       // "1234.56"
        console.log(ref.current?.formattedValue) // "1,234.56"
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
        a <code>name</code> and mirror the raw value into a hidden input. Or read the posted string
        back with <code>parseValue(formData.get('amount'), options)</code>, using the field's
        options:
      </p>
      <CodeBlock language="tsx">
        {`const [amount, setAmount] = useState('')

<form action="/pay">
  <NumoraInput value={amount} onValueChange={({ value }) => setAmount(value)} />
  <input type="hidden" name="amount" value={amount} />
</form>`}
      </CodeBlock>

      <h2>Parsing the value</h2>
      <p>
        Numora React does not provide a numeric value such as <code>valueAsNumber</code>. The raw
        value is canonical in every locale (<code>.</code> decimal, no grouping), so parse{' '}
        <code>value</code> yourself with a decimal library:
      </p>
      <CodeBlock language="tsx">
        {`import Decimal from 'decimal.js'
import { NumoraInput } from 'numora-react'

<NumoraInput
  onValueChange={({ value: raw }) => {
    // skip intermediate states such as "", "-" or "."
    if (!/^-?\\d+(\\.\\d+)?$/.test(raw)) return
    const amount = new Decimal(raw) // exact, no float rounding
    console.log(amount.toString())
  }}
/>`}
      </CodeBlock>
      <p>
        Avoid <code>Number()</code> and <code>parseFloat</code>. They are subject to IEEE 754
        limits, so integers above <code>Number.MAX_SAFE_INTEGER</code> and long decimals lose
        precision with no error.
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
