import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/compact-notation')({
  head: () => ({
    meta: [
      { title: 'Compact notation | Numora' },
      {
        name: 'description',
        content:
          'Enable compact number notation in inputs with Numora. Users type "1k" for 1,000 or "1m" for 1,000,000. Shorthand number input for financial UIs.',
      },
      { property: 'og:title', content: 'Compact notation | Numora' },
      {
        property: 'og:description',
        content:
          'Enable compact number notation in inputs with Numora. Users type "1k" for 1,000 or "1m" for 1,000,000. Shorthand number input for financial UIs.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora/features/compact-notation',
      },
      { name: 'twitter:title', content: 'Compact notation | Numora' },
      {
        name: 'twitter:description',
        content:
          'Enable compact number notation in inputs with Numora. Users type "1k" for 1,000 or "1m" for 1,000,000. Shorthand number input for financial UIs.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/compact-notation' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Compact notation expansion in Numora: 1k → 1000 in numeric input',
            description:
              'Expand compact notation in numeric input fields with Numora. Type 1k, 1.5m, or 2b and Numora expands it to the full numeric value.',
            url: 'https://numeric-input.com/docs/numora/features/compact-notation',
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
                name: 'Compact notation',
                item: 'https://numeric-input.com/docs/numora/features/compact-notation',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: CompactNotation,
});

function CompactNotation() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Compact notation</h1>
      <p>
        Compact notation expands shorthand values like <code>"1k"</code> or <code>"2.5m"</code> to
        full numbers when they are typed, pasted or passed in as <code>defaultValue</code> or to{' '}
        <code>setValue()</code>, once <code>allowCompactNotation</code> is on. Expansion uses string
        arithmetic, so no precision is lost. A suffix followed by a digit is not expanded: a pasted{' '}
        <code>1k5</code> becomes <code>15</code>. Typed text expands as soon as the suffix is typed,
        so typing <code>1k</code> and then <code>5</code> gives <code>10005</code>. Each suffixed
        number in a pasted text expands on its own, so <code>1k 2m</code> becomes{' '}
        <code>12000000</code>.
      </p>

      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Suffix</th>
              <th>Multiplier</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>k, K</td>
              <td>×1,000</td>
              <td>"1k" → "1000"</td>
            </tr>
            <tr>
              <td>m, M</td>
              <td>×1,000,000</td>
              <td>"1.5m" → "1500000"</td>
            </tr>
            <tr>
              <td>b, B</td>
              <td>×1,000,000,000</td>
              <td>"2B" → "2000000000"</td>
            </tr>
            <tr>
              <td>t, T</td>
              <td>×1,000,000,000,000</td>
              <td>"2.5T" → "2500000000000"</td>
            </tr>
          </tbody>
        </table>
      </div>

      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

const input = new NumoraInput(container, {
  allowCompactNotation: true,
  decimalMaxLength: 18,
  // "0.5k"  → "500"
  // "2.75m" → "2750000"
})`}
      </CodeBlock>

      <p>
        Typing <code>1</code> then <code>k</code> gives the raw value <code>"1000"</code>, shown as{' '}
        <code>1,000</code> with the default grouping.
      </p>
    </div>
  );
}
