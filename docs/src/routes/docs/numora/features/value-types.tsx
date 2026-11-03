import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/value-types')({
  head: () => ({
    meta: [
      { title: 'Value types | Numora' },
      {
        name: 'description',
        content:
          'Numora always emits string values from onChange. This page covers what rawValueMode does and when to use valueAsNumber.',
      },
      {
        property: 'og:title',
        content: 'Value types | Numora',
      },
      {
        property: 'og:description',
        content:
          'Numora always emits string values from onChange. This page covers what rawValueMode does and when to use valueAsNumber.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/value-types' },
      {
        name: 'twitter:title',
        content: 'Value types | Numora',
      },
      {
        name: 'twitter:description',
        content:
          'Numora always emits string values from onChange. This page covers what rawValueMode does and when to use valueAsNumber.',
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
            headline: 'Value types in Numora: raw vs formatted numeric input values',
            description:
              'Value types in the Numora JavaScript numeric input library. Raw string values for math, formatted display strings for the UI.',
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
                name: 'Numora',
                item: 'https://numeric-input.com/docs/numora',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Value types',
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
    <div className="docs-prose max-w-[40rem]">
      <h1>Value types</h1>
      <p>
        Numora always works with strings. <code>onChange</code> emits a string on every change. Value types decide <em>which</em> string you receive: the formatted display value (default) or the raw value.
      </p>

      <h2>Formatted by default, raw with rawValueMode</h2>
      <p>
        By default <code>onChange</code> receives the display value, the same string shown in the
        input, including thousand separators. With <code>rawValueMode: true</code> it receives the
        plain numeric string with separators removed, and <code>instance.value</code> returns the
        raw string too. The input still displays the formatted value.
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput, FormatOn, ThousandStyle } from 'numora'

const numoraInput = new NumoraInput(container, {
  thousandStyle: ThousandStyle.Thousand,
  formatOn: FormatOn.Change,
  // rawValueMode: false (default) → onChange gets "1,234.56"
  rawValueMode: true, //             → onChange gets "1234.56"
  onChange: (value) => {
    console.log(value)
    console.log(numoraInput.getElement().value) // "1,234.56" ← display value
  },
})`}
      </CodeBlock>

      <h2>valueAsNumber</h2>
      <p>
        <code>valueAsNumber</code> converts the current value to a JavaScript <code>number</code>{' '}
        via <code>parseFloat</code>. Use it only when you need a number type. Read the string for everything else.
      </p>
      <CodeBlock language="typescript">
        {`const num = numoraInput.valueAsNumber
console.log(typeof num) // "number"
console.log(num)        // 1234.56
console.log(isNaN(numoraInput.valueAsNumber)) // true when input is empty`}
      </CodeBlock>
      <p>
        <strong>Precision warning:</strong> <code>parseFloat</code> is subject to IEEE 754 limits.
        Integers above <code>Number.MAX_SAFE_INTEGER</code> and long decimals can lose
        precision without any warning. For financial arithmetic, keep working with the string from <code>onChange</code>{' '}
        and use a decimal library such as <code>decimal.js</code>.
      </p>

      <h3>Setting valueAsNumber</h3>
      <p>
        The setter accepts a JavaScript <code>number</code> and writes its JavaScript string form
        (always dot-decimal) as-is, so <code>valueAsNumber = 1234.5</code> sets the value to{' '}
        <code>"1234.5"</code>. Assigning <code>NaN</code> clears the field. The setter does not
        convert the decimal separator: with a non-dot decimal separator (for example{' '}
        <code>locale: 'de-DE'</code>), pass a string formatted with the configured separator to{' '}
        <code>setValue</code> instead, such as <code>setValue('1234,5')</code>.
      </p>
    </div>
  );
}
