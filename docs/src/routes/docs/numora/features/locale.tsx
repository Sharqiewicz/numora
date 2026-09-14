import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/locale')({
  head: () => ({
    meta: [
      { title: 'Locale-Aware Separator Detection | Numora' },
      {
        name: 'description',
        content:
          'Auto-detect thousand and decimal separators from the browser locale using the locale prop and getSeparatorsFromLocale.',
      },
      { property: 'og:title', content: 'Locale-Aware Separator Detection | Numora' },
      {
        property: 'og:description',
        content: 'Auto-detect separators from the browser locale with Numora.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/locale' },
      { name: 'twitter:title', content: 'Locale-Aware Separator Detection | Numora' },
      {
        name: 'twitter:description',
        content: 'Auto-detect separators from the browser locale with Numora.',
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
            headline: 'Locale Support in Numora - International Numeric Input Formatting',
            description:
              'Locale-aware separator detection in the Numora JavaScript numeric input library. Support comma decimals, dot thousand separators, and international grouping styles.',
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
                name: 'Numora JS',
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
    <div className="prose prose-invert max-w-xl">
      <h1 className="text-foreground">Locale</h1>
      <p className="text-muted-foreground text-base leading-6">
        The <code>locale</code> prop auto-detects thousand and decimal separators via{' '}
        <code>Intl.NumberFormat</code>. Grouping style is still controlled separately by{' '}
        <code>thousandStyle</code>.
      </p>

      <h2 className="text-foreground text-2xl">Browser locale (auto-detect)</h2>
      <p className="text-muted-foreground text-base leading-6">
        Pass <code>locale: true</code> to detect both separators from the browser's current locale.
        Explicit <code>thousandSeparator</code> or <code>decimalSeparator</code> values always take
        priority over locale-detected ones.
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput, ThousandStyle } from 'numora'

// Both separators auto-detected from browser locale
// de-DE → thousandSeparator: '.', decimalSeparator: ','
// en-US → thousandSeparator: ',', decimalSeparator: '.'
// fr-FR → thousandSeparator: '\\u202f', decimalSeparator: ','
const input = new NumoraInput(container, {
  locale: true,
  thousandStyle: ThousandStyle.Thousand,
})

// Override decimal separator while keeping locale thousand separator
const input2 = new NumoraInput(container, {
  locale: true,
  thousandStyle: ThousandStyle.Thousand,
  decimalSeparator: '.',
})`}
      </CodeBlock>

      <h2 className="text-foreground text-2xl">Specific locale tag</h2>
      <p className="text-muted-foreground text-base leading-6">
        Pass a BCP 47 locale tag to pin separators to a specific locale - useful for SSR or
        server-driven locale handling.
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput, ThousandStyle } from 'numora'

// Pinned to German locale: thousandSeparator '.', decimalSeparator ','
const input = new NumoraInput(container, {
  locale: 'de-DE',
  thousandStyle: ThousandStyle.Thousand,
})`}
      </CodeBlock>

      <h2 className="text-foreground text-2xl">getSeparatorsFromLocale</h2>
      <p className="text-muted-foreground text-base leading-6">For pre-computing separators and passing them explicitly:</p>
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

      <p className="text-muted-foreground text-base leading-6">
        For decimal separator configuration without locale detection, see{' '}
        <Link to="/docs/numora/features/decimals" className="underline link-underline hover:text-foreground transition-colors">
          Decimals
        </Link>
        .
      </p>

      <h2 className="text-foreground text-2xl">Value format under a locale</h2>
      <p className="text-muted-foreground text-base leading-6">
        String <code>value</code> / <code>setValue</code> are already in the field's{' '}
        <em>display</em> format, so a de-DE-configured field expects <code>','</code> for the
        decimal mark and reads a bare <code>'.'</code> as the thousand separator. A JS{' '}
        <code>number</code> is always dot-decimal, so passing one through <code>valueAsNumber</code>{' '}
        converts it to the configured decimal separator first:{' '}
        <code>instance.valueAsNumber = 1234.5</code> under <code>locale: 'de-DE'</code> displays{' '}
        <code>"1.234,5"</code>, not the <code>"12.345"</code> you would get from{' '}
        <code>setValue('1234.5')</code>, which reads the dot as grouping and strips it. See{' '}
        <Link to="/docs/numora/features/value-types" className="underline link-underline hover:text-foreground transition-colors">features/value-types</Link> for the full value
        contract.
      </p>
    </div>
  );
}
