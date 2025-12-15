import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/leading-zeros')({
  component: LeadingZeros,
})

function LeadingZeros() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Leading Zeros</h1>
      <p className="text-lg text-muted-foreground">
        Numora provides control over leading zero behavior. By default, leading zeros are removed
        to normalize values, but you can enable them if needed.
      </p>

      <h2>Default Behavior (Leading Zeros Removed)</h2>
      <p>
        By default, Numora removes leading zeros from the integer part of numbers:
      </p>

      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold">Default: Leading Zeros Removed</h4>
          <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableLeadingZeros: false,
  decimalMaxLength: 2,
  // Default: Leading zeros removed
  // Try typing '007' - it will become '7'
})`}
          </CodeBlock>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Leading Zeros Enabled</h4>
          <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableLeadingZeros: true,
  decimalMaxLength: 2,
  // Leading zeros preserved
  // Try typing '007' - it will be preserved
})`}
          </CodeBlock>
        </div>
      </div>

      <h2>Enabling Leading Zeros</h2>
      <p>
        You can enable leading zeros if your use case requires them:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableLeadingZeros: true,
  // User types: "007"
  // Result: "007" (leading zeros preserved)
  
  // User types: "0001"
  // Result: "0001" (leading zeros preserved)
})`}
      </CodeBlock>

      <h2>How It Works</h2>
      <p>
        Leading zero removal only affects the integer part of numbers, not decimal values:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableLeadingZeros: false,
  // "007" → "7" (integer part, zeros removed)
  // "0.5" → "0.5" (decimal part, zeros preserved)
  // "00.5" → "0.5" (integer part zeros removed, decimal preserved)
  // "0" → "0" (single zero preserved)
})`}
      </CodeBlock>

      <h2>Edge Cases</h2>

      <h3>Single Zero</h3>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableLeadingZeros: false,
  // "0" → "0" (single zero is always preserved)
  // "-0" → "-0" (preserved)
})`}
      </CodeBlock>

      <h3>Negative Numbers</h3>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableLeadingZeros: false,
  enableNegative: true,
  // "-007" → "-7" (leading zeros removed, sign preserved)
  // "-0001" → "-1" (leading zeros removed)
})`}
      </CodeBlock>

      <h3>Decimal Values</h3>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableLeadingZeros: false,
  // "00.5" → "0.5" (integer zeros removed)
  // "0.05" → "0.05" (decimal zeros preserved)
  // "0.005" → "0.005" (decimal zeros preserved)
})`}
      </CodeBlock>

      <h2>Use Cases</h2>

      <h3>Default (Leading Zeros Removed)</h3>
      <ul>
        <li>
          Currency inputs (e.g., "$007" should be "$7")
        </li>
        <li>
          General numeric inputs where leading zeros are not meaningful
        </li>
        <li>
          Most financial applications
        </li>
      </ul>

      <h3>Leading Zeros Enabled</h3>
      <ul>
        <li>
          Product codes or IDs that require leading zeros (e.g., "007", "0001")
        </li>
        <li>
          Formatted numbers where leading zeros are part of the format
        </li>
        <li>
          Special numeric formats that preserve zero padding
        </li>
      </ul>

      <h2>Complete Example</h2>
      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold">Currency Input (Default)</h4>
          <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableLeadingZeros: false,
  decimalMaxLength: 2,
  thousandSeparator: ',',
  // Default: Leading zeros removed for normal numeric input
})`}
          </CodeBlock>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Product Code Input</h4>
          <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableLeadingZeros: true,
  decimalMaxLength: 0,
  // Leading zeros preserved for special formats
})`}
          </CodeBlock>
        </div>
      </div>
    </div>
  )
}
