import { createFileRoute, Link } from '@tanstack/react-router';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/features/decimals')({
  head: () => ({
    meta: [
      { title: 'Decimals | Numora' },
      {
        name: 'description',
        content:
          'Enforce decimal place limits and validate decimal inputs with Numora. Set max and min decimal places, choose separators, and block invalid decimal entries.',
      },
      { property: 'og:title', content: 'Decimals | Numora' },
      {
        property: 'og:description',
        content:
          'Enforce decimal place limits and validate decimal inputs with Numora. Set max and min decimal places, choose separators, and block invalid decimal entries.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/decimals' },
      { name: 'twitter:title', content: 'Decimals | Numora' },
      {
        name: 'twitter:description',
        content: 'Enforce decimal place limits and validate decimal inputs with Numora. Set max and min decimal places, choose separators, and block invalid decimal entries.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/decimals' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Decimal handling in Numora: numeric input decimal precision',
            description:
              'Configure decimal precision in the Numora numeric input library. Set the decimal separator, max decimals, and decimal padding.',
            url: 'https://numeric-input.com/docs/numora/features/decimals',
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
                name: 'Decimals',
                item: 'https://numeric-input.com/docs/numora/features/decimals',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: Decimals,
});

function Decimals() {
  return (
    <div className="docs-prose max-w-[40rem]">
      <h1>Decimals</h1>
      <p>
        Decimal options limit how many decimal digits a value can have and set the separator between the integer and decimal parts.
      </p>

      <h2>Precision limits</h2>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

// Cap at 2 decimal places (the default). Extra digits are truncated on input
const input1 = new NumoraInput(container, {
  decimalMaxLength: 2,
})

// Pad to at least 2 decimal places as you type
const input2 = new NumoraInput(container, {
  decimalMinLength: 2,
  decimalMaxLength: 18,
  // typing "1" shows "1.00"
})`}
      </CodeBlock>

      <h2>Separators</h2>
      <CodeBlock language="typescript">
        {`import { NumoraInput, FormatOn, ThousandStyle } from 'numora'

// European format
const input = new NumoraInput(container, {
  decimalSeparator: ',',
  thousandSeparator: '.',
  thousandStyle: ThousandStyle.Thousand,
  formatOn: FormatOn.Change,
  // typing "1234,56" displays "1.234,56"
})`}
      </CodeBlock>

      <p>
        To detect separators from a locale, see{' '}
        <Link to="/docs/numora/features/locale">
          Locale
        </Link>
        .
      </p>

      <h2>Automatic behaviors</h2>
      <ul>
        <li>
          <strong>Separator input.</strong> Typing <code>,</code> or <code>.</code> inserts the
          configured decimal separator. Numora blocks it if the value already has one.
        </li>
        <li>
          <strong>Paste cleanup.</strong> If a pasted value has several separators (e.g.{' '}
          <code>"12.34.56"</code>), Numora keeps the first and removes the rest (<code>"12.3456"</code>).
        </li>
      </ul>
    </div>
  );
}
