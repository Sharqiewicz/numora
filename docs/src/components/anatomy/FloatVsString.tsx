export function FloatVsString() {
  const sumAsNumber = 0.1 + 0.2;
  const equality = 0.1 + 0.2 === 0.3;

  return (
    <div className="my-6 grid gap-4 rounded-lg border bg-muted/30 p-4 md:grid-cols-2">
      <div>
        <div className="mb-2 text-sm font-medium text-signal-red">JavaScript Number</div>
        <pre className="overflow-x-auto rounded bg-background p-3 font-mono text-sm leading-relaxed">
          <code>
            <span className="text-muted-foreground">{`> `}</span>0.1 + 0.2
            {`\n`}
            <span className="text-signal-red">{sumAsNumber}</span>
            {`\n\n`}
            <span className="text-muted-foreground">{`> `}</span>typeof (0.1 + 0.2)
            {`\n`}
            <span className="text-signal-red">"number"</span>
            {`\n\n`}
            <span className="text-muted-foreground">{`> `}</span>(0.1 + 0.2) === 0.3
            {`\n`}
            <span className="text-signal-red">{String(equality)}</span>
          </code>
        </pre>
      </div>
      <div>
        <div className="mb-2 text-sm font-medium text-signal-green">Numora (strings only)</div>
        <pre className="overflow-x-auto rounded bg-background p-3 font-mono text-sm leading-relaxed">
          <code>
            <span className="text-muted-foreground">{`> `}</span>input.value
            {`\n`}
            <span className="text-signal-green">"0.3"</span>
            {`\n\n`}
            <span className="text-muted-foreground">{`> `}</span>typeof input.value
            {`\n`}
            <span className="text-signal-green">"string"</span>
            {`\n\n`}
            <span className="text-muted-foreground">{`> `}</span>input.value === "0.3"
            {`\n`}
            <span className="text-signal-green">true</span>
          </code>
        </pre>
      </div>
    </div>
  );
}
