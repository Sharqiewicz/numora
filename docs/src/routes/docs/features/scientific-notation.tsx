import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'

export const Route = createFileRoute('/docs/features/scientific-notation')({
  component: ScientificNotation,
})

function ScientificNotation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Scientific Notation</h1>
      <p className="text-lg text-muted-foreground">
        Numora automatically expands scientific notation (e.g., "1.5e-7", "2e+5") to decimal
        notation. This expansion always happens and cannot be disabled.
      </p>

      <h2>Automatic Expansion</h2>
      <p>
        Scientific notation expansion is always enabled and happens automatically during
        sanitization:
      </p>

      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  maxDecimals={18}
  // Scientific notation is ALWAYS automatically expanded
/>`}
        language="tsx"
        config={{
          maxDecimals: 18,
        }}
        description="Try pasting '1.5e-7' or '2e+5' - they'll be automatically expanded"
      />

      <h2>Supported Formats</h2>
      <p>
        Numora supports standard scientific notation formats:
      </p>

      <ul>
        <li>
          <code>1.5e-7</code> - Negative exponent (small numbers)
        </li>
        <li>
          <code>2e+5</code> - Positive exponent (large numbers)
        </li>
        <li>
          <code>1.23e-4</code> - Decimal base with negative exponent
        </li>
        <li>
          <code>5e3</code> - Integer base with positive exponent
        </li>
        <li>
          <code>-1.5e-7</code> - Negative numbers
        </li>
      </ul>

      <h2>Examples</h2>

      <h3>Negative Exponents (Small Numbers)</h3>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 18,
})

// User pastes "1.5e-7"
// Automatically expands to "0.00000015"

// User pastes "2e-5"
// Automatically expands to "0.00002"

// User pastes "1.23e-4"
// Automatically expands to "0.000123"`}
      </CodeBlock>

      <h3>Positive Exponents (Large Numbers)</h3>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 18,
})

// User pastes "2e+5"
// Automatically expands to "200000"

// User pastes "1.5e3"
// Automatically expands to "1500"

// User pastes "5e6"
// Automatically expands to "5000000"`}
      </CodeBlock>

      <h3>Negative Numbers</h3>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  enableNegative: true,
  decimalMaxLength: 18,
})

// User pastes "-1.5e-7"
// Automatically expands to "-0.00000015"

// User pastes "-2e+5"
// Automatically expands to "-200000"`}
      </CodeBlock>

      <h2>How It Works</h2>
      <p>
        Scientific notation expansion happens during sanitization using string arithmetic:
      </p>

      <ol>
        <li>
          User enters or pastes a value with scientific notation (e.g., "1.5e-7")
        </li>
        <li>
          Numora detects the scientific notation pattern during sanitization
        </li>
        <li>
          The value is expanded using string arithmetic (no precision loss)
        </li>
        <li>
          The expanded value is then processed through the rest of the sanitization pipeline
        </li>
        <li>
          Finally, formatting is applied (if enabled)
        </li>
      </ol>

      <h2>String Arithmetic</h2>
      <p>
        Scientific notation expansion uses string manipulation to avoid floating-point precision
        issues:
      </p>

      <CodeBlock language="typescript">
{`// Numora uses string manipulation, not floating-point math
// "1.5e-7" expansion:
// 1. Base: "1.5", Exponent: -7
// 2. Move decimal point left by 7 positions
// 3. Result: "0.00000015" (accurate, no precision loss)

// "2e+5" expansion:
// 1. Base: "2", Exponent: 5
// 2. Move decimal point right by 5 positions
// 3. Result: "200000" (accurate)`}
      </CodeBlock>

      <h2>Precision Safety</h2>
      <p>
        Because Numora uses string arithmetic for expansion, there's no precision loss even with
        very small or very large numbers:
      </p>

      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 18,
})

// These are all handled accurately:
// "1.5e-18" → "0.0000000000000000015" (no precision loss
// "9.999999999999999e+20" → "999999999999999900000" (no precision loss)`}
      </CodeBlock>

      <h2>Important Notes</h2>
      <ul>
        <li>
          Scientific notation expansion is always enabled and cannot be disabled
        </li>
        <li>
          Expansion happens during sanitization, before formatting
        </li>
        <li>
          The expansion uses string arithmetic, ensuring no precision loss
        </li>
        <li>
          Both uppercase (E) and lowercase (e) exponents are supported
        </li>
        <li>
          The expanded value will be formatted according to your configuration
        </li>
      </ul>

      <h2>Complete Example</h2>
      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput
  maxDecimals={18}
  thousandSeparator=","
  formatOn="blur"
  onChange={(e) => {
    console.log('Value:', e.target.value)
  }}
/>`}
        language="tsx"
        config={{
          maxDecimals: 18,
          thousandSeparator: ',',
          formatOn: 'blur',
        }}
        description="Paste '1.5e-7' or '2e+5' to see automatic expansion"
      />
    </div>
  )
}
