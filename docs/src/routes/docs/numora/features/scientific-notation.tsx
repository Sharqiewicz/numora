import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/scientific-notation')({
  head: () => ({
    meta: [
      { title: 'Scientific notation | Numora' },
      {
        name: 'description',
        content:
          "Handle scientific notation in numeric inputs with Numora. Avoid JavaScript's automatic 1e-7 conversion and keep the full expanded string for DeFi token amounts.",
      },
      { property: 'og:title', content: 'Scientific notation | Numora' },
      {
        property: 'og:description',
        content:
          "Handle scientific notation in numeric inputs with Numora. Avoid JavaScript's automatic 1e-7 conversion and keep the full expanded string for DeFi token amounts.",
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora/features/scientific-notation',
      },
      { name: 'twitter:title', content: 'Scientific notation | Numora' },
      {
        name: 'twitter:description',
        content:
          "Handle scientific notation in numeric inputs with Numora. Avoid JavaScript's automatic 1e-7 conversion and keep the full expanded string for DeFi token amounts.",
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://numeric-input.com/docs/numora/features/scientific-notation',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Scientific notation in Numora: safe paste for numeric input',
            description:
              'Handle scientific notation in JavaScript numeric inputs. Numora expands 1.5e-7 to 0.00000015 when you paste from block explorers or APIs.',
            url: 'https://numeric-input.com/docs/numora/features/scientific-notation',
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
                name: 'Scientific notation',
                item: 'https://numeric-input.com/docs/numora/features/scientific-notation',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: ScientificNotation,
});

function ScientificNotation() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Scientific notation</h1>
      <p>
        Numora expands values like <code>1.5e-7</code> to decimal notation. It usually enters the
        field through paste or through values your app passes in. A lone <code>e</code> typed at the
        end of the field is ignored, but an <code>e</code> typed between digits completes a token
        and expands too (<code>1e5</code> becomes <code>100000</code>). Expansion uses string
        arithmetic, so no floating-point precision is lost.
      </p>
      <p>
        To refuse scientific notation instead, set <code>allowScientificNotation: false</code>{' '}
        (default <code>true</code>). Such a paste or keystroke then leaves the field unchanged.
        Values your app passes in (<code>defaultValue</code>, <code>setValue()</code>) are expanded
        either way, because <code>String(1e21)</code> is <code>"1e+21"</code> in JavaScript.
      </p>

      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

const input = new NumoraInput(container, {
  decimalMaxLength: 18,
})

// Paste any of these and Numora expands it. The raw value becomes:
// "1.5e-7"   → "0.00000015"
// "2e+5"     → "200000"  (shown as "200,000" with the default grouping)
// "1.23e-4"  → "0.000123"
// "5e3"      → "5000"    (shown as "5,000")
// "-1.5e-7"  → "-0.00000015"  (with allowNegative: true)
// "1.5e-17"  → "0.000000000000000015"  (18 decimals, no precision lost)
// Digits past decimalMaxLength are cut off after expansion:
// "1.5e-19" → "0.000000000000000000"`}
      </CodeBlock>

      <p>
        Both <code>e</code> and <code>E</code> work.
      </p>
    </div>
  );
}
