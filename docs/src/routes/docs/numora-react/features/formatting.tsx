import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'
import { FormatOn, ThousandStyle } from 'numora-react'

export const Route = createFileRoute('/docs/numora-react/features/formatting')({
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
        <ExampleWithDemo
          code={`import { NumoraInput, ThousandStyle } from 'numora-react'

<NumoraInput
  thousandSeparator=","
  thousandsGroupStyle="thousand"
  // Standard grouping: 1,234,567
/>`}
          language="tsx"
          config={{
            thousandSeparator: ',',
            thousandsGroupStyle: 'thousand',
            maxDecimals: 2,
          }}
          title="Standard Thousand Grouping"
          description="Type a large number to see standard grouping"
        />
        <ExampleWithDemo
          code={`import { NumoraInput, ThousandStyle } from 'numora-react'

<NumoraInput
  thousandSeparator=","
  thousandsGroupStyle="lakh"
  // Indian numbering: 12,34,567
/>`}
          language="tsx"
          config={{
            thousandSeparator: ',',
            thousandsGroupStyle: 'lakh',
            maxDecimals: 2,
          }}
          title="Indian Lakh Grouping"
          description="Type a large number to see Indian numbering style"
        />
        <ExampleWithDemo
          code={`import { NumoraInput, ThousandStyle } from 'numora-react'

<NumoraInput
  thousandSeparator=","
  thousandsGroupStyle="wan"
  // Chinese numbering: 123,4567
/>`}
          language="tsx"
          config={{
            thousandSeparator: ',',
            thousandsGroupStyle: 'wan',
            maxDecimals: 2,
          }}
          title="Chinese Wan Grouping"
          description="Type a large number to see Chinese numbering style"
        />
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
        <ExampleWithDemo
          code={`import { NumoraInput, FormatOn } from 'numora-react'

<NumoraInput
  formatOn="blur"
  thousandSeparator=","
  // Format when input loses focus
/>`}
          language="tsx"
          config={{
            formatOn: 'blur',
            thousandSeparator: ',',
            maxDecimals: 2,
          }}
          title="Format on Blur (Default)"
          description="Type a number and click away to see formatting"
        />
        <ExampleWithDemo
          code={`import { NumoraInput, FormatOn } from 'numora-react'

<NumoraInput
  formatOn="change"
  thousandSeparator=","
  // Real-time formatting as you type
/>`}
          language="tsx"
          config={{
            formatOn: 'change',
            thousandSeparator: ',',
            maxDecimals: 2,
          }}
          title="Format on Change"
          description="Type a number to see real-time formatting"
        />
      </div>

      <h2>Cursor Position Preservation</h2>
      <p>
        Numora intelligently preserves cursor position during formatting, even when thousand
        separators are added or removed. This ensures a smooth editing experience:
      </p>

      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  formatOn="change"
  thousandSeparator=","
  // Cursor position is preserved during formatting
/>`}
        language="tsx"
        config={{
          formatOn: 'change',
          thousandSeparator: ',',
          maxDecimals: 2,
        }}
        description="Type in the middle of a number - cursor position is preserved"
      />

      <h2>Thousand Separator Skipping</h2>
      <p>
        When deleting or backspacing, the cursor automatically skips over thousand separators for
        better UX:
      </p>

      <CodeBlock language="tsx">
{`import { NumoraInput, FormatOn } from 'numora-react'

<NumoraInput
  formatOn="change"
  thousandSeparator=","
  // Value: "1,234"
  // Cursor before "2"
  // User presses backspace
  // Cursor skips over "," and deletes "1"
  // Result: "234"
/>`}
      </CodeBlock>

      <h2>Custom Separators</h2>
      <p>
        You can use any character as thousand or decimal separator:
      </p>

      <div className="space-y-4">
        <ExampleWithDemo
          code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  decimalSeparator=","
  thousandSeparator="."
  // European format: 1.234,56
/>`}
          language="tsx"
          config={{
            decimalSeparator: ',',
            thousandSeparator: '.',
            maxDecimals: 2,
          }}
          title="European Format"
          description="Uses comma for decimals and dot for thousands"
        />
        <ExampleWithDemo
          code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  thousandSeparator=" "
  // Space as thousand separator: 1 234 567
/>`}
          language="tsx"
          config={{
            thousandSeparator: ' ',
            maxDecimals: 2,
          }}
          title="Space Separator"
          description="Uses space as thousand separator"
        />
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
