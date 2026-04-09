import { createFileRoute, Link } from '@tanstack/react-router'
import CHEVRON_RIGHT from '@/assets/chevron-right.svg'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/docs/numora-react/')({
  head: () => ({
    meta: [
      { title: 'Numora React - React Numeric Input & Number Input Component' },
      { name: 'description', content: 'Install and configure numora-react - the zero-dependency numeric input and number input component for React. Format numbers as you type with full cursor control.' },
      { property: 'og:title', content: 'Numora React - React Numeric Input & Number Input Component' },
      { property: 'og:description', content: 'Install and configure numora-react - the zero-dependency numeric input and number input component for React.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora-react' },
      { name: 'twitter:title', content: 'Numora React - React Numeric Input & Number Input Component' },
      { name: 'twitter:description', content: 'Install and configure numora-react - the zero-dependency numeric input and number input component for React.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numora.xyz/docs/numora-react' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numora.xyz" }, { "@type": "ListItem", "position": 2, "name": "Numora React", "item": "https://numora.xyz/docs/numora-react" }] }) },
    ],
  }),
  component: GetStarted,
})

function GetStarted() {
  return (
    <div className="prose prose-invert max-w-none text-muted-foreground!">
      <h1>Get Started</h1>
      <p >
        <strong className="font-numora">numora</strong> is a powerful, <strong className="font-numora">framework-agnostic</strong>, tamper-proof numeric input library that provides safe number handling,
         sanitization, validation, formatting and more.
      </p>

      <h2>Why <strong className="font-numora">numora</strong>?</h2>

      <p>If you audit the codebases of the top 10 DeFi protocols like Uniswap, Aave, Curve, Balancer, and others will notice a pattern. When it comes to the most critical UI component in finance - the Numeric Input - every single one of them has built a custom implementation from scratch</p>
      <ul className="list-disc list-inside ">
        <li key="uniswap">Uniswap maintains ~200 lines of custom regex and locale logic.</li>
        <li key="aave">Aave wraps a formatting library with heavy custom validation.</li>
        <li key="curve">Curve relies on a complex chain of hooks to handle state.</li>
      </ul>

      <p><strong>There is no standard.</strong></p>
      <p> Every team wastes days reinventing the wheel: writing the correct comma/dot separator logic with all edge cases, fighting with parseFloat precision loss, and patching bugs where mobile keyboards insert ghost characters. Or even worse - they write their own formatting logic from scratch.</p>



      <p><strong>That's where </strong><strong className="font-numora">numora</strong><strong> comes in. It is the new standard for numeric inputs.</strong></p>
      <hr/>
      <h2>Next Steps</h2>
      <p>
        Check out the <a href="/docs/numora/installation">Installation</a> guide for detailed setup
        instructions for your framework, or explore the{' '}
        <a href="/docs/numora/features/sanitization">Features</a> to learn about all the capabilities
        Numora offers.
      </p>
      <div className="flex justify-between items-center gap-2 my-8">
        <Link to="/docs/numora-react/installation"><Button variant="default">Installation <img src={CHEVRON_RIGHT} alt="Chevron Right" className="w-4 h-4" /></Button></Link>
      </div>
    </div>
  )
}
