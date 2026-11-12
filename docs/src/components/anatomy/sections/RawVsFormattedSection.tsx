import { CodeBlock } from '@/components/CodeBlock';
import { ValueReadout } from '../ValueReadout';
import type { SectionProps } from './types';

const reactCode = `import { NumoraInput, type NumoraInputChangeEvent } from 'numora-react'

<NumoraInput
  thousandSeparator=","
  decimalMaxLength={2}
  onChange={(e: NumoraInputChangeEvent) => {
    e.target.value           // → "1234.56"   (raw, no separators)
    e.target.formattedValue  // → "1,234.56"  (display string)
    e.target.selectionStart  // → cursor position
  }}
/>`;

const vanillaCode = `import { NumoraInput } from 'numora'

new NumoraInput(container, {
  thousandSeparator: ',',
  decimalMaxLength: 2,
  // onValueChange always receives both: the canonical raw value and the display string.
  onValueChange: ({ value, formattedValue }) => console.log(value, formattedValue),
})`;

export function RawVsFormattedSection({ pkg }: SectionProps) {
  return (
    <section id="raw-vs-formatted" className="space-y-4 scroll-mt-24">
      <h2>Raw value vs formatted value</h2>
      <p>
        Every formatting cycle produces two strings: the formatted display string (
        <code>"1,234.56"</code>) and the raw numeric string (<code>"1234.56"</code>). Your form,
        validator and API expect the raw value. The user sees the formatted value.
      </p>
      {pkg === 'numora-react' ? (
        <>
          <p>
            In Numora React, both are exposed on the change event's target.{' '}
            <code>e.target.value</code> returns the raw value via a Proxy;{' '}
            <code>e.target.formattedValue</code> is the display string. The same target also behaves
            as a real <code>HTMLInputElement</code>, so <code>selectionStart</code> and the other
            properties still work:
          </p>
          <CodeBlock language="tsx">{reactCode}</CodeBlock>
        </>
      ) : (
        <>
          <p>
            The vanilla <code>NumoraInput</code> class passes both to <code>onValueChange</code> as{' '}
            <code>{'{ value, formattedValue }'}</code>. On the instance, <code>rawValue</code>{' '}
            returns the raw value and <code>formattedValue</code> the display string:
          </p>
          <CodeBlock language="typescript">{vanillaCode}</CodeBlock>
        </>
      )}
      <p>Type below. Both readouts update on every keystroke:</p>
      <ValueReadout />
    </section>
  );
}
