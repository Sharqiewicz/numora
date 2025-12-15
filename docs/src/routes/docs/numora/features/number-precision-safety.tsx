import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/number-precision-safety')({
  component: NumberPrecisionSafety,
})

function NumberPrecisionSafety() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Number Precision Safety</h1>
      <p className="text-lg text-muted-foreground">
        Numora uses string arithmetic throughout to avoid JavaScript's floating-point precision
        issues. This ensures accurate handling of large numbers and decimal values.
      </p>

      <h2>The Problem with Floating-Point</h2>
      <p>
        JavaScript uses IEEE 754 double-precision floating-point numbers, which can cause
        precision loss:
      </p>

      <CodeBlock language="javascript">
{`// JavaScript floating-point precision issues
0.1 + 0.2 === 0.3  // false! (0.30000000000000004)
9999999999999999 === 10000000000000000  // true! (precision loss)

// Large numbers lose precision
Number(9007199254740992) === Number(9007199254740993)  // true!`}
      </CodeBlock>

      <h2>String Arithmetic Solution</h2>
      <p>
        Numora performs all numeric operations using string manipulation, avoiding floating-point
        arithmetic entirely:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 18,
  // All operations use string arithmetic
  // No precision loss, even with very large numbers
})

// Example: User enters "999999999999999999.99"
// Numora handles this accurately using strings
// No precision loss occurs`}
      </CodeBlock>

      <h2>Benefits</h2>
      <ul>
        <li>
          <strong>No Precision Loss</strong> - Large integers and decimals are handled accurately
        </li>
        <li>
          <strong>Consistent Results</strong> - Operations always produce expected results
        </li>
        <li>
          <strong>Financial Accuracy</strong> - Critical for DeFi and financial applications where
          precision matters
        </li>
        <li>
          <strong>Large Number Support</strong> - Handles numbers beyond JavaScript's safe integer
          range
        </li>
      </ul>

      <h2>Examples</h2>

      <h3>Large Integers</h3>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 0,
  // Handles numbers like:
  // "9007199254740992999" (beyond safe integer range)
  // "999999999999999999999" (very large numbers)
  // All handled accurately with string arithmetic
})`}
      </CodeBlock>

      <h3>Precise Decimals</h3>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 18,
  // Handles precise decimals like:
  // "0.123456789012345678"
  // "999.999999999999999"
  // No floating-point rounding errors
})`}
      </CodeBlock>

      <h3>Scientific Notation Expansion</h3>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 18,
  // Scientific notation is expanded using string arithmetic:
  // "1.5e-7" → "0.00000015" (accurate)
  // "2e+5" → "200000" (accurate)
  // No precision loss during expansion
})`}
      </CodeBlock>

      <h3>Compact Notation Expansion</h3>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableCompactNotation: true,
  decimalMaxLength: 18,
  // Compact notation expansion uses string arithmetic:
  // "1.5k" → "1500" (accurate)
  // "2.5M" → "2500000" (accurate)
  // "1.23T" → "1230000000000" (accurate)
  // No precision loss
})`}
      </CodeBlock>

      <h2>Best Practices</h2>
      <ul>
        <li>
          Always use string values when working with Numora - avoid converting to numbers unless
          necessary
        </li>
        <li>
          Use <code>rawValueMode</code> to get unformatted string values for calculations
        </li>
        <li>
          For display formatting, use Numora's formatting utilities which also use string
          arithmetic
        </li>
        <li>
          When you need numeric values, use <code>valueAsNumber</code> but be aware of JavaScript's
          precision limits
        </li>
      </ul>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  rawValueMode: true, // Get unformatted string values
  onChange: (value) => {
    // value is a string - use for calculations
    // No precision loss
    console.log('String value:', value)
    
    // If you need a number, be aware of precision limits
    const num = numoraInput.valueAsNumber
    // May lose precision for very large numbers
  },
})`}
      </CodeBlock>
    </div>
  )
}
