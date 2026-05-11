import { CodeBlock } from '@/components/CodeBlock'
import { ValueReadout } from '../ValueReadout'
import type { SectionProps } from './types'

const reactCode = `import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react'

<NumoraInput
  thousandSeparator=","
  maxDecimals={2}
  onChange={(e: NumoraInputChangeEvent) => {
    e.target.value           // → "1234.56"   (raw, no separators)
    e.target.formattedValue  // → "1,234.56"  (display string)
    e.target.selectionStart  // → caret position
  }}
/>`

const vanillaCode = `import { NumoraInput } from 'numora'

new NumoraInput(container, {
  thousandSeparator: ',',
  decimalMaxLength: 2,
  rawValueMode: true,
  // When rawValueMode is true, onChange receives the raw value.
  // When false (the default), it receives the formatted value.
  onChange: (value) => console.log(value),
})`

export function RawVsFormattedSection({ pkg }: SectionProps) {
  return (
    <section className="space-y-4">
      <h2>Raw value vs formatted value</h2>
      <p>
        Every formatting cycle produces two strings: the formatted display string
        (<code>"1,234.56"</code>) and the raw numeric string (<code>"1234.56"</code>).
        The raw value is what your form, your validator, and your API expect; the
        formatted value is what the user sees.
      </p>
      {pkg === 'numora-react' ? (
        <>
          <p>
            In <code>numora-react</code>, both are exposed on the change event's target.
            <code>e.target.value</code> returns the raw value via a Proxy;{' '}
            <code>e.target.formattedValue</code> is the display string. The same target
            is also a real <code>HTMLInputElement</code>, so{' '}
            <code>selectionStart</code> and friends keep working:
          </p>
          <CodeBlock language="tsx">{reactCode}</CodeBlock>
        </>
      ) : (
        <>
          <p>
            The vanilla <code>NumoraInput</code> class emits one or the other through{' '}
            <code>onChange</code>, controlled by <code>rawValueMode</code>:
          </p>
          <CodeBlock language="typescript">{vanillaCode}</CodeBlock>
        </>
      )}
      <p>Type below - both readouts update on every keystroke:</p>
      <ValueReadout />
    </section>
  )
}
