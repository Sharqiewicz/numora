import { useEffect, useRef, useState } from 'react'

interface LogEntry {
  id: number
  t: number
  event: string
  detail: string
}

const EVENT_COLORS: Record<string, string> = {
  keydown: 'text-purple-400',
  beforeinput: 'text-amber-400',
  input: 'text-emerald-400',
  keyup: 'text-muted-foreground',
}

export function EventPipelineDemo() {
  const [log, setLog] = useState<LogEntry[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const idRef = useRef(0)

  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    const start = performance.now()

    const push = (event: string, detail: string) => {
      idRef.current += 1
      setLog((prev) => [
        ...prev.slice(-19),
        { id: idRef.current, t: Math.round(performance.now() - start), event, detail },
      ])
    }

    const onKeyDown = (e: KeyboardEvent) => push('keydown', `key="${e.key}"`)
    const onBeforeInput = (e: InputEvent) =>
      push('beforeinput', `${e.inputType}, data="${e.data ?? ''}"`)
    const onInput = (e: Event) =>
      push('input', `value="${(e.target as HTMLInputElement).value}"`)
    const onKeyUp = (e: KeyboardEvent) => push('keyup', `key="${e.key}"`)

    input.addEventListener('keydown', onKeyDown)
    input.addEventListener('beforeinput', onBeforeInput)
    input.addEventListener('input', onInput)
    input.addEventListener('keyup', onKeyUp)
    return () => {
      input.removeEventListener('keydown', onKeyDown)
      input.removeEventListener('beforeinput', onBeforeInput)
      input.removeEventListener('input', onInput)
      input.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  return (
    <div className="my-6 space-y-3 rounded-lg border bg-muted/30 p-4">
      <input
        ref={inputRef}
        type="text"
        placeholder="Type to see events fire…"
        className="w-full rounded border bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="max-h-48 overflow-y-auto rounded bg-background p-3 font-mono text-xs">
        {log.length === 0 ? (
          <div className="text-muted-foreground">// event log - start typing</div>
        ) : (
          log.map((entry) => (
            <div key={entry.id} className="leading-relaxed">
              <span className="text-muted-foreground">
                +{String(entry.t).padStart(4, ' ')}ms{' '}
              </span>
              <span className={EVENT_COLORS[entry.event] ?? 'text-foreground'}>
                {entry.event.padEnd(11, ' ')}
              </span>
              <span className="text-muted-foreground/80"> {entry.detail}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
