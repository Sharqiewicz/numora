import { createFileRoute } from '@tanstack/react-router';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

export const Route = createFileRoute('/docs/numora-react/features/leading-zeros')({
  head: () => ({
    meta: [
      { title: 'Leading Zero Handling | numora-react' },
      {
        name: 'description',
        content:
          'Control leading zeros using the NumoraInput React component. Strip or preserve integer leading zeros, and auto-prepend "0" before bare decimal points like ".5" → "0.5".',
      },
      { property: 'og:title', content: 'Leading Zero Handling | numora-react' },
      {
        property: 'og:description',
        content:
          'Control leading zeros using the NumoraInput React component. Enable or disable for financial forms.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/leading-zeros',
      },
      { name: 'twitter:title', content: 'Leading Zero Handling | numora-react' },
      {
        name: 'twitter:description',
        content: 'Control leading zeros using the NumoraInput React component.',
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
            headline: 'Leading Zero Control in numora-react - React Numeric Input Leading Zeros',
            description:
              'Control leading zero behaviour in React numeric inputs with numora-react. Strip leading zeros automatically or preserve them based on your use case.',
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
                name: 'Leading Zeros',
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
    <div className="prose prose-invert max-w-xl">
      <h1 className="text-foreground">Leading Zeros</h1>
      <p className="text-muted-foreground text-base leading-6">
        By default, Numora strips leading zeros from the integer part of a number. Set{' '}
        <code>enableLeadingZeros</code> to preserve them.
      </p>

      <div className="space-y-4">
        <ExampleWithDemo
          title="Removed (default)"
          description={'Try typing "007" - it becomes "7"'}
          language="tsx"
          code={`<NumoraInput />`}
        />
        <ExampleWithDemo
          title="Preserved"
          description={'Try typing "007" - it stays "007"'}
          language="tsx"
          code={`<NumoraInput enableLeadingZeros />`}
          config={{ enableLeadingZeros: true }}
        />
      </div>

      <h2 className="text-foreground text-2xl">Rules</h2>
      <ul>
        <li>
          Only the integer part is affected - decimal zeros are never touched (<code>"0.05"</code>{' '}
          stays <code>"0.05"</code>)
        </li>
        <li>
          A bare <code>"0"</code> is always preserved
        </li>
        <li>
          The sign is preserved for negative numbers (<code>"-007"</code> → <code>"-7"</code>)
        </li>
      </ul>

      <h2 className="text-foreground text-2xl">When to use each</h2>
      <ul>
        <li>
          <strong>Removed (default)</strong> - currency and general numeric inputs where leading
          zeros are meaningless
        </li>
        <li>
          <strong>Preserved</strong> - product codes, IDs, or any format where zero-padding is
          significant
        </li>
      </ul>

      <h2 className="text-foreground text-2xl">Auto-prepend leading zero</h2>
      <p className="text-muted-foreground text-base leading-6">
        Set <code>autoAddLeadingZero</code> to automatically prepend <code>0</code> before a bare
        decimal separator. Useful when you want <code>.5</code> stored as <code>0.5</code>
        so the value is unambiguously parseable downstream.
      </p>

      <div className="space-y-4">
        <ExampleWithDemo
          title="Off (default)"
          description={'Type ".5" - it stays ".5"'}
          language="tsx"
          code={`<NumoraInput />`}
        />
        <ExampleWithDemo
          title="On"
          description={'Type ".5" - it becomes "0.5"'}
          language="tsx"
          code={`<NumoraInput autoAddLeadingZero />`}
          config={{ autoAddLeadingZero: true }}
        />
      </div>

      <ul>
        <li>
          Runs as the last sanitization step, after <code>enableLeadingZeros</code> trimming - safe
          to combine
        </li>
        <li>
          Respects <code>decimalSeparator</code> (e.g. <code>","</code> for European format)
        </li>
        <li>Off by default</li>
      </ul>
    </div>
  );
}
