import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/features/percent')({
  component: Percent,
})

function Percent() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Percent Formatting</h1>
      <p className="text-lg text-muted-foreground">
        Numora provides utility functions for formatting numeric values as percentages. These
        functions use string arithmetic to avoid precision loss.
      </p>

      <h2>Basic Percent Formatting</h2>
      <p>
        Format decimal values as percentages using <code>formatPercent</code>:
      </p>

      <CodeBlock language="typescript">
{`import { formatPercent } from 'numora'

// Format as percentage (input is decimal)
formatPercent('0.01', 2)        // "1.00%"
formatPercent('0.1234', 2)      // "12.34%"
formatPercent('1', 0)           // "100%"
formatPercent('0', 2)            // "0%"`}
      </CodeBlock>

      <h2>Parameters</h2>
      <ul>
        <li>
          <code>value</code> - The numeric string value (as decimal, e.g., "0.01" for 1%)
        </li>
        <li>
          <code>decimals</code> - Number of decimal places to show (default: 2)
        </li>
        <li>
          <code>decimalSeparator</code> - The decimal separator character (default: '.')
        </li>
        <li>
          <code>thousandSeparator</code> - Optional thousand separator for large percentages
        </li>
        <li>
          <code>thousandStyle</code> - Optional thousand grouping style
        </li>
      </ul>

      <h2>Examples</h2>

      <h3>Basic Usage</h3>
      <CodeBlock language="typescript">
{`import { formatPercent } from 'numora'

// Simple percentage
formatPercent('0.01', 2)        // "1.00%"
formatPercent('0.05', 2)        // "5.00%"
formatPercent('0.123', 2)       // "12.30%"
formatPercent('0.1234', 2)     // "12.34%"

// No decimals
formatPercent('0.5', 0)        // "50%"
formatPercent('1', 0)           // "100%"

// Many decimals
formatPercent('0.123456', 4)   // "12.3456%"`}
      </CodeBlock>

      <h3>With Thousand Separators</h3>
      <CodeBlock language="typescript">
{`import { formatPercent, ThousandStyle } from 'numora'

// Large percentages with thousand separators
formatPercent('10', 2, '.', ',', ThousandStyle.Thousand)
// "1,000.00%"

formatPercent('100', 2, '.', ',', ThousandStyle.Thousand)
// "10,000.00%"`}
      </CodeBlock>

      <h3>Negative Percentages</h3>
      <CodeBlock language="typescript">
{`import { formatPercent } from 'numora'

// Negative percentages
formatPercent('-0.01', 2)       // "-1.00%"
formatPercent('-0.123', 2)      // "-12.30%"`}
      </CodeBlock>

      <h2>Large Percent Formatting</h2>
      <p>
        For very large percentages, use <code>formatLargePercent</code> which includes scale
        notation (k, M, T, etc.):
      </p>

      <CodeBlock language="typescript">
{`import { formatLargePercent } from 'numora'

// Small percentages (normal format)
formatLargePercent('0.01', 2)           // "1.00%"
formatLargePercent('1000', 2)            // "100000%"

// Very large percentages (with scale notation)
formatLargePercent('1000000', 2)        // "100M%"
formatLargePercent('1000000000', 2)      // "100B%"`}
      </CodeBlock>

      <h2>String Arithmetic</h2>
      <p>
        All percent formatting functions use string arithmetic to avoid floating-point precision
        issues:
      </p>

      <CodeBlock language="typescript">
{`// Numora uses string manipulation, not floating-point math
// "0.01" → "1.00%" conversion:
// 1. Multiply by 100 using string arithmetic
// 2. Format with decimal precision
// 3. Add "%" suffix
// Result: "1.00%" (accurate, no precision loss)

// "0.123456789" → "12.3456789%" conversion:
// All precision is preserved using string arithmetic`}
      </CodeBlock>

      <h2>Use Cases</h2>
      <ul>
        <li>
          Displaying interest rates (e.g., "5.25%")
        </li>
        <li>
          Showing percentage changes (e.g., "+12.34%", "-5.50%")
        </li>
        <li>
          Formatting yield percentages in DeFi applications
        </li>
        <li>
          Displaying completion percentages
        </li>
        <li>
          Showing large percentages with scale notation (e.g., "1.23M%")
        </li>
      </ul>

      <h2>Complete Example</h2>
      <CodeBlock language="typescript">
{`import { formatPercent, formatLargePercent } from 'numora'

// Format interest rate
function formatInterestRate(rate: string) {
  return formatPercent(rate, 2)
}

formatInterestRate('0.0525')  // "5.25%"
formatInterestRate('0.1234')  // "12.34%"

// Format large yield percentage
function formatYield(yieldValue: string) {
  return formatLargePercent(yieldValue, 2)
}

formatYield('0.01')        // "1.00%"
formatYield('1000')        // "100000%"
formatYield('1000000')     // "100M%"

// In a React component
function PercentageDisplay({ value }: { value: string }) {
  const formatted = formatPercent(value, 2)
  return <span>{formatted}</span>
}`}
      </CodeBlock>

      <h2>Important Notes</h2>
      <ul>
        <li>
          Input values are expected as decimals (e.g., "0.01" represents 1%, not "1")
        </li>
        <li>
          All formatting uses string arithmetic, ensuring no precision loss
        </li>
        <li>
          Trailing zeros are automatically removed (e.g., "1.00%" not "1.0000%")
        </li>
        <li>
          Zero values are formatted as "0%" regardless of decimal places
        </li>
        <li>
          Negative values are preserved with the minus sign
        </li>
      </ul>
    </div>
  )
}
