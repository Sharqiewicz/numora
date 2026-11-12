import { createFileRoute } from '@tanstack/react-router';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

export const Route = createFileRoute('/docs/numora-react/features/leading-zeros')({
  head: () => ({
    meta: [
      { title: 'Leading zeros | Numora React' },
      {
        name: 'description',
        content:
          'Control leading zeros using the NumoraInput React component. Strip or preserve integer leading zeros, and auto-prepend "0" before bare decimal points like ".5" → "0.5".',
      },
      { property: 'og:title', content: 'Leading zeros | Numora React' },
      {
        property: 'og:description',
        content:
          'Control leading zeros using the NumoraInput React component. Strip or preserve integer leading zeros, and auto-prepend "0" before bare decimal points like ".5" → "0.5".',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/leading-zeros',
      },
      { name: 'twitter:title', content: 'Leading zeros | Numora React' },
      {
        name: 'twitter:description',
        content:
          'Control leading zeros using the NumoraInput React component. Strip or preserve integer leading zeros, and auto-prepend "0" before bare decimal points like ".5" → "0.5".',
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://numeric-input.com/docs/numora-react/features/leading-zeros',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Leading zeros | Numora React',
            description:
              'Control leading zeros in React numeric inputs with Numora React. It strips leading zeros by default, and allowLeadingZeros keeps them.',
            url: 'https://numeric-input.com/docs/numora-react/features/leading-zeros',
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
                name: 'Leading zeros',
                item: 'https://numeric-input.com/docs/numora-react/features/leading-zeros',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: LeadingZeros,
});

function LeadingZeros() {
  return (
    <div className="docs-prose max-w-[36rem]">
      <h1>Leading zeros</h1>
      <p>
        By default, Numora React strips leading zeros from the integer part of a number. Set{' '}
        <code>allowLeadingZeros</code> to preserve them.
      </p>

      <div className="space-y-4">
        <ExampleWithDemo
          title="Removed (default)"
          description={'Type "007" and it becomes "7"'}
          language="tsx"
          code={`<NumoraInput />`}
          config={{}}
        />
        <ExampleWithDemo
          title="Preserved"
          description={'Type "007" and it stays "007"'}
          language="tsx"
          code={`<NumoraInput allowLeadingZeros />`}
          config={{ allowLeadingZeros: true }}
        />
      </div>

      <h2>Rules</h2>
      <ul>
        <li>
          Only the integer part is affected. Decimal zeros are never touched (<code>"0.05"</code>{' '}
          stays <code>"0.05"</code>)
        </li>
        <li>
          Numora React always keeps a bare <code>"0"</code>
        </li>
        <li>
          Negative numbers keep their sign (<code>"-007"</code> → <code>"-7"</code>)
        </li>
      </ul>

      <p>
        Keep the default for currency and numeric inputs. Preserve zeros for product codes, IDs and
        other formats where zero-padding matters.
      </p>

      <h2>Auto-prepend leading zero</h2>
      <p>
        Set <code>padLeadingZero</code> to prepend <code>0</code> before a bare decimal separator.
        Use it when you want <code>.5</code> stored as <code>0.5</code>, so the value parses the
        same way everywhere downstream.
      </p>

      <div className="space-y-4">
        <ExampleWithDemo
          description={'Type ".5" and it becomes "0.5"'}
          language="tsx"
          code={`<NumoraInput padLeadingZero />`}
          config={{ padLeadingZero: true }}
        />
      </div>

      <ul>
        <li>
          Runs after <code>allowLeadingZeros</code> trimming, so you can combine the two. Only the
          optional <code>maxLength</code> truncation runs later
        </li>
        <li>
          Respects <code>decimalSeparator</code> (e.g. <code>","</code> for European format)
        </li>
      </ul>
    </div>
  );
}
