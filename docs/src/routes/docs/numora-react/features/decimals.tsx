import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'

export const Route = createFileRoute('/docs/numora-react/features/decimals')({
  component: Decimals,
})

function Decimals() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Decimals</h1>
      <p className="text-lg text-muted-foreground">
        Numora provides comprehensive decimal handling with precision control, minimum decimal
        places, and intelligent comma/dot conversion.
      </p>

      <h2>Decimal Precision Control</h2>
      <p>
        Control the maximum number of decimal places allowed:
      </p>

      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  maxDecimals={2}
  // Maximum 2 decimal places
/>`}
        language="tsx"
        config={{
          maxDecimals: 2,
        }}
        description="Try typing more than 2 decimal places - they'll be truncated"
      />

      <h2>Minimum Decimal Places</h2>
      <p>
        Automatically pad values with zeros to ensure minimum decimal places:
      </p>

      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  decimalMinLength={2}
  maxDecimals={18}
  // Minimum 2 decimal places (pads with zeros)
/>`}
        language="tsx"
        config={{
          decimalMinLength: 2,
          maxDecimals: 18,
        }}
        description="Try typing '1' and blur - it will become '1.00'"
      />

      <h2>Custom Decimal Separator</h2>
      <p>
        Use any character as decimal separator:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora-react'

// European format (comma as decimal separator)
<NumoraInput
  decimalSeparator=","
  thousandSeparator="."
  // "1234.56" → "1.234,56"
/>\n\n// Custom separator\n<NumoraInput\n  decimalSeparator="·"\n  // "1234·56"\n/>`}
      </CodeBlock>

      <h2>Comma/Dot Conversion</h2>
      <p>
        When <code>thousandStyle</code> is <code>None</code>, Numora automatically converts comma
        or dot to the configured decimal separator. This makes it easier for users without knowing
        the exact separator:
      </p>

      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  decimalSeparator=","
  thousandsGroupStyle={undefined}
  maxDecimals={2}
  // Comma/dot conversion enabled
/>`}
        language="tsx"
        config={{
          decimalSeparator: ',',
          maxDecimals: 2,
        }}
        description="Try typing '.' or ',' - both will be converted to ','"
      />

      <h3>How It Works</h3>
      <p>
        The <code>convertCommaOrDotToDecimalSeparatorAndPreventMultimpleDecimalSeparators</code>{' '}
        function handles this conversion:
      </p>

      <ul>
        <li>
          Only works when <code>thousandStyle</code> is <code>None</code> (to avoid conflicts with
          thousand separators)
        </li>
        <li>
          Converts both comma (,) and dot (.) to the configured <code>decimalSeparator</code>
        </li>
        <li>
          Prevents multiple decimal separators from being entered
        </li>
        <li>
          Preserves cursor position after conversion
        </li>
      </ul>

      <h2>Preventing Multiple Decimal Separators</h2>
      <p>
        Numora automatically prevents users from entering multiple decimal separators:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora-react'

<NumoraInput
  decimalSeparator="."
  // User types: "12.34"
  // User tries to type "." again
  // Result: "12.34" (second decimal separator is prevented)
/>`}
      </CodeBlock>

      <h2>Extra Decimal Separator Removal</h2>
      <p>
        If multiple decimal separators somehow get into the value (e.g., from paste), Numora
        removes all but the first one:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora-react'

<NumoraInput
  decimalSeparator="."
  // User pastes: "12.34.56"
  // After sanitization: "12.3456"
  // Only the first decimal separator is kept
/>`}
      </CodeBlock>

      <h2>Complete Example</h2>
      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  maxDecimals={18}
  decimalMinLength={2}
  decimalSeparator="."
  thousandSeparator=","
  onChange={(e) => {
    console.log('Decimal value:', e.target.value)
  }}
/>`}
        language="tsx"
        config={{
          maxDecimals: 18,
          decimalMinLength: 2,
          decimalSeparator: '.',
          thousandSeparator: ',',
        }}
        description="Try various decimal inputs to see precision control and padding"
      />
    </div>
  )
}
