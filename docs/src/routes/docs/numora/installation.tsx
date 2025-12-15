import { createFileRoute } from '@tanstack/react-router'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CodeBlock } from '@/components/CodeBlock'

export const Route = createFileRoute('/docs/numora/installation')({
  component: Installation,
})

function Installation() {
  return (
    <div className="prose prose-invert max-w-none">
      <h1>Installation</h1>
      <p className="text-lg text-muted-foreground">
        Get started with Numora core package for Vue, Svelte, or vanilla JavaScript.
      </p>

      <h2>Install</h2>
      <p>Install the core package:</p>
      <CodeBlock language="bash">
{`pnpm add numora
# or
npm install numora
# or
yarn add numora`}
      </CodeBlock>

      <Tabs defaultValue="vue" className="mt-8">
        <TabsList>
          <TabsTrigger value="vue">Vue</TabsTrigger>
          <TabsTrigger value="svelte">Svelte</TabsTrigger>
          <TabsTrigger value="vanilla">Vanilla JS</TabsTrigger>
        </TabsList>

        <TabsContent value="vue" className="mt-6">
          <h2>Vue</h2>
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
