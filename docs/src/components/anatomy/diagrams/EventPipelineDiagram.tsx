export function EventPipelineDiagram() {
  const events = [
    { x: 80, label: 'keydown', kind: 'normal' as const },
    { x: 240, label: 'beforeinput', kind: 'hero' as const },
    { x: 360, label: 'DOM mutation', kind: 'phantom' as const },
    { x: 480, label: 'input', kind: 'normal' as const },
    { x: 720, label: 'keyup', kind: 'normal' as const },
  ];

  return (
    <div className="my-10">
      <svg
        viewBox="0 0 780 110"
        role="img"
        aria-label="Five events fire in order on a single keystroke; beforeinput is the cancellation point"
        className="block w-full"
      >
        <line x1="20" y1="56" x2="760" y2="56" className="stroke-border" strokeWidth="1" />
        <text x="760" y="48" textAnchor="end" className="fill-muted-foreground" fontSize="11">
          time →
        </text>

        {events.map((e) => {
          if (e.kind === 'hero') {
            return (
              <g key={e.label}>
                <line
                  x1={e.x}
                  y1={42}
                  x2={e.x}
                  y2={72}
                  className="stroke-amber-300"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <text x={e.x} y={92} textAnchor="middle" className="fill-amber-300" fontSize="14">
                  {e.label}
                </text>
              </g>
            );
          }
          const isPhantom = e.kind === 'phantom';
          return (
            <g key={e.label}>
              <line
                x1={e.x}
                y1={50}
                x2={e.x}
                y2={64}
                className={isPhantom ? 'stroke-muted-foreground/40' : 'stroke-muted-foreground'}
                strokeWidth="1.25"
                strokeDasharray={isPhantom ? '2,3' : undefined}
              />
              <text
                x={e.x}
                y={92}
                textAnchor="middle"
                className={isPhantom ? 'fill-muted-foreground/60' : 'fill-foreground'}
                fontSize="12"
                fontStyle={isPhantom ? 'italic' : 'normal'}
              >
                {e.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
