import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/locale')({
  head: () => ({
    meta: [
      { title: 'Locale | Numora' },
      {
        name: 'description',
        content:
          'Detect thousand and decimal separators from the browser locale using the locale option and getSeparatorsFromLocale.',
      },
      { property: 'og:title', content: 'Locale | Numora' },
      {
        property: 'og:description',
        content: 'Detect thousand and decimal separators from the browser locale using the locale option and getSeparatorsFromLocale.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/locale' },
      { name: 'twitter:title', content: 'Locale | Numora' },
      {
        name: 'twitter:description',
        content: 'Detect thousand and decimal separators from the browser locale using the locale option and getSeparatorsFromLocale.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/locale' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Locale support in Numora for international numeric input',
            description:
              'Locale-aware separator detection in the Numora JavaScript numeric input library. Handles comma decimals, dot thousand separators, and international grouping styles.',
            url: 'https://numeric-input.com/docs/numora/features/locale',
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
                name: 'Locale',
                item: 'https://numeric-input.com/docs/numora/features/locale',
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
  return (
    <div className="docs-prose max-w-[40rem]">
      <h1>Locale</h1>
      <p>
        The <code>locale</code> option detects the thousand and decimal separators through{' '}
        <code>Intl.NumberFormat</code>. The grouping style is still set separately by{' '}
        <code>thousandStyle</code>.
      </p>

      <h2>Browser locale</h2>
      <p>
        Pass <code>locale: true</code> to detect both separators from the browser's current locale.
        Explicit <code>thousandSeparator</code> or <code>decimalSeparator</code> values always win
        over locale-detected ones.
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput, ThousandStyle } from 'numora'

// Both separators detected from the browser locale
const input = new NumoraInput(container, {
  locale: true,
  thousandStyle: ThousandStyle.Thousand,
})

// Override the decimal separator, keep the locale thousand separator
const input2 = new NumoraInput(container, {
  locale: 'fr-FR',
  thousandStyle: ThousandStyle.Thousand,
  decimalSeparator: '.',
})`}
      </CodeBlock>

      <h2>Specific locale tag</h2>
      <p>
        Pass a BCP 47 locale tag to pin separators to one locale. This helps with SSR and server-driven locale handling.
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput, ThousandStyle } from 'numora'

// Pinned to German locale
const input = new NumoraInput(container, {
  locale: 'de-DE',
  thousandStyle: ThousandStyle.Thousand,
})`}
      </CodeBlock>

      <h2>getSeparatorsFromLocale</h2>
      <p>To compute the separators yourself and pass them in:</p>
      <CodeBlock language="typescript">
        {`import { NumoraInput, getSeparatorsFromLocale } from 'numora'

const { thousandSeparator, decimalSeparator } = getSeparatorsFromLocale('de-DE')
// → { thousandSeparator: '.', decimalSeparator: ',' }

getSeparatorsFromLocale('en-US')
// → { thousandSeparator: ',', decimalSeparator: '.' }

getSeparatorsFromLocale('fr-FR')
// → { thousandSeparator: '\\u202f', decimalSeparator: ',' }

const input = new NumoraInput(container, { thousandSeparator, decimalSeparator })`}
      </CodeBlock>

      <p>
        For decimal separator configuration without locale detection, see{' '}
        <Link to="/docs/numora/features/decimals">
          Decimals
        </Link>
        .
      </p>

      <h2>Value format under a locale</h2>
      <p>
        String values are in the field's display format, so under de-DE use <code>'1234,5'</code>,
        not <code>'1234.5'</code>. See <Link to="/docs/numora/features/value-types">Value types</Link>{' '}
        for the full value contract.
      </p>
    </div>
  );
}
