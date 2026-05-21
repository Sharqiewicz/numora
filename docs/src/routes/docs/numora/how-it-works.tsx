import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/docs/numora/how-it-works')({
  head: () => ({
    meta: [
      { title: 'How Numora Works - Numeric Input Pipeline Reference' },
      { name: 'description', content: 'Quick reference for numora\'s pipeline: event handlers, the seven-step sanitization order, formatting stages, and value output. For the full narrative, see the Anatomy page.' },
      { property: 'og:title', content: 'How Numora Works - Numeric Input Pipeline Reference' },
      { property: 'og:description', content: 'Quick reference for numora\'s pipeline: event handlers, the seven-step sanitization order, formatting stages, and value output.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/how-it-works' },
      { name: 'twitter:title', content: 'How Numora Works - Numeric Input Pipeline Reference' },
      { name: 'twitter:description', content: 'Quick reference for numora\'s pipeline: event handlers, sanitization steps, formatting stages, value output.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/how-it-works' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([
        { "@context": "https://schema.org", "@type": "TechArticle", "headline": "How Numora Works - Numeric Input Pipeline Reference", "description": "Quick reference for numora's pipeline: event handlers, sanitization, formatting, and value output. The Anatomy page covers the same surface as a long-form narrative with diagrams.", "url": "https://numeric-input.com/docs/numora/how-it-works", "author": { "@type": "Person", "name": "Kacper Szarkiewicz", "url": "https://x.com/sharqiewicz" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora JS", "item": "https://numeric-input.com/docs/numora" }, { "@type": "ListItem", "position": 3, "name": "How It Works", "item": "https://numeric-input.com/docs/numora/how-it-works" }] }
      ]) },
    ],
  }),
  component: HowItWorks,
})

// Mirrors /docs/numora-react/how-it-works.tsx — keep the section structure aligned.
const ANATOMY = '/docs/numora/anatomy'

function HowItWorks() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>How It Works</h1>
      <p className="text-lg text-muted-foreground">
        A scannable reference for Numora's event handlers, sanitization steps, formatting
        stages, and value output. For the long-form narrative with diagrams and demos,
        see <Link to={ANATOMY}>Anatomy of a Numeric Input</Link>.
      </p>

      <h2>Events</h2>
      <p>
        Numora intercepts four input vectors on a single{' '}
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
          - primary formatting hook. Calls <code>preventDefault()</code> and writes the
          formatted result via <code>setRangeText</code>, preserving the browser's undo
          stack.
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
          - strip / re-apply thousand separators in <code>FormatOn.Blur</code> mode only.
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
        <Link to="/docs/numora/features/sanitization">features/sanitization</Link>,{' '}
        <Link to="/docs/numora/features/compact-notation">features/compact-notation</Link>,{' '}
        <Link to="/docs/numora/features/scientific-notation">features/scientific-notation</Link>,{' '}
        <Link to="/docs/numora/features/leading-zeros">features/leading-zeros</Link>.
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
      <p>
        Per-stage configuration: see{' '}
        <Link to="/docs/numora/features/formatting">features/formatting</Link>,{' '}
        <Link to="/docs/numora/features/decimals">features/decimals</Link>.
      </p>

      <h2>Value output</h2>
      <p>
        Every value is emitted as a string. See{' '}
        <Link to={ANATOMY} hash="raw-vs-formatted">Anatomy: raw vs formatted</Link>{' '}
        for the mental model;{' '}
        <Link to="/docs/numora/features/value-types">features/value-types</Link> for the
        configuration and the <code>valueAsNumber</code> escape hatch.
      </p>
      <ul>
        <li>
          <strong>formatted</strong> - the display string with thousand separators; always
          written to <code>input.value</code>.
        </li>
        <li>
          <strong>raw</strong> - the sanitized string without separators; emitted via{' '}
          <code>onChange</code> when <code>rawValueMode: true</code>.
        </li>
      </ul>
    </div>
  )
}
