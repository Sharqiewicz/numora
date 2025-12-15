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
        Get started with the Numora core package for Svelte or vanilla JavaScript.
      </p>

      <h2>Install</h2>
      <p>Install the core package:</p>
      <CodeBlock language="bash">
{`pnpm add numora`}
      </CodeBlock>

      <Tabs defaultValue="svelte" className="mt-8">
        <TabsList>
          <TabsTrigger value="svelte">svelte</TabsTrigger>
          <TabsTrigger value="vanilla">javascript</TabsTrigger>
        </TabsList>

        <TabsContent value="svelte" className="mt-6">
          <h2>Svelte</h2>
          <h3>Basic Usage</h3>
          <CodeBlock language="typescript">
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
          <h2>javascript</h2>
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
