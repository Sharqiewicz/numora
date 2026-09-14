import { createFileRoute, Link } from '@tanstack/react-router';
import { InstallTabs } from '@/components/InstallTabs';
import { CodeBlock } from '@/components/CodeBlock';
import CHEVRON_RIGHT from '@/assets/chevron-right.svg';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/docs/numora/installation')({
  head: () => ({
    meta: [
      { title: 'Install Numora - Numeric Input Library Setup Guide' },
      {
        name: 'description',
        content:
          'Install the Numora JavaScript numeric input library with npm, pnpm, yarn, or bun. Zero dependencies, TypeScript-ready, works with any framework. Live number formatting in minutes.',
      },
      { property: 'og:title', content: 'Install Numora - Numeric Input Library Setup Guide' },
      {
        property: 'og:description',
        content:
          'Install the Numora JavaScript numeric input library. Zero dependencies, TypeScript-ready, works with any framework.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/installation' },
      { name: 'twitter:title', content: 'Install Numora - Numeric Input Library Setup Guide' },
      {
        name: 'twitter:description',
        content:
          'Install the Numora JavaScript numeric input library. Zero dependencies, works with any framework.',
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
            headline: 'Install Numora - Numeric Input Library Setup',
            description:
              'Step-by-step installation guide for the numora JavaScript numeric input library. Works with npm, pnpm, yarn, and bun.',
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
                name: 'Numora JS',
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
    <div className="prose prose-invert max-w-xl">
      <h1 className="text-foreground">Install numora</h1>
      <p className="text-muted-foreground text-base leading-6">
        Add the numora JavaScript numeric input library to any project - no framework required.
      </p>

      <h2 className="text-foreground text-2xl">Install</h2>
      <p className="text-muted-foreground text-base leading-6">numora has zero runtime dependencies. Pick your package manager:</p>

      <InstallTabs packages="numora" />

      <h2 className="text-foreground text-2xl">Basic Usage</h2>
      <p className="text-muted-foreground text-base leading-6">
        Import the <code>NumoraInput</code> class and attach it to any container element:
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput } from 'numora'

const container = document.querySelector('#my-input-container')

const numoraInput = new NumoraInput(container, {
  maxDecimals: 2,
  thousandSeparator: ',',
  decimalSeparator: '.',
})`}
      </CodeBlock>

      <h2 className="text-foreground text-2xl">Options</h2>
      <p className="text-muted-foreground text-base leading-6">
        numora accepts a <code>FormattingOptions</code> object as the second argument. Common
        options:
      </p>
      <ul className="list-disc list-inside">
        <li>
          <code>decimalSeparator</code> - character separating integer from decimal part (default{' '}
          <code>'.'</code>)
        </li>
        <li>
          <code>thousandSeparator</code> - character inserted between digit groups (default{' '}
          <code>','</code>)
        </li>
        <li>
          <code>thousandStyle</code> - <code>None</code>, <code>Thousand</code>, <code>Lakh</code>,
          or <code>Wan</code>
        </li>
        <li>
          <code>formatOn</code> - when separators are applied: <code>FormatOn.Blur</code> (default)
          or <code>FormatOn.Change</code>
        </li>
        <li>
          <code>decimalMinLength</code> - pad decimals to a minimum number of digits on blur
        </li>
        <li>
          <code>enableNegative</code> - allow negative values (default <code>false</code>)
        </li>
        <li>
          <code>enableCompactNotation</code> - expand <code>1k → 1000</code> on input
        </li>
        <li>
          <code>rawValueMode</code> - emit raw values without separators in <code>onChange</code>
        </li>
      </ul>
      <p className="text-muted-foreground text-base leading-6">
        See the <Link to="/docs/numora/features/formatting" className="underline link-underline hover:text-foreground transition-colors">Formatting</Link> and{' '}
        <Link to="/docs/numora/features/sanitization" className="underline link-underline hover:text-foreground transition-colors">Sanitization</Link> docs for the full options
        reference.
      </p>

      <h2 className="text-foreground text-2xl">TypeScript</h2>
      <p className="text-muted-foreground text-base leading-6">
        numora ships with full TypeScript declarations - no <code>@types</code> package needed.
        Import types directly:
      </p>
      <CodeBlock language="typescript">
        {`import { NumoraInput, FormatOn, ThousandStyle } from 'numora'
import type { FormattingOptions } from 'numora'

const options: FormattingOptions = {
  maxDecimals: 6,
  formatOn: FormatOn.Change,
  thousandStyle: ThousandStyle.Thousand,
  thousandSeparator: ',',
}`}
      </CodeBlock>

      <hr />

      <h2 className="text-foreground text-2xl">Next Steps</h2>
      <p className="text-muted-foreground text-base leading-6">
        Learn how the <code>beforeinput</code>-based event architecture works in the{' '}
        <Link to="/docs/numora/anatomy" className="underline link-underline hover:text-foreground transition-colors">Anatomy</Link> guide, or jump to the{' '}
        <Link to="/docs/numora/features/formatting" className="underline link-underline hover:text-foreground transition-colors">Formatting</Link> feature docs.
      </p>
      <div className="flex items-center gap-2 my-8">
        <Link to="/docs/numora/anatomy">
          <Button variant="default">
            Anatomy <img src={CHEVRON_RIGHT} alt="Chevron Right" className="w-4 h-4" />
          </Button>
        </Link>
        <Link to="/docs/numora/features/formatting">
          <Button variant="outline">
            Formatting Features <img src={CHEVRON_RIGHT} alt="Chevron Right" className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
