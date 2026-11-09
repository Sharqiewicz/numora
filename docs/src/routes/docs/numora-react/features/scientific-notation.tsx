import { createFileRoute } from '@tanstack/react-router';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

export const Route = createFileRoute('/docs/numora-react/features/scientific-notation')({
  head: () => ({
    meta: [
      { title: 'Scientific Notation Input (1e-18) | numora-react' },
      {
        name: 'description',
        content:
          'Handle scientific notation input using the NumoraInput React component. Prevent 1e-18 issues and preserve full expanded decimal strings for token amounts.',
      },
      { property: 'og:title', content: 'Scientific Notation Input (1e-18) | numora-react' },
      {
        property: 'og:description',
        content:
          'Handle scientific notation input using the NumoraInput React component. Prevent 1e-18 issues for DeFi token amounts.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/scientific-notation',
      },
      { name: 'twitter:title', content: 'Scientific Notation Input (1e-18) | numora-react' },
      {
        name: 'twitter:description',
        content: 'Handle scientific notation (1e-18) using the NumoraInput React component.',
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
              'Scientific Notation Handling in numora-react - React Numeric Input Paste Safety',
            description:
              'Handle scientific notation safely in React numeric inputs. numora-react expands 1.5e-7 to 0.00000015 automatically when pasting from block explorers or APIs.',
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
                name: 'Scientific Notation',
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
    <div className="prose prose-invert max-w-xl">
      <h1 className="text-foreground">Scientific Notation</h1>
      <p className="text-muted-foreground text-base leading-6">
        Numora expands scientific notation to decimal notation. Expansion uses string arithmetic, so
        there is no floating-point precision loss. Typing <code>e</code> is rejected, so scientific
        notation enters the field through paste or through values your app passes in.
      </p>
      <p className="text-muted-foreground text-base leading-6">
        To refuse pasted scientific notation instead, pass{' '}
        <code>enableScientificNotation={'{false}'}</code>: such a paste leaves the field unchanged.
        Values passed through <code>value</code> or <code>defaultValue</code> are expanded either
        way, because <code>String(1e21)</code> is <code>"1e+21"</code> in JavaScript.
      </p>

      <ExampleWithDemo
        description={'Try pasting "1.5e-7", "2e+5", or "1.5e-18" - all are expanded'}
        language="tsx"
        code={`<NumoraInput decimalMaxLength={18} />`}
        config={{ decimalMaxLength: 18 }}
      />

      <p className="text-muted-foreground text-base leading-6">
        Both <code>e</code> and <code>E</code> are supported. The expanded value is then processed
        through the rest of the sanitization pipeline and formatted according to your configuration.
      </p>
    </div>
  );
}
