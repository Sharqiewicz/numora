import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'

export const Route = createFileRoute('/docs/features/compact-notation')({
  component: CompactNotation,
})

function CompactNotation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Compact Notation</h1>
      <p className="text-lg text-muted-foreground">
        Numora can automatically expand compact notation (shorthand like "1k", "1.5m", "2B") to
        full numbers when enabled. This is useful for allowing users to paste or type shorthand
        values.
      </p>

      <h2>Supported Suffixes</h2>
      <p>
        Numora supports the following compact notation suffixes (case-insensitive):
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
          <tr>
            <td>k, K</td>
            <td>1,000 (thousand)</td>
            <td>"1k" → "1000"</td>
          </tr>
          <tr>
            <td>m, M</td>
            <td>1,000,000 (million)</td>
            <td>"1.5m" → "1500000"</td>
          </tr>
          <tr>
            <td>b, B</td>
            <td>1,000,000,000 (billion)</td>
            <td>"2B" → "2000000000"</td>
          </tr>
          <tr>
            <td>t, T</td>
            <td>1,000,000,000,000 (trillion)</td>
            <td>"2.5T" → "2500000000000"</td>
          </tr>
        </tbody>
      </table>

      <h2>Enabling Compact Notation</h2>
      <p>
        Compact notation expansion is optional and must be enabled:
      </p>

      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  enableCompactNotation={true}
  maxDecimals={18}
  onChange={(e) => {
    console.log('Expanded value:', e.target.value)
  }}
/>`}
        language="tsx"
        config={{
          enableCompactNotation: true,
          maxDecimals: 18,
        }}
        description="Try pasting '1k', '1.5m', or '2B' - they'll be automatically expanded"
      />

      <h2>Usage Examples</h2>

      <h3>Basic Expansion</h3>
      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  enableCompactNotation={true}
  // Paste "1k" → "1000"
  // Paste "1.5m" → "1500000"
  // Paste "2B" → "2000000000"
/>`}
        language="tsx"
        config={{
          enableCompactNotation: true,
          maxDecimals: 18,
        }}
        description="Paste compact notation like '1k', '1.5m', or '2B' to see expansion"
      />

      <h3>With Decimal Values</h3>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableCompactNotation: true,
  decimalMaxLength: 18,
})

// User pastes "1.5k"
// Expands to "1500"

// User pastes "2.75m"
// Expands to "2750000"

// User pastes "0.5k"
// Expands to "500"`}
      </CodeBlock>

      <h3>Programmatic Usage</h3>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableCompactNotation: true,
})

// Set value using compact notation
numoraInput.setValue('1.5k') // Expands to "1500"
numoraInput.setValue('2M') // Expands to "2000000"
numoraInput.setValue('3.5B') // Expands to "3500000000"`}
      </CodeBlock>

      <h2>How It Works</h2>
      <p>
        Compact notation expansion happens during the sanitization phase, before formatting:
      </p>

      <ol>
        <li>
          User enters or pastes a value with compact notation (e.g., "1.5k")
        </li>
        <li>
          Numora detects the compact notation pattern during sanitization
        </li>
        <li>
          The value is expanded using string arithmetic (no precision loss)
        </li>
        <li>
          The expanded value is then processed through the rest of the sanitization pipeline
        </li>
        <li>
          Finally, formatting is applied (if enabled)
        </li>
      </ol>

      <h2>String Arithmetic</h2>
      <p>
        Compact notation expansion uses string arithmetic to avoid floating-point precision issues:
      </p>

      <CodeBlock language="typescript">
{`// Numora uses string manipulation, not floating-point math
// "1.5k" expansion:
// 1. Split: integer="1", decimal="5"
// 2. Move decimal right by 3 positions (k = 3 zeros)
// 3. Result: "1500" (accurate, no precision loss)

// "2.75m" expansion:
// 1. Split: integer="2", decimal="75"
// 2. Move decimal right by 6 positions (m = 6 zeros)
// 3. Result: "2750000" (accurate)`}
      </CodeBlock>

      <h2>Important Notes</h2>
      <ul>
        <li>
          Compact notation expansion only happens during paste or when using{' '}
          <code>setValue()</code>
        </li>
        <li>
          Users cannot type compact notation while editing - it's only expanded from pasted values
        </li>
        <li>
          Expansion happens before formatting, so the expanded value will be formatted according to
          your configuration
        </li>
        <li>
          The expansion uses string arithmetic, ensuring no precision loss even with very large
          numbers
        </li>
      </ul>

      <h2>Complete Example</h2>
      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  enableCompactNotation={true}
  maxDecimals={18}
  thousandSeparator=","
  formatOn="blur"
  onChange={(e) => {
    console.log('Value:', e.target.value)
  }}
/>`}
        language="tsx"
        config={{
          enableCompactNotation: true,
          maxDecimals: 18,
          thousandSeparator: ',',
          formatOn: 'blur',
        }}
        description="Paste '1.5k' and blur to see expansion and formatting"
      />
    </div>
  )
}
