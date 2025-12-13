import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'

export const Route = createFileRoute('/docs/features/sanitization')({
  component: Sanitization,
})

function Sanitization() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Sanitization</h1>
      <p className="text-lg text-muted-foreground">
        Numora provides comprehensive input sanitization to ensure data integrity and prevent
        tampering. The sanitization pipeline processes user input through multiple stages to clean
        and normalize numeric values.
      </p>

      <h2>Sanitization Pipeline</h2>
      <p>
        Numora's sanitization process follows a specific order to handle various input scenarios:
      </p>

      <ol>
        <li>
          <strong>Mobile Keyboard Filtering</strong> - Removes non-breaking spaces and Unicode
          whitespace artifacts from mobile keyboards
        </li>
        <li>
          <strong>Thousand Separator Removal</strong> - Strips formatting characters (thousand
          separators) that are not part of the actual numeric value
        </li>
        <li>
          <strong>Compact Notation Expansion</strong> - Expands shorthand notation like "1k" to
          "1000" (if enabled)
        </li>
        <li>
          <strong>Scientific Notation Expansion</strong> - Always expands scientific notation
          like "1.5e-7" to "0.00000015"
        </li>
        <li>
          <strong>Non-numeric Character Removal</strong> - Filters out invalid characters while
          preserving valid numeric characters, decimal separators, and optionally negative signs
        </li>
        <li>
          <strong>Extra Decimal Separator Removal</strong> - Ensures only one decimal separator
          exists in the value
        </li>
        <li>
          <strong>Leading Zero Removal</strong> - Removes leading zeros (if not enabled) to
          normalize values like "007" to "7"
        </li>
      </ol>

      <h2>Mobile Keyboard Filtering</h2>
      <p>
        Mobile keyboards often insert non-breaking spaces (U+00A0) and other Unicode whitespace
        variants that can cause issues. Numora automatically filters these artifacts:
      </p>

      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  maxDecimals={2}
  // Mobile keyboard artifacts are automatically filtered
/>`}
        language="tsx"
        config={{
          maxDecimals: 2,
        }}
        description="Try typing with spaces or special characters - they'll be automatically filtered"
      />

      <h3>Filtered Characters</h3>
      <ul>
        <li>Non-breaking space (U+00A0)</li>
        <li>En quad, em quad (U+2000-U+2003)</li>
        <li>Zero-width space (U+200B)</li>
        <li>Narrow no-break space (U+202F)</li>
        <li>Medium mathematical space (U+205F)</li>
        <li>Ideographic space (U+3000)</li>
        <li>All regular whitespace characters</li>
      </ul>

      <h2>Non-numeric Character Filtering</h2>
      <p>
        Numora automatically removes invalid characters while preserving:
      </p>
      <ul>
        <li>Digits (0-9)</li>
        <li>Decimal separator (configured via <code>decimalSeparator</code>)</li>
        <li>Negative sign (-) if <code>enableNegative</code> is true</li>
      </ul>

      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  maxDecimals={2}
  // Invalid characters are automatically removed
/>`}
        language="tsx"
        config={{
          maxDecimals: 2,
        }}
        description="Try typing letters or special characters - only numbers will be kept"
      />

      <h2>Decimal Separator Handling</h2>
      <p>
        Numora ensures only one decimal separator exists in the value. If multiple decimal
        separators are entered, only the first one is kept:
      </p>

      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  decimalSeparator="."
  maxDecimals={2}
/>`}
        language="tsx"
        config={{
          decimalSeparator: '.',
          maxDecimals: 2,
        }}
        description="Try typing multiple decimal points - only the first one will be kept"
      />

      <h2>Leading Zeros</h2>
      <p>
        By default, Numora removes leading zeros to normalize values. You can enable leading zeros
        if needed:
      </p>

      <div className="space-y-4">
        <ExampleWithDemo
          code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  enableLeadingZeros={false}
  // Default: Leading zeros removed
/>`}
          language="tsx"
          config={{
            enableLeadingZeros: false,
            maxDecimals: 2,
          }}
          title="Default: Leading Zeros Removed"
          description="Try typing '007' - it will become '7'"
        />
        <ExampleWithDemo
          code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  enableLeadingZeros={true}
  // Leading zeros preserved
/>`}
          language="tsx"
          config={{
            enableLeadingZeros: true,
            maxDecimals: 2,
          }}
          title="Leading Zeros Enabled"
          description="Try typing '007' - it will be preserved"
        />
      </div>

      <h2>Complete Example</h2>
      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  maxDecimals={2}
  decimalSeparator="."
  thousandSeparator=","
  enableCompactNotation={true}
  enableNegative={false}
  enableLeadingZeros={false}
  onChange={(e) => {
    // Value is always sanitized before this callback
    console.log('Sanitized value:', e.target.value)
  }}
/>`}
        language="tsx"
        config={{
          maxDecimals: 2,
          decimalSeparator: '.',
          thousandSeparator: ',',
          enableCompactNotation: true,
          enableNegative: false,
          enableLeadingZeros: false,
        }}
        description="Try pasting ' 1,234.56.78abc' - it will be sanitized and formatted"
      />
    </div>
  )
}
