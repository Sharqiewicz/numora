import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/installation')({
  head: () => ({
    meta: [
      { title: 'Installation - Numora Core | JavaScript Numeric Input' },
      { name: 'description', content: 'How to install numora in your JavaScript project. Zero dependencies, 6.4kb gzipped, works with any framework.' },
      { property: 'og:title', content: 'Installation - Numora Core | JavaScript Numeric Input' },
      { property: 'og:description', content: 'How to install numora in your JavaScript project. Zero dependencies, 6.4kb gzipped, works with any framework.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora/installation' },
      { name: 'twitter:title', content: 'Installation - Numora Core | JavaScript Numeric Input' },
      { name: 'twitter:description', content: 'How to install numora in your JavaScript project. Zero dependencies, works with any framework.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numora.xyz/docs/numora/installation' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numora.xyz" }, { "@type": "ListItem", "position": 2, "name": "Numora JS", "item": "https://numora.xyz/docs/numora" }, { "@type": "ListItem", "position": 3, "name": "Installation", "item": "https://numora.xyz/docs/numora/installation" }] }) },
    ],
  }),
  component: Installation,
})


function Installation() {

  return (
    <div className="prose prose-invert max-w-none">
      <h1>Installation</h1>
      <p className="text-lg text-muted-foreground">
        Get started with the Numora core package.
      </p>

      <h2>Install</h2>
      <p>Install the core package:</p>
      <CodeBlock language="bash">
{`pnpm i numora`}
      </CodeBlock>

      <p>Basic usage:</p>
          <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const container = document.querySelector('#my-input-container')

const numoraInput = new NumoraInput(container)`}
          </CodeBlock>
    </div>
  )
}
