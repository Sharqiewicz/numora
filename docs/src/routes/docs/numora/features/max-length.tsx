import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/max-length')({
  head: () => ({
    meta: [
      { title: 'Max length | Numora' },
      {
        name: 'description',
        content:
          'Cap numeric input length by raw digits with Numora. Thousand separators are not counted, so the limit applies to the digits and not to the formatted character count.',
      },
      { property: 'og:title', content: 'Max length | Numora' },
      {
        property: 'og:description',
        content:
          'Cap numeric input length by raw digits with Numora. Thousand separators are not counted, so the limit applies to the digits and not to the formatted character count.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/max-length' },
      { name: 'twitter:title', content: 'Max length | Numora' },
      {
        name: 'twitter:description',
        content: 'Cap numeric input length by raw digits with Numora. Thousand separators are not counted, so the limit applies to the digits and not to the formatted character count.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/max-length' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Max length in Numora: a raw-counted numeric input length limit',
            description:
              'Cap numeric input length by raw digits with Numora. Thousand separators are excluded from the count, so the limit applies to the numeric value and not to the formatted display.',
            url: 'https://numeric-input.com/docs/numora/features/max-length',
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
                name: 'Max length',
                item: 'https://numeric-input.com/docs/numora/features/max-length',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: MaxLength,
});

function MaxLength() {
  return (
    <div className="docs-prose max-w-[40rem]">
      <h1>Max length</h1>
      <p>
        Max length caps the input by raw character count, so thousand separators are excluded.
        The native <code>maxLength</code> attribute counts formatted characters:{' '}
        <code>1,234,567</code> is 9 characters but only 7 digits, and Numora counts 7.
      </p>

      <CodeBlock language="typescript">
        {`import { NumoraInput, FormatOn, ThousandStyle } from 'numora'

const input = new NumoraInput(container, {
  maxLength: 7,
  thousandStyle: ThousandStyle.Thousand,
  thousandSeparator: ',',
  formatOn: FormatOn.Change,
})

// User types: 1, 2, 3, 4, 5, 6, 7  → "1,234,567"  (allowed)
// Next keystroke is blocked - raw length is already 7.`}
      </CodeBlock>

      <h2>Rules</h2>
      <ul>
        <li>
          Counts the <strong>raw</strong> value after sanitization. Thousand separators and{' '}
          <code>decimalMinLength</code> padding are excluded
        </li>
        <li>
          The decimal separator <em>is</em> counted (it is part of the raw value)
        </li>
        <li>
          A leading <code>-</code> sign <em>is</em> counted
        </li>
        <li>
          Truncation happens from the right; if it would leave a trailing decimal separator, that
          separator is also removed (<code>"1234.56"</code> capped at 5 → <code>"1234"</code>)
        </li>
        <li>
          If truncation would leave a bare <code>"-"</code>, the result is <code>""</code>
        </li>
      </ul>

      <h2>Pasted values</h2>
      <p>
        Pastes are truncated after sanitization. Pasting <code>"99999999"</code> into an input with{' '}
        <code>maxLength: 4</code> commits <code>"9999"</code>.
      </p>

      <h2>Standalone utility</h2>
      <p>
        To truncate a string outside the input pipeline, use the exported{' '}
        <code>truncateToMaxLength</code>:
      </p>

      <CodeBlock language="typescript">
        {`import { truncateToMaxLength } from 'numora'

truncateToMaxLength('1234567', 5)        // → '12345'
truncateToMaxLength('1234,56', 5, ',')   // → '1234'   (custom separator)`}
      </CodeBlock>
    </div>
  );
}
