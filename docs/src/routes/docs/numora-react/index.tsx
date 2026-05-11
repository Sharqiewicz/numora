import { createFileRoute, Link } from '@tanstack/react-router'
import CHEVRON_RIGHT from '@/assets/chevron-right.svg'
import { Button } from '@/components/ui/button'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora-react/')({
  head: () => ({
    meta: [
      { title: 'Numora React - React Numeric Input Component | Docs' },
      { name: 'description', content: 'Get started with numora-react, the drop-in React numeric input component. Format numbers as you type, controlled or uncontrolled, compatible with React Hook Form and other form libraries.' },
      { property: 'og:title', content: 'Numora React - React Numeric Input Component | Docs' },
      { property: 'og:description', content: 'Drop-in React numeric input component. Controlled components, React Hook Form integration, raw value in onChange, formattedValue for display. Zero extra dependencies.' },
      { property: 'og:url', content: 'https://numeric-input.com/docs/numora-react' },
      { name: 'twitter:title', content: 'Numora React - React Numeric Input Component | Docs' },
      { name: 'twitter:description', content: 'Drop-in React numeric input component. React Hook Form compatible, raw and formatted value access.' },
    ],
    links: [
      { rel: 'canonical', href: 'https://numeric-input.com/docs/numora-react' },
    ],
    scripts: [
      { type: 'application/ld+json', children: JSON.stringify([
        { "@context": "https://schema.org", "@type": "SoftwareSourceCode", "name": "numora-react", "codeRepository": "https://github.com/sharqiewicz/numora", "programmingLanguage": "TypeScript", "runtimePlatform": "Browser", "url": "https://numeric-input.com/docs/numora-react", "description": "React numeric input component. Drop-in NumoraInput with TypeScript support, React Hook Form integration, and raw/formatted value separation." },
        { "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{ "@type": "ListItem", "position": 1, "name": "Home", "item": "https://numeric-input.com" }, { "@type": "ListItem", "position": 2, "name": "Numora React", "item": "https://numeric-input.com/docs/numora-react" }] }
      ]) },
    ],
  }),
  component: GetStarted,
})

function GetStarted() {
  return (
    <div className="prose prose-invert max-w-none text-muted-foreground!">
      <h1>Numora React - React Numeric Input Component</h1>
      <p>
        <strong className="font-numora">numora-react</strong> is a drop-in replacement for{' '}
        <code>{'<input>'}</code> that handles all numeric formatting, sanitization, and cursor management inside
        React. It's a <code>forwardRef</code> component that works in controlled and uncontrolled patterns and
        accepts every standard HTML input attribute.
      </p>

      <h2>What makes it different</h2>
      <p>
        On every change, <code>e.target.value</code> always returns the raw numeric string - no separators, no
        formatting characters. Safe to pass directly to BigNumber, ethers.js, viem, or any precision math library.
        No parsing step needed.
      </p>
      <p>
        <code>e.target.formattedValue</code> gives you the display string with thousand separators and decimal
        formatting for showing to the user. Two values, one event - clean separation between machine-readable and
        human-readable.
      </p>

      <CodeBlock language="tsx">
{`import { NumoraInput, FormatOn } from 'numora-react'

function Amount() {
  return (
    <NumoraInput
      formatOn={FormatOn.Change}
      maxDecimals={2}
      thousandSeparator=","
      onChange={(e) => {
        console.log(e.target.value)          // "1234.56" - raw
        console.log(e.target.formattedValue) // "1,234.56" - display
      }}
    />
  )
}`}
      </CodeBlock>

      <h2>React ecosystem</h2>
      <ul className="list-disc list-inside">
        <li><strong>Controlled & uncontrolled</strong> - works either way, no special props required</li>
        <li><strong>React Hook Form</strong> - drop-in compatible via <code>Controller</code></li>
        <li><strong>Formik</strong> - works as a custom field component</li>
        <li><strong>forwardRef</strong> - pass refs through to the underlying input</li>
        <li><strong>All HTML input props</strong> - <code>placeholder</code>, <code>disabled</code>, <code>className</code>, <code>aria-*</code>, etc.</li>
        <li><strong>TypeScript-first</strong> - full type definitions for props, events, and options</li>
      </ul>

      <h2>Why <strong className="font-numora">numora-react</strong>?</h2>
      <p>
        Every React DeFi app reinvents the numeric input. Uniswap, Aave, and Curve all maintain hundreds of lines of
        custom keystroke handlers, regex sanitizers, and cursor position trackers. numora-react ships all of that
        as a single component you configure with props.
      </p>
      <p>
        The component delegates to the same <Link to="/docs/numora">core numora engine</Link> - a vanilla TypeScript
        library with zero runtime dependencies. The React layer is a thin wrapper that hooks the engine into React's
        event system and value tracker.
      </p>

      <hr/>
      <h2>Next Steps</h2>
      <p>
        Follow the <Link to="/docs/numora-react/installation">Installation</Link> guide to add numora-react to
        your project, or read <Link to="/docs/numora-react/how-it-works">How It Works</Link> for the React-specific
        event architecture.
      </p>
      <div className="flex justify-between items-center gap-2 my-8">
        <Link to="/docs/numora-react/installation"><Button variant="default">Installation <img src={CHEVRON_RIGHT} alt="Chevron Right" className="w-4 h-4" /></Button></Link>
      </div>
    </div>
  )
}
