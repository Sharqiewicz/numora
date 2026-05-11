import { createFileRoute, Link } from '@tanstack/react-router'
import CHEVRON_RIGHT from '@/assets/chevron-right.svg'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/')({
  head: () => ({
    meta: [
      { title: 'Numora - JavaScript Numeric Input Library | Docs' },
      { name: 'description', content: 'Get started with numora, the zero-dependency JavaScript numeric input library. Attach to any input element - works with React, Vue, Svelte, Angular, and Vanilla JS. 6.4kb gzipped.' },
      { property: 'og:title', content: 'Numora - JavaScript Numeric Input Library | Docs' },
      { property: 'og:description', content: 'Get started with numora, the zero-dependency JavaScript numeric input library. Framework-agnostic - works with React, Vue, Svelte, Angular, and Vanilla JS. 6.4kb gzipped.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora' },
      { name: 'twitter:title', content: 'Numora - JavaScript Numeric Input Library | Docs' },
      { name: 'twitter:description', content: 'Zero-dependency JavaScript numeric input library. Framework-agnostic - works with React, Vue, Svelte, Angular, and Vanilla JS. 6.4kb gzipped.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([
        { "@context": "https://schema.org", "@type": "SoftwareSourceCode", "name": "numora", "codeRepository": "https://github.com/sharqiewicz/numora", "programmingLanguage": "TypeScript", "runtimePlatform": "Browser", "url": "https://numeric-input.com/docs/numora", "description": "Zero-dependency JavaScript numeric input library. Precision-first, framework-agnostic, 6.4kb gzipped." },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora JS", "item": "https://numeric-input.com/docs/numora" }] }
      ]) },
    ],
  }),
  component: GetStarted,
})

function GetStarted() {
  return (
    <div className="prose prose-invert max-w-none text-muted-foreground!">
      <h1>Numora - JavaScript Numeric Input Library</h1>
      <p>
        <strong className="font-numora">numora</strong> is a zero-dependency TypeScript library that turns any{' '}
        <code>{'<input>'}</code> element into a precision numeric input. Unlike{' '}
        <code>{'<input type="number">'}</code>, numora uses <code>type="text"</code> under the hood so you control
        exactly what the user can type, paste, and see.
      </p>

      <h2>Why <strong className="font-numora">numora</strong>?</h2>

      <p>
        If you audit the codebases of the top 10 DeFi protocols - Uniswap, Aave, Curve, Balancer - you'll notice a pattern.
        For the most critical UI component in finance, the numeric input, every single one has built a custom implementation
        from scratch.
      </p>
      <ul className="list-disc list-inside">
        <li>Uniswap maintains ~200 lines of custom regex and locale logic.</li>
        <li>Aave wraps a formatting library with heavy custom validation.</li>
        <li>Curve relies on a complex chain of hooks to handle state.</li>
      </ul>

      <p><strong>There is no standard.</strong> Every team wastes days reinventing the wheel: comma/dot separator logic, parseFloat precision loss, mobile keyboard ghost characters.</p>

      <p>
        <strong>numora is the new standard for numeric inputs</strong> - a precision-first library you drop in once, configure with options, and forget about.
      </p>

      <h2>What you get</h2>
      <ul className="list-disc list-inside">
        <li><strong>Zero dependencies</strong> - no moment, no lodash, no formatting library</li>
        <li><strong>6.4 kb gzipped</strong> - negligible bundle cost</li>
        <li><strong>String-only values</strong> - never converts to <code>Number</code>, so no IEEE 754 rounding errors on amounts like <code>0.1 + 0.2</code></li>
        <li><strong>Full cursor preservation</strong> - editing in the middle of a formatted number keeps the caret in place after reformatting</li>
        <li><strong>Thousand separator formatting</strong> - Standard, Indian Lakh, and East Asian Wan grouping styles</li>
        <li><strong>Paste sanitization</strong> - strips non-numeric characters, expands compact notation (<code>1k → 1000</code>) and scientific notation (<code>1.5e-7 → 0.00000015</code>)</li>
        <li><strong>Framework-agnostic</strong> - works with React, Vue, Svelte, Angular, or plain HTML</li>
      </ul>

      <h2>Vanilla JS API</h2>
      <p>
        The core package exports a <code>NumoraInput</code> class. Instantiate it with a container element and an
        optional <code>FormattingOptions</code> object. The class attaches all event listeners and manages internal state -
        no build step, no JSX, no reactivity system required.
      </p>
      <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const container = document.querySelector('#amount-input')

const input = new NumoraInput(container, {
  maxDecimals: 2,
  thousandSeparator: ',',
  decimalSeparator: '.',
  enableNegative: false,
})

container.addEventListener('change', (e) => {
  console.log(e.target.value) // raw string, e.g. "1234.56"
})`}
      </CodeBlock>

      <p>
        The <code>NumoraInput</code> class is the same engine used by the{' '}
        <Link to="/docs/numora-react">numora-react</Link> component. Both share the formatting pipeline, sanitization
        logic, and options interface.
      </p>

      <hr/>
      <h2>Next Steps</h2>
      <p>
        Follow the <Link to="/docs/numora/installation">Installation</Link> guide to add numora to your project, or
        read <Link to="/docs/numora/how-it-works">How It Works</Link> to understand the <code>beforeinput</code>-based
        architecture.
      </p>
      <div className="flex justify-between items-center gap-2 my-8">
        <Link to="/docs/numora/installation"><Button variant="default">Installation <img src={CHEVRON_RIGHT} alt="Chevron Right" className="w-4 h-4" /></Button></Link>
      </div>
    </div>
  )
}
