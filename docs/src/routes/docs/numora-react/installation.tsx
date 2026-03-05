import { createFileRoute } from '@tanstack/react-router'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'
import { FormatOn } from 'numora'

export const Route = createFileRoute('/docs/numora-react/installation')({
  head: () => ({
    meta: [
      { title: 'Installation - numora-react | React Numeric Input Component' },
      { name: 'description', content: 'Install numora-react and start using NumoraInput, the React wrapper for the numora core library.' },
      { property: 'og:title', content: 'Installation - numora-react | React Numeric Input Component' },
      { property: 'og:description', content: 'Install numora-react and start using NumoraInput, the React wrapper for the numora core library.' },
      { property: 'og:url', content: 'https://numora.xyz/docs/numora-react/installation' },
      { name: 'twitter:title', content: 'Installation - numora-react | React Numeric Input Component' },
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
{`pnpm i numora-react`}
      </CodeBlock>

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

    </div>
  )
}
