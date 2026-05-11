export function FloatVsString() {
  const sumAsNumber = 0.1 + 0.2
  const equality = (0.1 + 0.2) === 0.3

  return (
    <div className="my-6 grid gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-2">
      <div>
        <div className="mb-2 text-sm font-medium text-red-400">JavaScript Number</div>
        <pre className="overflow-x-auto rounded bg-background p-3 font-mono text-sm leading-relaxed">
          <code>
            <span className="text-muted-foreground">{`> `}</span>0.1 + 0.2
            {`\n`}
            <span className="text-red-400">{sumAsNumber}</span>
            {`\n\n`}
            <span className="text-muted-foreground">{`> `}</span>typeof (0.1 + 0.2)
            {`\n`}
            <span className="text-red-400">"number"</span>
            {`\n\n`}
            <span className="text-muted-foreground">{`> `}</span>(0.1 + 0.2) === 0.3
            {`\n`}
            <span className="text-red-400">{String(equality)}</span>
          </code>
        </pre>
      </div>
      <div>
        <div className="mb-2 text-sm font-medium text-emerald-400">Numora (strings only)</div>
        <pre className="overflow-x-auto rounded bg-background p-3 font-mono text-sm leading-relaxed">
          <code>
            <span className="text-muted-foreground">{`> `}</span>input.value
            {`\n`}
            <span className="text-emerald-400">"0.3"</span>
            {`\n\n`}
            <span className="text-muted-foreground">{`> `}</span>typeof input.value
            {`\n`}
            <span className="text-emerald-400">"string"</span>
            {`\n\n`}
            <span className="text-muted-foreground">{`> `}</span>input.value === "0.3"
            {`\n`}
            <span className="text-emerald-400">true</span>
          </code>
        </pre>
      </div>
    </div>
  )
}
