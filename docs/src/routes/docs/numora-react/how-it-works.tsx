import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora-react/how-it-works')({
  head: () => ({
    meta: [
      { title: 'How numora-react Works - React Numeric Input Pipeline Reference' },
      {
        name: 'description',
        content:
          "Quick reference for numora-react's pipeline: event handlers, the seven-step sanitization order, formatting stages, and value output. For the full narrative, see the Anatomy page.",
      },
      {
        property: 'og:title',
        content: 'How numora-react Works - React Numeric Input Pipeline Reference',
      },
      {
        property: 'og:description',
        content:
          "Quick reference for numora-react's pipeline: event handlers, sanitization, formatting, and value output.",
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react/how-it-works' },
      {
        name: 'twitter:title',
        content: 'How numora-react Works - React Numeric Input Pipeline Reference',
      },
      {
        name: 'twitter:description',
        content:
          "Quick reference for numora-react's pipeline: event handlers, sanitization, formatting, value output.",
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/how-it-works' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'How numora-react Works - React Numeric Input Pipeline Reference',
            description:
              "Quick reference for numora-react's pipeline: event handlers, sanitization, formatting, and value output. The Anatomy page covers the same surface as a long-form narrative with diagrams and demos.",
            url: 'https://numeric-input.com/docs/numora-react/how-it-works',
            author: {
              '@type': 'Person',
              name: 'Kacper Szarkiewicz',
              url: 'https://x.com/sharqiewicz',
            },
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://numeric-input.com' },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Numora React',
                item: 'https://numeric-input.com/docs/numora-react',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'How It Works',
                item: 'https://numeric-input.com/docs/numora-react/how-it-works',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: HowItWorks,
});

// Mirrors /docs/numora/how-it-works.tsx - keep the section structure aligned.
const ANATOMY = '/docs/numora-react/anatomy';

function HowItWorks() {
  return (
    <div className="prose prose-invert max-w-xl">
      <h1 className="text-foreground">How It Works</h1>
      <p className="text-muted-foreground text-base leading-6">
        A scannable reference for numora-react's event handlers, sanitization steps, formatting
        stages, and value output. For the long-form narrative with diagrams and demos, see{' '}
        <Link to={ANATOMY} className="underline link-underline hover:text-foreground transition-colors">Anatomy of a Numeric Input</Link>.
      </p>

      <h2 className="text-foreground text-2xl">React integration</h2>
      <p className="text-muted-foreground text-base leading-6">
        <code>NumoraInput</code> is a <code>forwardRef</code> functional component that calls the
        core event handlers directly - no vanilla class is instantiated. Props map to core options,
        and <code>onChange</code> fires after every pipeline cycle with a synthetic event whose{' '}
        <code>target</code> exposes both the raw and formatted values.
      </p>

      <h2 className="text-foreground text-2xl">Events</h2>
      <p className="text-muted-foreground text-base leading-6">
        numora-react intercepts four input vectors on a single{' '}
        <code>&lt;input type="text"&gt;</code>. See{' '}
        <Link to={ANATOMY} hash="event-pipeline" className="underline link-underline hover:text-foreground transition-colors">
          Anatomy: event pipeline
        </Link>{' '}
        for the lifecycle and timing of each.
      </p>
      <ul>
        <li>
          <strong>
            <Link to={ANATOMY} hash="keydown" className="underline link-underline hover:text-foreground transition-colors">
              <code>keydown</code>
            </Link>
          </strong>{' '}
          - skips the cursor over thousand separators on <kbd>Delete</kbd> / <kbd>Backspace</kbd>.
        </li>
        <li>
          <strong>
            <Link to={ANATOMY} hash="before-input" className="underline link-underline hover:text-foreground transition-colors">
              <code>beforeinput</code>
            </Link>
          </strong>{' '}
          - primary formatting hook. Registered via native <code>addEventListener</code> (see{' '}
          <Link to={ANATOMY} hash="react-synthetic-bypass" className="underline link-underline hover:text-foreground transition-colors">
            why it bypasses React's synthetic system
          </Link>
          ), calls <code>preventDefault()</code> and writes the formatted result via{' '}
          <code>setRangeText</code>, preserving the browser's undo stack.
        </li>
        <li>
          <strong>
            <code>input</code>
          </strong>{' '}
          - single <code>onChange</code> emitter; idempotent on values already produced by the
          pipeline.
        </li>
        <li>
          <strong>
            <Link to={ANATOMY} hash="paste" className="underline link-underline hover:text-foreground transition-colors">
              <code>paste</code>
            </Link>
          </strong>{' '}
          - splices clipboard text into the selection range, runs the full pipeline, repositions the
          cursor.
        </li>
        <li>
          <strong>
            <Link to={ANATOMY} hash="format-mode" className="underline link-underline hover:text-foreground transition-colors">
              <code>focus</code> / <code>blur</code>
            </Link>
          </strong>{' '}
          - strip / re-apply thousand separators in <code>FormatOn.Blur</code> mode (the React
          default).
        </li>
      </ul>

      <h2 className="text-foreground text-2xl">Sanitization</h2>
      <p className="text-muted-foreground text-base leading-6">
        Seven steps run in order on every value before formatting is applied. See{' '}
        <Link to={ANATOMY} hash="sanitization" className="underline link-underline hover:text-foreground transition-colors">
          Anatomy: sanitization
        </Link>{' '}
        for the visual pipeline and per-step demos.
      </p>
      <ol>
        <li>Mobile keyboard artifact filtering</li>
        <li>Thousand separator removal</li>
        <li>
          Compact notation expansion (opt-in via <code>enableCompactNotation</code>)
        </li>
        <li>Scientific notation expansion</li>
        <li>Non-numeric character removal</li>
        <li>Extra decimal separator removal</li>
        <li>
          Leading zero normalization (disable with <code>enableLeadingZeros</code>)
        </li>
      </ol>
      <p className="text-muted-foreground text-base leading-6">
        Per-step configuration: see{' '}
        <Link to="/docs/numora-react/features/sanitization" className="underline link-underline hover:text-foreground transition-colors">features/sanitization</Link>.
      </p>

      <h2 className="text-foreground text-2xl">Formatting</h2>
      <p className="text-muted-foreground text-base leading-6">
        Four stages run after sanitization. See{' '}
        <Link to={ANATOMY} hash="grouping-styles" className="underline link-underline hover:text-foreground transition-colors">
          Anatomy: formatting
        </Link>{' '}
        for diagrams and demos.
      </p>
      <ol>
        <li>
          Decimal trimming to <code>maxDecimals</code> (every keystroke)
        </li>
        <li>
          Decimal padding to <code>decimalMinLength</code> - display/blur only, never on a
          keystroke, so a padded field can still receive further digits by typing
        </li>
        <li>
          Thousand grouping (<code>FormatOn.Change</code> only; deferred to blur in{' '}
          <code>FormatOn.Blur</code>)
        </li>
        <li>
          Cursor restoration after the formatted value replaces <code>input.value</code>
        </li>
      </ol>

      <h2 className="text-foreground text-2xl">Value output</h2>
      <p className="text-muted-foreground text-base leading-6">
        Every value is emitted as a string on a single <code>onChange</code> event, with both
        representations exposed on <code>e.target</code>. See{' '}
        <Link to={ANATOMY} hash="raw-vs-formatted" className="underline link-underline hover:text-foreground transition-colors">
          Anatomy: raw vs formatted
        </Link>{' '}
        for the mental model, and{' '}
        <Link to={ANATOMY} hash="proxy-target" className="underline link-underline hover:text-foreground transition-colors">
          Anatomy: the Proxy on e.target
        </Link>{' '}
        for how both values reach you from the same event.
      </p>
      <ul>
        <li>
          <strong>raw</strong> - the sanitized string without separators; always returned as{' '}
          <code>e.target.value</code>. Safe to pass directly to form libraries.
        </li>
        <li>
          <strong>formatted</strong> - the display string with thousand separators; written to{' '}
          <code>input.value</code> and available as <code>e.target.formattedValue</code> via{' '}
          <code>NumoraHTMLInputElement</code>.
        </li>
      </ul>

      <h2 className="text-foreground text-2xl">Value format</h2>
      <p className="text-muted-foreground text-base leading-6">
        A string <code>value</code> / <code>defaultValue</code> is already in the field's{' '}
        <em>display</em> format - locale separators allowed, grouping optional - since that is what
        every existing caller passes and <code>formatValueForDisplay</code> already strips grouping.
        A JS <code>number</code> can only be dot-decimal, so numora-react converts a numeric{' '}
        <code>value</code> / <code>defaultValue</code> to the configured decimal separator before
        formatting it, instead of passing the dot through unchanged.
      </p>
      <p className="text-muted-foreground text-base leading-6">
        Example: under <code>locale="de-DE"</code> ('.' groups, ',' is the decimal mark),{' '}
        <code>{'<NumoraInput locale="de-DE" value={1234.5} />'}</code> displays{' '}
        <code>"1.234,5"</code>. Passing the raw string <code>{'value="1234.5"'}</code> instead
        displays <code>"12.345"</code> - the dot is read as de-DE's thousand separator and stripped,
        concatenating the digits.
      </p>

      <h2 className="text-foreground text-2xl">Full pipeline</h2>
      {/*
        React-only block. The React event flow has a step the vanilla flow doesn't -
        native addEventListener('beforeinput') bypassing React's synthetic system -
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
    │                      ↓ onChange called directly (setRangeText does not
    │                        synchronously dispatch 'input' in current browsers/jsdom)
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
    │            formatNumoraInput (thousand grouping)
    │            [FormatOn.Change only; skipped in FormatOn.Blur]
    │                      │
    │                ┌─────┴──────────────────────┐
    │                ▼                             ▼
    │           formatted                         raw
    │         → input.value                     → e.target.value (onChange)
    │         → e.target.formattedValue
    │
    │   ensureMinDecimals (decimalMinLength padding) never runs here - it's a
    │   display/blur-only concern (see the blur branch below), so a padded field
    │   can still receive further digits by typing.
    │
    └─ blur ─────────────── formatValueForDisplay
                            [FormatOn.Blur, or decimalMinLength > 0]
                            → input.value`}
      </CodeBlock>
    </div>
  );
}
