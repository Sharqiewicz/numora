import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'

export const Route = createFileRoute('/docs/numora-react/features/sanitization')({
  head: () => ({
    meta: [
      { title: 'Numeric Input Sanitization | numora-react' },
      { name: 'description', content: 'Sanitize numeric inputs using the NumoraInput React component. Block invalid characters, clean pasted values, and handle all input vectors automatically.' },
      { property: 'og:title', content: 'Numeric Input Sanitization | numora-react' },
      { property: 'og:description', content: 'Sanitize numeric inputs using the NumoraInput React component. Block invalid characters and clean pasted values.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora-react/features/sanitization' },
      { name: 'twitter:title', content: 'Numeric Input Sanitization | numora-react' },
      { name: 'twitter:description', content: 'Sanitize numeric inputs using the NumoraInput React component.' },
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

      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput maxDecimals={2} />`}
        language="tsx"
        config={{
          maxDecimals: 2,
        }}
        description="Try typing letters or special characters - only numbers will be kept"
      />

      <h2>removeThousandSeparators</h2>
      <p>
        Numora exports a standalone <code>removeThousandSeparators</code> utility from the core
        package for stripping thousand separators from a formatted string. Useful when you need
        to extract a raw numeric value from a display string.
      </p>
      <p>(You can also access the raw value of the input by <code>e.target.rawValue</code> when <code>rawValueMode</code> is <code>true</code>)</p>


      <CodeBlock language="tsx">
{`import { removeThousandSeparators } from 'numora'

removeThousandSeparators('1,234,567.89', ',') // → '1234567.89'
removeThousandSeparators('1.234.567,89', '.') // → '1234567,89'
removeThousandSeparators('1 234 567', ' ')    // → '1234567'`}
      </CodeBlock>
    </div>
  )
}
