import { createFileRoute, Link } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'
import { FormatOn } from 'numora'
import CHEVRON_RIGHT from '@/assets/chevron-right.svg'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/docs/numora-react/installation')({
  head: () => ({
    meta: [
      { title: 'Install numora-react - React Numeric Input Component Setup' },
      { name: 'description', content: 'Add a precision-ready React numeric input component to your project in under a minute. Install numora-react, drop in NumoraInput, and get live number formatting with zero extra dependencies.' },
      { property: 'og:title', content: 'Install numora-react - React Numeric Input Component Setup' },
      { property: 'og:description', content: 'Install numora-react and drop in NumoraInput for precision number formatting in any React project. Zero extra dependencies, TypeScript-first.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react/installation' },
      { name: 'twitter:title', content: 'Install numora-react - React Numeric Input Component Setup' },
      { name: 'twitter:description', content: 'Drop-in React numeric input component. Live number formatting in minutes.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react/installation' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([
        { "@context": "https://schema.org", "@type": "TechArticle", "headline": "Install numora-react - React Numeric Input Component Setup", "description": "Step-by-step installation guide for numora-react, the React numeric input component.", "url": "https://numeric-input.com/docs/numora-react/installation", "author": { "@type": "Person", "name": "Kacper Szarkiewicz", "url": "https://x.com/sharqiewicz" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora React", "item": "https://numeric-input.com/docs/numora-react" }, { "@type": "ListItem", "position": 3, "name": "Installation", "item": "https://numeric-input.com/docs/numora-react/installation" }] }
      ]) },
    ],
  }),
  component: Installation,
})

function Installation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Install numora-react - React Numeric Input</h1>
      <p className="text-lg text-muted-foreground">
        Drop a precision-ready numeric input component into any React project in under a minute.
      </p>

      <h2>Install</h2>
      <p>
        numora-react has one peer dependency: <code>numora</code> (the core engine). Both are installed together.
        Pick your package manager:
      </p>

      <Tabs defaultValue="pnpm">
        <TabsList>
          <TabsTrigger value="pnpm">pnpm</TabsTrigger>
          <TabsTrigger value="npm">npm</TabsTrigger>
          <TabsTrigger value="yarn">yarn</TabsTrigger>
          <TabsTrigger value="bun">bun</TabsTrigger>
        </TabsList>
        <TabsContent value="pnpm">
          <CodeBlock language="bash">{`pnpm add numora numora-react`}</CodeBlock>
        </TabsContent>
        <TabsContent value="npm">
          <CodeBlock language="bash">{`npm install numora numora-react`}</CodeBlock>
        </TabsContent>
        <TabsContent value="yarn">
          <CodeBlock language="bash">{`yarn add numora numora-react`}</CodeBlock>
        </TabsContent>
        <TabsContent value="bun">
          <CodeBlock language="bash">{`bun add numora numora-react`}</CodeBlock>
        </TabsContent>
      </Tabs>

      <p>
        <strong>Peer dependency:</strong> React 16.8 or higher (hooks support).
      </p>

      <h3>Basic Usage</h3>
      <ExampleWithDemo
        code={`import { NumoraInput, FormatOn } from 'numora-react'

function App() {
  return (
    <NumoraInput
      maxDecimals={2}
      formatOn={FormatOn.Change}
    />
  )
}`}
        language="tsx"
        config={{
          formatOn: FormatOn.Change,
          maxDecimals: 2,
        }}
        description="Try typing a number to see formatting in action"
      />

      <h2>Controlled component</h2>
      <p>
        Use <code>useState</code> with <code>NumoraInput</code> like any controlled input. The raw value (no
        separators) lives in <code>e.target.value</code>:
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
        maxDecimals={6}
        formatOn={FormatOn.Change}
      />
      <p>Raw value: {amount}</p>
    </>
  )
}`}
      </CodeBlock>

      <h2>What you get</h2>
      <ul className="list-disc list-inside">
        <li><code>e.target.value</code> - raw numeric string, no separators (safe for BigNumber, ethers, viem)</li>
        <li><code>e.target.formattedValue</code> - display string with thousand separators</li>
        <li><strong>forwardRef support</strong> - pass refs through to the underlying input</li>
        <li><strong>All standard HTML input props</strong> - <code>placeholder</code>, <code>disabled</code>, <code>className</code>, <code>aria-*</code>, etc.</li>
        <li><strong>React Hook Form compatible</strong> - works via <code>Controller</code></li>
        <li><strong>TypeScript-first</strong> - every prop and event is typed</li>
      </ul>

      <h2>TypeScript</h2>
      <p>
        <code>NumoraInput</code> accepts all standard <code>HTMLInputElement</code> props plus{' '}
        <code>FormattingOptions</code>. Import types directly from <code>numora-react</code>:
      </p>
      <CodeBlock language="typescript">
{`import type {
  FormattingOptions,
  NumoraInputChangeEvent,
  NumoraHTMLInputElement,
} from 'numora-react'`}
      </CodeBlock>

      <hr />

      <h2>Next Steps</h2>
      <p>
        Read <Link to="/docs/numora-react/how-it-works">How It Works</Link> to understand the React event
        architecture, or jump to <Link to="/docs/numora-react/features/formatting">Formatting</Link> features.
      </p>
      <div className="flex items-center gap-2 my-8">
        <Link to="/docs/numora-react/how-it-works">
          <Button variant="default">
            How It Works <img src={CHEVRON_RIGHT} alt="Chevron Right" className="w-4 h-4" />
          </Button>
        </Link>
        <Link to="/docs/numora-react/integrations/react-hook-form">
          <Button variant="outline">
            React Hook Form <img src={CHEVRON_RIGHT} alt="Chevron Right" className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
