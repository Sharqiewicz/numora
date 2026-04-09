import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/scientific-notation')({
  head: () => ({
    meta: [
      { title: 'Scientific Notation Input (1e-18) | Numora' },
      { name: 'description', content: 'Handle scientific notation in numeric inputs with Numora. Prevent JavaScript\'s automatic 1e-6 conversion and preserve full expanded strings for DeFi token amounts.' },
      { property: 'og:title', content: 'Scientific Notation Input (1e-18) | Numora' },
      { property: 'og:description', content: 'Handle scientific notation in numeric inputs with Numora. Prevent 1e-18 issues and preserve full expanded decimal strings.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora/features/scientific-notation' },
      { name: 'twitter:title', content: 'Scientific Notation Input (1e-18) | Numora' },
      { name: 'twitter:description', content: 'Handle scientific notation (1e-18) in numeric inputs with Numora.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numora.xyz/docs/numora/features/scientific-notation' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numora.xyz" }, { "@type": "ListItem", "position": 2, "name": "Numora JS", "item": "https://numora.xyz/docs/numora" }, { "@type": "ListItem", "position": 3, "name": "Features", "item": "https://numora.xyz/docs/numora/features" }, { "@type": "ListItem", "position": 4, "name": "Scientific Notation", "item": "https://numora.xyz/docs/numora/features/scientific-notation" }] }) },
    ],
  }),
  component: ScientificNotation,
})

function ScientificNotation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Scientific Notation</h1>
      <p className="text-lg text-muted-foreground">
        Numora always expands scientific notation to decimal notation. This is automatic and cannot
        be disabled. Expansion uses string arithmetic, so there is no floating-point precision loss.
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const input = new NumoraInput(container, {
  decimalMaxLength: 18,
})

// Paste or type any of these - all are expanded automatically:
// "1.5e-7"   → "0.00000015"
// "2e+5"     → "200000"
// "1.23e-4"  → "0.000123"
// "5e3"      → "5000"
// "-1.5e-7"  → "-0.00000015"  (with enableNegative: true)
// "1.5e-18"  → "0.0000000000000000015"  (no precision loss)`}
      </CodeBlock>

      <p>
        Both <code>e</code> and <code>E</code> are supported. The expanded value is then processed
        through the rest of the sanitization pipeline and formatted according to your configuration.
      </p>
    </div>
  )
}
