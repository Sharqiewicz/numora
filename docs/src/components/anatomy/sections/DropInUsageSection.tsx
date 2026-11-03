import { Link } from '@tanstack/react-router';
import { FormatOn, ThousandStyle } from 'numora';
import { CodeBlock } from '@/components/CodeBlock';
import { ExampleWithDemo } from '@/components/ExampleWithDemo';
import type { SectionProps } from './types';

const reactExample = `import { NumoraInput, FormatOn, ThousandStyle } from 'numora-react'

<NumoraInput
  formatOn={FormatOn.Change}
  thousandSeparator=","
  thousandStyle={ThousandStyle.Thousand}
  maxDecimals={2}
  enableCompactNotation
  onChange={(e) => console.log(e.target.value)}
/>`;

const vanillaExample = `import { NumoraInput, FormatOn, ThousandStyle } from 'numora'

new NumoraInput(container, {
  formatOn: FormatOn.Change,
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
  decimalMaxLength: 2,
  enableCompactNotation: true,
  onChange: (value) => console.log(value),
})`;

export function DropInUsageSection({ pkg }: SectionProps) {
  const installPath =
    pkg === 'numora-react' ? '/docs/numora-react/installation' : '/docs/numora/installation';
  const installCmd = pkg === 'numora-react' ? 'pnpm add numora-react numora' : 'pnpm add numora';

  return (
    <section id="drop-in-usage" className="space-y-4 scroll-mt-24">
      <h2>Drop-in usage</h2>
      <p>Install:</p>
      <CodeBlock language="bash">{installCmd}</CodeBlock>
      <p>
        Paste a messy value like <code>"$1,234.56abc"</code> into the demo, then press Ctrl/Cmd+Z:
      </p>
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
        placeholder="$1,234.56abc"
        label="Paste a messy value"
      />
      <p>
        The full options reference is on the <Link to={installPath}>installation page</Link>. Each
        feature has its own page in the sidebar.
      </p>
    </section>
  );
}
