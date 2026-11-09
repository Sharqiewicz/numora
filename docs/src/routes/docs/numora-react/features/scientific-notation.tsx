import { createFileRoute } from '@tanstack/react-router';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

export const Route = createFileRoute('/docs/numora-react/features/scientific-notation')({
  head: () => ({
    meta: [
      { title: 'Scientific notation | Numora React' },
      {
        name: 'description',
        content:
          'Handle scientific notation input in the NumoraInput React component. Avoid 1e-18 problems and keep full expanded decimal strings for token amounts.',
      },
      { property: 'og:title', content: 'Scientific notation | Numora React' },
      {
        property: 'og:description',
        content:
          'Handle scientific notation input in the NumoraInput React component. Avoid 1e-18 problems and keep full expanded decimal strings for token amounts.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/scientific-notation',
      },
      { name: 'twitter:title', content: 'Scientific notation | Numora React' },
      {
        name: 'twitter:description',
        content: 'Handle scientific notation input in the NumoraInput React component. Avoid 1e-18 problems and keep full expanded decimal strings for token amounts.',
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://numeric-input.com/docs/numora-react/features/scientific-notation',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline:
              'Scientific notation | Numora React',
            description:
              'Handle scientific notation in React numeric inputs. Numora React expands 1.5e-7 to 0.00000015 when you paste from block explorers or APIs.',
            url: 'https://numeric-input.com/docs/numora-react/features/scientific-notation',
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
                name: 'Scientific notation',
                item: 'https://numeric-input.com/docs/numora-react/features/scientific-notation',
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
        Numora expands scientific notation to decimal notation. Expansion uses string arithmetic, so
        there is no floating-point precision loss. Typing <code>e</code> is rejected, so scientific
        notation enters the field through paste or through values your app passes in.
      </p>
      <p>
        To refuse pasted scientific notation instead, pass{' '}
        <code>enableScientificNotation={'{false}'}</code>: such a paste leaves the field unchanged.
        Values passed through <code>value</code> or <code>defaultValue</code> are expanded either
        way, because <code>String(1e21)</code> is <code>"1e+21"</code> in JavaScript.
      </p>

      <ExampleWithDemo
        description={'Paste "1.5e-7", "2e+5" or "1.5e-18" to see each expanded'}
        language="tsx"
        code={`<NumoraInput decimalMaxLength={18} />`}
        config={{ decimalMaxLength: 18 }}
      />

      <p>
        Both <code>e</code> and <code>E</code> are supported.
      </p>
    </div>
  );
}
