import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'

export const Route = createFileRoute('/docs/numora-react/installation')({
  head: () => ({
    meta: [
      { title: 'Installation — numora-react | React Numeric Input Component' },
      { name: 'description', content: 'Install numora-react and start using NumoraInput, the React wrapper for the numora core library.' },
      { property: 'og:title', content: 'Installation — numora-react | React Numeric Input Component' },
      { property: 'og:description', content: 'Install numora-react and start using NumoraInput, the React wrapper for the numora core library.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora-react/installation' },
      { name: 'twitter:title', content: 'Installation — numora-react | React Numeric Input Component' },
      { name: 'twitter:description', content: 'Install numora-react and start using NumoraInput, the React wrapper for the numora core library.' },
    ],
  }),
  component: Installation,
})

function Installation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Installation</h1>
      <p className="text-lg text-muted-foreground">
        Get started with Numora React.
      </p>

      <h2>Install</h2>
      <p>Install the React wrapper package:</p>
      <CodeBlock language="bash">
{`pnpm add numora-react
# or
npm install numora-react
# or
yarn add numora-react`}
      </CodeBlock>

      <h3>Basic Usage</h3>
      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

function App() {
  return (
    <NumoraInput
      maxDecimals={2}
      thousandSeparator=","
      onChange={(e) => {
        console.log('Value:', e.target.value)
      }}
    />
  )
}`}
        language="tsx"
        config={{
          maxDecimals: 2,
          thousandSeparator: ',',
        }}
        description="Try typing a number to see formatting in action"
      />

      <h3>Advanced Example</h3>
      <ExampleWithDemo
        code={`import { NumoraInput } from 'numora-react'

function PaymentForm() {
  return (
    <NumoraInput
      maxDecimals={18}
      formatOn="change"
      thousandSeparator=","
      thousandsGroupStyle="thousand"
      enableCompactNotation={true}
      placeholder="Enter amount"
      onChange={(e) => {
        console.log('Formatted value:', e.target.value)
      }}
    />
  )
}`}
        language="tsx"
        config={{
          maxDecimals: 18,
          formatOn: 'change',
          thousandSeparator: ',',
          thousandsGroupStyle: 'thousand',
          enableCompactNotation: true,
          placeholder: 'Enter amount',
        }}
        description="Try typing or pasting values to see real-time formatting"
      />
    </div>
  )
}
