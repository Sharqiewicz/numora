import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/scientific-notation')({
  head: () => ({
    meta: [
      { title: 'Scientific notation | Numora' },
      {
        name: 'description',
        content:
          "Handle scientific notation in numeric inputs with Numora. Avoid JavaScript's automatic 1e-6 conversion and keep the full expanded string for DeFi token amounts.",
      },
      { property: 'og:title', content: 'Scientific notation | Numora' },
      {
        property: 'og:description',
        content:
          "Handle scientific notation in numeric inputs with Numora. Avoid JavaScript's automatic 1e-6 conversion and keep the full expanded string for DeFi token amounts.",
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora/features/scientific-notation',
      },
      { name: 'twitter:title', content: 'Scientific notation | Numora' },
      {
        name: 'twitter:description',
        content: "Handle scientific notation in numeric inputs with Numora. Avoid JavaScript's automatic 1e-6 conversion and keep the full expanded string for DeFi token amounts.",
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
              'Handle scientific notation safely in JavaScript numeric inputs. Numora expands 1.5e-7 to 0.00000015 when you paste from block explorers or APIs.',
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
    <div className="docs-prose max-w-[40rem]">
      <h1>Scientific notation</h1>
      <p>
        Numora expands values like <code>1.5e-7</code> to decimal notation. Typing <code>e</code> is
        rejected, so scientific notation enters the field through paste or through values your app
        passes in. Expansion uses string arithmetic, so no floating-point precision is lost.
      </p>
      <p>
        To refuse pasted scientific notation instead, set{' '}
        <code>enableScientificNotation: false</code> (default <code>true</code>): such a paste leaves
        the field unchanged. Values your app passes in (<code>value</code>, <code>defaultValue</code>,{' '}
        <code>setValue()</code>) are expanded either way, because <code>String(1e21)</code> is{' '}
        <code>"1e+21"</code> in JavaScript.
      </p>

      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

const input = new NumoraInput(container, {
  decimalMaxLength: 18,
})

// Paste any of these and Numora expands it:
// "1.5e-7"   → "0.00000015"
// "2e+5"     → "200000"
// "1.23e-4"  → "0.000123"
// "5e3"      → "5000"
// "-1.5e-7"  → "-0.00000015"  (with enableNegative: true)
// "1.5e-18"  → "0.0000000000000000015"  (no precision lost)`}
      </CodeBlock>

      <p>
        Both <code>e</code> and <code>E</code> are supported.
      </p>
    </div>
  );
}
