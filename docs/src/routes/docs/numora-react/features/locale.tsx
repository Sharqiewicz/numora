import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';
import { FormatOn } from 'numora';

export const Route = createFileRoute('/docs/numora-react/features/locale')({
  head: () => ({
    meta: [
      { title: 'Locale-Aware Separator Detection | numora-react' },
      {
        name: 'description',
        content:
          'Auto-detect thousand and decimal separators from the browser locale using the locale prop and getSeparatorsFromLocale.',
      },
      { property: 'og:title', content: 'Locale-Aware Separator Detection | numora-react' },
      {
        property: 'og:description',
        content: 'Auto-detect separators from the browser locale with numora-react.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/locale',
      },
      { name: 'twitter:title', content: 'Locale-Aware Separator Detection | numora-react' },
      {
        name: 'twitter:description',
        content: 'Auto-detect separators from the browser locale with numora-react.',
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
            headline: 'Locale Support in numora-react - International React Numeric Input',
            description:
              'Locale-aware separator detection in the numora-react React numeric input component. Support comma decimals, dot thousand separators, and international grouping.',
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
    <div className="prose prose-invert max-w-xl">
      <h1 className="text-stone-100">Locale</h1>
      <p className="text-stone-400 text-base leading-6">
        The <code>locale</code> prop auto-detects thousand and decimal separators via{' '}
        <code>Intl.NumberFormat</code>. Grouping style is still controlled separately by{' '}
        <code>thousandStyle</code>.
      </p>

      <h2 className="text-stone-100 text-2xl">Browser locale (auto-detect)</h2>
      <p className="text-stone-400 text-base leading-6">
        Pass <code>locale={'{true}'}</code> to detect both separators from the browser's current
        locale. Explicit <code>thousandSeparator</code> or <code>decimalSeparator</code> values
        always take priority over locale-detected ones.
      </p>
      <div className="space-y-4">
        <ExampleWithDemo
          title={`Browser locale detection (yours ${usersLocale})`}
          description="Both separators are resolved from your browser's locale setting"
          language="tsx"
          code={`<NumoraInput locale={true} />`}
          config={{ locale: true, formatOn: FormatOn.Change }}
        />
      </div>

      <h2 className="text-stone-100 text-2xl">Specific locale tag</h2>
      <p className="text-stone-400 text-base leading-6">
        Pass a BCP 47 locale tag to pin separators to a specific locale - useful for SSR or
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

      <h2 className="text-stone-100 text-2xl">getSeparatorsFromLocale</h2>
      <p className="text-stone-400 text-base leading-6">For pre-computing separators and passing them explicitly:</p>
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

      <p className="text-stone-400 text-base leading-6">
        For decimal separator configuration without locale detection, see{' '}
        <Link to="/docs/numora-react/features/decimals" className="underline link-underline hover:text-stone-100 transition-colors">
          Decimals
        </Link>
        .
      </p>

      <h2 className="text-stone-100 text-2xl">Value format under a locale</h2>
      <p className="text-stone-400 text-base leading-6">
        A string <code>value</code> / <code>defaultValue</code> is already in the field's{' '}
        <em>display</em> format, so a de-DE-configured field expects <code>','</code> for the
        decimal mark and reads a bare <code>'.'</code> as the thousand separator. A JS{' '}
        <code>number</code> is always dot-decimal, so numora-react converts a numeric{' '}
        <code>value</code> / <code>defaultValue</code> to the configured decimal separator before
        formatting it: <code>{'<NumoraInput locale="de-DE" value={1234.5} />'}</code> displays{' '}
        <code>"1.234,5"</code>, not the <code>"12.345"</code> you would get from{' '}
        <code>{'value="1234.5"'}</code>, which reads the dot as grouping and strips it. See{' '}
        <Link to="/docs/numora-react/features/value-types" className="underline link-underline hover:text-stone-100 transition-colors">features/value-types</Link> for the full
        value contract.
      </p>
    </div>
  );
}
