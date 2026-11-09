import { createFileRoute, Link } from '@tanstack/react-router';
import { InstallTabs } from '@/components/InstallTabs';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';
import { FormatOn } from 'numora';

export const Route = createFileRoute('/docs/numora-react/installation')({
  head: () => ({
    meta: [
      { title: 'Installation | Numora React' },
      {
        name: 'description',
        content:
          'Add a React numeric input component to your project. Install Numora React, render NumoraInput, and get live number formatting with no dependencies beyond its peers react and numora.',
      },
      {
        property: 'og:title',
        content: 'Installation | Numora React',
      },
      {
        property: 'og:description',
        content:
          'Install Numora React and render NumoraInput for string-based number formatting in any React project. No dependencies beyond its peers react and numora. Written for TypeScript.',
      },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react/installation' },
      {
        name: 'twitter:title',
        content: 'Installation | Numora React',
      },
      {
        name: 'twitter:description',
        content: 'React numeric input component with live number formatting.',
      },
    ],
    links: [{ rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/installation' }],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify([
          {
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Installation | Numora React',
            description:
              'Installation guide for Numora React, the React numeric input component.',
            url: 'https://numeric-input.com/docs/numora-react/installation',
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
                name: 'Installation',
                item: 'https://numeric-input.com/docs/numora-react/installation',
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
      <h1>Installation</h1>
      <p>
        Install Numora React and render <code>NumoraInput</code> in any React project.
      </p>

      <h2>Install</h2>
      <p>
        Numora React has peer dependencies on <code>react</code> (17 or later), <code>numora</code>{' '}
        (3.5.0 or later, the core engine), and optionally <code>react-dom</code> (17 or later). The
        command below installs <code>numora</code> and <code>numora-react</code> together. Pick your
        package manager:
      </p>

      <InstallTabs packages="numora numora-react" />

      <h2>Basic usage</h2>
      <ExampleWithDemo
        code={`import { NumoraInput, FormatOn } from 'numora-react'

function App() {
  return (
    <NumoraInput
      decimalMaxLength={2}
      formatOn={FormatOn.Change}
    />
  )
}`}
        language="tsx"
        config={{
          formatOn: FormatOn.Change,
          decimalMaxLength: 2,
        }}
        description="Type a number to see it formatted"
      />

      <h2>Controlled component</h2>
      <p>
        Use <code>useState</code> with <code>NumoraInput</code> like any controlled input. The raw
        value (no separators) is in <code>e.target.value</code>. See{' '}
        <Link to="/docs/numora-react">Get started</Link> for raw vs formatted values:
      </p>
      <CodeBlock language="tsx">
        {`import { useState } from 'react'
import { NumoraInput, FormatOn } from 'numora-react'

function AmountField() {
  const [amount, setAmount] = useState('')

  return (
    <>
      <NumoraInput
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        decimalMaxLength={6}
        formatOn={FormatOn.Change}
      />
      <p>Raw value: {amount}</p>
    </>
  )
}`}
      </CodeBlock>

      <h2>TypeScript</h2>
      <p>
        Types ship with the package. Import them from <code>numora-react</code>:
      </p>
      <CodeBlock language="typescript">
        {`import type {
  FormattingOptions,
  NumoraInputProps,
  NumoraInputChangeEvent,
  NumoraHTMLInputElement,
} from 'numora-react'`}
      </CodeBlock>
    </div>
  );
}
