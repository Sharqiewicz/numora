import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/subscript-notation')({
  component: SubscriptNotation,
})

function SubscriptNotation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Subscript Notation</h1>
      <p className="text-lg text-muted-foreground">
        Numora provides a utility function to condense leading decimal zeros using subscript
        notation. This is useful for displaying very small numbers in a more readable format.
      </p>

      <h2>What is Subscript Notation?</h2>
      <p>
        Subscript notation condenses leading decimal zeros by replacing them with a subscript
        number. For example:
      </p>

      <ul>
        <li>
          <code>0.000001</code> → <code>0₆1</code> (6 leading zeros)
        </li>
        <li>
          <code>0.000123</code> → <code>0₃123</code> (3 leading zeros)
        </li>
        <li>
          <code>0.001</code> → <code>0.001</code> (not enough zeros to condense)
        </li>
      </ul>

      <h2>Usage</h2>
      <p>
        Subscript notation is available as a display formatting utility:
      </p>

      <CodeBlock language="typescript">
{`import { condenseDecimalZeros } from 'numora'

// Condense leading decimal zeros
const condensed = condenseDecimalZeros('0.000001', 8)
// Result: "0₆1"

const condensed2 = condenseDecimalZeros('0.000123', 8)
// Result: "0₃123"

// Not enough zeros to condense (need at least 3)
const notCondensed = condenseDecimalZeros('0.001', 8)
// Result: "0.001"`}
      </CodeBlock>

      <h2>Parameters</h2>
      <ul>
        <li>
          <code>value</code> - The numeric string value to condense
        </li>
        <li>
          <code>maxDecimalDigits</code> - Maximum number of decimal digits to show after
          condensation (default: 8)
        </li>
        <li>
          <code>decimalSeparator</code> - The decimal separator character (default: '.')
        </li>
      </ul>

      <h2>How It Works</h2>
      <ol>
        <li>
          Finds leading zeros in the decimal part (requires at least 3 leading zeros)
        </li>
        <li>
          Converts the count of leading zeros to subscript Unicode characters
        </li>
        <li>
          Replaces the leading zeros with <code>0{subscript}</code>
        </li>
        <li>
          Trims to <code>maxDecimalDigits</code> if needed
        </li>
      </ol>

      <h2>Examples</h2>

      <h3>Basic Condensation</h3>
      <CodeBlock language="typescript">
{`import { condenseDecimalZeros } from 'numora'

// 6 leading zeros
condenseDecimalZeros('0.000001', 8)
// "0₆1"

// 3 leading zeros
condenseDecimalZeros('0.000123', 8)
// "0₃123"

// 5 leading zeros
condenseDecimalZeros('0.000005678', 8)
// "0₅5678"`}
      </CodeBlock>

      <h3>With maxDecimalDigits</h3>
      <CodeBlock language="typescript">
{`import { condenseDecimalZeros } from 'numora'

// Limit to 4 decimal digits after condensation
condenseDecimalZeros('0.000001234567', 4)
// "0₆1234" (trimmed to 4 digits after subscript)

// Limit to 2 decimal digits
condenseDecimalZeros('0.000123456', 2)
// "0₃12" (trimmed to 2 digits after subscript)`}
      </CodeBlock>

      <h3>Edge Cases</h3>
      <CodeBlock language="typescript">
{`import { condenseDecimalZeros } from 'numora'

// Not enough zeros (need at least 3)
condenseDecimalZeros('0.001', 8)
// "0.001" (not condensed)

// No decimal part
condenseDecimalZeros('123', 8)
// "123" (no change)

// Negative numbers
condenseDecimalZeros('-0.000001', 8)
// "-0₆1"`}
      </CodeBlock>

      <h2>Subscript Characters</h2>
      <p>
        Numora uses Unicode subscript characters:
      </p>

      <table>
        <thead>
          <tr>
            <th>Digit</th>
            <th>Subscript</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0</td>
            <td>₀</td>
          </tr>
          <tr>
            <td>1</td>
            <td>₁</td>
          </tr>
          <tr>
            <td>2</td>
            <td>₂</td>
          </tr>
          <tr>
            <td>3</td>
            <td>₃</td>
          </tr>
          <tr>
            <td>4</td>
            <td>₄</td>
          </tr>
          <tr>
            <td>5</td>
            <td>₅</td>
          </tr>
          <tr>
            <td>6</td>
            <td>₆</td>
          </tr>
          <tr>
            <td>7</td>
            <td>₇</td>
          </tr>
          <tr>
            <td>8</td>
            <td>₈</td>
          </tr>
          <tr>
            <td>9</td>
            <td>₉</td>
          </tr>
        </tbody>
      </table>

      <h2>Use Cases</h2>
      <ul>
        <li>
          Displaying very small cryptocurrency amounts (e.g., wei values)
        </li>
        <li>
          Showing precise decimal values in scientific contexts
        </li>
        <li>
          Improving readability of numbers with many leading zeros
        </li>
        <li>
          Saving space in UI when displaying small decimal values
        </li>
      </ul>

      <h2>Complete Example</h2>
      <CodeBlock language="typescript">
{`import { condenseDecimalZeros } from 'numora'

// Format a very small number for display
function formatSmallNumber(value: string) {
  return condenseDecimalZeros(value, 8)
}

// Usage
const display = formatSmallNumber('0.000000000123456789')
// "0₉12345678" (9 leading zeros condensed)`}
      </CodeBlock>
    </div>
  )
}
