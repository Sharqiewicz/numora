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
        content:
          'Detect thousand and decimal separators from the browser locale using the locale option and getSeparatorsFromLocale.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/locale' },
      { name: 'twitter:title', content: 'Locale | Numora' },
      {
        name: 'twitter:description',
        content:
          'Detect thousand and decimal separators from the browser locale using the locale option and getSeparatorsFromLocale.',
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
    <div className="docs-prose max-w-[36rem]">
      <h1>Locale</h1>
      <p>
        The <code>locale</code> option detects the thousand and decimal separators, and the
        digit-grouping style, through <code>Intl.NumberFormat</code>. An explicit{' '}
        <code>groupingStyle</code> overrides the detected one.
      </p>

      <h2>Browser locale</h2>
      <p>
        Pass <code>locale: true</code> to detect both separators from the browser's current locale.
        Explicit <code>thousandSeparator</code> or <code>decimalSeparator</code> values win over
        locale-detected ones. <code>locale</code> only fills the options you did not set.
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

// Both separators detected from the browser locale
const input = new NumoraInput(container, {
  locale: true,
  groupingStyle: 'thousand',
})

// Override the decimal separator, keep the locale thousand separator
const input2 = new NumoraInput(container, {
  locale: 'fr-FR',
  groupingStyle: 'thousand',
  decimalSeparator: '.',
})`}
      </CodeBlock>

      <h2>Specific locale tag</h2>
      <p>
        Pass a BCP 47 locale tag to pin separators to one locale. This helps with SSR and
        server-driven locale handling.
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

// Pinned to German locale
const input = new NumoraInput(container, {
  locale: 'de-DE',
  groupingStyle: 'thousand',
})`}
      </CodeBlock>

      <h2>Grouping style detection</h2>
      <p>
        Indic locales group as 3-2-2 (lakh/crore) rather than 3-3-3. When <code>groupingStyle</code>{' '}
        is left unset, it is derived from the locale, so <code>hi-IN</code> and <code>en-IN</code>{' '}
        get <code>'lakh'</code> automatically.
      </p>
      <CodeBlock language="typescript">
        {`// locale-derived grouping: 12345678 → "1,23,45,678"
const input = new NumoraInput(container, { locale: 'en-IN' })

// an explicit groupingStyle always wins: 12345678 → "12,345,678"
const input2 = new NumoraInput(container, {
  locale: 'en-IN',
  groupingStyle: 'thousand',
})`}
      </CodeBlock>
      <p>
        Only <code>Thousand</code> and <code>Lakh</code> are inferrable.{' '}
        <code>'wan'</code> (4-4-4) is not derivable from <code>Intl.NumberFormat</code>{' '}
        (<code>zh-CN</code> and <code>ja-JP</code> both report Western 3-3-3 grouping), so pass Wan
        explicitly.
      </p>

      <h2>getSeparatorsFromLocale</h2>
      <p>To compute the separators yourself and pass them in:</p>
      <CodeBlock language="typescript">
        {`import { NumoraInput, getSeparatorsFromLocale } from 'numora'

const { thousandSeparator, decimalSeparator } = getSeparatorsFromLocale('de-DE')
// → { thousandSeparator: '.', decimalSeparator: ',', groupingStyle: 'thousand' }

getSeparatorsFromLocale('en-US')
// → { thousandSeparator: ',', decimalSeparator: '.', groupingStyle: 'thousand' }

getSeparatorsFromLocale('fr-FR')
// → { thousandSeparator: '\\u202f', decimalSeparator: ',', groupingStyle: 'thousand' }

getSeparatorsFromLocale('en-IN')
// → { thousandSeparator: ',', decimalSeparator: '.', groupingStyle: 'lakh' }

const input = new NumoraInput(container, { thousandSeparator, decimalSeparator })`}
      </CodeBlock>

      <p>
        For decimal separator configuration without locale detection, see{' '}
        <Link to="/docs/numora/features/decimals">Decimals</Link>.
      </p>

      <h2>What the field displays</h2>
      <p>
        The field shows the locale's separators with ASCII digits and an ASCII <code>-</code>. In
        ar-EG it shows <code>1٬234٫5</code>, not the Arabic-Indic <code>١٬٢٣٤٫٥</code> that{' '}
        <code>Intl.NumberFormat</code> prints, and in sv-SE it shows <code>-</code>, not{' '}
        <code>−</code> (U+2212). Typed and pasted native digits and minus signs are still accepted
        and folded to ASCII. Four-digit numbers are always grouped (<code>1.234</code> in es-ES),
        even where <code>Intl</code> leaves them ungrouped.
      </p>

      <h2>Value format under a locale</h2>
      <p>
        <code>value</code> and <code>setValue</code> take the canonical raw value in every locale:
        ASCII digits, <code>.</code> as the decimal mark, no grouping. Under{' '}
        <code>locale: 'de-DE'</code>, <code>setValue('1234.5')</code> displays{' '}
        <code>"1.234,5"</code>, and <code>instance.rawValue</code> returns <code>"1234.5"</code>.
        See <Link to="/docs/numora/features/value-types">Value types</Link> for the full value
        contract.
      </p>
    </div>
  );
}
