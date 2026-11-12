import { createFileRoute, Link } from '@tanstack/react-router';
import { useSyncExternalStore } from 'react';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

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
        content:
          'Auto-detect thousand and decimal separators from the browser locale using the locale prop and getSeparatorsFromLocale.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/locale',
      },
      { name: 'twitter:title', content: 'Locale | Numora React' },
      {
        name: 'twitter:description',
        content:
          'Auto-detect thousand and decimal separators from the browser locale using the locale prop and getSeparatorsFromLocale.',
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

const subscribeNoop = () => () => {};
const getBrowserLocale = () => Intl.NumberFormat().resolvedOptions().locale;
// Browser locale is unknown on the server; the empty server snapshot keeps the first
// client render identical to the SSR HTML, and the real value appears after hydration.
const getServerLocale = () => '';

function Locale() {
  const usersLocale = useSyncExternalStore(subscribeNoop, getBrowserLocale, getServerLocale);

  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Locale</h1>
      <p>
        The <code>locale</code> prop detects thousand and decimal separators, and the digit-grouping
        style, via <code>Intl.NumberFormat</code>. An explicit <code>groupingStyle</code> overrides
        the detected one.
      </p>

      <h2>Browser locale (auto-detect)</h2>
      <p>
        Pass <code>locale={'{true}'}</code> to detect both separators from the browser's current
        locale. Explicit <code>thousandSeparator</code> or <code>decimalSeparator</code> values win
        over locale-detected ones.
      </p>
      <div className="space-y-4">
        <ExampleWithDemo
          title={usersLocale ? `Your browser: ${usersLocale}` : 'Your browser'}
          description="Both separators are resolved from your browser's locale setting"
          language="tsx"
          code={`<NumoraInput locale={true} />`}
          config={{ locale: true, formatOn: 'change' }}
        />
      </div>

      <h2>Specific locale tag</h2>
      <p>
        Pass a BCP 47 locale tag to pin separators to a specific locale. Use this whenever the
        field is rendered on the server: <code>locale={'{true}'}</code> there resolves to the
        server's locale, which may not match the browser, and logs a warning in development.
      </p>
      <div className="space-y-4">
        <ExampleWithDemo
          title="de-DE"
          description="Separators pinned to German locale: '.' thousand, ',' decimal"
          language="tsx"
          code={`<NumoraInput locale="de-DE" />`}
          config={{ locale: 'de-DE', formatOn: 'change' }}
        />
      </div>

      <h2>Grouping style detection</h2>
      <p>
        Indic locales group as 3-2-2 (lakh/crore) rather than 3-3-3. When <code>groupingStyle</code>{' '}
        is left unset, it is derived from the locale, so <code>hi-IN</code> and <code>en-IN</code>{' '}
        get <code>'lakh'</code> automatically.
      </p>
      <div className="space-y-4">
        <ExampleWithDemo
          title="Indic locale (en-IN)"
          description="Grouping derived from the locale: 12345678 formats as 1,23,45,678"
          language="tsx"
          code={`<NumoraInput locale="en-IN" />`}
          config={{ locale: 'en-IN', formatOn: 'change' }}
        />
        <ExampleWithDemo
          title="Explicit groupingStyle wins"
          description="Passing groupingStyle overrides the locale-derived one: 12,345,678"
          language="tsx"
          code={`<NumoraInput locale="en-IN" groupingStyle="thousand" />`}
          config={{
            locale: 'en-IN',
            groupingStyle: 'thousand',
            formatOn: 'change',
          }}
        />
      </div>
      <p>
        Only <code>Thousand</code> and <code>Lakh</code> are inferrable.{' '}
        <code>'wan'</code> (4-4-4) cannot be derived from <code>Intl.NumberFormat</code>
        , because <code>zh-CN</code> and <code>ja-JP</code> both report Western 3-3-3 grouping. Pass
        Wan explicitly.
      </p>

      <h2>getSeparatorsFromLocale</h2>
      <p>To compute separators ahead of time and pass them explicitly:</p>
      <CodeBlock language="tsx">
        {`import { NumoraInput, getSeparatorsFromLocale } from 'numora-react'

const { thousandSeparator, decimalSeparator } = getSeparatorsFromLocale('de-DE')
// → { thousandSeparator: '.', decimalSeparator: ',', groupingStyle: 'thousand' }

getSeparatorsFromLocale('en-US')
// → { thousandSeparator: ',', decimalSeparator: '.', groupingStyle: 'thousand' }

getSeparatorsFromLocale('fr-FR')
// → { thousandSeparator: '\\u202f', decimalSeparator: ',', groupingStyle: 'thousand' }

getSeparatorsFromLocale('en-IN')
// → { thousandSeparator: ',', decimalSeparator: '.', groupingStyle: 'lakh' }

<NumoraInput thousandSeparator={thousandSeparator} decimalSeparator={decimalSeparator} />`}
      </CodeBlock>

      <p>
        For decimal separator configuration without locale detection, see{' '}
        <Link to="/docs/numora-react/features/decimals">Decimals</Link>.
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
        <code>value</code> and <code>defaultValue</code> take the canonical raw value in every
        locale: ASCII digits, <code>.</code> as the decimal mark, no grouping. Under{' '}
        <code>locale="de-DE"</code>, <code>{'value="1234.5"'}</code> displays{' '}
        <code>"1.234,5"</code>, and{' '}
        <code>e.target.value</code> is <code>"1234.5"</code>. See{' '}
        <Link to="/docs/numora-react/features/value-types">features/value-types</Link> for the full
        value contract.
      </p>
    </div>
  );
}
