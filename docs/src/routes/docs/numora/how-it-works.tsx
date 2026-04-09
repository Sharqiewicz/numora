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
    links: [
      { rel: 'canonical', href: 'https://numora.xyz/docs/numora/how-it-works' },
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
        <code>keydown</code> handles one special case before any DOM mutation occurs:
      </p>
      <ul>
        <li>
          Skips the cursor over thousand separators on <kbd>Delete</kbd> / <kbd>Backspace</kbd>{' '}
          so the user never has to manually navigate past a formatting character.
        </li>
      </ul>

      <h3>beforeinput</h3>
      <p>
        <code>beforeinput</code> is the primary formatting hook. It fires after the browser has
        resolved what the input <em>will</em> be, but before the DOM is mutated — making it the
        correct place to intercept and reformat. Numora calls{' '}
        <code>e.preventDefault()</code> to suppress the native mutation, computes the intended
        value, runs the full sanitize → format pipeline, then writes the result via{' '}
        <code>setRangeText</code> (which preserves the browser's undo/redo stack).
      </p>
      <p>The handler covers:</p>
      <ul>
        <li>
          <strong>Decimal separator key</strong> — converts <code>,</code> or <code>.</code> to
          the configured separator; blocks a second decimal if one already exists.
        </li>
        <li>
          <strong>Character insertion</strong> (<code>insertText</code>) — inserts at cursor,
          formats the result.
        </li>
        <li>
          <strong>Deletions</strong> (<code>deleteContentBackward</code>,{' '}
          <code>deleteContentForward</code>, <code>deleteByCut</code>,{' '}
          <code>deleteByDrag</code>) — removes the correct range, formats the result.
        </li>
        <li>
          <strong>Undo/redo</strong> (<code>historyUndo</code>, <code>historyRedo</code>) —
          not intercepted; the browser handles these natively against its own undo stack.
        </li>
        <li>
          <strong>Paste/drop</strong> — deferred to the dedicated <code>paste</code> handler.
        </li>
      </ul>

      <h3>input</h3>
      <p>
        <code>handleChange</code> is the single place <code>onChange</code> is emitted — it
        always runs the full sanitize → format pipeline via{' '}
        <code>handleOnChangeNumoraInput</code>. Three paths lead here:
      </p>
      <ul>
        <li>
          <strong>After <code>beforeinput</code></strong> — <code>setRangeText</code> fires a
          synchronous <code>input</code> event in real browsers (jsdom skips this; tests
          dispatch it manually). <code>formatInputValue</code> is idempotent on the
          already-formatted value so the pipeline is a no-op and <code>onChange</code> is
          emitted.
        </li>
        <li>
          <strong>After paste</strong> — <code>handlePaste</code> sets the value directly
          then dispatches a synthetic <code>input</code> event. Same idempotent run.
        </li>
        <li>
          <strong>Undo/redo and programmatic changes</strong> — the browser (or external
          code) sets the value and fires <code>input</code>; the pipeline formats the new
          value and emits <code>onChange</code>.
        </li>
      </ul>

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
    ├─ keydown ──────────── skip cursor over thousand separator (Delete/Backspace only)
    │
    ├─ beforeinput ─────── decimal separator handling          (primary path)
    │                      character insertion / deletion
    │                      e.preventDefault() + setRangeText
    │                      ↓ fires synchronous 'input' (real browsers)
    │                        or dispatched manually in tests (jsdom gap)
    │
    ├─ paste ────────────── splice clipboard into selection    (dedicated handler)
    │                      sanitize + format + cursor reposition
    │                      ↓ dispatches synthetic 'input'
    │
    ├─ input ────────────── always runs full pipeline          (single onChange emitter)
    │   (handleChange)     covers all paths above + undo/redo + programmatic changes
    │                      formatInputValue is idempotent: no-op when already formatted
    │                      ▼
    │             trimToDecimalMaxLength
    │                      │
    │                      ▼
    │                ensureMinDecimals
    │                      │
    │                      ▼
    │            formatNumoraInput (thousand grouping)
    │            [FormatOn.Change only; skipped in FormatOn.Blur]
    │                      │
    │                ┌─────┴──────┐
    │                ▼            ▼
    │           formatted        raw
    │         → input.value   → onChange (if rawValueMode)
    │
    └─ blur ─────────────── formatValueForDisplay (FormatOn.Blur only)
                            → input.value`}
      </CodeBlock>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numora.xyz" },
          { "@type": "ListItem", "position": 2, "name": "Numora JS", "item": "https://numora.xyz/docs/numora" },
          { "@type": "ListItem", "position": 3, "name": "How It Works", "item": "https://numora.xyz/docs/numora/how-it-works" }
        ]
      }) }} />
    </div>
  )
}
