import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/decimals')({
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

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  // Maximum 2 decimal places
  // Try typing more than 2 decimal places - they'll be truncated
})`}
      </CodeBlock>

      <h2>Minimum Decimal Places</h2>
      <p>
        Automatically pad values with zeros to ensure minimum decimal places:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMinLength: 2,
  decimalMaxLength: 18,
  // Minimum 2 decimal places (pads with zeros)
  // Try typing '1' and blur - it will become '1.00'
})`}
      </CodeBlock>

      <h2>Custom Decimal Separator</h2>
      <p>
        Use any character as decimal separator:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

// European format (comma as decimal separator)
const european = new NumoraInput(container, {
  decimalSeparator: ',',
  thousandSeparator: '.',
  // "1234.56" → "1.234,56"
})

// Custom separator
const custom = new NumoraInput(container, {
  decimalSeparator: '·',
  // "1234·56"
})`}
      </CodeBlock>

      <h2>Comma/Dot Conversion</h2>
      <p>
        When <code>thousandStyle</code> is <code>None</code>, Numora automatically converts comma
        or dot to the configured decimal separator. This makes it easier for users without knowing
        the exact separator:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalSeparator: ',',
  thousandStyle: undefined,
  decimalMaxLength: 2,
  // Comma/dot conversion enabled
  // Try typing '.' or ',' - both will be converted to ','
})`}
      </CodeBlock>

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
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalSeparator: '.',
  // User types: "12.34"
  // User tries to type "." again
  // Result: "12.34" (second decimal separator is prevented)
})`}
      </CodeBlock>

      <h2>Extra Decimal Separator Removal</h2>
      <p>
        If multiple decimal separators somehow get into the value (e.g., from paste), Numora
        removes all but the first one:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalSeparator: '.',
  // User pastes: "12.34.56"
  // After sanitization: "12.3456"
  // Only the first decimal separator is kept
})`}
      </CodeBlock>

      <h2>Complete Example</h2>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 18,
  decimalMinLength: 2,
  decimalSeparator: '.',
  thousandSeparator: ',',
  onChange: (value) => {
    console.log('Decimal value:', value)
  },
})
// Try various decimal inputs to see precision control and padding`}
      </CodeBlock>
    </div>
  )
}
