import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

export const Route = createFileRoute('/docs/numora-react/features/sanitization')({
  head: () => ({
    meta: [
      { title: 'Numeric Input Sanitization | numora-react' },
      {
        name: 'description',
        content:
          'Sanitize numeric inputs using the NumoraInput React component. Block invalid characters, clean pasted values, and handle all input vectors automatically.',
      },
      { property: 'og:title', content: 'Numeric Input Sanitization | numora-react' },
      {
        property: 'og:description',
        content:
          'Sanitize numeric inputs using the NumoraInput React component. Block invalid characters and clean pasted values.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/sanitization',
      },
      { name: 'twitter:title', content: 'Numeric Input Sanitization | numora-react' },
      {
        name: 'twitter:description',
        content: 'Sanitize numeric inputs using the NumoraInput React component.',
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
            headline: 'Numeric Input Sanitization in numora-react - React Component Input Cleaning',
            description:
              'Sanitize numeric inputs in React using the NumoraInput component. Block invalid characters, clean pasted values, and handle all input vectors automatically.',
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
    <div className="prose prose-invert max-w-xl">
      <h1 className="text-stone-100">Sanitization</h1>
      <p className="text-stone-400 text-base leading-6">
        Numora sanitizes every value through a sequential pipeline before formatting is applied. For
        the full architecture and pipeline diagram, see{' '}
        <Link to="/docs/numora/anatomy" hash="sanitization" className="underline link-underline hover:text-stone-100 transition-colors">
          Anatomy: Sanitization
        </Link>
        . The sections below cover each configurable sanitization feature.
      </p>

      <h2 className="text-stone-100 text-2xl">Non-numeric Character Filtering</h2>
      <p className="text-stone-400 text-base leading-6">Numora automatically removes invalid characters while preserving:</p>
      <ul>
        <li>Digits (0-9)</li>
        <li>
          Decimal separator (configured via <code>decimalSeparator</code>)
        </li>
        <li>
          Negative sign (<code>-</code>) if <code>enableNegative</code> is true
        </li>
      </ul>
      <p className="text-stone-400 text-base leading-6">
        A sign character is only ever kept in the leading position: a <code>-</code> found anywhere
        else in the string is stripped rather than rejected (<code>"5-3"</code> → <code>"53"</code>
        ), and a leading <code>+</code> is always removed (<code>"+5"</code> → <code>"5"</code>)
        since Numora has no concept of an explicit positive sign.
      </p>

      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

<NumoraInput maxDecimals={2} />`}
        language="tsx"
        config={{
          maxDecimals: 2,
        }}
        description="Try typing letters or special characters - only numbers will be kept"
      />

      <h2 className="text-stone-100 text-2xl">removeThousandSeparators</h2>
      <p className="text-stone-400 text-base leading-6">
        Numora exports a standalone <code>removeThousandSeparators</code> utility from the core
        package for stripping thousand separators from a formatted string. Useful when you need to
        extract a raw numeric value from a display string.
      </p>
      <p className="text-stone-400 text-base leading-6">
        (You can also access the raw value directly via <code>e.target.value</code> in{' '}
        <code>onChange</code> - separators are always stripped.)
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
