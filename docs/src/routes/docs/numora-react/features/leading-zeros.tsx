import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'

export const Route = createFileRoute('/docs/numora-react/features/leading-zeros')({
  head: () => ({
    meta: [
      { title: 'Leading Zero Handling | numora-react' },
      { name: 'description', content: 'Control leading zeros using the NumoraInput React component. Enable or disable leading zero input for financial forms with full React support.' },
      { property: 'og:title', content: 'Leading Zero Handling | numora-react' },
      { property: 'og:description', content: 'Control leading zeros using the NumoraInput React component. Enable or disable for financial forms.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora-react/features/leading-zeros' },
      { name: 'twitter:title', content: 'Leading Zero Handling | numora-react' },
      { name: 'twitter:description', content: 'Control leading zeros using the NumoraInput React component.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numora.xyz/docs/numora-react/features/leading-zeros' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numora.xyz" }, { "@type": "ListItem", "position": 2, "name": "Numora React", "item": "https://numora.xyz/docs/numora-react" }, { "@type": "ListItem", "position": 3, "name": "Features", "item": "https://numora.xyz/docs/numora-react/features" }, { "@type": "ListItem", "position": 4, "name": "Leading Zeros", "item": "https://numora.xyz/docs/numora-react/features/leading-zeros" }] }) },
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
        Set <code>enableLeadingZeros</code> to preserve them.
      </p>

      <div className="space-y-4">
        <ExampleWithDemo
          title="Removed (default)"
          description={'Try typing "007" - it becomes "7"'}
          language="tsx"
          code={`<NumoraInput />`}
        />
        <ExampleWithDemo
          title="Preserved"
          description={'Try typing "007" - it stays "007"'}
          language="tsx"
          code={`<NumoraInput enableLeadingZeros />`}
          config={{ enableLeadingZeros: true }}
        />
      </div>

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
