import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/leading-zeros')({
  head: () => ({
    meta: [
      { title: 'Leading Zero Handling | Numora' },
      {
        name: 'description',
        content:
          'Control leading zero behavior in numeric inputs with Numora. Strip or preserve integer leading zeros, and auto-prepend "0" before bare decimal points like ".5" → "0.5".',
      },
      { property: 'og:title', content: 'Leading Zero Handling | Numora' },
      {
        property: 'og:description',
        content:
          'Control leading zero behavior in numeric inputs with Numora. Enable or disable for financial inputs.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora/features/leading-zeros',
      },
      { name: 'twitter:title', content: 'Leading Zero Handling | Numora' },
      {
        name: 'twitter:description',
        content: 'Control leading zero behavior in numeric inputs with Numora.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/leading-zeros' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Leading Zero Control in Numora - Numeric Input Leading Zero Handling',
            description:
              'Control leading zero behaviour in JavaScript numeric inputs with Numora. Strip leading zeros automatically or preserve them based on your use case.',
            url: 'https://numeric-input.com/docs/numora/features/leading-zeros',
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
                name: 'Numora JS',
                item: 'https://numeric-input.com/docs/numora',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Leading Zeros',
                item: 'https://numeric-input.com/docs/numora/features/leading-zeros',
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
      <h1 className="text-stone-100">Leading Zeros</h1>
      <p className="text-stone-400 text-base leading-6">
        By default, Numora strips leading zeros from the integer part of a number. Set{' '}
        <code>enableLeadingZeros: true</code> to preserve them.
      </p>

      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

// Default - leading zeros removed
// "007" → "7", "0001" → "1"
const input = new NumoraInput(container, {
  enableLeadingZeros: false,
})

// Leading zeros preserved
// "007" → "007", "0001" → "0001"
const input = new NumoraInput(container, {
  enableLeadingZeros: true,
})`}
      </CodeBlock>

      <h2 className="text-stone-100 text-2xl">Rules</h2>
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

      <h2 className="text-stone-100 text-2xl">When to use each</h2>
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

      <h2 className="text-stone-100 text-2xl">Auto-prepend leading zero</h2>
      <p className="text-stone-400 text-base leading-6">
        Set <code>autoAddLeadingZero: true</code> to automatically prepend <code>0</code>
        before a bare decimal separator. Useful when you want <code>.5</code> stored as
        <code>0.5</code> so the value is unambiguously parseable downstream.
      </p>

      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

const input = new NumoraInput(container, {
  autoAddLeadingZero: true,
})

// Typing ".5"        → "0.5"
// Typing "-.5"       → "-0.5"  (requires enableNegative: true)
// Typing "."         → "0."
// Typing "1.5"       → "1.5"   (unchanged)`}
      </CodeBlock>

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
