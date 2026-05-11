import { useState } from 'react'
import { FormatOn, ThousandStyle } from 'numora'
import {
  type NumoraHTMLInputElement,
  NumoraInput,
  type NumoraInputChangeEvent,
} from 'numora-react'

export function ValueReadout() {
  const [rawValue, setRawValue] = useState('')
  const [formattedValue, setFormattedValue] = useState('')
  const [selectionStart, setSelectionStart] = useState<number | null>(0)

  const handleChange = (e: NumoraInputChangeEvent) => {
    const target = e.target as NumoraHTMLInputElement
    setRawValue(target.value)
    setFormattedValue(target.formattedValue ?? '')
    setSelectionStart(target.selectionStart)
  }

  return (
    <div className="my-6 grid gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-medium">Type a number with separators:</label>
        <NumoraInput
          formatOn={FormatOn.Change}
          thousandSeparator=","
          thousandStyle={ThousandStyle.Thousand}
          maxDecimals={2}
          enableCompactNotation
          onChange={handleChange}
          placeholder="Try 1234567.89 or 2.5k…"
          className="w-full rounded border bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-1.5 self-center font-mono text-xs text-muted-foreground">
        <div>
          <span className="text-foreground">e.target.value</span>{' '}
          <span className="text-muted-foreground/60">// raw, no separators</span>
          <br />
          <span className="text-emerald-400">"{rawValue}"</span>
        </div>
        <div>
          <span className="text-foreground">e.target.formattedValue</span>{' '}
          <span className="text-muted-foreground/60">// display string</span>
          <br />
          <span className="text-emerald-400">"{formattedValue}"</span>
        </div>
        <div>
          <span className="text-foreground">e.target.selectionStart</span>
          <br />
          <span className="text-emerald-400">{selectionStart}</span>
        </div>
      </div>
    </div>
  )
}
