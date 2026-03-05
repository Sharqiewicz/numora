import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/how-it-works')({
  head: () => ({
    meta: [
      { title: 'How It Works - Numora Core | JavaScript Numeric Input' },
      { name: 'description', content: 'Understand the internal pipeline of numora: event interception, sanitization, formatting, and value emission on every keystroke, paste, and blur.' },
      { property: 'og:title', content: 'How It Works - Numora Core | JavaScript Numeric Input' },
      { property: 'og:description', content: 'Understand the internal pipeline of numora: event interception, sanitization, formatting, and value emission on every keystroke, paste, and blur.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora/how-it-works' },
      { name: 'twitter:title', content: 'How It Works - Numora Core | JavaScript Numeric Input' },
      { name: 'twitter:description', content: 'Understand the internal pipeline of numora: event interception, sanitization, formatting, and value emission.' },
    ],
  }),
  component: HowItWorks,
})

function HowItWorks() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>How It Works</h1>
      <p className="text-lg text-muted-foreground">
        Numora wraps a <code>type="text"</code> input and intercepts all three input vectors -
        keyboard, paste, and focus/blur - to run every value through a consistent
        sanitize → format → emit pipeline before any change reaches your code.
      </p>

      <h2>Event lifecycle</h2>

      <h3>keydown</h3>
      <p>
        Before the DOM mutation occurs, <code>keydown</code> handles two special cases and
        captures the current caret position so the input handler can restore it after formatting:
      </p>
      <ul>
        <li>Blocks a second decimal separator from being typed (only one is ever allowed).</li>
        <li>
          Skips the cursor over thousand separators on <kbd>Delete</kbd> / <kbd>Backspace</kbd>{' '}
          so the user never has to manually navigate past a formatting character.
        </li>
      </ul>

      <h3>input</h3>
      <p>
        Every keystroke that produces a character fires the <code>input</code> event.
        Numora captures the pre-mutation cursor position, runs the full sanitize → format
        pipeline on the new raw value, writes the formatted result back to{' '}
        <code>input.value</code>, then restores the cursor to the correct position
        accounting for any characters added or removed by formatting.
      </p>

      <h3>paste</h3>
      <p>
        Numora prevents the default browser paste, reads the clipboard text, splices it into
        the current value at the active selection range (replacing any selected characters),
        then passes the result through the same sanitize → format pipeline. The new cursor
        position is calculated based on how many characters formatting added or removed
        relative to the paste point.
      </p>

      <h3>focus / blur</h3>
      <p>
        When <code>formatOn</code> is set to <code>"blur"</code>, thousand separators are
        stripped on <code>focus</code> so the user edits a clean number (e.g. <code>1234.56</code>),
        then <code>blur</code> calls <code>formatValueForDisplay</code> to re-apply thousand
        grouping for display (e.g. <code>1,234.56</code>).
        In <code>"change"</code> mode (the default) formatting is applied live on every
        input event; <code>blur</code> does not alter the value in this mode.
      </p>

      <h2>The sanitization pipeline</h2>
      <p>
        <code>sanitizeNumoraInput</code> runs seven steps in order on every value before
        formatting is applied:
      </p>
      <ol>
        <li>
          <strong>Mobile keyboard artifact filtering</strong> - removes non-breaking spaces
          (U+00A0) and other Unicode whitespace variants inserted by mobile keyboards.
        </li>
        <li>
          <strong>Thousand separator removal</strong> - strips any existing thousand
          separators so the pipeline always works on a plain numeric string.
        </li>
        <li>
          <strong>Compact notation expansion</strong> - expands shorthand like{' '}
          <code>"1k"</code> → <code>"1000"</code> or <code>"2.5M"</code> → <code>"2500000"</code>.
          Opt-in via <code>enableCompactNotation: true</code>.
        </li>
        <li>
          <strong>Scientific notation expansion</strong> - always active; expands{' '}
          <code>"1.5e-7"</code> → <code>"0.00000015"</code>.
        </li>
        <li>
          <strong>Non-numeric character removal</strong> - keeps only digits, the configured
          decimal separator, and (if <code>enableNegative</code> is true) a leading{' '}
          <code>-</code>. Everything else is discarded.
        </li>
        <li>
          <strong>Extra decimal separator removal</strong> - if more than one decimal
          separator survives the previous step, only the first one is kept.
        </li>
        <li>
          <strong>Leading zero normalization</strong> - <code>"007"</code> becomes{' '}
          <code>"7"</code>. Disable with <code>enableLeadingZeros: true</code>.
        </li>
      </ol>

      <h2>The formatting step</h2>
      <p>
        After sanitization, two length adjustments run before visual formatting:
      </p>
      <ul>
        <li>
          <strong>trimToDecimalMaxLength</strong> - truncates the decimal portion to{' '}
          <code>decimalMaxLength</code> digits.
        </li>
        <li>
          <strong>ensureMinDecimals</strong> - zero-pads the decimal portion up to{' '}
          <code>decimalMinLength</code> digits.
        </li>
      </ul>
      <p>
        <code>formatNumoraInput</code> then applies thousand grouping in the configured style
        (only when <code>formatOn='change'</code>; in <code>FormatOn.Blur</code> mode this
        step is deferred to the blur handler). Finally, <code>updateCursorPosition</code>{' '}
        restores the caret to the correct position after the formatted value is written back
        to <code>input.value</code>.
      </p>
      <CodeBlock language="typescript">
{`import { NumoraInput, ThousandStyle } from 'numora'

// ThousandStyle.Thousand  →  1,234,567  (Western)
// ThousandStyle.Lakh      →  12,34,567  (South Asian)
// ThousandStyle.Wan       →  123,4567   (East Asian)

const numoraInput = new NumoraInput(container, {
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
  decimalMaxLength: 2,
})`}
      </CodeBlock>

      <h2>Value output</h2>
      <p>
        The pipeline produces two representations of the value:
      </p>
      <ul>
        <li>
          <strong>formatted</strong> - the display string including thousand separators.
          This is always written to <code>input.value</code>.
        </li>
        <li>
          <strong>raw</strong> - the value after sanitization but before thousand grouping
          (e.g. <code>"1234.56"</code>). Emitted via <code>onChange</code> when{' '}
          <code>rawValueMode: true</code>; otherwise <code>onChange</code> receives the
          formatted value.
        </li>
      </ul>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  thousandSeparator: ',',
  rawValueMode: true, // onChange receives "1234.56" instead of "1,234.56"
  onChange: (value) => {
    console.log(value)             // "1234.56"
    console.log(numoraInput.value) // "1,234.56" (always formatted)
  },
})`}
      </CodeBlock>

      <h2>Full pipeline diagram</h2>
      <CodeBlock language="text">
{`user action
    │
    ├─ keydown ──────────── block duplicate decimal / skip over thousand separator
    │
    ├─ input  ──┐
    │            ├─ sanitize (7 steps)
    ├─ paste  ──┘        │
                         ▼
                  trimToDecimalMaxLength
                         │
                         ▼
                   ensureMinDecimals
                         │
                         ▼
               formatNumoraInput (thousand grouping)
               [FormatOn.Change only; skipped on input/paste in FormatOn.Blur]
                         │
                   ┌─────┴──────┐
                   ▼            ▼
              formatted        raw
            → input.value   → onChange (if rawValueMode)
                         │
                         ▼
               updateCursorPosition

    └─ blur ─── formatValueForDisplay (FormatOn.Blur only)
                → input.value`}
      </CodeBlock>
    </div>
  )
}
