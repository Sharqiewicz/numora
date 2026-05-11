import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/features/formatting')({
  head: () => ({
    meta: [
      { title: 'Numeric Input Formatting - Thousand Separators, Lakh, Wan | Numora' },
      { name: 'description', content: 'Add thousand separators and format numbers as you type with Numora. Supports Standard, Lakh, and Wan grouping styles with cursor position preservation.' },
      { property: 'og:title', content: 'Numeric Input Formatting - Thousand Separators, Lakh, Wan | Numora' },
      { property: 'og:description', content: 'Add thousand separators and format numbers as you type with Numora. Supports multiple grouping styles with cursor position preservation.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora/features/formatting' },
      { name: 'twitter:title', content: 'Numeric Input Formatting - Thousand Separators, Lakh, Wan | Numora' },
      { name: 'twitter:description', content: 'Add thousand separators and format numbers as you type with Numora. Cursor position preserved.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora/features/formatting' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([{ "@context": "https://schema.org", "@type": "TechArticle", "headline": "Number Formatting in Numora - Thousand Separators, Lakh, and Wan Grouping", "description": "Format numbers as you type in any JavaScript numeric input. Supports Standard (1,234,567), Indian Lakh (12,34,567), and East Asian Wan (123,4567) grouping with automatic cursor preservation.", "url": "https://numeric-input.com/docs/numora/features/formatting", "author": { "@type": "Person", "name": "Kacper Szarkiewicz", "url": "https://x.com/sharqiewicz" } }, { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora JS", "item": "https://numeric-input.com/docs/numora" }, { "@type": "ListItem", "position": 3, "name": "Number Formatting", "item": "https://numeric-input.com/docs/numora/features/formatting" }] }]) },
    ],
  }),
  component: Formatting,
})

function Formatting() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Formatting</h1>
      <p className="text-lg text-muted-foreground">
        Numora formats numbers with thousand separators as the user types, preserving cursor
        position throughout.
      </p>

      <h2>Grouping styles</h2>
      <CodeBlock language="typescript">
{`import { NumoraInput, ThousandStyle } from 'numora'

// Standard: 1,234,567
const input = new NumoraInput(container, {
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
})

// Indian (Lakh): 12,34,567
const input = new NumoraInput(container, {
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Lakh,
})

// Chinese (Wan): 123,4567
const input = new NumoraInput(container, {
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Wan,
})

// None: 1234567
const input = new NumoraInput(container, {
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.None,
})`}
      </CodeBlock>

      <h2>When to format</h2>
      <CodeBlock language="typescript">
{`import { NumoraInput, FormatOn } from 'numora'

// Blur (default) - format when the input loses focus
const input = new NumoraInput(container, {
  formatOn: FormatOn.Blur,
  thousandSeparator: ',',
})

// Change - format on every keystroke
const input = new NumoraInput(container, {
  formatOn: FormatOn.Change,
  thousandSeparator: ',',
})`}
      </CodeBlock>

      <h2>Automatic behaviors</h2>
      <ul>
        <li><strong>Cursor preservation</strong> - the cursor stays in the correct position when separators are added or removed during formatting</li>
        <li><strong>Separator skipping</strong> - backspace and delete automatically skip over thousand separators so they never need to be deleted manually</li>
      </ul>
    </div>
  )
}
