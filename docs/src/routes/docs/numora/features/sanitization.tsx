import { createFileRoute, Link } from '@tanstack/react-router';
import { SanitizationJourney } from '@/components/anatomy/SanitizationJourney';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/sanitization')({
  head: () => ({
    meta: [
      { title: 'Sanitization | Numora' },
      {
        name: 'description',
        content:
          'How Numora sanitizes numeric input: which characters it keeps, how it reads pasted text, and the standalone removeThousandSeparators utility.',
      },
      { property: 'og:title', content: 'Sanitization | Numora' },
      {
        property: 'og:description',
        content:
          'How Numora sanitizes numeric input: which characters it keeps, how it reads pasted text, and the standalone removeThousandSeparators utility.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora/features/sanitization',
      },
      { name: 'twitter:title', content: 'Sanitization | Numora' },
      {
        name: 'twitter:description',
        content:
          'How Numora sanitizes numeric input: which characters it keeps, how it reads pasted text, and the standalone removeThousandSeparators utility.',
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
              'How Numora sanitizes numeric input: which characters it keeps, how it reads pasted text, and the standalone removeThousandSeparators utility.',
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
    <div className="docs-prose max-w-[36rem]">
      <h1>Sanitization</h1>
      <p>
        Numora runs every value through a sanitization pipeline before it formats. Watch
        three messy values go through it. Each step marks what it is about to change. Steps with
        nothing to do are skipped:
      </p>
      <SanitizationJourney />
      <p>
        <Link to="/docs/numora/anatomy" hash="sanitization">
          Anatomy: sanitization
        </Link>{' '}
        covers the pipeline in full. This page covers character filtering and the standalone{' '}
        <code>removeThousandSeparators</code> utility.
      </p>

      <h2>Non-numeric character filtering</h2>
      <p>Numora removes invalid characters and keeps:</p>
      <ul>
        <li>Digits (0-9)</li>
        <li>
          Decimal separator (configured via <code>decimalSeparator</code>)
        </li>
        <li>
          Negative sign (<code>-</code>) if <code>allowNegative</code> is true
        </li>
      </ul>
      <p>
        Numora keeps a sign character only in the leading position. A <code>-</code> anywhere else
        in the string is removed and the rest of the input stays, so <code>"5-3"</code> becomes{' '}
        <code>"53"</code>. Numora also removes a leading <code>+</code>, so <code>"+5"</code>{' '}
        becomes <code>"5"</code>, because it has no explicit positive sign.
      </p>

      <p>
        While typing, <code>.</code> and <code>,</code> are both decimal keys, whatever the
        configured separator.
      </p>

      <h2>What the figure leaves out</h2>
      <p>
        The figure has every optional step switched on. A default field skips three of the ten:
        compact expansion runs only with <code>allowCompactNotation</code>, the leading{' '}
        <code>0</code> is added only with <code>padLeadingZero</code>, and the cut at{' '}
        <code>maxLength</code> runs only when <code>maxLength</code> is set. So a default field
        turns <code>$.75</code> into <code>.75</code>, and <code>0.75</code> only with{' '}
        <code>padLeadingZero</code>. Leading zeros are removed unless you set{' '}
        <code>allowLeadingZeros</code>.
      </p>
      <p>The pipeline also does four things the ten steps don't name:</p>
      <ul>
        <li>
          <strong>Length cap.</strong> Numora reads the first 10,000 characters of any text and
          drops the rest.
        </li>
        <li>
          <strong>Whitespace and invisible characters.</strong> Step 1 removes every whitespace
          character, zero-width characters (U+200B to U+200D, U+2060) and bidi marks (U+200E,
          U+200F, U+061C, U+202A to U+202E, U+2066 to U+2069). <code>1 234</code> becomes{' '}
          <code>1234</code>.
        </li>
        <li>
          <strong>Paste format detection.</strong> Pasted, dropped and autofilled text is first
          checked for another locale's format. The figure skips this and reads its text with the
          field's own separators. Two different marks: the last one is the decimal mark, so{' '}
          <code>1.234,56</code> pasted into an en-US field is read as <code>1234.56</code>. One
          mark, repeated: it is grouping, so <code>1.234.567</code> is read as <code>1234567</code>.
          One mark, once: it is grouping when the digits around it form valid groups (
          <code>1,234</code>) and the decimal mark when they do not (<code>1.5</code>). The field's
          own decimal separator is always the decimal mark. Dropped or autofilled text in a
          focused field that formats on change is the exception: Numora reads it as its own display
          text.
        </li>
        <li>
          <strong>Minus signs and decimal glyphs.</strong> Step 3 turns fullwidth and other native
          digits into <code>0-9</code>. It turns three minus variants into <code>-</code>: U+2212,
          U+FF0D and U+FE63. An en dash or em dash is not a minus sign and is removed, so{' '}
          <code>–5</code> becomes <code>5</code> even with <code>allowNegative</code>. It turns a
          native decimal mark (<code>٫</code>, <code>،</code>, <code>，</code>, <code>．</code>,{' '}
          <code>。</code>) into the field's decimal separator.
        </li>
      </ul>

      <h2>removeThousandSeparators</h2>
      <p>
        Numora exports a standalone <code>removeThousandSeparators</code> utility that strips
        thousand separators from a formatted string. Use it to get a raw numeric value out of a
        display string.
      </p>
      <p>
        To read the raw value from the input, see{' '}
        <Link to="/docs/numora/features/value-types">Value types</Link>.
      </p>

      <CodeBlock language="typescript">
        {`import { removeThousandSeparators } from 'numora/pipeline'

removeThousandSeparators('1,234,567.89', ',') // → '1234567.89'
removeThousandSeparators('1.234.567,89', '.') // → '1234567,89'
removeThousandSeparators('1 234 567', ' ')    // → '1234567'`}
      </CodeBlock>
    </div>
  );
}
