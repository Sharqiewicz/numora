import { FormatOn, ThousandStyle } from 'numora'
import { NumoraInput } from 'numora-react'

const inputClass =
  'w-full rounded border bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-ring'

const samples = [
  { label: 'German price', value: '1.234,56' },
  { label: 'US price with $', value: '$1,234.56' },
  { label: 'Excel cell', value: '1,234.560000' },
  { label: 'Email body fragment', value: 'price: 2,500,000.00 USD' },
]

export function PasteSection() {
  return (
    <section className="space-y-4">
      <h2>Paste from a foreign locale</h2>
      <p>
        When the user pastes, <code>beforeinput</code> fires first with{' '}
        <code>inputType: 'insertFromPaste'</code>. Numora returns immediately - the
        dedicated <code>paste</code> handler takes over because it has access to the
        full <code>ClipboardData</code> object.
      </p>
      <p>The paste handler:</p>
      <ol>
        <li><code>e.preventDefault()</code> - block the native paste outright.</li>
        <li>Read <code>e.clipboardData.getData('text/plain')</code>.</li>
        <li>Splice the clipboard text into the current value at the active selection.</li>
        <li>
          Run the combined value through the full pipeline with{' '}
          <code>shouldRemoveThousandSeparators: true</code> - unconditionally, because
          clipboard text may carry separators from a foreign locale (German{' '}
          <code>"1.234,56"</code>) that would otherwise be parsed as decimals.
        </li>
        <li>Set <code>input.value</code> directly and reposition the cursor.</li>
        <li>Dispatch a synthetic <code>input</code> event so consumers see <code>onChange</code>.</li>
      </ol>
      <p>Copy any of these strings and paste into the Numora input below:</p>
      <div className="my-4 flex flex-wrap gap-2">
        {samples.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => navigator.clipboard?.writeText(s.value)}
            className="rounded border border-border/60 bg-background/50 px-2.5 py-1 text-xs hover:border-border"
            title={`Copy "${s.value}"`}
          >
            <span className="text-muted-foreground">{s.label}: </span>
            <span className="font-mono text-foreground">{s.value}</span>
          </button>
        ))}
      </div>
      <div className="my-6 rounded-lg border bg-muted/30 p-4">
        <NumoraInput
          formatOn={FormatOn.Change}
          thousandSeparator=","
          thousandStyle={ThousandStyle.Thousand}
          maxDecimals={2}
          enableCompactNotation
          placeholder="Paste a foreign-locale number here…"
          className={inputClass}
        />
      </div>
    </section>
  )
}
