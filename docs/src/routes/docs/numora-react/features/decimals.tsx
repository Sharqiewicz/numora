import { createFileRoute, Link } from '@tanstack/react-router';
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

      <h2>Precision limits</h2>
      <div className="space-y-4">
        <ExampleWithDemo
          title="Max decimal places"
          description="Try typing more than 2 decimal places (the default). Extra digits are truncated"
          language="tsx"
          code={`<NumoraInput decimalMaxLength={2} />`}
          config={{ decimalMaxLength: 2 }}
        />
        <ExampleWithDemo
          title="Min decimal places"
          description={'Type "1" and the input shows "1.00"'}
          language="tsx"
          code={`<NumoraInput decimalMinLength={2} decimalMaxLength={18} />`}
          config={{ decimalMinLength: 2, decimalMaxLength: 18 }}
        />
      </div>

      <h2>Separators</h2>
      <div className="space-y-4">
        <ExampleWithDemo
          title="European format"
          description='Type a number and it displays as "1.234,56"'
          language="tsx"
          code={`<NumoraInput decimalSeparator="," thousandSeparator="." formatOn="change" />`}
          config={{ decimalSeparator: ',', thousandSeparator: '.', formatOn: 'change' }}
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
      </ul>
    </div>
  );
}
