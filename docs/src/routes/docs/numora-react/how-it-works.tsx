import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/docs/numora-react/how-it-works')({
  head: () => ({
    meta: [
      { title: 'How it works | Numora React' },
      {
        name: 'description',
        content:
          "Quick reference for Numora React's pipeline: event handlers, the ten-step sanitization order, formatting stages, and value output. The Anatomy page explains each step with diagrams and demos.",
      },
      {
        property: 'og:title',
        content: 'How it works | Numora React',
      },
      {
        property: 'og:description',
        content:
          "Quick reference for Numora React's pipeline: event handlers, sanitization, formatting, and value output.",
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react/how-it-works' },
      {
        name: 'twitter:title',
        content: 'How it works | Numora React',
      },
      {
        name: 'twitter:description',
        content:
          "Quick reference for Numora React's pipeline: event handlers, sanitization, formatting, value output.",
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
            headline: 'How it works | Numora React',
            description:
              "Quick reference for Numora React's pipeline: event handlers, sanitization, formatting, and value output. The Anatomy page explains each step with diagrams and demos.",
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
                name: 'How it works',
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
    <div className="docs-prose max-w-[36rem]">
      <h1>How it works</h1>
      <p>
        A cheat sheet. Each row links to the section of <Link to={ANATOMY}>Anatomy</Link> that
        explains it with diagrams and demos.
      </p>

      <h2>React integration</h2>
      <p>
        <code>NumoraInput</code> is a <code>forwardRef</code> component that calls the core event
        handlers directly and never instantiates the vanilla class. When an edit changes the raw
        value, <code>onChange</code> fires with a synthetic event whose <code>target</code> exposes
        both the raw and formatted values.
      </p>

      <h2>Events</h2>
      <ul>
        <li>
          <Link to={ANATOMY} hash="keydown">
            <code>keydown</code>
          </Link>
          : skips the cursor over separators on <kbd>Delete</kbd> / <kbd>Backspace</kbd>.
        </li>
        <li>
          <Link to={ANATOMY} hash="before-input">
            <code>beforeinput</code>
          </Link>
          : the main formatting hook, registered with native <code>addEventListener</code> (
          <Link to={ANATOMY} hash="react-synthetic-bypass">
            why it bypasses React
          </Link>
          ). Writes the formatted value with <code>setRangeText</code>.
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
          <Link to="/docs/numora-react/features/format-on">
            <code>focus</code> / <code>blur</code>
          </Link>
          : strip and re-apply separators in <code>'blur'</code> mode. Blur also settles the value
          in both modes: it drops a trailing separator and pads decimals.
        </li>
      </ul>

      <h2>Pipeline</h2>
      <ul>
        <li>
          <Link to={ANATOMY} hash="sanitization">
            Sanitization
          </Link>
          : runs on every value before formatting. Options:{' '}
          <Link to="/docs/numora-react/features/sanitization">Sanitization</Link>,{' '}
          <Link to="/docs/numora-react/features/compact-notation">Compact notation</Link>,{' '}
          <Link to="/docs/numora-react/features/scientific-notation">Scientific notation</Link> (a
          paste is rejected when <code>allowScientificNotation</code> is <code>false</code>),{' '}
          <Link to="/docs/numora-react/features/leading-zeros">Leading zeros</Link>,{' '}
          <Link to="/docs/numora-react/features/max-length">Max length</Link>.
        </li>
        <li>
          <Link to={ANATOMY} hash="grouping-styles">
            Formatting
          </Link>
          : decimal trimming and padding, then thousand grouping. Options:{' '}
          <Link to="/docs/numora-react/features/formatting">Formatting</Link>,{' '}
          <Link to="/docs/numora-react/features/decimals">Decimals</Link>.
        </li>
        <li>
          <Link to={ANATOMY} hash="cursor-preservation">
            Cursor restoration
          </Link>
          : puts the cursor back after the formatted value replaces <code>input.value</code>.
        </li>
        <li>
          <Link to={ANATOMY} hash="raw-vs-formatted">
            Value output
          </Link>
          : <code>e.target.value</code> is the canonical raw value,{' '}
          <code>e.target.formattedValue</code> is the display string (
          <Link to={ANATOMY} hash="proxy-target">
            how
          </Link>
          ). See <Link to="/docs/numora-react/features/value-types">Value types</Link>.
        </li>
      </ul>

      <h2>Input value format</h2>
      <p>
        <code>value</code> / <code>defaultValue</code> take a string: the canonical raw value, with
        ASCII digits, <code>.</code> as the decimal mark and no grouping, in every locale. Under{' '}
        <code>locale="de-DE"</code>, <code>{'value="1234.5"'}</code> displays <code>"1.234,5"</code>
        . A JS <code>number</code> is a TypeScript error, because it may already have lost
        precision.
      </p>
    </div>
  );
}
