import { createFileRoute, Link } from '@tanstack/react-router';
import { InstallTabs } from '@/components/InstallTabs';
import { CodeBlock } from '@/components/CodeBlock';

export const Route = createFileRoute('/docs/numora/installation')({
  head: () => ({
    meta: [
      { title: 'Installation | Numora' },
      {
        name: 'description',
        content:
          'Install the Numora TypeScript numeric input library with npm, pnpm, yarn, or bun. Zero dependencies, no framework required.',
      },
      { property: 'og:title', content: 'Installation | Numora' },
      {
        property: 'og:description',
        content:
          'Install the Numora TypeScript numeric input library with npm, pnpm, yarn, or bun. Zero dependencies, no framework required.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/installation' },
      { name: 'twitter:title', content: 'Installation | Numora' },
      {
        name: 'twitter:description',
        content:
          'Install the Numora TypeScript numeric input library with npm, pnpm, yarn, or bun. Zero dependencies, no framework required.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora/installation' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Install Numora',
            description:
              'How to install the Numora TypeScript numeric input library with npm, pnpm, yarn, or bun.',
            url: 'https://numeric-input.com/docs/numora/installation',
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
                name: 'Installation',
                item: 'https://numeric-input.com/docs/numora/installation',
              },
            ],
          },
        ]),
      },
    ],
  }),
  component: Installation,
});

function Installation() {
  return (
    <div className="docs-prose max-w-[40rem]">
      <h1>Install Numora</h1>
      <p>
        Add the Numora TypeScript numeric input library to any project. No framework required.
      </p>

      <h2>Install</h2>
      <p>Numora has zero runtime dependencies. Pick your package manager:</p>

      <InstallTabs packages="numora" />

      <h2>Basic usage</h2>
      <p>
        Import the <code>NumoraInput</code> class and pass it a container element:
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput, FormatOn, ThousandStyle } from 'numora'

const container = document.querySelector('#my-input-container')

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  thousandStyle: ThousandStyle.Thousand,
  thousandSeparator: ',',
  decimalSeparator: '.',
  formatOn: FormatOn.Change,
  // typing 1234.56 displays "1,234.56"
})`}
      </CodeBlock>

      <h2>Options</h2>
      <p>
        Numora requires an options object (<code>NumoraInputOptions</code>) as the second argument. It extends{' '}
        <code>FormattingOptions</code> with <code>locale</code>, <code>onChange</code>, <code>value</code> and <code>defaultValue</code>. Common
        options:
      </p>
      <ul>
        <li>
          <code>decimalSeparator</code>: the character between the integer and decimal parts (default{' '}
          <code>'.'</code>)
        </li>
        <li>
          <code>thousandSeparator</code>: the character between digit groups (default{' '}
          <code>','</code>). Separators only appear when <code>thousandStyle</code> is not{' '}
          <code>None</code>
        </li>
        <li>
          <code>thousandStyle</code>: <code>None</code> (default), <code>Thousand</code>,{' '}
          <code>Lakh</code>, or <code>Wan</code>
        </li>
        <li>
          <code>formatOn</code>: when separators are applied, <code>FormatOn.Blur</code> (default)
          or <code>FormatOn.Change</code>
        </li>
        <li>
          <code>decimalMaxLength</code>: maximum number of decimal digits (default <code>2</code>)
        </li>
        <li>
          <code>decimalMinLength</code>: pad decimals to a minimum number of digits as you type (default <code>0</code>)
        </li>
        <li>
          <code>enableNegative</code>: allow negative values (default <code>false</code>)
        </li>
        <li>
          <code>enableCompactNotation</code>: expand <code>1k → 1000</code> on input
        </li>
        <li>
          <code>rawValueMode</code>: emit raw values without separators in <code>onChange</code>
        </li>
      </ul>
      <p>
        See the <Link to="/docs/numora/features/formatting">Formatting</Link> and{' '}
        <Link to="/docs/numora/features/sanitization">Sanitization</Link> docs for details on
        these options.
      </p>

      <h2>TypeScript</h2>
      <p>
        Numora ships its own declarations. Import types directly:
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput, FormatOn, ThousandStyle } from 'numora'
import type { FormattingOptions } from 'numora'

const options: FormattingOptions = {
  decimalMaxLength: 6,
  formatOn: FormatOn.Change,
  thousandStyle: ThousandStyle.Thousand,
  thousandSeparator: ',',
}`}
      </CodeBlock>
    </div>
  );
}
