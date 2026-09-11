import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

export const Route = createFileRoute('/docs/numora-react/features/validation')({
  head: () => ({
    meta: [
      { title: 'Custom Validation with isAllowed | numora-react' },
      {
        name: 'description',
        content:
          'Reject numeric input pre-commit with a custom isAllowed validator in the NumoraInput React component. Cap values, enforce business rules, and block invalid keystrokes before they hit React state.',
      },
      { property: 'og:title', content: 'Custom Validation with isAllowed | numora-react' },
      {
        property: 'og:description',
        content:
          'Reject numeric input pre-commit with a custom isAllowed validator. Block keystrokes and pastes before they fire onChange in React.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/validation',
      },
      { name: 'twitter:title', content: 'Custom Validation with isAllowed | numora-react' },
      {
        name: 'twitter:description',
        content:
          'Reject numeric input pre-commit with a custom isAllowed validator in numora-react.',
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
            headline: 'Custom Validation with isAllowed in numora-react',
            description:
              'Use the isAllowed predicate prop to reject invalid numeric input before it commits to React state. Enforce caps, business rules, and other invariants without writing your own keydown handlers.',
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
    <div className="prose prose-invert max-w-xl">
      <h1 className="text-stone-100">Custom Validation</h1>
      <p className="text-stone-400 text-base leading-6">
        Reject keystrokes and pastes <em>before</em> they commit using an <code>isAllowed</code>{' '}
        predicate. Useful for enforcing caps, business rules, or format invariants that don't fit
        one of the built-in props.
      </p>

      <h2 className="text-stone-100 text-2xl">Shape</h2>
      <CodeBlock language="typescript">
        {`type IsAllowed = (rawValue: string) => boolean`}
      </CodeBlock>

      <p className="text-stone-400 text-base leading-6">
        <code>rawValue</code> is the sanitized, raw (no-separator) string that <em>would</em>
        be committed by this keystroke or paste. Return <code>true</code> to accept it,
        <code>false</code> to discard it - the input stays at its previous value and
        <code>onChange</code> does not fire.
      </p>

      <h2 className="text-stone-100 text-2xl">Example: cap at 100</h2>
      <ExampleWithDemo
        title="Reject anything above 100"
        description={'Try typing past 100 - keystrokes that would exceed it are blocked'}
        language="tsx"
        code={`<NumoraInput
  isAllowed={(raw) => {
    if (raw === '' || raw === '-' || raw === '.') return true
    const n = parseFloat(raw)
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

      <h2 className="text-stone-100 text-2xl">Example: only multiples of 5</h2>
      <CodeBlock language="tsx">
        {`<NumoraInput
  isAllowed={(raw) =>
    raw === '' || (/^[0-9]+$/.test(raw) && Number(raw) % 5 === 0)
  }
/>`}
      </CodeBlock>

      <h2 className="text-stone-100 text-2xl">Notes</h2>
      <ul>
        <li>
          Runs <em>after</em> sanitization and formatting, but <em>before</em> the DOM is mutated
          and React state updates
        </li>
        <li>Fires for both typing and paste paths</li>
        <li>
          Always allow the intermediate strings users need to type their way to a valid value (empty
          string, lone <code>-</code> or decimal separator)
        </li>
        <li>Keep the predicate cheap - it runs on every keystroke</li>
        <li>
          Combine with <code>maxLength</code> for length caps and <code>maxDecimals</code> for
          decimal-precision caps; <code>isAllowed</code> is for everything else
        </li>
      </ul>
    </div>
  );
}
