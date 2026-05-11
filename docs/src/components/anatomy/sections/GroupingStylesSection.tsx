import { FormatOn, ThousandStyle } from 'numora'
import { NumoraInput } from 'numora-react'

const inputClass =
  'w-full rounded border bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-ring'

const styles: { label: string; style: ThousandStyle; example: string; description: string }[] = [
  {
    label: 'ThousandStyle.Thousand',
    style: ThousandStyle.Thousand,
    example: '1,000,000',
    description: 'Western convention. Group by three digits from the right.',
  },
  {
    label: 'ThousandStyle.Lakh',
    style: ThousandStyle.Lakh,
    example: '10,00,000',
    description: 'Indian convention. Three on the right, then groups of two.',
  },
  {
    label: 'ThousandStyle.Wan',
    style: ThousandStyle.Wan,
    example: '100,0000',
    description: 'CJK convention. Four-digit groups (myriad / 万).',
  },
]

export function GroupingStylesSection() {
  return (
    <section className="space-y-4">
      <h2>Thousand grouping styles</h2>
      <p>
        Different writing systems group large numbers differently. Numora ships three
        styles, each producing a different visual rhythm for the same underlying value.
        Type <code>10000000</code> in all three to see them diverge:
      </p>
      <div className="my-6 grid gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-3">
        {styles.map((s) => (
          <div key={s.label} className="space-y-2">
            <div className="text-sm font-medium">{s.label}</div>
            <NumoraInput
              formatOn={FormatOn.Change}
              thousandSeparator=","
              thousandStyle={s.style}
              maxDecimals={2}
              placeholder={s.example}
              className={inputClass}
            />
            <div className="font-mono text-xs text-muted-foreground">
              e.g. <span className="text-emerald-400">{s.example}</span>
            </div>
            <div className="text-xs text-muted-foreground">{s.description}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
