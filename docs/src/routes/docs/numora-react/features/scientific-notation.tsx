import { createFileRoute } from '@tanstack/react-router';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';
import { ScientificNotationDemo } from '@/components/ScientificNotationDemo';

export const Route = createFileRoute('/docs/numora-react/features/scientific-notation')({
  head: () => ({
    meta: [
      { title: 'Scientific notation | Numora React' },
      {
        name: 'description',
        content:
          'Handle scientific notation input in the NumoraInput React component. A pasted 1e-18 expands to 0.000000000000000001, so token amounts keep every digit.',
      },
      { property: 'og:title', content: 'Scientific notation | Numora React' },
      {
        property: 'og:description',
        content:
          'Handle scientific notation input in the NumoraInput React component. A pasted 1e-18 expands to 0.000000000000000001, so token amounts keep every digit.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/scientific-notation',
      },
      { name: 'twitter:title', content: 'Scientific notation | Numora React' },
      {
        name: 'twitter:description',
        content:
          'Handle scientific notation input in the NumoraInput React component. A pasted 1e-18 expands to 0.000000000000000001, so token amounts keep every digit.',
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
            headline: 'Scientific notation | Numora React',
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
    <div className="docs-prose max-w-[36rem]">
      <h1>Scientific notation</h1>
      <p>
        Numora expands values like <code>1.5e-7</code> to decimal notation. It usually enters the
        field through paste or through values your app passes in. A lone <code>e</code> typed at the
        end of the field is ignored, but an <code>e</code> typed between digits completes a token
        and expands too (<code>1e5</code> becomes <code>100000</code>). Expansion uses string
        arithmetic, so no floating-point precision is lost.
      </p>

      <ScientificNotationDemo />
      <p>
        To refuse scientific notation instead, pass <code>allowScientificNotation={'{false}'}</code>
        . Numora then rejects a paste that holds a complete exponent, such as <code>1.5e-7</code>,
        and an <code>e</code> typed between two digits. The field keeps the value it had. Values
        passed through <code>value</code> or <code>defaultValue</code> are expanded either way,
        because <code>String(1e21)</code> is <code>"1e+21"</code> in JavaScript.
      </p>

      <ExampleWithDemo
        description={'Paste "1.5e-7", "2e+5" or "1.5e-17" to see each expanded'}
        language="tsx"
        code={`<NumoraInput />`}
        config={{}}
      />

      <p>
        Both <code>e</code> and <code>E</code> work.
      </p>

      <h2>Limits</h2>
      <ul>
        <li>
          The exponent can be at most 1000 in either direction. <code>1e1000</code> expands to a{' '}
          <code>1</code> and 1000 zeros. <code>1e1001</code> and <code>1e-1001</code> are dropped,
          and the field ends up empty.
        </li>
        <li>
          The exponent must be a whole number. <code>1e3.5</code> is dropped. An <code>e</code> with
          no digits after it is removed and the number stays: <code>1e</code> becomes <code>1</code>
          .
        </li>
        <li>
          Typing <code>1</code>, <code>e</code>, <code>5</code> in that order gives <code>15</code>,
          because the <code>e</code> at the end of the field is ignored.
        </li>
      </ul>
    </div>
  );
}
