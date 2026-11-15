import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/docs/numora/how-it-works')({
  head: () => ({
    meta: [
      { title: 'How it works | Numora' },
      {
        name: 'description',
        content:
          "Quick reference for Numora's pipeline: event handlers, the ten-step sanitization order, formatting stages, and value output. The Anatomy page explains each step with diagrams and demos.",
      },
      { property: 'og:title', content: 'How it works | Numora' },
      {
        property: 'og:description',
        content:
          "Quick reference for Numora's pipeline: event handlers, the ten-step sanitization order, formatting stages, and value output.",
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/how-it-works' },
      { name: 'twitter:title', content: 'How it works | Numora' },
      {
        name: 'twitter:description',
        content:
          "Quick reference for Numora's pipeline: event handlers, sanitization steps, formatting stages, value output.",
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
            headline: 'How it works | Numora',
            description:
              "Quick reference for Numora's pipeline: event handlers, sanitization, formatting, and value output. The Anatomy page explains each step with diagrams.",
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
                name: 'Numora',
                item: 'https://numeric-input.com/docs/numora',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'How it works',
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
    <div className="docs-prose max-w-[36rem]">
      <h1>How it works</h1>
      <p>
        A cheat sheet. Each row links to the section of <Link to={ANATOMY}>Anatomy</Link> that
        explains it with diagrams and demos.
      </p>

      <h2>Events</h2>
      <ul>
        <li>
          <Link to={ANATOMY} hash="keydown">
            <code>keydown</code>
          </Link>
          : moves the cursor over a thousand separator on <kbd>Delete</kbd> / <kbd>Backspace</kbd>.
          It deletes nothing. It acts only with <code>formatOn: 'change'</code>, a thousand
          separator set and no text selected. <code>beforeinput</code> then deletes the digit.
          Mobile keyboards that send no usable <code>keydown</code> get the same result, because{' '}
          <code>beforeinput</code> deletes the digit past the separator itself.
        </li>
        <li>
          <Link to={ANATOMY} hash="before-input">
            <code>beforeinput</code>
          </Link>
          : the main formatting hook. Writes the formatted value with <code>setRangeText</code>.
        </li>
        <li>
          <Link to={ANATOMY} hash="event-pipeline">
            <code>input</code>
          </Link>
          : fallback for autofill, drop, IME commits and other changes without{' '}
          <code>beforeinput</code>.
        </li>
        <li>
          <Link to={ANATOMY} hash="paste">
            <code>paste</code>
          </Link>
          : splices clipboard text into the selection and runs the full pipeline.
        </li>
        <li>
          <Link to="/docs/numora/features/format-on">
            <code>focus</code> / <code>blur</code>
          </Link>
          : strip and re-apply separators in <code>'blur'</code> mode. Blur also settles the value
          in both modes: it drops a trailing decimal separator, pads decimals, turns <code>-0</code>{' '}
          into <code>0</code> and empties a field with no digit.
        </li>
      </ul>

      <h2>Pipeline</h2>
      <ul>
        <li>
          <Link to={ANATOMY} hash="sanitization">
            Sanitization
          </Link>
          : runs on every value before formatting. Options:{' '}
          <Link to="/docs/numora/features/sanitization">Sanitization</Link>,{' '}
          <Link to="/docs/numora/features/compact-notation">Compact notation</Link>,{' '}
          <Link to="/docs/numora/features/scientific-notation">Scientific notation</Link> (
          <code>allowScientificNotation</code>),{' '}
          <Link to="/docs/numora/features/leading-zeros">Leading zeros</Link>,{' '}
          <Link to="/docs/numora/features/max-length">Max length</Link>.
        </li>
        <li>
          <Link to={ANATOMY} hash="grouping-styles">
            Formatting
          </Link>
          : trims the decimals to <code>decimalMaxLength</code>, then groups the digits. On blur and
          for values from your code it then drops a trailing decimal separator and pads the decimals
          to <code>decimalMinLength</code>. Options:{' '}
          <Link to="/docs/numora/features/formatting">Formatting</Link>,{' '}
          <Link to="/docs/numora/features/decimals">Decimals</Link>.
        </li>
        <li>
          <Link to={ANATOMY} hash="cursor-preservation">
            Cursor restoration
          </Link>
          : puts the cursor back after Numora writes the formatted value. Every write goes through{' '}
          <code>setRangeText</code>, which fires no <code>input</code> event. Numora never assigns{' '}
          <code>input.value</code>.
        </li>
        <li>
          <Link to={ANATOMY} hash="raw-vs-formatted">
            Value output
          </Link>
          : values are always strings. <code>onValueChange</code> gets both the raw{' '}
          <code>value</code> (canonical in every locale: ASCII digits, <code>.</code> decimal, no
          grouping) and the <code>formattedValue</code>. See{' '}
          <Link to="/docs/numora/features/value-types">Value types</Link>.
        </li>
      </ul>
    </div>
  );
}
