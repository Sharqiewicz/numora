import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/docs/numora/how-it-works')({
  head: () => ({
    meta: [
      { title: 'How Numora Works - Numeric Input Pipeline Reference' },
      {
        name: 'description',
        content:
          "Quick reference for numora's pipeline: event handlers, the seven-step sanitization order, formatting stages, and value output. For the full narrative, see the Anatomy page.",
      },
      { property: 'og:title', content: 'How Numora Works - Numeric Input Pipeline Reference' },
      {
        property: 'og:description',
        content:
          "Quick reference for numora's pipeline: event handlers, the seven-step sanitization order, formatting stages, and value output.",
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/how-it-works' },
      { name: 'twitter:title', content: 'How Numora Works - Numeric Input Pipeline Reference' },
      {
        name: 'twitter:description',
        content:
          "Quick reference for numora's pipeline: event handlers, sanitization steps, formatting stages, value output.",
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora/how-it-works' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'How Numora Works - Numeric Input Pipeline Reference',
            description:
              "Quick reference for numora's pipeline: event handlers, sanitization, formatting, and value output. The Anatomy page covers the same surface as a long-form narrative with diagrams.",
            url: 'https://numeric-input.com/docs/numora/how-it-works',
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
                name: 'Numora JS',
                item: 'https://numeric-input.com/docs/numora',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'How It Works',
                item: 'https://numeric-input.com/docs/numora/how-it-works',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: HowItWorks,
});

// Mirrors /docs/numora-react/how-it-works.tsx - keep the section structure aligned.
const ANATOMY = '/docs/numora/anatomy';

function HowItWorks() {
  return (
    <div className="prose prose-invert max-w-xl">
      <h1 className="text-stone-100">How It Works</h1>
      <p className="text-stone-400 text-base leading-6">
        A scannable reference for Numora's event handlers, sanitization steps, formatting stages,
        and value output. For the long-form narrative with diagrams and demos, see{' '}
        <Link to={ANATOMY} className="underline link-underline hover:text-stone-100 transition-colors">Anatomy of a Numeric Input</Link>.
      </p>

      <h2 className="text-stone-100 text-2xl">Events</h2>
      <p className="text-stone-400 text-base leading-6">
        Numora intercepts four input vectors on a single <code>&lt;input type="text"&gt;</code>. See{' '}
        <Link to={ANATOMY} hash="event-pipeline" className="underline link-underline hover:text-stone-100 transition-colors">
          Anatomy: event pipeline
        </Link>{' '}
        for the lifecycle and timing of each.
      </p>
      <ul>
        <li>
          <strong>
            <Link to={ANATOMY} hash="keydown" className="underline link-underline hover:text-stone-100 transition-colors">
              <code>keydown</code>
            </Link>
          </strong>{' '}
          - skips the cursor over thousand separators on <kbd>Delete</kbd> / <kbd>Backspace</kbd>.
        </li>
        <li>
          <strong>
            <Link to={ANATOMY} hash="before-input" className="underline link-underline hover:text-stone-100 transition-colors">
              <code>beforeinput</code>
            </Link>
          </strong>{' '}
          - primary formatting hook. Calls <code>preventDefault()</code> and writes the formatted
          result via <code>setRangeText</code>, preserving the browser's undo stack.
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
            <Link to={ANATOMY} hash="paste" className="underline link-underline hover:text-stone-100 transition-colors">
              <code>paste</code>
            </Link>
          </strong>{' '}
          - splices clipboard text into the selection range, runs the full pipeline, repositions the
          cursor.
        </li>
        <li>
          <strong>
            <Link to={ANATOMY} hash="format-mode" className="underline link-underline hover:text-stone-100 transition-colors">
              <code>focus</code> / <code>blur</code>
            </Link>
          </strong>{' '}
          - strip / re-apply thousand separators in <code>FormatOn.Blur</code> mode only.
        </li>
      </ul>

      <h2 className="text-stone-100 text-2xl">Sanitization</h2>
      <p className="text-stone-400 text-base leading-6">
        Seven steps run in order on every value before formatting is applied. See{' '}
        <Link to={ANATOMY} hash="sanitization" className="underline link-underline hover:text-stone-100 transition-colors">
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
      <p className="text-stone-400 text-base leading-6">
        Per-step configuration: see{' '}
        <Link to="/docs/numora/features/sanitization" className="underline link-underline hover:text-stone-100 transition-colors">features/sanitization</Link>,{' '}
        <Link to="/docs/numora/features/compact-notation" className="underline link-underline hover:text-stone-100 transition-colors">features/compact-notation</Link>,{' '}
        <Link to="/docs/numora/features/scientific-notation" className="underline link-underline hover:text-stone-100 transition-colors">features/scientific-notation</Link>,{' '}
        <Link to="/docs/numora/features/leading-zeros" className="underline link-underline hover:text-stone-100 transition-colors">features/leading-zeros</Link>.
      </p>

      <h2 className="text-stone-100 text-2xl">Formatting</h2>
      <p className="text-stone-400 text-base leading-6">
        Four stages run after sanitization. See{' '}
        <Link to={ANATOMY} hash="grouping-styles" className="underline link-underline hover:text-stone-100 transition-colors">
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
      <p className="text-stone-400 text-base leading-6">
        Per-stage configuration: see{' '}
        <Link to="/docs/numora/features/formatting" className="underline link-underline hover:text-stone-100 transition-colors">features/formatting</Link>,{' '}
        <Link to="/docs/numora/features/decimals" className="underline link-underline hover:text-stone-100 transition-colors">features/decimals</Link>.
      </p>

      <h2 className="text-stone-100 text-2xl">Value output</h2>
      <p className="text-stone-400 text-base leading-6">
        Every value is emitted as a string. See{' '}
        <Link to={ANATOMY} hash="raw-vs-formatted" className="underline link-underline hover:text-stone-100 transition-colors">
          Anatomy: raw vs formatted
        </Link>{' '}
        for the mental model;{' '}
        <Link to="/docs/numora/features/value-types" className="underline link-underline hover:text-stone-100 transition-colors">features/value-types</Link> for the
        configuration and the <code>valueAsNumber</code> escape hatch.
      </p>
      <ul>
        <li>
          <strong>formatted</strong> - the display string with thousand separators; always written
          to <code>input.value</code>.
        </li>
        <li>
          <strong>raw</strong> - the sanitized string without separators; emitted via{' '}
          <code>onChange</code> when <code>rawValueMode: true</code>.
        </li>
      </ul>

      <h2 className="text-stone-100 text-2xl">Value format</h2>
      <p className="text-stone-400 text-base leading-6">
        String <code>value</code> / <code>setValue</code> are already in the field's{' '}
        <em>display</em> format - locale separators allowed, grouping optional - since that is what
        every existing caller passes and <code>formatValueForDisplay</code> already strips grouping.
        A JS <code>number</code> is always dot-decimal, so the <code>valueAsNumber</code> setter
        converts it to the configured decimal separator before writing, instead of passing the dot
        through unchanged.
      </p>
      <p className="text-stone-400 text-base leading-6">
        Example: under <code>locale: 'de-DE'</code> ('.' groups, ',' is the decimal mark),{' '}
        <code>instance.valueAsNumber = 1234.5</code> displays <code>"1.234,5"</code>. Passing the
        raw string <code>'1234.5'</code> to <code>setValue</code> instead displays{' '}
        <code>"12.345"</code> - the dot is read as de-DE's thousand separator and stripped,
        concatenating the digits. Setting a negative <code>valueAsNumber</code> with{' '}
        <code>enableNegative: false</code> throws a <code>RangeError</code> rather than silently
        dropping the sign.
      </p>
    </div>
  );
}
