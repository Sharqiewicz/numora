import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'
import { FormatOn } from 'numora'

export const Route = createFileRoute('/docs/numora-react/features/max-length')({
  head: () => ({
    meta: [
      { title: 'Max Length (Raw-Counted) | numora-react' },
      { name: 'description', content: 'Cap numeric input length by raw digits using the NumoraInput React component. Thousand separators are excluded from the count, so the limit reflects the actual value.' },
      { property: 'og:title', content: 'Max Length (Raw-Counted) | numora-react' },
      { property: 'og:description', content: 'Cap numeric input length by raw digits in React. Separator-aware truncation for financial forms.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react/features/max-length' },
      { name: 'twitter:title', content: 'Max Length (Raw-Counted) | numora-react' },
      { name: 'twitter:description', content: 'Cap numeric input length by raw digits with the NumoraInput React component.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/features/max-length' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "Max Length in numora-react - Raw-Counted React Numeric Input Limit", "description": "Cap React numeric input length by raw digits with numora-react. Thousand separators are excluded from the count, so the limit reflects the actual numeric value.", "url": "https://numeric-input.com/docs/numora-react/features/max-length", "author": { "@type": "Person", "name": "Kacper Szarkiewicz", "url": "https://x.com/sharqiewicz" } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora React", "item": "https://numeric-input.com/docs/numora-react" }, { "@type": "ListItem", "position": 3, "name": "Max Length", "item": "https://numeric-input.com/docs/numora-react/features/max-length" }] }]) },
    ],
  }),
  component: MaxLength,
})

function MaxLength() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Max Length</h1>
      <p className="text-lg text-muted-foreground">
        Cap the input by raw character count - thousand separators are excluded from the
        limit, so the cap reflects the actual numeric value rather than the formatted
        display.
      </p>

      <h2>Why not the native HTML attribute?</h2>
      <p>
        The native <code>maxLength</code> attribute on <code>&lt;input&gt;</code> counts every
        formatted character. With thousand separators, <code>1,234,567</code> is 9
        characters; the user thinks of it as 7 digits. Numora's prop counts the raw value the
        way users actually reason about length, and shadows the native HTML attribute.
      </p>

      <div className="space-y-4">
        <ExampleWithDemo
          title="7 raw digits, formatted with thousands"
          description={'Try typing more than 7 digits - the 8th keystroke is blocked'}
          language="tsx"
          code={`<NumoraInput
  maxLength={7}
  thousandSeparator=","
  formatOn={FormatOn.Change}
/>`}
          config={{ maxLength: 7, thousandSeparator: ',', formatOn: FormatOn.Change }}
        />
        <ExampleWithDemo
          title="With decimals"
          description={'Decimal separator counts. "1234.56" → 7 raw chars'}
          language="tsx"
          code={`<NumoraInput maxLength={6} />`}
          config={{ maxLength: 6 }}
        />
      </div>

      <h2>Rules</h2>
      <ul>
        <li>Counts the <strong>raw</strong> value - thousand separators are stripped before measuring</li>
        <li>The decimal separator <em>is</em> counted</li>
        <li>A leading <code>-</code> sign <em>is</em> counted</li>
        <li>Truncation happens from the right; if it would leave a trailing decimal separator, that separator is also stripped</li>
      </ul>

      <h2>Pasted values</h2>
      <p>
        Pastes are truncated after sanitization. Pasting <code>"99999999"</code> into an
        input with <code>maxLength={'{4}'}</code> commits <code>"9999"</code>.
      </p>

      <h2>Standalone utility</h2>
      <p>
        For one-off truncation outside of the input pipeline, Numora exports
        <code>truncateToMaxLength</code> from the core package:
      </p>

      <CodeBlock language="tsx">
{`import { truncateToMaxLength } from 'numora'

truncateToMaxLength('1234567', 5)        // → '12345'
truncateToMaxLength('1234.56', 5)        // → '1234'
truncateToMaxLength('-1234567', 5)       // → '-1234'`}
      </CodeBlock>
    </div>
  )
}
