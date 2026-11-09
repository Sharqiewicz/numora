import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';
import { FormatOn, GroupingStyle } from 'numora';

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
    <div className="prose prose-invert prose-article">
      <h1>Locale</h1>
      <p>
        The <code>locale</code> prop auto-detects thousand and decimal separators - and the
        digit-grouping style - via <code>Intl.NumberFormat</code>. An explicit{' '}
        <code>groupingStyle</code> always overrides the detected one.
      </p>

      <h2>Browser locale (auto-detect)</h2>
      <p>
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

      <h2>Specific locale tag</h2>
      <p>
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

      <h2>Grouping style detection</h2>
      <p>
        Indic locales group as 3-2-2 (lakh/crore) rather than 3-3-3. When <code>groupingStyle</code>{' '}
        is left unset, it is derived from the locale, so <code>hi-IN</code> and <code>en-IN</code>{' '}
        get <code>GroupingStyle.Lakh</code> automatically.
      </p>
      <div className="space-y-4">
        <ExampleWithDemo
          title="Indic locale (en-IN)"
          description="Grouping derived from the locale: 12345678 formats as 1,23,45,678"
          language="tsx"
          code={`<NumoraInput locale="en-IN" />`}
          config={{ locale: 'en-IN', formatOn: FormatOn.Change }}
        />
        <ExampleWithDemo
          title="Explicit groupingStyle wins"
          description="Passing groupingStyle overrides the locale-derived one: 12,345,678"
          language="tsx"
          code={`<NumoraInput locale="en-IN" groupingStyle={GroupingStyle.Thousand} />`}
          config={{
            locale: 'en-IN',
            groupingStyle: GroupingStyle.Thousand,
            formatOn: FormatOn.Change,
          }}
        />
      </div>
      <p>
        Only <code>Thousand</code> and <code>Lakh</code> are inferrable.{' '}
        <code>GroupingStyle.Wan</code> (4-4-4) is not derivable from <code>Intl.NumberFormat</code>{' '}
        - <code>zh-CN</code> and <code>ja-JP</code> both report Western 3-3-3 grouping - so Wan must
        be passed explicitly.
      </p>

      <h2>getSeparatorsFromLocale</h2>
      <p>For pre-computing separators and passing them explicitly:</p>
      <CodeBlock language="tsx">
        {`import { NumoraInput } from 'numora-react'
import { getSeparatorsFromLocale } from 'numora'

const { thousandSeparator, decimalSeparator } = getSeparatorsFromLocale('de-DE')
// → { thousandSeparator: '.', decimalSeparator: ',', groupingStyle: GroupingStyle.Thousand }

getSeparatorsFromLocale('en-US')
// → { thousandSeparator: ',', decimalSeparator: '.', groupingStyle: GroupingStyle.Thousand }

getSeparatorsFromLocale('fr-FR')
// → { thousandSeparator: '\\u202f', decimalSeparator: ',', groupingStyle: GroupingStyle.Thousand }

getSeparatorsFromLocale('en-IN')
// → { thousandSeparator: ',', decimalSeparator: '.', groupingStyle: GroupingStyle.Lakh }

<NumoraInput thousandSeparator={thousandSeparator} decimalSeparator={decimalSeparator} />`}
      </CodeBlock>

      <p>
        For decimal separator configuration without locale detection, see{' '}
        <Link to="/docs/numora-react/features/decimals" className="text-primary underline">
          Decimals
        </Link>
        .
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
        <code>locale="de-DE"</code>, both <code>{'value="1234.5"'}</code> and{' '}
        <code>{'value={1234.5}'}</code> display <code>"1.234,5"</code>, and{' '}
        <code>e.target.value</code> is <code>"1234.5"</code>. See{' '}
        <Link to="/docs/numora-react/features/value-types">features/value-types</Link> for the full
        value contract.
      </p>
    </div>
  );
}
