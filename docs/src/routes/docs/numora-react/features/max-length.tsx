import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';

export const Route = createFileRoute('/docs/numora-react/features/max-length')({
  head: () => ({
    meta: [
      { title: 'Max length | Numora React' },
      {
        name: 'description',
        content:
          'Cap numeric input length by raw digits in the NumoraInput React component. Thousand separators are not counted, so the limit applies to the digits and not to the formatted character count.',
      },
      { property: 'og:title', content: 'Max length | Numora React' },
      {
        property: 'og:description',
        content:
          'Cap numeric input length by raw digits in the NumoraInput React component. Thousand separators are not counted, so the limit applies to the digits and not to the formatted character count.',
      },
      {
        property: 'og:url',
        content: 'https://numeric-input.com/docs/numora-react/features/max-length',
      },
      { name: 'twitter:title', content: 'Max length | Numora React' },
      {
        name: 'twitter:description',
        content:
          'Cap numeric input length by raw digits in the NumoraInput React component. Thousand separators are not counted, so the limit applies to the digits and not to the formatted character count.',
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
              'Cap React numeric input length by raw digits with Numora React. Thousand separators are not counted, so the limit applies to the digits and not to the formatted character count.',
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
    <div className="docs-prose max-w-[36rem]">
      <h1>Max length</h1>
      <p>
        Cap the input by raw character count, so thousand separators are not counted. The native{' '}
        <code>maxLength</code> attribute counts formatted characters: <code>1,234,567</code> is 9
        characters but only 7 digits, and <code>maxLength</code> here counts 7.
      </p>

      <div className="space-y-4">
        <ExampleWithDemo
          title="7 raw digits, grouped by default"
          description={'Try typing more than 7 digits. The 8th keystroke is blocked'}
          language="tsx"
          code={`<NumoraInput
  maxLength={7}
  formatOn="change"
/>`}
          config={{ maxLength: 7, formatOn: 'change' }}
        />
      </div>

      <h2>Rules</h2>
      <ul>
        <li>
          Counts the <strong>raw</strong> value after sanitization. Thousand separators and{' '}
          <code>decimalMinLength</code> padding are excluded
        </li>
        <li>
          The decimal separator <em>is</em> counted, because it is part of the raw value
        </li>
        <li>
          A leading <code>-</code> sign <em>is</em> counted
        </li>
        <li>
          Numora truncates from the right. If that would leave a trailing decimal separator, it
          removes the separator too (<code>"1234.56"</code> capped at 5 → <code>"1234"</code>)
        </li>
        <li>
          If truncation would leave a bare <code>"-"</code>, the result is <code>""</code>
        </li>
      </ul>

      <h2>Pasted values</h2>
      <p>
        Numora React truncates a paste after sanitizing it. Pasting <code>"99999999"</code> into an
        input with <code>maxLength={'{4}'}</code> commits <code>"9999"</code>.
      </p>
      <p>
        Typing is different: a keystroke that would take the raw value past the limit is rejected,
        and nothing is cut. Values your code passes in are truncated like a paste.
      </p>
      <p>
        Truncation happens after compact and scientific notation expand, so it can change the
        magnitude. With <code>allowCompactNotation</code> and <code>maxLength={'{5}'}</code>, a
        pasted <code>1.5m</code> expands to <code>1500000</code> and is cut to <code>15000</code>.
        To refuse an over-long paste, drop <code>maxLength</code> and check the length in{' '}
        <Link to="/docs/numora-react/features/validation">isAllowed</Link>. With both set,{' '}
        <code>isAllowed</code> only sees the value after it was cut.
      </p>

      <h2>Standalone utility</h2>
      <p>
        To truncate outside the input pipeline, import <code>truncateToMaxLength</code> from the{' '}
        <code>numora/pipeline</code> entry point of the core package:
      </p>

      <CodeBlock language="tsx">
        {`import { truncateToMaxLength } from 'numora/pipeline'

truncateToMaxLength('1234567', 5) // → '12345'`}
      </CodeBlock>
    </div>
  );
}
