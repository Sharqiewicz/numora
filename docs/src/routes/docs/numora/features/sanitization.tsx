import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/sanitization')({
  head: () => ({
    meta: [
      { title: 'Numeric Input Sanitization | Numora' },
      { name: 'description', content: 'Sanitize numeric inputs and block invalid characters with Numora. Clean pasted values from block explorers, prevent invalid keystrokes, handle all input vectors.' },
      { property: 'og:title', content: 'Numeric Input Sanitization | Numora' },
      { property: 'og:description', content: 'Sanitize numeric inputs and block invalid characters with Numora. Clean pasted values and prevent invalid keystrokes.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora/features/sanitization' },
      { name: 'twitter:title', content: 'Numeric Input Sanitization | Numora' },
      { name: 'twitter:description', content: 'Sanitize numeric inputs and block invalid characters with Numora.' },
    ],
  }),
  component: Sanitization,
})

function Sanitization() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Sanitization</h1>
      <p className="text-lg text-muted-foreground">
        Numora sanitizes every value through a sequential pipeline before formatting is applied.
        For the full architecture and pipeline diagram, see{' '}
        <Link to="/docs/numora/how-it-works">How It Works</Link>. The sections below cover each
        configurable sanitization feature.
      </p>

      <h2>Non-numeric Character Filtering</h2>
      <p>
        Numora automatically removes invalid characters while preserving:
      </p>
      <ul>
        <li>Digits (0-9)</li>
        <li>Decimal separator (configured via <code>decimalSeparator</code>)</li>
        <li>Negative sign (<code>-</code>) if <code>enableNegative</code> is true</li>
      </ul>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  // Invalid characters are automatically removed
  // Try typing letters or special characters - only numbers will be kept
})`}
      </CodeBlock>

      <h2>Decimal Separator Handling</h2>
      <p>
        Numora uses two complementary layers to prevent multiple decimal separators:
      </p>
      <ul>
        <li>
          <strong>Keydown prevention</strong> - When a user types a second decimal separator,
          it is blocked immediately before the value changes. This is the primary guard for
          keyboard input.
        </li>
        <li>
          <strong>Sanitization cleanup</strong> - If multiple separators reach the value anyway
          (e.g., via paste), only the first is kept and the rest are removed. This is the
          fallback for pasted input.
        </li>
      </ul>
      <p>
        Note: comma/dot conversion (typing <code>.</code> when the separator is{' '}
        <code>,</code>) is also handled at keydown time, not in the sanitization pipeline.
        This prevents accidental conversion of thousand separators during paste.
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalSeparator: '.',
  decimalMaxLength: 2,
  // Keydown: typing '.' a second time does nothing
  // Paste: "12.34.56" → "12.3456" (sanitization removes extras)
})`}
      </CodeBlock>

      <h2>Leading Zeros</h2>
      <p>
        By default, Numora removes leading zeros to normalize values. You can enable leading zeros
        if needed. <Link to="/docs/numora/how-it-works" className="underline">Leading zeros docs</Link>
      </p>

      <h2>removeThousandSeparators</h2>
      <p>
        Numora exports a standalone <code>removeThousandSeparators</code> utility for stripping
        thousand separators from a formatted string. Useful when you need to extract a raw
        numeric value from a display string.
      </p>
      <p>(You can also access the raw value of the input by <code>e.target.rawValue</code> when <code>rawValueMode</code> is <code>true</code>)</p>

      <CodeBlock language="typescript">
{`import { removeThousandSeparators } from 'numora'

removeThousandSeparators('1,234,567.89', ',') // → '1234567.89'
removeThousandSeparators('1.234.567,89', '.') // → '1234567,89'
removeThousandSeparators('1 234 567', ' ')    // → '1234567'`}
      </CodeBlock>
    </div>
  )
}
