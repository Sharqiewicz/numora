import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/sanitization')({
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

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  // Mobile keyboard artifacts are automatically filtered
  // Try typing with spaces or special characters - they'll be automatically filtered
})`}
      </CodeBlock>

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

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  // Invalid characters are automatically removed
  // Try typing letters or special characters - only numbers will be kept
})`}
      </CodeBlock>

      <h2>Decimal Separator Handling</h2>
      <p>
        Numora ensures only one decimal separator exists in the value. If multiple decimal
        separators are entered, only the first one is kept:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalSeparator: '.',
  decimalMaxLength: 2,
  // Try typing multiple decimal points - only the first one will be kept
})`}
      </CodeBlock>

      <h2>Leading Zeros</h2>
      <p>
        By default, Numora removes leading zeros to normalize values. You can enable leading zeros
        if needed:
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

      <h2>Complete Example</h2>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  decimalSeparator: '.',
  thousandSeparator: ',',
  enableCompactNotation: true,
  enableNegative: false,
  enableLeadingZeros: false,
  onChange: (value) => {
    // Value is always sanitized before this callback
    console.log('Sanitized value:', value)
  },
})
// Try pasting ' 1,234.56.78abc' - it will be sanitized and formatted`}
      </CodeBlock>
    </div>
  )
}
