import { createFileRoute, Link } from '@tanstack/react-router';

export const Route = createFileRoute('/docs/numora/how-it-works')({
  head: () => ({
    meta: [
      { title: 'How it works | Numora' },
      {
        name: 'description',
        content:
          "Quick reference for Numora's pipeline: event handlers, the ten-step sanitization order, formatting stages, and value output. For the full narrative, see the Anatomy page.",
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
              "Quick reference for Numora's pipeline: event handlers, sanitization, formatting, and value output. The Anatomy page covers the same surface as a long-form narrative with diagrams.",
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
    <div className="docs-prose max-w-[40rem]">
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
          : skips the cursor over separators on <kbd>Delete</kbd> / <kbd>Backspace</kbd>.
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
          : fallback for undo/redo, autofill and other changes without <code>beforeinput</code>.
        </li>
        <li>
          <Link to={ANATOMY} hash="paste">
            <code>paste</code>
          </Link>
          : splices clipboard text into the selection and runs the full pipeline.
        </li>
        <li>
          <Link to={ANATOMY} hash="format-mode">
            <code>focus</code> / <code>blur</code>
          </Link>
          : strip and re-apply separators in <code>FormatOn.Blur</code> mode.
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
          <Link to="/docs/numora/features/scientific-notation">Scientific notation</Link>{' '}
          (<code>enableScientificNotation</code>),{' '}
          <Link to="/docs/numora/features/leading-zeros">Leading zeros</Link>,{' '}
          <Link to="/docs/numora/features/max-length">Max length</Link>.
        </li>
        <li>
          <Link to={ANATOMY} hash="grouping-styles">
            Formatting
          </Link>
          : decimal trimming and padding, then thousand grouping. Options:{' '}
          <Link to="/docs/numora/features/formatting">Formatting</Link>,{' '}
          <Link to="/docs/numora/features/decimals">Decimals</Link>.
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
          : values are always strings. <code>onChange</code> gets both the raw <code>value</code>{' '}
          (canonical in every locale: ASCII digits, <code>.</code> decimal, no grouping) and the{' '}
          <code>formattedValue</code>. See{' '}
          <Link to="/docs/numora/features/value-types">Value types</Link> and{' '}
          <code>valueAsNumber</code>.
        </li>
      </ul>
    </div>
  );
}
