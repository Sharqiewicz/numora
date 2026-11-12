import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

export const Route = createFileRoute('/docs/numora-react/features/validation')({
  head: () => ({
    meta: [
      { title: 'Validation | Numora React' },
      {
        name: 'description',
        content:
          'Reject numeric input before it commits, with a custom isAllowed validator in the NumoraInput React component. Cap values, enforce business rules and block invalid keystrokes before they reach React state.',
      },
      { property: 'og:title', content: 'Validation | Numora React' },
      {
        property: 'og:description',
        content:
          'Reject numeric input before it commits, with a custom isAllowed validator in the NumoraInput React component. Cap values, enforce business rules and block invalid keystrokes before they reach React state.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/validation',
      },
      { name: 'twitter:title', content: 'Validation | Numora React' },
      {
        name: 'twitter:description',
        content:
          'Reject numeric input before it commits, with a custom isAllowed validator in the NumoraInput React component. Cap values, enforce business rules and block invalid keystrokes before they reach React state.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/features/validation' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Validation | Numora React',
            description:
              'Use the isAllowed predicate prop to reject invalid numeric input before it commits to React state. Enforce caps and business rules without writing your own keydown handlers.',
            url: 'https://numeric-input.com/docs/numora-react/features/validation',
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
                name: 'Validation',
                item: 'https://numeric-input.com/docs/numora-react/features/validation',
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
        Use an <code>isAllowed</code> predicate to reject edits the user makes (typing, paste, drop,
        autofill) <em>before</em> they commit. It fits business rules and format rules that no
        built-in prop covers.
      </p>

      <CodeBlock language="typescript">
        {`type IsAllowed = (rawValue: string) => boolean`}
      </CodeBlock>

      <p>
        <code>rawValue</code> is the sanitized, raw (no-separator) string that <em>would</em> be
        committed. Return <code>true</code> to accept it or <code>false</code> to discard it. A
        discarded value leaves the input at its previous value, and <code>onChange</code> does not
        fire.
      </p>

      <h2>Example: cap at 100</h2>
      <ExampleWithDemo
        title="Reject anything above 100"
        description={'Try typing past 100. Keystrokes that would exceed it are blocked'}
        language="tsx"
        code={`<NumoraInput
  isAllowed={(raw) => {
    if (raw === '' || raw === '-' || raw === '.') return true
    const n = parseFloat(raw) // comparison only
    return Number.isFinite(n) && n <= 100
  }}
/>`}
        config={{
          isAllowed: (raw: string) => {
            if (raw === '' || raw === '-' || raw === '.') return true;
            const n = parseFloat(raw);
            return Number.isFinite(n) && n <= 100;
          },
        }}
      />

      <h2>Example: whole numbers, up to 6 digits</h2>
      <p>This predicate is safe for every prefix, so users can type and delete freely.</p>
      <CodeBlock language="tsx">
        {`<NumoraInput
  isAllowed={(raw) => /^\\d{0,6}$/.test(raw)}
/>`}
      </CodeBlock>

      <h2>Notes</h2>
      <ul>
        <li>
          Runs <em>after</em> sanitization and formatting, but <em>before</em> the DOM is mutated
          and React state updates
        </li>
        <li>Fires for typing, deletion, paste, drop and autofill</li>
        <li>
          Always allow the intermediate strings users need to type their way to a valid value (empty
          string, lone <code>-</code> or decimal separator)
        </li>
        <li>Keep the predicate cheap, because it runs on every keystroke</li>
        <li>
          For length and decimal-precision caps, use{' '}
          <Link to="/docs/numora-react/features/max-length">max length</Link> and{' '}
          <Link to="/docs/numora-react/features/decimals">decimals</Link> instead
        </li>
      </ul>
    </div>
  );
}
