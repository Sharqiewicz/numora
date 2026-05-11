import { useState } from 'react'
import { FormatOn, ThousandStyle } from 'numora'
import { NumoraInput } from 'numora-react'
import { InputPair } from '../InputPair'

const inputClass =
  'w-full rounded border bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-ring'

function NaiveFormattedInput() {
  const [value, setValue] = useState('1,234,567')

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, '').replace(/[^0-9]/g, '')
    const formatted = raw.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    setValue(formatted)
  }

  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      className={inputClass}
    />
  )
}

export function CursorPreservationSection() {
  return (
    <section className="space-y-4">
      <h2>Cursor preservation</h2>
      <p>
        The classic input-mask bug: a user clicks into the middle of <code>1,234,567</code>{' '}
        to insert a digit, the formatter rebuilds the string with a new comma in a
        different place, and the cursor lands several characters away from where it should be.
      </p>
      <p>
        Numora's <code>updateCursorPosition</code> anchors on <em>meaningful digits</em>{' '}
        rather than character index.{' '}
        <code>countMeaningfulDigitsBeforePosition</code> walks the intended string from
        the start to the caret, counting only digits and the decimal separator while
        skipping thousand separators. It then walks the formatted string until it has
        counted the same number, and parks the cursor there. The user feels the caret
        stay "between the same two digits" no matter how the separators rearranged
        around it.
      </p>
      <p>
        Click between the <code>3</code> and the <code>4</code> in both inputs below and
        type a digit. The naive formatter jumps your cursor; Numora keeps it pinned:
      </p>
      <InputPair
        left={{
          label: 'Naive formatter (rebuilds the string)',
          tone: 'bad',
          input: <NaiveFormattedInput />,
          note: 'Reformats on every change. Cursor is restored to its old index, but the index now points at a different character.',
        }}
        right={{
          label: 'NumoraInput',
          tone: 'good',
          input: (
            <NumoraInput
              formatOn={FormatOn.Change}
              thousandSeparator=","
              thousandStyle={ThousandStyle.Thousand}
              maxDecimals={2}
              defaultValue="1234567"
              className={inputClass}
            />
          ),
          note: 'Counts meaningful digits before the caret, then re-anchors. The cursor stays between the same two digits.',
        }}
      />
    </section>
  )
}
