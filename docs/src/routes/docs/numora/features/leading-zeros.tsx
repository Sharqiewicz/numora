import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/leading-zeros')({
  head: () => ({
    meta: [
      { title: 'Leading Zero Handling | Numora' },
      { name: 'description', content: 'Control leading zero behavior in numeric inputs with Numora. Enable or disable leading zeros for clean number entry in financial applications.' },
      { property: 'og:title', content: 'Leading Zero Handling | Numora' },
      { property: 'og:description', content: 'Control leading zero behavior in numeric inputs with Numora. Enable or disable for financial inputs.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora/features/leading-zeros' },
      { name: 'twitter:title', content: 'Leading Zero Handling | Numora' },
      { name: 'twitter:description', content: 'Control leading zero behavior in numeric inputs with Numora.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numora.xyz/docs/numora/features/leading-zeros' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numora.xyz" }, { "@type": "ListItem", "position": 2, "name": "Numora JS", "item": "https://numora.xyz/docs/numora" }, { "@type": "ListItem", "position": 3, "name": "Features", "item": "https://numora.xyz/docs/numora/features" }, { "@type": "ListItem", "position": 4, "name": "Leading Zeros", "item": "https://numora.xyz/docs/numora/features/leading-zeros" }] }) },
    ],
  }),
  component: LeadingZeros,
})

function LeadingZeros() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Leading Zeros</h1>
      <p className="text-lg text-muted-foreground">
        By default, Numora strips leading zeros from the integer part of a number.
        Set <code>enableLeadingZeros: true</code> to preserve them.
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

// Default - leading zeros removed
// "007" → "7", "0001" → "1"
const input = new NumoraInput(container, {
  enableLeadingZeros: false,
})

// Leading zeros preserved
// "007" → "007", "0001" → "0001"
const input = new NumoraInput(container, {
  enableLeadingZeros: true,
})`}
      </CodeBlock>

      <h2>Rules</h2>
      <ul>
        <li>Only the integer part is affected - decimal zeros are never touched (<code>"0.05"</code> stays <code>"0.05"</code>)</li>
        <li>A bare <code>"0"</code> is always preserved</li>
        <li>The sign is preserved for negative numbers (<code>"-007"</code> → <code>"-7"</code>)</li>
      </ul>

      <h2>When to use each</h2>
      <ul>
        <li><strong>Removed (default)</strong> - currency and general numeric inputs where leading zeros are meaningless</li>
        <li><strong>Preserved</strong> - product codes, IDs, or any format where zero-padding is significant</li>
      </ul>
    </div>
  )
}
