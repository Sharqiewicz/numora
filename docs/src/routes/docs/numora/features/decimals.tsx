import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/decimals')({
  head: () => ({
    meta: [
      { title: 'Decimal Input Validation & Limits | Numora' },
      { name: 'description', content: 'Enforce decimal place limits and validate decimal inputs with Numora. Set max/min decimal places, choose separators, and prevent invalid decimal entries.' },
      { property: 'og:title', content: 'Decimal Input Validation & Limits | Numora' },
      { property: 'og:description', content: 'Enforce decimal place limits and validate decimal inputs with Numora. Set max/min decimal places and prevent invalid entries.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora/features/decimals' },
      { name: 'twitter:title', content: 'Decimal Input Validation & Limits | Numora' },
      { name: 'twitter:description', content: 'Enforce decimal place limits and validate decimal inputs with Numora.' },
    ],
  }),
  component: Decimals,
})

function Decimals() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Decimals</h1>
      <p className="text-lg text-muted-foreground">
        Control decimal precision, separators, and locale-aware formatting.
      </p>

      <h2>Precision limits</h2>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

// Cap at 2 decimal places - extra digits are truncated on input
const input = new NumoraInput(container, {
  decimalMaxLength: 2,
})

// Pad to at least 2 decimal places - applied on blur
const input = new NumoraInput(container, {
  decimalMinLength: 2,
  decimalMaxLength: 18,
  // "1" on blur → "1.00"
})`}
      </CodeBlock>

      <h2>Separators</h2>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

// European format
const input = new NumoraInput(container, {
  decimalSeparator: ',',
  thousandSeparator: '.',
  // "1234.56" → "1.234,56"
})`}
      </CodeBlock>

      <p>
        For locale-aware separator detection, see{' '}
        <Link to="/docs/numora/features/locale" className="text-primary underline">
          Locale
        </Link>
        .
      </p>

      <h2>Automatic behaviors</h2>
      <ul>
        <li><strong>Comma/dot conversion</strong> - when no thousand separator is set, both <code>,</code> and <code>.</code> keystrokes map to the configured decimal separator</li>
        <li><strong>Duplicate prevention</strong> - typing a second decimal separator is blocked</li>
        <li><strong>Paste cleanup</strong> - if multiple separators appear (e.g. <code>"12.34.56"</code>), all but the first are removed (<code>"12.3456"</code>)</li>
      </ul>
    </div>
  )
}
