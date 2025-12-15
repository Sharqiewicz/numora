import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/formatting')({
  component: Formatting,
})

function Formatting() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Formatting</h1>
      <p className="text-lg text-muted-foreground">
        Numora provides sophisticated number formatting with thousand separators, cursor position
        preservation, and multiple formatting modes.
      </p>

      <h2>Thousand Separators</h2>
      <p>
        Numora supports customizable thousand separators with different grouping styles:
      </p>

      <ul>
        <li>
          <strong>Thousand</strong> - Standard grouping: 1,000,000
        </li>
        <li>
          <strong>Lakh</strong> - Indian numbering: 10,00,000
        </li>
        <li>
          <strong>Wan</strong> - Chinese numbering: 100,0000
        </li>
        <li>
          <strong>None</strong> - No grouping
        </li>
      </ul>

      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold">Standard Thousand Grouping</h4>
          <CodeBlock language="typescript">
{`import { NumoraInput, ThousandStyle } from 'numora'

const numoraInput = new NumoraInput(container, {
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
  decimalMaxLength: 2,
  // Standard grouping: 1,234,567
})`}
          </CodeBlock>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Indian Lakh Grouping</h4>
          <CodeBlock language="typescript">
{`import { NumoraInput, ThousandStyle } from 'numora'

const numoraInput = new NumoraInput(container, {
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Lakh,
  decimalMaxLength: 2,
  // Indian numbering: 12,34,567
})`}
          </CodeBlock>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Chinese Wan Grouping</h4>
          <CodeBlock language="typescript">
{`import { NumoraInput, ThousandStyle } from 'numora'

const numoraInput = new NumoraInput(container, {
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Wan,
  decimalMaxLength: 2,
  // Chinese numbering: 123,4567
})`}
          </CodeBlock>
        </div>
      </div>

      <h2>Format On</h2>
      <p>
        Choose when formatting is applied:
      </p>

      <ul>
        <li>
          <strong>Blur</strong> (default) - Format when input loses focus. Provides clean editing
          experience without formatting interruptions.
        </li>
        <li>
          <strong>Change</strong> - Format on every change. Real-time formatting as user types.
        </li>
      </ul>

      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold">Format on Blur (Default)</h4>
          <CodeBlock language="typescript">
{`import { NumoraInput, FormatOn } from 'numora'

const numoraInput = new NumoraInput(container, {
  formatOn: FormatOn.Blur,
  thousandSeparator: ',',
  decimalMaxLength: 2,
  // Format when input loses focus
})`}
          </CodeBlock>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Format on Change</h4>
          <CodeBlock language="typescript">
{`import { NumoraInput, FormatOn } from 'numora'

const numoraInput = new NumoraInput(container, {
  formatOn: FormatOn.Change,
  thousandSeparator: ',',
  decimalMaxLength: 2,
  // Real-time formatting as you type
})`}
          </CodeBlock>
        </div>
      </div>

      <h2>Cursor Position Preservation</h2>
      <p>
        Numora intelligently preserves cursor position during formatting, even when thousand
        separators are added or removed. This ensures a smooth editing experience:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput, FormatOn } from 'numora'

const numoraInput = new NumoraInput(container, {
  formatOn: FormatOn.Change,
  thousandSeparator: ',',
  decimalMaxLength: 2,
  // Cursor position is preserved during formatting
})`}
      </CodeBlock>

      <h2>Thousand Separator Skipping</h2>
      <p>
        When deleting or backspacing, the cursor automatically skips over thousand separators for
        better UX:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput, FormatOn } from 'numora'

const numoraInput = new NumoraInput(container, {
  formatOn: FormatOn.Change,
  thousandSeparator: ',',
  // Value: "1,234"
  // Cursor before "2"
  // User presses backspace
  // Cursor skips over "," and deletes "1"
  // Result: "234"
})`}
      </CodeBlock>

      <h2>Custom Separators</h2>
      <p>
        You can use any character as thousand or decimal separator:
      </p>

      <div className="space-y-4">
        <div>
          <h4 className="text-lg font-semibold">European Format</h4>
          <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalSeparator: ',',
  thousandSeparator: '.',
  decimalMaxLength: 2,
  // European format: 1.234,56
})`}
          </CodeBlock>
        </div>
        <div>
          <h4 className="text-lg font-semibold">Space Separator</h4>
          <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  thousandSeparator: ' ',
  decimalMaxLength: 2,
  // Space as thousand separator: 1 234 567
})`}
          </CodeBlock>
        </div>
      </div>

      <h2>Display Formatting Utilities</h2>
      <p>
        Numora also provides utilities for formatting numbers outside of input fields:
      </p>

      <CodeBlock language="typescript">
{`import {
  formatPercent,
  formatLargePercent,
  formatLargeNumber,
  condenseDecimalZeros,
} from 'numora'

// Format as percentage
const percent = formatPercent('0.01', 2) // "1.00%"
const largePercent = formatLargePercent('1000', 2) // "100000%"

// Format large numbers with scale notation
const large = formatLargeNumber('1234567') // "1.23M"
const small = formatLargeNumber('1234') // "1.23k"

// Condense decimal zeros
const condensed = condenseDecimalZeros('0.000001', 8) // "0₆1"
const condensed2 = condenseDecimalZeros('0.000123', 8) // "0₃123"`}
      </CodeBlock>
    </div>
  )
}
