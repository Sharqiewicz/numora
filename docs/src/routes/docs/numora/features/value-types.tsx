import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/value-types')({
  head: () => ({
    meta: [
      { title: 'Raw vs Formatted Value - Numeric Input Output Types | Numora' },
      {
        name: 'description',
        content:
          'Learn how the Numora onChange callback delivers the raw and display values as strings, how the raw and formatted values relate, and when to use valueAsNumber as an escape hatch.',
      },
      {
        property: 'og:title',
        content: 'Raw vs Formatted Value - Numeric Input Output Types | Numora',
      },
      {
        property: 'og:description',
        content:
          'Learn how the Numora onChange callback delivers the raw and display values as strings, how the raw and formatted values relate, and when to use valueAsNumber.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/value-types' },
      {
        name: 'twitter:title',
        content: 'Raw vs Formatted Value - Numeric Input Output Types | Numora',
      },
      {
        name: 'twitter:description',
        content:
          'The Numora onChange callback delivers strings, never numbers. Learn about the raw value and the valueAsNumber escape hatch.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/value-types' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Value Types in Numora - Raw vs Formatted Numeric Input Values',
            description:
              'Understand value types in the Numora JavaScript numeric input library. Raw string values for math operations, formatted display strings for the UI.',
            url: 'https://numeric-input.com/docs/numora/features/value-types',
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
                name: 'Numora JS',
                item: 'https://numeric-input.com/docs/numora',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Value Types',
                item: 'https://numeric-input.com/docs/numora/features/value-types',
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
    <div className="prose prose-invert prose-article">
      <h1>Value Types</h1>
      <p>
        Numora always works with strings. <code>onChange</code> emits a string on every change. Two
        modes control <em>which</em> string you receive.
      </p>

      <h2>Raw value and formatted value</h2>
      <p>
        <code>onChange</code> receives <code>{'{ value, formattedValue }'}</code>.{' '}
        <code>value</code> is the canonical raw string for every locale: ASCII digits,{' '}
        <code>.</code> as the decimal, a leading <code>-</code>, no grouping (a de-DE display of{' '}
        <code>1.234.567,89</code> is raw <code>1234567.89</code>). <code>getValue()</code> and{' '}
        <code>instance.value</code> return the same raw string; <code>getFormattedValue()</code>{' '}
        returns the display string.
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  thousandSeparator: ',',
  onChange: ({ value, formattedValue }) => {
    console.log(value)          // "1234.56" ← no separators
    console.log(formattedValue) // "1,234.56" ← display value
  },
})
numoraInput.getValue()          // "1234.56"
numoraInput.getFormattedValue() // "1,234.56"`}
      </CodeBlock>

      <h2>valueAsNumber</h2>
      <p>
        <code>valueAsNumber</code> converts the current value to a JavaScript <code>number</code>{' '}
        via <code>Number(raw)</code>. Use it as an escape hatch when you need a number type, not as
        the primary way to read the value.
      </p>
      <CodeBlock language="typescript">
        {`const num = numoraInput.valueAsNumber
console.log(typeof num) // "number"
console.log(num)        // 1234.56
console.log(isNaN(numoraInput.valueAsNumber)) // true when input is empty`}
      </CodeBlock>
      <p>
        <strong>Precision warning:</strong> <code>Number</code> is subject to IEEE 754 limits.
        Integers above <code>Number.MAX_SAFE_INTEGER</code> and long decimals may silently lose
        precision. For financial arithmetic, keep working with the string from <code>onChange</code>{' '}
        and use a decimal library such as <code>decimal.js</code>.
      </p>

      <h3>Setting valueAsNumber</h3>
      <p>
        The setter accepts a JavaScript <code>number</code> and writes it as a canonical raw value,
        so <code>valueAsNumber = 1234.5</code> under <code>locale="de-DE"</code> displays{' '}
        <code>1.234,5</code>. Assigning a non-finite value (<code>NaN</code>, <code>Infinity</code>,{' '}
        <code>-Infinity</code>) or a negative number while <code>enableNegative</code> is{' '}
        <code>false</code> throws a <code>RangeError</code> instead of silently clearing the field
        or dropping the sign.
      </p>
    </div>
  );
}
