import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/locale')({
  head: () => ({
    meta: [
      { title: 'Locale-Aware Separator Detection | Numora' },
      { name: 'description', content: 'Auto-detect thousand and decimal separators from the browser locale using the locale prop and getSeparatorsFromLocale.' },
      { property: 'og:title', content: 'Locale-Aware Separator Detection | Numora' },
      { property: 'og:description', content: 'Auto-detect separators from the browser locale with Numora.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora/features/locale' },
      { name: 'twitter:title', content: 'Locale-Aware Separator Detection | Numora' },
      { name: 'twitter:description', content: 'Auto-detect separators from the browser locale with Numora.' },
    ],
  }),
  component: Locale,
})

function Locale() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Locale</h1>
      <p className="text-lg text-muted-foreground">
        The <code>locale</code> prop auto-detects thousand and decimal separators via{' '}
        <code>Intl.NumberFormat</code>. Grouping style is still controlled separately by{' '}
        <code>thousandStyle</code>.
      </p>

      <h2>Browser locale (auto-detect)</h2>
      <p>
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

      <h2>Specific locale tag</h2>
      <p>
        Pass a BCP 47 locale tag to pin separators to a specific locale — useful for SSR or
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

      <h2>getSeparatorsFromLocale</h2>
      <p>
        For pre-computing separators and passing them explicitly:
      </p>
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
        <Link to="/docs/numora/features/decimals" className="text-primary underline">
          Decimals
        </Link>
        .
      </p>
    </div>
  )
}
