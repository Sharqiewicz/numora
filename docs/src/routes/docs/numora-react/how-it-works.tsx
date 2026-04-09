import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora-react/how-it-works')({
  head: () => ({
    meta: [
      { title: 'How It Works - numora-react | React Numeric Input' },
      { name: 'description', content: 'Understand the internal pipeline of numora-react: event interception, sanitization, formatting, and value emission on every keystroke, paste, and blur.' },
      { property: 'og:title', content: 'How It Works - numora-react | React Numeric Input' },
      { property: 'og:description', content: 'Understand the internal pipeline of numora-react: event interception, sanitization, formatting, and value emission on every keystroke, paste, and blur.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora-react/how-it-works' },
      { name: 'twitter:title', content: 'How It Works - numora-react | React Numeric Input' },
      { name: 'twitter:description', content: 'Understand the internal pipeline of numora-react: event interception, sanitization, formatting, and value emission.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numora.xyz/docs/numora-react/how-it-works' },
    ],
  }),
  component: HowItWorks,
})

function HowItWorks() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>How It Works</h1>
      <p className="text-lg text-muted-foreground">
        <code>NumoraInput</code> renders a <code>type="text"</code> input and intercepts all
        three input vectors - keyboard, paste, and focus/blur - to run every value through a
        consistent sanitize → format → emit pipeline before any change reaches your React state.
      </p>

      <h2>React integration</h2>
      <p>
        <code>numora-react</code> is a functional React component that calls the same core
        handler functions as the vanilla library directly - no class is instantiated or
        destroyed. Props map to core options, and the React <code>onChange</code> event fires
        after every pipeline cycle with the same event object shape you expect from a regular{' '}
        <code>input</code>.
      </p>
      <CodeBlock language="tsx">
{`import { NumoraInput } from 'numora-react'

function App() {
  return (
    <NumoraInput
      maxDecimals={2}
      thousandSeparator=","
      onChange={(e) => {
        console.log(e.target.value) // always "1,234.56" - the formatted display string
      }}
    />
  )
}`}
      </CodeBlock>

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
      <CodeBlock language="typescript">
{`// thousand separator skip - handled transparently
// user presses Backspace on "1,234" → cursor jumps over the comma
// result: "1234" after the next input event`}
      </CodeBlock>

      <h3>beforeinput</h3>
      <p>
        <code>beforeinput</code> is the primary formatting hook, registered via native{' '}
        <code>addEventListener</code> directly on the element — not through React's synthetic
        event system. React delegates events from the root, which means{' '}
        <code>preventDefault()</code> would be a no-op by the time it runs; a native listener
        fires synchronously at the element, before the browser commits the mutation.
      </p>
      <p>
        The handler calls <code>e.preventDefault()</code>, computes the intended value, runs
        the full sanitize → format pipeline, and writes the result via{' '}
        <code>setRangeText</code> — which preserves the browser's undo/redo stack. This fires
        a synchronous <code>input</code> event, which React catches as <code>onChange</code>.
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
          not intercepted; the browser handles these natively.
        </li>
        <li>
          <strong>Paste/drop</strong> — deferred to the dedicated <code>paste</code> handler.
        </li>
      </ul>

      <h3>input / onChange</h3>
      <p>
        The synchronous <code>input</code> event fired by <code>setRangeText</code> inside{' '}
        <code>beforeinput</code> is caught by React as <code>onChange</code>.{' '}
        <code>handleChange</code> is a pure emitter — it reads the already-formatted value
        from the DOM, strips thousand separators to compute <code>rawValue</code>, and fires
        the <code>onChange</code> and <code>onRawValueChange</code> callbacks. It does not
        reformat. The same handler fires for paste (via synthetic event) and undo/redo (via
        native browser event).
      </p>
      <CodeBlock language="tsx">
{`<NumoraInput
  maxDecimals={2}
  thousandSeparator=","
  onChange={(e) => {
    // fires after every sanitize + format cycle
    console.log(e.target.value) // e.g. "1,234.56"
  }}
/>`}
      </CodeBlock>

      <h3>paste</h3>
      <p>
        The default browser paste is prevented. The clipboard text is spliced into the current
        value at the active selection range (replacing any selected text), then the combined
        string passes through the full sanitize → format pipeline. The new cursor position is
        calculated from how many characters formatting added or removed relative to the paste
        point.
      </p>
      <CodeBlock language="typescript">
{`// pasting " 1,234.56.78abc" into an empty input
// → after splice + sanitize + format → "1,234.5678" (if maxDecimals allows)
// invalid characters, extra separators, and whitespace are stripped automatically`}
      </CodeBlock>

      <h3>focus / blur</h3>
      <p>
        The default <code>formatOn</code> is <code>"blur"</code>: thousand separators are
        stripped on <code>focus</code> so the user edits a clean number (e.g. <code>1234.56</code>),
        then re-applied on <code>blur</code> for display (e.g. <code>1,234.56</code>).
        In <code>"change"</code> mode formatting is applied live on every keystroke and
        focus/blur do not alter the value.
      </p>
      <CodeBlock language="tsx">
{`// default: formatOn="blur"
<NumoraInput
  maxDecimals={2}
  thousandSeparator=","
  formatOn="blur" // strip separators on focus, re-apply on blur
/>

// live formatting on every keystroke:
<NumoraInput formatOn="change" thousandSeparator="," maxDecimals={2} />`}
      </CodeBlock>

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
          Opt-in via <code>enableCompactNotation</code>.
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
          <code>"7"</code>. Disable with <code>enableLeadingZeros</code>.
        </li>
      </ol>

      <h2>The formatting step</h2>
      <p>
        After sanitization, two length adjustments run before visual formatting:
      </p>
      <ul>
        <li>
          <strong>trimToDecimalMaxLength</strong> - truncates the decimal portion to{' '}
          <code>maxDecimals</code> digits.
        </li>
        <li>
          <strong>ensureMinDecimals</strong> - zero-pads the decimal portion up to{' '}
          <code>minDecimals</code> digits.
        </li>
      </ul>
      <p>
        <code>formatNumoraInput</code> then applies thousand grouping in the configured style:
      </p>
      <CodeBlock language="tsx">
{`// thousandStyle="thousand"  →  1,234,567  (Western, default)
// thousandStyle="lakh"      →  12,34,567  (South Asian)
// thousandStyle="wan"       →  123,4567   (East Asian)

<NumoraInput
  thousandSeparator=","
  thousandStyle="thousand"
  maxDecimals={2}
/>`}
      </CodeBlock>

      <h2>Value output</h2>
      <p>
        The pipeline produces two representations of the value:
      </p>
      <ul>
        <li>
          <strong>formatted</strong> - the display string including thousand separators.
          Always written to the DOM input and always available as <code>e.target.value</code>{' '}
          in <code>onChange</code>.
        </li>
        <li>
          <strong>raw</strong> - the value after sanitization but before thousand grouping
          (e.g. <code>"1234.56"</code>). Available as <code>e.target.rawValue</code> and via
          the <code>onRawValueChange</code> callback.
        </li>
      </ul>
      <CodeBlock language="tsx">
{`<NumoraInput
  maxDecimals={2}
  thousandSeparator=","
  onChange={(e) => {
    console.log(e.target.value)    // always "1,234.56" - the formatted display string
    console.log(e.target.rawValue) // "1234.56" - no thousand separators
  }}
  onRawValueChange={(raw) => {
    console.log(raw) // "1234.56" - convenient shorthand for the raw value
  }}
/>`}
      </CodeBlock>

      <h2>Full pipeline diagram</h2>
      <CodeBlock language="text">
{`user action
    │
    ├─ keydown ──────────── skip cursor over thousand separator (Delete/Backspace only)
    │
    ├─ beforeinput ─────── decimal separator handling        [native addEventListener]
    │                      character insertion / deletion     (primary path)
    │                      e.preventDefault() + setRangeText
    │                      ↓ fires synchronous 'input' → React onChange (handleChange)
    │
    ├─ paste ────────────── splice clipboard into selection    (dedicated handler)
    │                      sanitize + format + cursor reposition
    │                      ↓ synthetic ChangeEvent → onChange directly
    │
    ├─ input / onChange ─── pure emitter                      (handleChange)
    │                      reads already-formatted value from DOM
    │                      strips separators → rawValue
    │                      fires onChange + onRawValueChange
    │                      (also fires for undo/redo via native browser input event)
    │
    │   (beforeinput pipeline produces:)
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
    │                ┌─────┴──────────────────────┐
    │                ▼                             ▼
    │           formatted                         raw
    │         → input.value                     → e.target.rawValue
    │         → e.target.value (onChange)        → onRawValueChange
    │
    └─ blur ─────────────── formatValueForDisplay (FormatOn.Blur only)
                            → input.value`}
      </CodeBlock>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numora.xyz" },
          { "@type": "ListItem", "position": 2, "name": "Numora React", "item": "https://numora.xyz/docs/numora-react" },
          { "@type": "ListItem", "position": 3, "name": "How It Works", "item": "https://numora.xyz/docs/numora-react/how-it-works" }
        ]
      }) }} />
    </div>
  )
}
