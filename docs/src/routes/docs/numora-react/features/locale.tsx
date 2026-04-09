import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'
import {FormatOn} from 'numora'

export const Route = createFileRoute('/docs/numora-react/features/locale')({
  head: () => ({
    meta: [
      { title: 'Locale-Aware Separator Detection | numora-react' },
      { name: 'description', content: 'Auto-detect thousand and decimal separators from the browser locale using the locale prop and getSeparatorsFromLocale.' },
      { property: 'og:title', content: 'Locale-Aware Separator Detection | numora-react' },
      { property: 'og:description', content: 'Auto-detect separators from the browser locale with numora-react.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora-react/features/locale' },
      { name: 'twitter:title', content: 'Locale-Aware Separator Detection | numora-react' },
      { name: 'twitter:description', content: 'Auto-detect separators from the browser locale with numora-react.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numora.xyz/docs/numora-react/features/locale' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numora.xyz" }, { "@type": "ListItem", "position": 2, "name": "Numora React", "item": "https://numora.xyz/docs/numora-react" }, { "@type": "ListItem", "position": 3, "name": "Features", "item": "https://numora.xyz/docs/numora-react/features" }, { "@type": "ListItem", "position": 4, "name": "Locale", "item": "https://numora.xyz/docs/numora-react/features/locale" }] }) },
    ],
  }),
  component: Locale,
})

function Locale() {

  const usersLocale = Intl.NumberFormat().resolvedOptions().locale

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
        Pass a BCP 47 locale tag to pin separators to a specific locale — useful for SSR or
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
      <p>
        For pre-computing separators and passing them explicitly:
      </p>
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
        <Link to="/docs/numora-react/features/decimals" className="text-primary underline">
          Decimals
        </Link>
        .
      </p>
    </div>
  )
}
