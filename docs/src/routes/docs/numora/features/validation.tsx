import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/validation')({
  head: () => ({
    meta: [
      { title: 'Validation | Numora' },
      {
        name: 'description',
        content:
          'Reject numeric input pre-commit with a custom isAllowed validator in Numora. Cap values, enforce business rules, and stop invalid keystrokes before they reach your state.',
      },
      { property: 'og:title', content: 'Validation | Numora' },
      {
        property: 'og:description',
        content:
          'Reject numeric input pre-commit with a custom isAllowed validator in Numora. Cap values, enforce business rules, and stop invalid keystrokes before they reach your state.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/validation' },
      { name: 'twitter:title', content: 'Validation | Numora' },
      {
        name: 'twitter:description',
        content:
          'Reject numeric input pre-commit with a custom isAllowed validator in Numora. Cap values, enforce business rules, and stop invalid keystrokes before they reach your state.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/validation' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Validation with isAllowed in Numora',
            description:
              'Use the isAllowed predicate to reject invalid numeric input before it commits. Enforce caps and business rules without writing your own keydown handlers.',
            url: 'https://numeric-input.com/docs/numora/features/validation',
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
                name: 'Validation',
                item: 'https://numeric-input.com/docs/numora/features/validation',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: Validation,
});

function Validation() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Validation</h1>
      <p>
        An <code>isAllowed</code> predicate rejects edits the user makes (typing, deleting, paste,
        drop, autofill, IME) <em>before</em> they commit. Use it for business rules or format
        constraints that don't fit a built-in option.
      </p>

      <CodeBlock language="typescript">
        {`type IsAllowed = (rawValue: string) => boolean`}
      </CodeBlock>

      <p>
        <code>rawValue</code> is the sanitized, raw (no-separator) string that <em>would</em> be
        committed. Return <code>true</code> to accept it, <code>false</code> to discard it. The
        input keeps its previous value and no <code>onValueChange</code> fires.
      </p>

      <h2>Example: cap at 100</h2>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

const input = new NumoraInput(container, {
  isAllowed: (raw) => {
    // Half-typed values. "-" and "-." only arrive with allowNegative: true
    if (raw === '' || raw === '-' || raw === '.' || raw === '-.') return true
    const n = parseFloat(raw)
    return Number.isFinite(n) && n <= 100
  },
})`}
      </CodeBlock>

      <h2>Example: whole numbers, up to 6 digits</h2>
      <CodeBlock language="typescript">
        {`new NumoraInput(container, {
  isAllowed: (raw) => /^\\d{0,6}$/.test(raw),
})`}
      </CodeBlock>

      <h2>Notes</h2>
      <ul>
        <li>
          Runs <em>after</em> sanitization and formatting. For typing and paste that is{' '}
          <em>before</em> the DOM is mutated. For drop, autofill and IME text, which the browser has
          already inserted, a rejection puts the previous value back
        </li>
        <li>
          Fires for typing, deletion, paste, drop, autofill and IME text. A keystroke that changes
          nothing, or one a built-in option already refused, never reaches it
        </li>
        <li>
          Does not run for values your code writes: <code>defaultValue</code>,{' '}
          <code>setValue()</code> and <code>update()</code> are never checked
        </li>
        <li>
          A predicate that throws counts as a rejection, and the error is logged with{' '}
          <code>console.error</code>
        </li>
        <li>
          Always allow the intermediate strings users need to type their way to a valid value (empty
          string, lone <code>-</code> or decimal separator)
        </li>
        <li>Keep the predicate cheap, because it runs on every edit</li>
        <li>
          For length and decimal-precision caps, use{' '}
          <Link to="/docs/numora/features/max-length">max length</Link> and{' '}
          <Link to="/docs/numora/features/decimals">decimals</Link> instead
        </li>
      </ul>
    </div>
  );
}
