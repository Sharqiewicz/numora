import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'

export const Route = createFileRoute('/docs/installation')({
  component: Installation,
})

function Installation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Installation</h1>
      <p className="text-lg text-muted-foreground">
        Choose your framework to get started with Numora.
      </p>

      <Tabs defaultValue="react" className="mt-8">
        <TabsList>
          <TabsTrigger value="react">React</TabsTrigger>
          <TabsTrigger value="vue">Vue</TabsTrigger>
          <TabsTrigger value="svelte">Svelte</TabsTrigger>
          <TabsTrigger value="vanilla">Vanilla JS</TabsTrigger>
        </TabsList>

        <TabsContent value="react" className="mt-6">
          <h2>React</h2>
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
        </TabsContent>

        <TabsContent value="vue" className="mt-6">
          <h2>Vue</h2>
          <p>Install the core package:</p>
          <CodeBlock language="bash">
{`pnpm add numora
# or
npm install numora
# or
yarn add numora`}
          </CodeBlock>

          <p className="text-muted-foreground">
            <strong>Note:</strong> Vue wrapper is coming soon. For now, use the core package
            directly.
          </p>

          <h3>Basic Usage</h3>
          <CodeBlock language="vue">
{`<template>
  <div ref="container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { NumoraInput } from 'numora'

const container = ref<HTMLElement | null>(null)
let numoraInput: NumoraInput | null = null

onMounted(() => {
  if (container.value) {
    numoraInput = new NumoraInput(container.value, {
      decimalMaxLength: 2,
      onChange: (value) => {
        console.log('Value:', value)
      },
    })
  }
})

onUnmounted(() => {
  // Cleanup if needed
})
</script>`}
          </CodeBlock>
        </TabsContent>

        <TabsContent value="svelte" className="mt-6">
          <h2>Svelte</h2>
          <p>Install the core package:</p>
          <CodeBlock language="bash">
{`pnpm add numora
# or
npm install numora
# or
yarn add numora`}
          </CodeBlock>

          <h3>Basic Usage</h3>
          <CodeBlock language="svelte">
{`<script lang="ts">
  import { onMount } from 'svelte'
  import { NumoraInput } from 'numora'

  let container: HTMLDivElement
  let numoraInput: NumoraInput | null = null

  onMount(() => {
    if (container) {
      numoraInput = new NumoraInput(container, {
        decimalMaxLength: 2,
        onChange: (value) => {
          console.log('Value:', value)
        },
      })
    }
  })
</script>

<div bind:this={container}></div>`}
          </CodeBlock>
        </TabsContent>

        <TabsContent value="vanilla" className="mt-6">
          <h2>Vanilla JavaScript</h2>
          <p>Install the core package:</p>
          <CodeBlock language="bash">
{`pnpm add numora
# or
npm install numora
# or
yarn add numora`}
          </CodeBlock>

          <h3>Basic Usage</h3>
          <CodeBlock language="typescript">
{`import { NumoraInput } from 'numora'

const container = document.querySelector('#my-input-container')

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  onChange: (value) => {
    console.log('Value changed:', value)
  },
})`}
          </CodeBlock>

          <h3>Advanced Example</h3>
          <CodeBlock language="typescript">
{`import { NumoraInput, FormatOn, ThousandStyle } from 'numora'

const container = document.querySelector('#my-input-container')

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 18,
  decimalMinLength: 2,
  decimalSeparator: '.',
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
  formatOn: FormatOn.Change,
  enableCompactNotation: true,
  enableNegative: false,
  enableLeadingZeros: false,
  rawValueMode: true,
  placeholder: 'Enter amount',
  onChange: (value) => {
    console.log('Raw value:', value)
    console.log('Display value:', numoraInput.value)
    console.log('As number:', numoraInput.valueAsNumber)
  },
})`}
          </CodeBlock>
        </TabsContent>
      </Tabs>
    </div>
  )
}
