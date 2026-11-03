import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';
import { FormatOn } from 'numora';

export const Route = createFileRoute('/docs/numora-react/features/locale')({
  head: () => ({
    meta: [
      { title: 'Locale | Numora React' },
      {
        name: 'description',
        content:
          'Auto-detect thousand and decimal separators from the browser locale using the locale prop and getSeparatorsFromLocale.',
      },
      { property: 'og:title', content: 'Locale | Numora React' },
      {
        property: 'og:description',
        content: 'Auto-detect thousand and decimal separators from the browser locale using the locale prop and getSeparatorsFromLocale.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/locale',
      },
      { name: 'twitter:title', content: 'Locale | Numora React' },
      {
        name: 'twitter:description',
        content: 'Auto-detect thousand and decimal separators from the browser locale using the locale prop and getSeparatorsFromLocale.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/features/locale' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Locale | Numora React',
            description:
              'Locale-aware separator detection in the React numeric input component. Supports comma decimals, dot thousand separators and international grouping.',
            url: 'https://numeric-input.com/docs/numora-react/features/locale',
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
                name: 'Locale',
                item: 'https://numeric-input.com/docs/numora-react/features/locale',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: Locale,
});

function Locale() {
  const usersLocale = Intl.NumberFormat().resolvedOptions().locale;

  return (
    <div className="docs-prose max-w-[40rem]">
      <h1>Locale</h1>
      <p>
        The <code>locale</code> prop detects thousand and decimal separators via{' '}
        <code>Intl.NumberFormat</code>. Grouping style is still set separately with{' '}
        <code>thousandStyle</code>.
      </p>

      <h2>Browser locale (auto-detect)</h2>
      <p>
        Pass <code>locale={'{true}'}</code> to detect both separators from the browser's current
        locale. Explicit <code>thousandSeparator</code> or <code>decimalSeparator</code> values
        always take priority over locale-detected ones.
      </p>
      <div className="space-y-4">
        <ExampleWithDemo
          title={`Browser locale (yours: ${usersLocale})`}
          description="Both separators are resolved from your browser's locale setting"
          language="tsx"
          code={`<NumoraInput locale={true} />`}
          config={{ locale: true, formatOn: FormatOn.Change }}
        />
      </div>

      <h2>Specific locale tag</h2>
      <p>
        Pass a BCP 47 locale tag to pin separators to a specific locale. Use this for SSR or
        server-driven locale handling.
      </p>
      <div className="space-y-4">
        <ExampleWithDemo
          title="Specific locale (de-DE)"
          description="Separators pinned to German locale: '.' thousand, ',' decimal"
          language="tsx"
          code={`<NumoraInput locale="de-DE" />`}
          config={{ locale: 'de-DE', formatOn: FormatOn.Change }}
        />
      </div>

      <h2>getSeparatorsFromLocale</h2>
      <p>To compute separators ahead of time and pass them explicitly:</p>
      <CodeBlock language="tsx">
        {`import { NumoraInput } from 'numora-react'
import { getSeparatorsFromLocale } from 'numora'

const { thousandSeparator, decimalSeparator } = getSeparatorsFromLocale('de-DE')
// → { thousandSeparator: '.', decimalSeparator: ',' }

getSeparatorsFromLocale('en-US')
// → { thousandSeparator: ',', decimalSeparator: '.' }

getSeparatorsFromLocale('fr-FR')
// → { thousandSeparator: '\\u202f', decimalSeparator: ',' }

<NumoraInput thousandSeparator={thousandSeparator} decimalSeparator={decimalSeparator} />`}
      </CodeBlock>

      <p>
        For decimal separator configuration without locale detection, see{' '}
        <Link to="/docs/numora-react/features/decimals">
          Decimals
        </Link>
        .
      </p>

      <h2>Value format under a locale</h2>
      <p>
        String values are in the field's display format, so under de-DE use <code>value="1234,5"</code>,
        not <code>"1234.5"</code>. See <Link to="/docs/numora-react/features/value-types">Value types</Link>{' '}
        for the full value contract.
      </p>
    </div>
  );
}
