import { createFileRoute } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';
import { FormatOn } from 'numora';

export const Route = createFileRoute('/docs/numora-react/features/max-length')({
  head: () => ({
    meta: [
      { title: 'Max length | Numora React' },
      {
        name: 'description',
        content:
          'Cap numeric input length by raw digits in the NumoraInput React component. Thousand separators are not counted, so the limit applies to the actual value.',
      },
      { property: 'og:title', content: 'Max length | Numora React' },
      {
        property: 'og:description',
        content:
          'Cap numeric input length by raw digits in the NumoraInput React component. Thousand separators are not counted, so the limit applies to the actual value.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/max-length',
      },
      { name: 'twitter:title', content: 'Max length | Numora React' },
      {
        name: 'twitter:description',
        content: 'Cap numeric input length by raw digits in the NumoraInput React component. Thousand separators are not counted, so the limit applies to the actual value.',
      },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/features/max-length' },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Max length | Numora React',
            description:
              'Cap React numeric input length by raw digits with Numora React. Thousand separators are not counted, so the limit applies to the actual numeric value.',
            url: 'https://numeric-input.com/docs/numora-react/features/max-length',
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
                name: 'Max length',
                item: 'https://numeric-input.com/docs/numora-react/features/max-length',
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
        Cap the input by raw character count, so thousand separators are not counted. The native{' '}
        <code>maxLength</code> attribute counts formatted characters: <code>1,234,567</code> is 9
        characters but only 7 digits, and <code>maxLength</code> here counts 7.
      </p>

      <div className="space-y-4">
        <ExampleWithDemo
          title="7 raw digits, formatted with thousands"
          description={'Try typing more than 7 digits. The 8th keystroke is blocked'}
          language="tsx"
          code={`<NumoraInput
  maxLength={7}
  formatOn={FormatOn.Change}
/>`}
          config={{ maxLength: 7, formatOn: FormatOn.Change }}
        />
      </div>

      <h2>Rules</h2>
      <ul>
        <li>
          Counts the <strong>raw</strong> value after sanitization. Thousand separators are
          stripped before measuring, and <code>decimalMinLength</code> padding is excluded
        </li>
        <li>
          The decimal separator <em>is</em> counted (it's part of the raw value)
        </li>
        <li>
          A leading <code>-</code> sign <em>is</em> counted
        </li>
        <li>
          Truncation happens from the right; if it would leave a trailing decimal separator, that
          separator is also stripped (<code>"1234.56"</code> capped at 5 → <code>"1234"</code>)
        </li>
        <li>
          If truncation would leave a bare <code>"-"</code>, the result is <code>""</code>
        </li>
      </ul>

      <h2>Pasted values</h2>
      <p>
        Pastes are truncated after sanitization. Pasting <code>"99999999"</code> into an input with{' '}
        <code>maxLength={'{4}'}</code> commits <code>"9999"</code>.
      </p>

      <h2>Standalone utility</h2>
      <p>
        To truncate outside the input pipeline, the <code>numora</code> core package{' '}
        exports <code>truncateToMaxLength</code>:
      </p>

      <CodeBlock language="tsx">
        {`import { truncateToMaxLength } from 'numora'

truncateToMaxLength('1234567', 5) // → '12345'`}
      </CodeBlock>
    </div>
  );
}
