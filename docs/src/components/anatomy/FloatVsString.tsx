import { DiagramFrame, demoInsetClass } from './kit';
import { Verdict } from './InputPair';

export function FloatVsString() {
  const sum = String(0.1 + 0.2);
  const equality = 0.1 + 0.2 === 0.3;
  const head = sum.slice(0, 3);
  const tail = sum.slice(3);

  return (
    <DiagramFrame>
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <div className="mb-2 flex items-center justify-between gap-2 text-caption font-medium text-foreground">
            JavaScript Number
            <Verdict tone="bad" />
          </div>
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable code must be keyboard reachable */}
          <pre tabIndex={0} className={`${demoInsetClass} overflow-x-auto leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}>
            <code>
              <span className="text-muted-foreground">{`> `}</span>0.1 + 0.2
              {`\n`}
              {head}
              <span className="text-signal-red-fg underline decoration-wavy decoration-signal-red-line underline-offset-4">
                {tail}
              </span>
              {`\n\n`}
              <span className="text-muted-foreground">{`> `}</span>typeof (0.1 + 0.2)
              {`\n`}"number"
              {`\n\n`}
              <span className="text-muted-foreground">{`> `}</span>(0.1 + 0.2) === 0.3
              {`\n`}
              <span className="text-signal-red-fg">{String(equality)}</span>
            </code>
          </pre>
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between gap-2 text-caption font-medium text-foreground">
            Numora (strings only)
            <Verdict tone="good" />
          </div>
          {/* biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable code must be keyboard reachable */}
          <pre tabIndex={0} className={`${demoInsetClass} overflow-x-auto leading-relaxed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}>
            <code>
              <span className="text-muted-foreground">{`> `}</span>input.value
              {`\n`}"0.3"
              {`\n\n`}
              <span className="text-muted-foreground">{`> `}</span>typeof input.value
              {`\n`}"string"
              {`\n\n`}
              <span className="text-muted-foreground">{`> `}</span>input.value === "0.3"
              {`\n`}
              <span className="text-signal-green-fg">true</span>
            </code>
          </pre>
        </div>
      </div>
    </DiagramFrame>
  );
}
