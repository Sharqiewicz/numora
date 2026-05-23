import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/validation')({
  head: () => ({
    meta: [
      { title: 'Custom Validation with isAllowed | Numora' },
      { name: 'description', content: 'Reject numeric input pre-commit with a custom isAllowed validator in Numora. Cap values, enforce business rules, and stop invalid keystrokes before they hit your state.' },
      { property: 'og:title', content: 'Custom Validation with isAllowed | Numora' },
      { property: 'og:description', content: 'Reject numeric input pre-commit with a custom isAllowed validator. Block keystrokes and pastes before they fire onChange.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/validation' },
      { name: 'twitter:title', content: 'Custom Validation with isAllowed | Numora' },
      { name: 'twitter:description', content: 'Reject numeric input pre-commit with a custom isAllowed validator in Numora.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/validation' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "Custom Validation with isAllowed in Numora", "description": "Use the isAllowed predicate to reject invalid numeric input before it commits. Enforce caps, business rules, and other invariants without writing your own keydown handlers.", "url": "https://numeric-input.com/docs/numora/features/validation", "author": { "@type": "Person", "name": "Kacper Szarkiewicz", "url": "https://x.com/sharqiewicz" } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora JS", "item": "https://numeric-input.com/docs/numora" }, { "@type": "ListItem", "position": 3, "name": "Validation", "item": "https://numeric-input.com/docs/numora/features/validation" }] }]) },
    ],
  }),
  component: Validation,
})

function Validation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Custom Validation</h1>
      <p className="text-lg text-muted-foreground">
        Reject keystrokes and pastes <em>before</em> they commit using an{' '}
        <code>isAllowed</code> predicate. Useful for enforcing caps, business rules, or
        format invariants that don't fit one of the built-in options.
      </p>

      <h2>Shape</h2>
      <CodeBlock language="typescript">
{`type IsAllowed = (rawValue: string) => boolean`}
      </CodeBlock>

      <p>
        <code>rawValue</code> is the sanitized, raw (no-separator) string that <em>would</em>
        be committed by this keystroke or paste. Return <code>true</code> to accept it,
        <code>false</code> to discard it - the input stays at its previous value and no
        <code>onChange</code> fires.
      </p>

      <h2>Example: cap at 100</h2>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const input = new NumoraInput(container, {
  isAllowed: (raw) => {
    if (raw === '' || raw === '-' || raw === '.') return true
    const n = parseFloat(raw)
    return Number.isFinite(n) && n <= 100
  },
})`}
      </CodeBlock>

      <h2>Example: only multiples of 5</h2>
      <CodeBlock language="typescript">
{`new NumoraInput(container, {
  isAllowed: (raw) => raw === '' || /^[0-9]+$/.test(raw) && Number(raw) % 5 === 0,
})`}
      </CodeBlock>

      <h2>Notes</h2>
      <ul>
        <li>Runs <em>after</em> sanitization and formatting, but <em>before</em> the DOM is mutated</li>
        <li>Fires for both typing and paste paths</li>
        <li>Always allow the intermediate strings users need to type their way to a valid value (empty string, lone <code>-</code> or decimal separator)</li>
        <li>Keep the predicate cheap - it runs on every keystroke</li>
        <li>Combine with <code>maxLength</code> for length caps and <code>maxDecimals</code> for decimal-precision caps; <code>isAllowed</code> is for everything else</li>
      </ul>
    </div>
  )
}
