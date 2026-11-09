import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora-react/features/sanitization')({
  head: () => ({
    meta: [
      { title: 'Sanitization | Numora React' },
      {
        name: 'description',
        content:
          'Sanitize numeric input with the NumoraInput React component. Block invalid characters and clean pasted values.',
      },
      { property: 'og:title', content: 'Sanitization | Numora React' },
      {
        property: 'og:description',
        content:
          'Sanitize numeric input with the NumoraInput React component. Block invalid characters and clean pasted values.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/sanitization',
      },
      { name: 'twitter:title', content: 'Sanitization | Numora React' },
      {
        name: 'twitter:description',
        content: 'Sanitize numeric input with the NumoraInput React component. Block invalid characters and clean pasted values.',
      },
    ],
    links: [
      {
        rel: 'canonical',
        href: 'https://numeric-input.com/docs/numora-react/features/sanitization',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Sanitization | Numora React',
            description:
              'Sanitize numeric input in React with the NumoraInput component. Block invalid characters and clean pasted values.',
            url: 'https://numeric-input.com/docs/numora-react/features/sanitization',
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
                name: 'Sanitization',
                item: 'https://numeric-input.com/docs/numora-react/features/sanitization',
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
        Numora React runs every value through a sequential sanitization pipeline before formatting. For
        the full architecture and pipeline diagram, see the{' '}
        <Link to="/docs/numora-react/anatomy" hash="sanitization">
          Sanitization section of Anatomy
        </Link>
        . The sections below cover the configurable features.
      </p>

      <h2>Non-numeric character filtering</h2>
      <p>Numora React removes every character except:</p>
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
        Numora React keeps a sign character only in the leading position. A <code>-</code> anywhere
        else in the string is stripped, not rejected (<code>"5-3"</code> → <code>"53"</code>), and a leading <code>+</code> is always removed (<code>"+5"</code> → <code>"5"</code>)
        because Numora React has no explicit positive sign.
      </p>

      <h2>removeThousandSeparators</h2>
      <p>
        The <code>numora</code> core package exports a standalone{' '}
        <code>removeThousandSeparators</code> utility that strips thousand separators from a formatted string. Use it when you need
        the raw numeric value from a display string.
      </p>
      <p>
        To read the raw value in <code>onChange</code>, see{' '}
        <Link to="/docs/numora-react/features/value-types">Value types</Link>.
      </p>

      <CodeBlock language="tsx">
        {`import { removeThousandSeparators } from 'numora'

removeThousandSeparators('1,234,567.89', ',') // → '1234567.89'
removeThousandSeparators('1.234.567,89', '.') // → '1234567,89'
removeThousandSeparators('1 234 567', ' ')    // → '1234567'`}
      </CodeBlock>
    </div>
  );
}
