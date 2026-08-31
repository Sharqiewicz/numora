import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/locale')({
  head: () => ({
    meta: [
      { title: 'Locale-Aware Separator Detection | Numora' },
      { name: 'description', content: 'Auto-detect thousand and decimal separators from the browser locale using the locale prop and getSeparatorsFromLocale.' },
      { property: 'og:title', content: 'Locale-Aware Separator Detection | Numora' },
      { property: 'og:description', content: 'Auto-detect separators from the browser locale with Numora.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/locale' },
      { name: 'twitter:title', content: 'Locale-Aware Separator Detection | Numora' },
      { name: 'twitter:description', content: 'Auto-detect separators from the browser locale with Numora.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/locale' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "Locale Support in Numora - International Numeric Input Formatting", "description": "Locale-aware separator detection in the Numora JavaScript numeric input library. Support comma decimals, dot thousand separators, and international grouping styles.", "url": "https://numeric-input.com/docs/numora/features/locale", "author": { "@type": "Person", "name": "Kacper Szarkiewicz", "url": "https://x.com/sharqiewicz" } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora JS", "item": "https://numeric-input.com/docs/numora" }, { "@type": "ListItem", "position": 3, "name": "Locale", "item": "https://numeric-input.com/docs/numora/features/locale" }] }]) },
    ],
  }),
  component: Locale,
})

function Locale() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Locale</h1>
      <p className="text-lg text-muted-foreground">
        The <code>locale</code> prop auto-detects thousand and decimal separators - and the
        digit-grouping style - via <code>Intl.NumberFormat</code>. An explicit{' '}
        <code>groupingStyle</code> always overrides the detected one.
      </p>

      <h2>Browser locale (auto-detect)</h2>
      <p>
        Pass <code>locale: true</code> to detect both separators from the browser's current locale.
        Explicit <code>thousandSeparator</code> or <code>decimalSeparator</code> values always take
        priority over locale-detected ones.
      </p>
      <CodeBlock language="typescript">
{`import { NumoraInput, GroupingStyle } from 'numora'

// Both separators auto-detected from browser locale
// de-DE → thousandSeparator: '.', decimalSeparator: ','
// en-US → thousandSeparator: ',', decimalSeparator: '.'
// fr-FR → thousandSeparator: '\\u202f', decimalSeparator: ','
const input = new NumoraInput(container, {
  locale: true,
  groupingStyle: GroupingStyle.Thousand,
})

// Override decimal separator while keeping locale thousand separator
const input2 = new NumoraInput(container, {
  locale: true,
  groupingStyle: GroupingStyle.Thousand,
  decimalSeparator: '.',
})`}
      </CodeBlock>

      <h2>Specific locale tag</h2>
      <p>
        Pass a BCP 47 locale tag to pin separators to a specific locale - useful for SSR or
        server-driven locale handling.
      </p>
      <CodeBlock language="typescript">
{`import { NumoraInput, GroupingStyle } from 'numora'

// Pinned to German locale: thousandSeparator '.', decimalSeparator ','
const input = new NumoraInput(container, {
  locale: 'de-DE',
  groupingStyle: GroupingStyle.Thousand,
})`}
      </CodeBlock>

      <h2>Grouping style detection</h2>
      <p>
        Indic locales group as 3-2-2 (lakh/crore) rather than 3-3-3. When{' '}
        <code>groupingStyle</code> is left unset, it is derived from the locale, so{' '}
        <code>hi-IN</code> and <code>en-IN</code> get <code>GroupingStyle.Lakh</code>{' '}
        automatically.
      </p>
      <CodeBlock language="typescript">
{`// locale-derived grouping: 12345678 → "1,23,45,678"
const input = new NumoraInput(container, { locale: 'en-IN' })

// an explicit groupingStyle always wins: 12345678 → "12,345,678"
const input2 = new NumoraInput(container, {
  locale: 'en-IN',
  groupingStyle: GroupingStyle.Thousand,
})`}
      </CodeBlock>
      <p>
        Only <code>Thousand</code> and <code>Lakh</code> are inferrable.{' '}
        <code>GroupingStyle.Wan</code> (4-4-4) is not derivable from{' '}
        <code>Intl.NumberFormat</code> - <code>zh-CN</code> and <code>ja-JP</code> both report
        Western 3-3-3 grouping - so Wan must be passed explicitly.
      </p>

      <h2>getSeparatorsFromLocale</h2>
      <p>
        For pre-computing separators and passing them explicitly:
      </p>
      <CodeBlock language="typescript">
{`import { NumoraInput, getSeparatorsFromLocale } from 'numora'

const { thousandSeparator, decimalSeparator } = getSeparatorsFromLocale('de-DE')
// → { thousandSeparator: '.', decimalSeparator: ',', groupingStyle: GroupingStyle.Thousand }

getSeparatorsFromLocale('en-US')
// → { thousandSeparator: ',', decimalSeparator: '.', groupingStyle: GroupingStyle.Thousand }

getSeparatorsFromLocale('fr-FR')
// → { thousandSeparator: '\\u202f', decimalSeparator: ',', groupingStyle: GroupingStyle.Thousand }

getSeparatorsFromLocale('en-IN')
// → { thousandSeparator: ',', decimalSeparator: '.', groupingStyle: GroupingStyle.Lakh }

const input = new NumoraInput(container, { thousandSeparator, decimalSeparator })`}
      </CodeBlock>

      <p>
        For decimal separator configuration without locale detection, see{' '}
        <Link to="/docs/numora/features/decimals" className="text-primary underline">
          Decimals
        </Link>
        .
      </p>
    </div>
  )
}
