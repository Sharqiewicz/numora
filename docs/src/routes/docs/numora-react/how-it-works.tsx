import { createFileRoute, Link } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora-react/how-it-works')({
  head: () => ({
    meta: [
      { title: 'How numora-react Works - React Numeric Input Pipeline Reference' },
      { name: 'description', content: 'Quick reference for numora-react\'s pipeline: event handlers, the seven-step sanitization order, formatting stages, and value output. For the full narrative, see the Anatomy page.' },
      { property: 'og:title', content: 'How numora-react Works - React Numeric Input Pipeline Reference' },
      { property: 'og:description', content: 'Quick reference for numora-react\'s pipeline: event handlers, sanitization, formatting, and value output.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react/how-it-works' },
      { name: 'twitter:title', content: 'How numora-react Works - React Numeric Input Pipeline Reference' },
      { name: 'twitter:description', content: 'Quick reference for numora-react\'s pipeline: event handlers, sanitization, formatting, value output.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/how-it-works' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([
        { "@context": "https://schema.org", "@type": "TechArticle", "headline": "How numora-react Works - React Numeric Input Pipeline Reference", "description": "Quick reference for numora-react's pipeline: event handlers, sanitization, formatting, and value output. The Anatomy page covers the same surface as a long-form narrative with diagrams and demos.", "url": "https://numeric-input.com/docs/numora-react/how-it-works", "author": { "@type": "Person", "name": "Kacper Szarkiewicz", "url": "https://x.com/sharqiewicz" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora React", "item": "https://numeric-input.com/docs/numora-react" }, { "@type": "ListItem", "position": 3, "name": "How It Works", "item": "https://numeric-input.com/docs/numora-react/how-it-works" }] }
      ]) },
    ],
  }),
  component: HowItWorks,
})

// Mirrors /docs/numora/how-it-works.tsx — keep the section structure aligned.
const ANATOMY = '/docs/numora-react/anatomy'

function HowItWorks() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>How It Works</h1>
      <p className="text-lg text-muted-foreground">
        A scannable reference for numora-react's event handlers, sanitization steps,
        formatting stages, and value output. For the long-form narrative with diagrams and
        demos, see{' '}
        <Link to={ANATOMY}>Anatomy of a Numeric Input</Link>.
      </p>

      <h2>React integration</h2>
      <p>
        <code>NumoraInput</code> is a <code>forwardRef</code> functional component that calls
        the core event handlers directly - no vanilla class is instantiated. Props map to
        core options, and <code>onChange</code> fires after every pipeline cycle with a
        synthetic event whose <code>target</code> exposes both the raw and formatted values.
      </p>

      <h2>Events</h2>
      <p>
        numora-react intercepts four input vectors on a single{' '}
        <code>&lt;input type="text"&gt;</code>. See{' '}
        <Link to={ANATOMY} hash="event-pipeline">Anatomy: event pipeline</Link>{' '}
        for the lifecycle and timing of each.
      </p>
      <ul>
        <li>
          <strong><Link to={ANATOMY} hash="keydown"><code>keydown</code></Link></strong>{' '}
          - skips the cursor over thousand separators on <kbd>Delete</kbd> /{' '}
          <kbd>Backspace</kbd>.
        </li>
        <li>
          <strong><Link to={ANATOMY} hash="before-input"><code>beforeinput</code></Link></strong>{' '}
          - primary formatting hook. Registered via native <code>addEventListener</code>{' '}
          (see{' '}
          <Link to={ANATOMY} hash="react-synthetic-bypass">why it bypasses React's synthetic system</Link>),
          calls <code>preventDefault()</code> and writes the formatted result via{' '}
          <code>setRangeText</code>, preserving the browser's undo stack.
        </li>
        <li>
          <strong><code>input</code></strong> - single <code>onChange</code> emitter;
          idempotent on values already produced by the pipeline.
        </li>
        <li>
          <strong><Link to={ANATOMY} hash="paste"><code>paste</code></Link></strong>{' '}
          - splices clipboard text into the selection range, runs the full pipeline,
          repositions the cursor.
        </li>
        <li>
          <strong><Link to={ANATOMY} hash="format-mode"><code>focus</code> / <code>blur</code></Link></strong>{' '}
          - strip / re-apply thousand separators in <code>FormatOn.Blur</code> mode (the
          React default).
        </li>
      </ul>

      <h2>Sanitization</h2>
      <p>
        Seven steps run in order on every value before formatting is applied. See{' '}
        <Link to={ANATOMY} hash="sanitization">Anatomy: sanitization</Link>{' '}
        for the visual pipeline and per-step demos.
      </p>
      <ol>
        <li>Mobile keyboard artifact filtering</li>
        <li>Thousand separator removal</li>
        <li>Compact notation expansion (opt-in via <code>enableCompactNotation</code>)</li>
        <li>Scientific notation expansion</li>
        <li>Non-numeric character removal</li>
        <li>Extra decimal separator removal</li>
        <li>Leading zero normalization (disable with <code>enableLeadingZeros</code>)</li>
      </ol>
      <p>
        Per-step configuration: see{' '}
        <Link to="/docs/numora-react/features/sanitization">features/sanitization</Link>.
      </p>

      <h2>Formatting</h2>
      <p>
        Four stages run after sanitization. See{' '}
        <Link to={ANATOMY} hash="grouping-styles">Anatomy: formatting</Link>{' '}
        for diagrams and demos.
      </p>
      <ol>
        <li>Decimal trimming to <code>decimalMaxLength</code></li>
        <li>Decimal padding to <code>decimalMinLength</code></li>
        <li>
          Thousand grouping (<code>FormatOn.Change</code> only; deferred to blur in{' '}
          <code>FormatOn.Blur</code>)
        </li>
        <li>Cursor restoration after the formatted value replaces <code>input.value</code></li>
      </ol>

      <h2>Value output</h2>
      <p>
        Every value is emitted as a string on a single <code>onChange</code> event, with both
        representations exposed on <code>e.target</code>. See{' '}
        <Link to={ANATOMY} hash="raw-vs-formatted">Anatomy: raw vs formatted</Link>{' '}
        for the mental model, and{' '}
        <Link to={ANATOMY} hash="proxy-target">Anatomy: the Proxy on e.target</Link>{' '}
        for how both values reach you from the same event.
      </p>
      <ul>
        <li>
          <strong>raw</strong> - the sanitized string without separators; always returned as{' '}
          <code>e.target.value</code>. Safe to pass directly to form libraries.
        </li>
        <li>
          <strong>formatted</strong> - the display string with thousand separators; written
          to <code>input.value</code> and available as <code>e.target.formattedValue</code>{' '}
          via <code>NumoraHTMLInputElement</code>.
        </li>
      </ul>

      <h2>Full pipeline</h2>
      {/*
        React-only block. The React event flow has a step the vanilla flow doesn't —
        native addEventListener('beforeinput') bypassing React's synthetic system —
        which is awkward to convey through bullets alone. Vanilla how-it-works deliberately
        does not have an equivalent diagram.
      */}
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
    │                      strips separators → raw value
    │                      fires onChange (e.target.value = raw)
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
    │         → input.value                     → e.target.value (onChange)
    │         → e.target.formattedValue
    │
    └─ blur ─────────────── formatValueForDisplay (FormatOn.Blur only)
                            → input.value`}
      </CodeBlock>
    </div>
  )
}
