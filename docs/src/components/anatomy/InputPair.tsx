import { type ReactNode } from 'react'

interface PaneProps {
  label: string
  tone?: 'neutral' | 'bad' | 'good'
  input: ReactNode
  note?: ReactNode
}

interface InputPairProps {
  left: PaneProps
  right: PaneProps
  caption?: ReactNode
}

const TONE_COLORS: Record<NonNullable<PaneProps['tone']>, string> = {
  neutral: 'text-foreground',
  bad: 'text-red-400',
  good: 'text-emerald-400',
}

export function InputPair({ left, right, caption }: InputPairProps) {
  return (
    <div className="my-6 space-y-3 rounded-lg border bg-muted/30 p-4">
      <div className="grid gap-4 md:grid-cols-2">
        {[left, right].map((pane, i) => (
          <div key={i} className="space-y-2">
            <div className={`text-sm font-medium ${TONE_COLORS[pane.tone ?? 'neutral']}`}>
              {pane.label}
            </div>
            {pane.input}
            {pane.note && (
              <div className="text-xs text-muted-foreground">{pane.note}</div>
            )}
          </div>
        ))}
      </div>
      {caption && (
        <div className="border-t border-border/40 pt-3 text-xs text-muted-foreground">
          {caption}
        </div>
      )}
    </div>
  )
}
