import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/compact-notation')({
  head: () => ({
    meta: [
      { title: 'Compact Notation (1k, 1m, 1b) | Numora' },
      { name: 'description', content: 'Enable compact number notation in inputs with Numora. Let users type "1k" for 1,000 or "1m" for 1,000,000. Shorthand number input for financial UIs.' },
      { property: 'og:title', content: 'Compact Notation (1k, 1m, 1b) | Numora' },
      { property: 'og:description', content: 'Enable compact number notation in inputs with Numora. Let users type "1k", "1m", "1b" for shorthand number input.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora/features/compact-notation' },
      { name: 'twitter:title', content: 'Compact Notation (1k, 1m, 1b) | Numora' },
      { name: 'twitter:description', content: 'Enable compact number notation in inputs with Numora. Type "1k" for 1,000.' },
    ],
  }),
  component: CompactNotation,
})

function CompactNotation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Compact Notation</h1>
      <p className="text-lg text-muted-foreground">
        When enabled, pasting shorthand values like <code>"1k"</code> or <code>"2.5m"</code> expands
        them to full numbers. Expansion uses string arithmetic - no precision loss.
      </p>

      <table>
        <thead>
          <tr>
            <th>Suffix</th>
            <th>Multiplier</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>k, K</td><td>×1,000</td><td>"1k" → "1000"</td></tr>
          <tr><td>m, M</td><td>×1,000,000</td><td>"1.5m" → "1500000"</td></tr>
          <tr><td>b, B</td><td>×1,000,000,000</td><td>"2B" → "2000000000"</td></tr>
          <tr><td>t, T</td><td>×1,000,000,000,000</td><td>"2.5T" → "2500000000000"</td></tr>
        </tbody>
      </table>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const input = new NumoraInput(container, {
  enableCompactNotation: true,
  decimalMaxLength: 18,
  // Paste "1k"    → "1000"
  // Paste "1.5m"  → "1500000"
  // Paste "0.5k"  → "500"
  // Paste "2.75m" → "2750000"
})`}
      </CodeBlock>

      <p>
        Expansion only happens on paste - users cannot type compact notation character by character.
        The expanded value then passes through the rest of the sanitization and formatting pipeline.
      </p>
    </div>
  )
}
