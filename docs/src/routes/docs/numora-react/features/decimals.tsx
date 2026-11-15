import { createFileRoute, Link } from '@tanstack/react-router';
import { DecimalsDemo } from '@/components/DecimalsDemo';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

export const Route = createFileRoute('/docs/numora-react/features/decimals')({
  head: () => ({
    meta: [
      { title: 'Decimals | Numora React' },
      {
        name: 'description',
        content:
          'Limit decimal places in the NumoraInput React component. Set the max and min decimal places and the decimal separator, with TypeScript types.',
      },
      { property: 'og:title', content: 'Decimals | Numora React' },
      {
        property: 'og:description',
        content:
          'Limit decimal places in the NumoraInput React component. Set the max and min decimal places and the decimal separator, with TypeScript types.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/decimals',
      },
      { name: 'twitter:title', content: 'Decimals | Numora React' },
      {
        name: 'twitter:description',
        content:
          'Limit decimal places in the NumoraInput React component. Set the max and min decimal places and the decimal separator, with TypeScript types.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/features/decimals' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Decimals | Numora React',
            description:
              'Configure decimal precision in the React numeric input component: the decimal separator, decimalMaxLength and decimalMinLength padding.',
            url: 'https://numeric-input.com/docs/numora-react/features/decimals',
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
                name: 'Decimals',
                item: 'https://numeric-input.com/docs/numora-react/features/decimals',
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
      <p>Set how many decimal places are allowed and which separators the input uses.</p>

      <DecimalsDemo />

      <h2>Precision limits</h2>
      <div className="space-y-4">
        <ExampleWithDemo
          title="Max decimal places"
          description="Try typing more than 2 decimal places. Extra typed digits are refused, and pasted ones are cut off, not rounded (the default limit is 18)"
          language="tsx"
          code={`<NumoraInput decimalMaxLength={2} />`}
          config={{ decimalMaxLength: 2 }}
        />
        <ExampleWithDemo
          title="Min decimal places"
          description={
            'Type "1" and click away. The input shows "1.00" on blur. A value your app passes is padded too. decimalMinLength above decimalMaxLength is an invalid option'
          }
          language="tsx"
          code={`<NumoraInput decimalMinLength={2} />`}
          config={{ decimalMinLength: 2 }}
        />
      </div>

      <h2>Separators</h2>
      <div className="space-y-4">
        <ExampleWithDemo
          title="European format"
          description='Type a number and it displays as "1.234,56"'
          language="tsx"
          code={`<NumoraInput decimalSeparator="," thousandSeparator="." />`}
          config={{ decimalSeparator: ',', thousandSeparator: '.' }}
        />
      </div>

      <p>
        For locale-aware separator detection, see{' '}
        <Link to="/docs/numora-react/features/locale">Locale</Link>.
      </p>

      <h2>Built-in behavior</h2>
      <ul>
        <li>
          Typing <code>,</code> or <code>.</code> inserts the configured decimal separator. It is
          blocked if the value already has one.
        </li>
        <li>
          Numora reads pasted text by its own format. When both <code>.</code> and <code>,</code>{' '}
          appear, the last one is the decimal, so <code>"1,234.56"</code> becomes{' '}
          <code>1234.56</code>. A mark that repeats is grouping, so <code>"12.34.56"</code> becomes{' '}
          <code>123456</code>.
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
          <strong>No decimals.</strong> With <code>decimalMaxLength={0}</code> Numora refuses a
          typed decimal separator, so typing <code>12.5</code> gives <code>125</code>. A paste keeps
          the integer part: <code>12.75</code> becomes <code>12</code>.
        </li>
        <li>
          <strong>Invalid values.</strong> A negative or fractional limit, or{' '}
          <code>decimalMinLength</code> above <code>decimalMaxLength</code>, is an error. See{' '}
          <Link to="/docs/numora-react/features/validation" hash="invalid-options">
            invalid options
          </Link>
          .
        </li>
      </ul>
    </div>
  );
}
