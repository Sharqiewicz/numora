import { useEffect, useRef, useState } from 'react'

export function AnnotatedInput() {
  const [value, setValue] = useState('1234.56')
  const [selectionStart, setSelectionStart] = useState(0)
  const [selectionEnd, setSelectionEnd] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const sync = () => {
    const input = inputRef.current
    if (!input) return
    setSelectionStart(input.selectionStart ?? 0)
    setSelectionEnd(input.selectionEnd ?? 0)
  }

  useEffect(() => {
    const input = inputRef.current
    if (!input) return
    input.addEventListener('selectionchange', sync)
    return () => input.removeEventListener('selectionchange', sync)
  }, [])

  return (
    <div className="my-6 grid gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-2">
      <div>
        <label className="mb-2 block text-sm font-medium">Live input - type or click:</label>
        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          pattern="[0-9.,-]*"
          value={value}
          onChange={(e) => {
            setValue(e.target.value)
            sync()
          }}
          onSelect={sync}
          onKeyUp={sync}
          onClick={sync}
          className="w-full rounded border bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="space-y-1.5 self-center font-mono text-xs text-muted-foreground">
        <div>
          <span className="text-foreground">value</span>:{' '}
          <span className="text-secondary">"{value}"</span>
        </div>
        <div>
          <span className="text-foreground">selectionStart</span>:{' '}
          <span className="text-secondary">{selectionStart}</span>
        </div>
        <div>
          <span className="text-foreground">selectionEnd</span>:{' '}
          <span className="text-secondary">{selectionEnd}</span>
        </div>
        <div>
          <span className="text-foreground">type</span>:{' '}
          <span className="text-secondary">"text"</span>
        </div>
        <div>
          <span className="text-foreground">inputMode</span>:{' '}
          <span className="text-secondary">"decimal"</span>{' '}
          <span className="text-muted-foreground/60">→ mobile numeric pad</span>
        </div>
        <div>
          <span className="text-foreground">pattern</span>:{' '}
          <span className="text-secondary">"[0-9.,-]*"</span>{' '}
          <span className="text-muted-foreground/60">→ form-validation regex</span>
        </div>
      </div>
    </div>
  )
}
