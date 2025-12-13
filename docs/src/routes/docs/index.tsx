import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'

export const Route = createFileRoute('/docs/')({
  component: GetStarted,
})

function GetStarted() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Get Started</h1>
      <p className="text-lg text-muted-foreground">
        Numora is a powerful, tamper-proof number input library that provides safe number handling,
        formatting, and validation for web applications.
      </p>

      <h2>Why Numora?</h2>
      <p>
        Numora solves common problems with number inputs in web applications:
      </p>
      <ul>
        <li>
          <strong>Tamper-proof:</strong> Prevents users from entering invalid characters or
          manipulating values
        </li>
        <li>
          <strong>Mobile-friendly:</strong> Handles mobile keyboard artifacts and edge cases
        </li>
        <li>
          <strong>Flexible formatting:</strong> Supports thousand separators, decimal precision,
          compact notation, and more
        </li>
        <li>
          <strong>Framework agnostic:</strong> Works with React, Vue, Svelte, or vanilla JavaScript
        </li>
        <li>
          <strong>Type-safe:</strong> Built with TypeScript for better developer experience
        </li>
      </ul>

      <h2>Quick Start</h2>
      <p>Install Numora for your framework:</p>

      <CodeBlock language="bash">
{`# React
pnpm add numora-react

# Core (for other frameworks)
pnpm add numora`}
      </CodeBlock>

      <p>Then use it in your component:</p>

      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

function App() {
  return (
    <NumoraInput
      placeholder="Enter amount"
      onChange={(e) => console.log(e.target.value)}
    />
  )
}`}
        language="tsx"
        config={{
          placeholder: 'Enter amount',
        }}
        description="Try typing a number to see Numora in action"
      />

      <h2>Next Steps</h2>
      <p>
        Check out the <a href="/docs/installation">Installation</a> guide for detailed setup
        instructions for your framework, or explore the{' '}
        <a href="/docs/features/sanitization">Features</a> to learn about all the capabilities
        Numora offers.
      </p>
    </div>
  )
}
