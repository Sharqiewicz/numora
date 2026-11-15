import { createFileRoute } from '@tanstack/react-router';
import { ValueReadout } from '@/components/anatomy/ValueReadout';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/value-types')({
  head: () => ({
    meta: [
      { title: 'Value types | Numora' },
      {
        name: 'description',
        content:
          'The Numora onValueChange callback delivers the raw value and the display value as strings. How the two relate, and how to convert to a number when you must.',
      },
      {
        property: 'og:title',
        content: 'Value types | Numora',
      },
      {
        property: 'og:description',
        content:
          'The Numora onValueChange callback delivers the raw value and the display value as strings. How the two relate, and how to convert to a number when you must.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/value-types' },
      {
        name: 'twitter:title',
        content: 'Value types | Numora',
      },
      {
        name: 'twitter:description',
        content:
          'The Numora onValueChange callback delivers two strings, the raw value and the display string. It never delivers a number.',
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
    <div className="docs-prose max-w-[36rem]">
      <h1>Value types</h1>
      <p>
        Numora works with strings. Every change gives <code>onValueChange</code> two of them, the
        raw value for math and the formatted display value for the UI.
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
              <th>Options</th>
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
              <td>locale: 'de-DE'</td>
              <td>1.234.567,89</td>
              <td>"1234567.89"</td>
            </tr>
            <tr>
              <td>locale: 'fr-FR'</td>
              <td>{'1 234 567,89'}</td>
              <td>"1234567.89"</td>
            </tr>
            <tr>
              <td>locale: 'en-IN'</td>
              <td>12,34,567.89</td>
              <td>"1234567.89"</td>
            </tr>
            <tr>
              <td>locale: 'ar-EG'</td>
              <td>1٬234٬567٫89</td>
              <td>"1234567.89"</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The raw value is what the user has typed so far, so it is not always a complete number. It
        can be <code>""</code> (empty field), <code>"-"</code>, <code>"."</code>, <code>"1."</code>{' '}
        or <code>".5"</code>. Check for these before you parse it. Numora keeps trailing zeros, so{' '}
        <code>0.50</code> stays <code>"0.50"</code>. With <code>decimalMinLength</code> it pads on
        blur and when your app sets the value, and the padding is part of the raw value, so{' '}
        <code>5</code> becomes <code>"5.00"</code>.
      </p>
      <p>
        <code>defaultValue</code> and <code>setValue</code> take this same format, so the value you
        get from <code>onValueChange</code> can go straight back into <code>setValue</code>.
      </p>

      <h2>Raw value and formatted value</h2>
      <p>
        <code>onValueChange</code> receives <code>{'{ value, formattedValue }'}</code>.{' '}
        <code>value</code> is the raw value described above and <code>formattedValue</code> is the
        text the field shows. <code>instance.rawValue</code> and{' '}
        <code>instance.formattedValue</code> return the same two strings. The naming rule is that
        the instance says <code>rawValue</code>, and callbacks and options say <code>value</code>.
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  thousandSeparator: ',',
  onValueChange: ({ value, formattedValue }) => {
    console.log(value)          // "1234.56" ← no separators
    console.log(formattedValue) // "1,234.56" ← display value
  },
})
numoraInput.rawValue       // "1234.56"
numoraInput.formattedValue // "1,234.56"`}
      </CodeBlock>
      <p>Type below. Both readouts update on every keystroke:</p>
      <ValueReadout pkg="numora" />

      <h2>Native form submission</h2>
      <p>
        A plain <code>&lt;form&gt;</code> submit or <code>new FormData(form)</code> reads the
        input's DOM value, which is the display string. That is <code>"1,234.56"</code>, or{' '}
        <code>"1.234,56"</code> in de-DE. To submit the raw value, leave the visible input without a{' '}
        <code>name</code> and copy the raw value into a hidden input:
      </p>
      <CodeBlock language="typescript">
        {`const hidden = form.querySelector<HTMLInputElement>('input[name="amount"]')!
const numoraInput = new NumoraInput(container, {
  onValueChange: ({ value }) => {
    hidden.value = value // "1234.56"
  },
})
// onValueChange does not fire for the initial value or for setValue(),
// so copy the raw value yourself after those.
hidden.value = numoraInput.rawValue`}
      </CodeBlock>

      <h2>When you need a number</h2>
      <p>
        Numora has no numeric getter. If you need a JavaScript <code>number</code>, convert the raw
        value yourself. Only do it where a rounding error is acceptable, such as a chart or a
        slider:
      </p>
      <CodeBlock language="typescript">
        {`const numoraInput = new NumoraInput(container, { defaultValue: '1234.56' })

const num = Number(numoraInput.rawValue)
console.log(num)                                // 1234.56
console.log(numoraInput.rawValue === '')        // true when the input is empty`}
      </CodeBlock>
      <p>
        <code>Number</code> is an IEEE 754 double. Integers above{' '}
        <code>Number.MAX_SAFE_INTEGER</code> and long decimals lose precision, and JavaScript raises
        no error when they do. For financial arithmetic, keep working with the string from{' '}
        <code>onValueChange</code> and use a decimal library such as <code>decimal.js</code>, or{' '}
        <code>parseUnits</code> for token amounts.
      </p>

      <h2>Writing a value</h2>
      <p>
        <code>rawValue</code> is read-only. To set the field from code, call <code>setValue</code>{' '}
        with a canonical raw value. Under <code>locale: 'de-DE'</code>,{' '}
        <code>setValue('1234.5')</code> displays <code>1.234,5</code>.
      </p>
      <p>
        <code>setValue</code> is your own write, so it does not call <code>onValueChange</code> and{' '}
        <code>isAllowed</code> does not check it. The new text still goes to{' '}
        <code>onFormattedValueChange</code>. Numora reads a <code>,</code> in a value you pass in as
        a decimal mark, like <code>.</code>, and never as grouping. So{' '}
        <code>setValue('1234,5')</code> sets the same number and logs a warning in development. Turn
        formatted text into a raw value with <code>parseValue()</code> first.
      </p>
    </div>
  );
}
