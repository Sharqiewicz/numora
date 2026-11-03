import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/sanitization')({
  head: () => ({
    meta: [
      { title: 'Sanitization | Numora' },
      {
        name: 'description',
        content:
          'Sanitize numeric inputs and block invalid characters with Numora. Clean pasted values from block explorers and block invalid keystrokes.',
      },
      { property: 'og:title', content: 'Sanitization | Numora' },
      {
        property: 'og:description',
        content:
          'Sanitize numeric inputs and block invalid characters with Numora. Clean pasted values from block explorers and block invalid keystrokes.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora/features/sanitization',
      },
      { name: 'twitter:title', content: 'Sanitization | Numora' },
      {
        name: 'twitter:description',
        content: 'Sanitize numeric inputs and block invalid characters with Numora. Clean pasted values from block explorers and block invalid keystrokes.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/sanitization' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Numeric input sanitization in Numora: blocking invalid characters',
            description:
              'Sanitize numeric inputs and block invalid characters with Numora. Clean pasted values from block explorers and block invalid keystrokes.',
            url: 'https://numeric-input.com/docs/numora/features/sanitization',
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
                name: 'Sanitization',
                item: 'https://numeric-input.com/docs/numora/features/sanitization',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: Sanitization,
});

function Sanitization() {
  return (
    <div className="docs-prose max-w-[40rem]">
      <h1>Sanitization</h1>
      <p>
        Numora runs every value through a sequential sanitization pipeline before it formats. For
        the full architecture and pipeline diagram, see{' '}
        <Link to="/docs/numora/anatomy" hash="sanitization">
          Anatomy: sanitization
        </Link>
        . This page covers character filtering and the standalone <code>removeThousandSeparators</code> utility.
      </p>

      <h2>Non-numeric character filtering</h2>
      <p>Numora removes invalid characters and keeps:</p>
      <ul>
        <li>Digits (0-9)</li>
        <li>
          Decimal separator (configured via <code>decimalSeparator</code>)
        </li>
        <li>
          Negative sign (<code>-</code>) if <code>enableNegative</code> is true
        </li>
      </ul>
      <p>
        A sign character is only ever kept in the leading position: a <code>-</code> found anywhere
        else in the string is removed rather than rejected (<code>"5-3"</code> → <code>"53"</code>), and a leading <code>+</code> is always removed (<code>"+5"</code> → <code>"5"</code>)
        since Numora has no concept of an explicit positive sign.
      </p>

      <h2>removeThousandSeparators</h2>
      <p>
        Numora exports a standalone <code>removeThousandSeparators</code> utility that strips
        thousand separators from a formatted string. Use it to get a raw numeric
        value out of a display string.
      </p>
      <p>
        To read the raw value from the input, see{' '}
        <Link to="/docs/numora/features/value-types">Value types</Link>.
      </p>

      <CodeBlock language="typescript">
        {`import { removeThousandSeparators } from 'numora'

removeThousandSeparators('1,234,567.89', ',') // → '1234567.89'
removeThousandSeparators('1.234.567,89', '.') // → '1234567,89'
removeThousandSeparators('1 234 567', ' ')    // → '1234567'`}
      </CodeBlock>
    </div>
  );
}
