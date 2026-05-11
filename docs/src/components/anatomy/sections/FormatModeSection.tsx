import { FormatOn, ThousandStyle } from 'numora'
import { NumoraInput } from 'numora-react'
import { InputPair } from '../InputPair'

const inputClass =
  'w-full rounded border bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-ring'

export function FormatModeSection() {
  return (
    <section className="space-y-4">
      <h2>Format on change vs format on blur</h2>
      <p>
        Numora applies thousand separators in one of two modes. <code>FormatOn.Change</code>{' '}
        groups every keystroke; the user sees commas appear as they type.{' '}
        <code>FormatOn.Blur</code> groups only when the input loses focus; while editing,
        the value reads as a plain unformatted string. Both modes use the same pipeline -
        only the <em>moment</em> of formatting differs.
      </p>
      <p>Type <code>1234567.89</code> in both inputs to feel the difference:</p>
      <InputPair
        left={{
          label: 'FormatOn.Change',
          input: (
            <NumoraInput
              formatOn={FormatOn.Change}
              thousandSeparator=","
              thousandStyle={ThousandStyle.Thousand}
              maxDecimals={2}
              placeholder="1234567.89"
              className={inputClass}
            />
          ),
          note: 'Best for live previews and read-while-typing UX. Slightly more reformatting per keystroke.',
        }}
        right={{
          label: 'FormatOn.Blur',
          input: (
            <NumoraInput
              formatOn={FormatOn.Blur}
              thousandSeparator=","
              thousandStyle={ThousandStyle.Thousand}
              maxDecimals={2}
              placeholder="1234567.89"
              className={inputClass}
            />
          ),
          note: 'Best when users are editing existing values and shouldn\'t see separators move under the cursor.',
        }}
      />
    </section>
  )
}
