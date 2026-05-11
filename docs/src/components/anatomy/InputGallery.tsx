import { sanitizeNumoraInput } from 'numora'

const cases: { input: string; label: string }[] = [
  { input: '$1,234.56', label: 'Currency symbol + commas' },
  { input: '1.5e-7', label: 'Scientific notation' },
  { input: '1k', label: 'Compact (k)' },
  { input: '2.5M', label: 'Compact (M)' },
  { input: '007', label: 'Leading zeros' },
  { input: '1.2.3', label: 'Multiple decimals' },
  { input: '1 234', label: 'Non-breaking space (mobile keyboards)' },
  { input: 'abc123def', label: 'Letters mixed in' },
  { input: '12,34,567', label: 'Indian Lakh grouping' },
]

export function InputGallery() {
  return (
    <div className="my-6 overflow-hidden rounded-lg border bg-muted/30">
      <table className="w-full text-sm">
        <thead className="bg-background/50">
          <tr>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              User input
            </th>
            <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Numora interpretation
            </th>
            <th className="hidden px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground sm:table-cell">
              What happened
            </th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => {
            const cleaned = sanitizeNumoraInput(c.input, {
              enableCompactNotation: true,
              enableNegative: true,
              enableLeadingZeros: false,
              decimalSeparator: '.',
              thousandSeparator: ',',
            })
            return (
              <tr key={c.input} className="border-t border-border/40">
                <td className="px-4 py-2 font-mono">"{c.input}"</td>
                <td className="px-4 py-2 font-mono text-emerald-400">
                  "{cleaned}"
                </td>
                <td className="hidden px-4 py-2 text-xs text-muted-foreground sm:table-cell">
                  {c.label}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
