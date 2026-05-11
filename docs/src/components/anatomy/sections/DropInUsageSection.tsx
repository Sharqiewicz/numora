import { Link } from '@tanstack/react-router'
import { FormatOn, ThousandStyle } from 'numora'
import { CodeBlock } from '@/components/CodeBlock'
import { ExampleWithDemo } from '@/components/ExampleWithDemo'
import type { SectionProps } from './types'

const reactExample = `import { NumoraInput, FormatOn, ThousandStyle } from 'numora-react'

<NumoraInput
  formatOn={FormatOn.Change}
  thousandSeparator=","
  thousandStyle={ThousandStyle.Thousand}
  maxDecimals={2}
  enableCompactNotation
  onChange={(e) => console.log(e.target.value)}
/>`

const vanillaExample = `import { NumoraInput, FormatOn, ThousandStyle } from 'numora'

new NumoraInput(container, {
  formatOn: FormatOn.Change,
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
  decimalMaxLength: 2,
  enableCompactNotation: true,
  onChange: (value) => console.log(value),
})`

export function DropInUsageSection({ pkg }: SectionProps) {
  const installPath =
    pkg === 'numora-react' ? '/docs/numora-react/installation' : '/docs/numora/installation'
  const installCmd = pkg === 'numora-react' ? 'pnpm add numora-react numora' : 'pnpm add numora'

  return (
    <section className="space-y-4">
      <h2>Drop-in usage</h2>
      <p>
        Everything above is one component (or one class) and a handful of options.
        Install:
      </p>
      <CodeBlock language="bash">{installCmd}</CodeBlock>
      <p>And paste a messy payload like <code>"$1,234.56abc"</code> into this:</p>
      <ExampleWithDemo
        code={pkg === 'numora-react' ? reactExample : vanillaExample}
        language={pkg === 'numora-react' ? 'tsx' : 'typescript'}
        config={{
          formatOn: FormatOn.Change,
          thousandSeparator: ',',
          thousandStyle: ThousandStyle.Thousand,
          maxDecimals: 2,
          enableCompactNotation: true,
        }}
        placeholder="Try $1,234.56abc, then Ctrl+Z…"
      />
      <p>
        The full options reference lives on the{' '}
        <Link to={installPath}>installation page</Link>, and every individual feature has
        its own deep-dive in the sidebar.
      </p>
    </section>
  )
}
