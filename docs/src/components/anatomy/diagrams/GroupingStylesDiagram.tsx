type Group = { from: number; to: number; color: string }

interface Style {
  label: string
  formatted: string
  groups: Group[]
  description?: string
}

export function GroupingStylesDiagram() {
  const styles: Style[] = [
    {
      label: 'raw',
      formatted: '10000000',
      groups: [],
    },
    {
      label: 'Thousand',
      formatted: '10,000,000',
      groups: [
        { from: 0, to: 1, color: 'emerald' },
        { from: 3, to: 5, color: 'sky' },
        { from: 7, to: 9, color: 'amber' },
      ],
      description: 'Group by 3 from the right (Western)',
    },
    {
      label: 'Lakh',
      formatted: '1,00,00,000',
      groups: [
        { from: 0, to: 0, color: 'emerald' },
        { from: 2, to: 3, color: 'sky' },
        { from: 5, to: 6, color: 'amber' },
        { from: 8, to: 10, color: 'violet' },
      ],
      description: 'Three then twos from the right (Indian)',
    },
    {
      label: 'Wan',
      formatted: '1000,0000',
      groups: [
        { from: 0, to: 3, color: 'sky' },
        { from: 5, to: 8, color: 'amber' },
      ],
      description: 'Four-digit groups, the myriad (CJK)',
    },
  ]

  const cellW = 26
  const colorMap: Record<string, string> = {
    emerald: 'fill-emerald-400/15 stroke-emerald-400/70',
    sky: 'fill-sky-400/15 stroke-sky-400/70',
    amber: 'fill-amber-400/15 stroke-amber-400/70',
    violet: 'fill-violet-400/15 stroke-violet-400/70',
  }

  return (
    <div className="my-10">
      <svg
        viewBox="0 0 720 360"
        role="img"
        aria-label="The same underlying value rendered with three grouping rhythms: Thousand, Lakh, and Wan, with the raw value at top for comparison"
        className="block w-full"
      >
        {styles.map((s, idx) => {
          const isRaw = s.groups.length === 0
          const rowY = 30 + idx * 78
          const chars = [...s.formatted]
          const totalW = chars.length * cellW
          const startX = (720 - totalW) / 2

          return (
            <g key={s.label}>
              <text
                x="20"
                y={rowY + 22}
                className={isRaw ? 'fill-muted-foreground' : 'fill-foreground'}
                fontSize={isRaw ? 13 : 14}
                fontWeight={isRaw ? 400 : 600}
                fontStyle={isRaw ? 'italic' : 'normal'}
              >
                {s.label}
              </text>
              {s.description && (
                <text x="20" y={rowY + 40} className="fill-muted-foreground" fontSize="11">
                  {s.description}
                </text>
              )}

              {s.groups.map((g, gi) => {
                const x = startX + g.from * cellW
                const w = (g.to - g.from + 1) * cellW
                return (
                  <rect
                    key={gi}
                    x={x - 2}
                    y={rowY + 4}
                    width={w}
                    height={44}
                    rx={6}
                    className={colorMap[g.color]}
                    strokeWidth="1.5"
                  />
                )
              })}

              {chars.map((ch, i) => {
                const isSep = ch === ','
                return (
                  <text
                    key={i}
                    x={startX + i * cellW + cellW / 2}
                    y={rowY + 32}
                    textAnchor="middle"
                    className={
                      isSep
                        ? 'fill-muted-foreground'
                        : isRaw
                          ? 'fill-muted-foreground'
                          : 'fill-foreground'
                    }
                    fontSize="18"
                    fontFamily="ui-monospace, monospace"
                    fontWeight={isSep || isRaw ? 400 : 600}
                  >
                    {ch}
                  </text>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
