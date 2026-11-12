import { createFileRoute } from '@tanstack/react-router';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

export const Route = createFileRoute('/docs/numora-react/features/compact-notation')({
  head: () => ({
    meta: [
      { title: 'Compact notation | Numora React' },
      {
        name: 'description',
        content:
          'Enable compact number notation in the NumoraInput React component. Users can type "1k", "1m" or "1b" as shorthand for the full number.',
      },
      { property: 'og:title', content: 'Compact notation | Numora React' },
      {
        property: 'og:description',
        content:
          'Enable compact number notation in the NumoraInput React component. Users can type "1k", "1m" or "1b" as shorthand for the full number.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/compact-notation',
      },
      { name: 'twitter:title', content: 'Compact notation | Numora React' },
      {
        name: 'twitter:description',
        content:
          'Enable compact number notation in the NumoraInput React component. Users can type "1k", "1m" or "1b" as shorthand for the full number.',
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://numeric-input.com/docs/numora-react/features/compact-notation',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Compact notation | Numora React',
            description:
              'Expand compact notation in React numeric input fields. Type 1k, 1.5m or 2b and Numora React expands it to the full numeric value.',
            url: 'https://numeric-input.com/docs/numora-react/features/compact-notation',
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
                name: 'Compact notation',
                item: 'https://numeric-input.com/docs/numora-react/features/compact-notation',
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
        With <code>allowCompactNotation</code> set, typing or pasting shorthand like{' '}
        <code>"1k"</code> or <code>"2.5m"</code> expands it to the full number. Expansion uses
        string arithmetic, so there is no precision loss.
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

      <ExampleWithDemo
        description={'Type or paste "1k", "1.5m", "2B", or "2.5T" to see expansion'}
        language="tsx"
        code={`<NumoraInput allowCompactNotation decimalMaxLength={18} />`}
        config={{ allowCompactNotation: true, decimalMaxLength: 18 }}
      />

      <p>
        Typing <code>1</code> then <code>k</code> gives <code>1000</code>.
      </p>
    </div>
  );
}
