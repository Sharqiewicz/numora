import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/leading-zeros')({
  head: () => ({
    meta: [
      { title: 'Leading zeros | Numora' },
      {
        name: 'description',
        content:
          'Control leading zero behavior in numeric inputs with Numora. Strip or keep integer leading zeros, and prepend "0" before bare decimal points like ".5" → "0.5".',
      },
      { property: 'og:title', content: 'Leading zeros | Numora' },
      {
        property: 'og:description',
        content:
          'Control leading zero behavior in numeric inputs with Numora. Strip or keep integer leading zeros, and prepend "0" before bare decimal points like ".5" → "0.5".',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora/features/leading-zeros',
      },
      { name: 'twitter:title', content: 'Leading zeros | Numora' },
      {
        name: 'twitter:description',
        content:
          'Control leading zero behavior in numeric inputs with Numora. Strip or keep integer leading zeros, and prepend "0" before bare decimal points like ".5" → "0.5".',
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
            headline: 'Leading zero control in Numora numeric inputs',
            description:
              'Control leading zero behavior in JavaScript numeric inputs with Numora. Strip leading zeros, or keep them for IDs and product codes.',
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
                name: 'Numora',
                item: 'https://numeric-input.com/docs/numora',
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'Leading zeros',
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
    <div className="docs-prose max-w-[36rem]">
      <h1>Leading zeros</h1>
      <p>
        By default, Numora removes leading zeros from the integer part of a number. Set{' '}
        <code>allowLeadingZeros: true</code> to keep them.
      </p>

      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

// Default: leading zeros removed
// "007" → "7", "0001" → "1"
const input1 = new NumoraInput(container, {
  allowLeadingZeros: false,
})

// Leading zeros kept
// "007" → "007", "0001" → raw "0001" (shown as "0,001" with the default grouping)
const input2 = new NumoraInput(container, {
  allowLeadingZeros: true,
})`}
      </CodeBlock>

      <h2>Rules</h2>
      <ul>
        <li>
          Only the integer part is affected. Decimal zeros are never touched (<code>"0.05"</code>{' '}
          stays <code>"0.05"</code>).
        </li>
        <li>
          Numora always keeps a bare <code>"0"</code>
        </li>
        <li>
          Negative numbers keep their sign (<code>"-007"</code> → <code>"-7"</code>, with{' '}
          <code>allowNegative: true</code>)
        </li>
      </ul>

      <p>
        Keep the default for currency and numeric inputs. Enable leading zeros for product codes,
        IDs and other formats where zero-padding matters.
      </p>

      <h2>Auto-prepend leading zero</h2>
      <p>
        Set <code>padLeadingZero: true</code> to prepend <code>0</code> before a bare decimal
        separator. Use it when you want <code>.5</code> stored as <code>0.5</code>, so the value
        parses the same way everywhere downstream.
      </p>

      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

const input = new NumoraInput(container, {
  padLeadingZero: true,
})

// Typing ".5"        → "0.5"
// Typing "-.5"       → "-0.5"  (requires allowNegative: true)
// Typing "."         → "0."
// Typing "1.5"       → "1.5"   (unchanged)`}
      </CodeBlock>

      <ul>
        <li>
          Runs after <code>allowLeadingZeros</code> trimming, so you can combine the two. Only the
          optional <code>maxLength</code> truncation runs later.
        </li>
        <li>
          Uses your <code>decimalSeparator</code> (e.g. <code>","</code> for European format)
        </li>
      </ul>
    </div>
  );
}
