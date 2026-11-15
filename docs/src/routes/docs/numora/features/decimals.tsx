import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { DecimalsDemo } from '@/components/DecimalsDemo';

export const Route = createFileRoute('/docs/numora/features/decimals')({
  head: () => ({
    meta: [
      { title: 'Decimals | Numora' },
      {
        name: 'description',
        content:
          'Enforce decimal place limits and validate decimal inputs with Numora. Set max and min decimal places, choose separators, and block invalid decimal entries.',
      },
      { property: 'og:title', content: 'Decimals | Numora' },
      {
        property: 'og:description',
        content:
          'Enforce decimal place limits and validate decimal inputs with Numora. Set max and min decimal places, choose separators, and block invalid decimal entries.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/decimals' },
      { name: 'twitter:title', content: 'Decimals | Numora' },
      {
        name: 'twitter:description',
        content:
          'Enforce decimal place limits and validate decimal inputs with Numora. Set max and min decimal places, choose separators, and block invalid decimal entries.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/decimals' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Decimal handling in Numora: numeric input decimal precision',
            description:
              'Configure decimal precision in the Numora numeric input library. Set the decimal separator, max decimals, and decimal padding.',
            url: 'https://numeric-input.com/docs/numora/features/decimals',
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
                name: 'Decimals',
                item: 'https://numeric-input.com/docs/numora/features/decimals',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: Decimals,
});

function Decimals() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Decimals</h1>
      <p>
        Decimal options limit how many decimal digits a value can have and set the separator between
        the integer and decimal parts. <code>decimalMaxLength</code> defaults to <code>18</code> and{' '}
        <code>decimalMinLength</code> to <code>0</code>.
      </p>

      <DecimalsDemo />

      <h2>Precision limits</h2>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

// Cap at 2 decimal places. Numora refuses a third typed digit. It cuts extra digits
// off a pasted or app-set value without rounding, so "1.239" becomes "1.23"
const input1 = new NumoraInput(container, {
  decimalMaxLength: 2,
})

// Pad to at least 2 decimal places on blur and when your app sets the value, never
// while typing. The constructor throws if decimalMinLength is above decimalMaxLength
const input2 = new NumoraInput(container, {
  decimalMinLength: 2,
  // "1" on blur → "1.00"
})`}
      </CodeBlock>

      <h2>Separators</h2>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

// Comma decimal, dot thousands
const input = new NumoraInput(container, {
  decimalSeparator: ',',
  thousandSeparator: '.',
  // typing "1234,56" displays "1.234,56"
})`}
      </CodeBlock>

      <p>
        To detect separators from a locale, see{' '}
        <Link to="/docs/numora/features/locale">Locale</Link>.
      </p>

      <h2>Typing and pasting a separator</h2>
      <ul>
        <li>
          <strong>Separator input.</strong> Typing <code>,</code> or <code>.</code> inserts the
          configured decimal separator. Numora blocks it if the value already has one.
        </li>
        <li>
          <strong>Paste cleanup.</strong> Numora works out the format of pasted text from the text
          first. When both <code>.</code> and <code>,</code> appear, the last one is the decimal, so{' '}
          <code>"1,234.56"</code> becomes <code>1234.56</code>. A mark that repeats is grouping, so{' '}
          <code>"12.34.56"</code> becomes <code>123456</code>.
        </li>
        <li>
          <strong>A single mark.</strong> When pasted text has one <code>.</code> or one{' '}
          <code>,</code>, Numora reads it as grouping only if it could be grouping: one to three
          digits before it, exactly three after it, and no leading zero. In a default field a pasted{' '}
          <code>12,345</code> becomes <code>12345</code>. A pasted <code>1,5</code>,{' '}
          <code>1234,567</code> or <code>0,123</code> becomes <code>1.5</code>,{' '}
          <code>1234.567</code> or <code>0.123</code>. The field's own decimal separator is always
          the decimal: a pasted <code>1,234</code> is <code>1234</code> in a default field and{' '}
          <code>1.234</code> in a <code>de-DE</code> field.
        </li>
        <li>
          <strong>No decimals.</strong> With <code>decimalMaxLength: 0</code> Numora refuses a typed
          decimal separator, so typing <code>12.5</code> gives <code>125</code>. A paste keeps the
          integer part: <code>12.75</code> becomes <code>12</code>.
        </li>
        <li>
          <strong>Invalid values.</strong> A negative or fractional limit, or{' '}
          <code>decimalMinLength</code> above <code>decimalMaxLength</code>, is an error. See{' '}
          <Link to="/docs/numora/features/validation" hash="invalid-options">
            invalid options
          </Link>
          .
        </li>
      </ul>
    </div>
  );
}
