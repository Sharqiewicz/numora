import { useState } from 'react'
import { FormatOn, ThousandStyle } from 'numora'
import { NumoraInput } from 'numora-react'
import { InputPair } from '../InputPair'

export function PlainVsNumoraSection() {
  const [plainValue, setPlainValue] = useState('')

  return (
    <section className="space-y-4">
      <h2>Plain <code>&lt;input&gt;</code> vs Numora</h2>
      <p>
        Type the same thing into both inputs below - for example{' '}
        <code>$1,234.56abc</code>, then <code>1.5e-7</code>, then <code>2.5k</code>. The
        plain input takes whatever you give it. Numora cleans, expands, and groups in
        real time:
      </p>
      <InputPair
        left={{
          label: 'Plain <input type="text">',
          tone: 'bad',
          input: (
            <input
              type="text"
              value={plainValue}
              onChange={(e) => setPlainValue(e.target.value)}
              placeholder="Try $1,234.56abc"
              className="w-full rounded border bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-ring"
            />
          ),
          note: 'Accepts every character. No grouping. No expansion. Holds a string and shrugs.',
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
              enableCompactNotation
              placeholder="Try $1,234.56abc"
              className="w-full rounded border bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-ring"
            />
          ),
          note: 'Strips junk, expands compact notation, applies thousand grouping.',
        }}
      />
    </section>
  )
}
