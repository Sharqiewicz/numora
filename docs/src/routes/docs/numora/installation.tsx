import { createFileRoute, Link } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/CodeBlock'
import CHEVRON_RIGHT from '@/assets/chevron-right.svg'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/docs/numora/installation')({
  head: () => ({
    meta: [
      { title: 'Install Numora - JavaScript Numeric Input Library Setup Guide' },
      { name: 'description', content: 'Install the Numora JavaScript numeric input library with npm, pnpm, yarn, or bun. Zero dependencies, TypeScript-ready, works with any framework. Live number formatting in minutes.' },
      { property: 'og:title', content: 'Install Numora - JavaScript Numeric Input Library Setup Guide' },
      { property: 'og:description', content: 'Install the Numora JavaScript numeric input library. Zero dependencies, TypeScript-ready, works with any framework.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/installation' },
      { name: 'twitter:title', content: 'Install Numora - JavaScript Numeric Input Library Setup Guide' },
      { name: 'twitter:description', content: 'Install the Numora JavaScript numeric input library. Zero dependencies, works with any framework.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/installation' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([
        { "@context": "https://schema.org", "@type": "TechArticle", "headline": "Install Numora - JavaScript Numeric Input Library Setup", "description": "Step-by-step installation guide for the numora JavaScript numeric input library. Works with npm, pnpm, yarn, and bun.", "url": "https://numeric-input.com/docs/numora/installation", "author": { "@type": "Person", "name": "Kacper Szarkiewicz", "url": "https://x.com/sharqiewicz" } },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora JS", "item": "https://numeric-input.com/docs/numora" }, { "@type": "ListItem", "position": 3, "name": "Installation", "item": "https://numeric-input.com/docs/numora/installation" }] }
      ]) },
    ],
  }),
  component: Installation,
})


function Installation() {

  return (
    <div className="prose prose-invert max-w-none">
      <h1>Install Numora - JavaScript Numeric Input</h1>
      <p className="text-lg text-muted-foreground">
        Add the numora JavaScript numeric input library to any project - no framework required.
      </p>

      <h2>Install</h2>
      <p>numora has zero runtime dependencies. Pick your package manager:</p>

      <Tabs defaultValue="pnpm">
        <TabsList>
          <TabsTrigger value="pnpm">pnpm</TabsTrigger>
          <TabsTrigger value="npm">npm</TabsTrigger>
          <TabsTrigger value="yarn">yarn</TabsTrigger>
          <TabsTrigger value="bun">bun</TabsTrigger>
        </TabsList>
        <TabsContent value="pnpm">
          <CodeBlock language="bash">{`pnpm add numora`}</CodeBlock>
        </TabsContent>
        <TabsContent value="npm">
          <CodeBlock language="bash">{`npm install numora`}</CodeBlock>
        </TabsContent>
        <TabsContent value="yarn">
          <CodeBlock language="bash">{`yarn add numora`}</CodeBlock>
        </TabsContent>
        <TabsContent value="bun">
          <CodeBlock language="bash">{`bun add numora`}</CodeBlock>
        </TabsContent>
      </Tabs>

      <h2>Basic Usage</h2>
      <p>Import the <code>NumoraInput</code> class and attach it to any container element:</p>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const container = document.querySelector('#my-input-container')

const numoraInput = new NumoraInput(container, {
  maxDecimals: 2,
  thousandSeparator: ',',
  decimalSeparator: '.',
})`}
      </CodeBlock>

      <h2>Options</h2>
      <p>
        numora accepts a <code>FormattingOptions</code> object as the second argument. Common options:
      </p>
      <ul className="list-disc list-inside">
        <li><code>decimalSeparator</code> - character separating integer from decimal part (default <code>'.'</code>)</li>
        <li><code>thousandSeparator</code> - character inserted between digit groups (default <code>','</code>)</li>
        <li><code>thousandStyle</code> - <code>None</code>, <code>Thousand</code>, <code>Lakh</code>, or <code>Wan</code></li>
        <li><code>formatOn</code> - when separators are applied: <code>FormatOn.Blur</code> (default) or <code>FormatOn.Change</code></li>
        <li><code>decimalMinLength</code> - pad decimals to a minimum number of digits on blur</li>
        <li><code>enableNegative</code> - allow negative values (default <code>false</code>)</li>
        <li><code>enableCompactNotation</code> - expand <code>1k → 1000</code> on input</li>
        <li><code>rawValueMode</code> - emit raw values without separators in <code>onChange</code></li>
      </ul>
      <p>
        See the <Link to="/docs/numora/features/formatting">Formatting</Link> and{' '}
        <Link to="/docs/numora/features/sanitization">Sanitization</Link> docs for the full options reference.
      </p>

      <h2>TypeScript</h2>
      <p>
        numora ships with full TypeScript declarations - no <code>@types</code> package needed. Import types
        directly:
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

      <h2>Next Steps</h2>
      <p>
        Learn how the <code>beforeinput</code>-based event architecture works in{' '}
        <Link to="/docs/numora/how-it-works">How It Works</Link>, or jump to the{' '}
        <Link to="/docs/numora/features/formatting">Formatting</Link> feature docs.
      </p>
      <div className="flex items-center gap-2 my-8">
        <Link to="/docs/numora/how-it-works">
          <Button variant="default">
            How It Works <img src={CHEVRON_RIGHT} alt="Chevron Right" className="w-4 h-4" />
          </Button>
        </Link>
        <Link to="/docs/numora/features/formatting">
          <Button variant="outline">
            Formatting Features <img src={CHEVRON_RIGHT} alt="Chevron Right" className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
