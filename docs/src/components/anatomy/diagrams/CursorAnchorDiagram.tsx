export function CursorAnchorDiagram() {
  const before = '1,234,567';
  const naiveAfter = '12,345,678';
  const numoraAfter = '12,348,567';
  const caretBeforeIdx = 4;
  const naiveCaretIdx = 4;
  const numoraCaretIdx = 5;

  const cellW = 22;
  const cellH = 32;
  const labelX = 16;
  const gridX = 150;

  type CharRowOpts = {
    chars: string;
    y: number;
    caretIdx: number;
    dim: boolean;
    showCount: boolean;
  };

  const charRow = ({ chars, y, caretIdx, dim, showCount }: CharRowOpts) => {
    return (
      <>
        {[...chars].map((ch, i) => {
          const isSep = ch === ',';
          const isCounted = showCount && !isSep && i < caretIdx;
          return (
            <g key={i}>
              <text
                x={gridX + i * cellW + cellW / 2}
                y={y + 22}
                textAnchor="middle"
                className={
                  isSep
                    ? 'fill-muted-foreground/60'
                    : dim
                      ? 'fill-foreground/40'
                      : 'fill-foreground'
                }
                fontSize="20"
                fontFamily="ui-monospace, monospace"
              >
                {ch}
              </text>
              {isCounted && (
                <line
                  x1={gridX + i * cellW + 4}
                  x2={gridX + i * cellW + cellW - 4}
                  y1={y + 32}
                  y2={y + 32}
                  className="stroke-signal-violet-fg"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              )}
            </g>
          );
        })}
        <line
          x1={gridX + caretIdx * cellW}
          x2={gridX + caretIdx * cellW}
          y1={y - 4}
          y2={y + cellH}
          className={dim ? 'stroke-foreground/40' : 'stroke-foreground'}
          strokeWidth="2.5"
          strokeDasharray={dim ? '2,3' : undefined}
        />
      </>
    );
  };

  return (
    <div className="my-10">
      <svg
        viewBox="0 0 640 260"
        role="img"
        aria-label="Three rows of digits showing the cursor before typing, after naive index restoration, and after Numora's digit-count anchoring"
        className="mx-auto block w-full max-w-2xl"
      >
        <text x={labelX} y="36" className="fill-muted-foreground" fontSize="13" fontWeight="600">
          Before
        </text>
        <text x={labelX} y="54" className="fill-muted-foreground/70" fontSize="11">
          3 digits before caret
        </text>
        {charRow({ chars: before, y: 20, caretIdx: caretBeforeIdx, dim: false, showCount: true })}

        <text x={labelX} y="116" className="fill-foreground/60" fontSize="13" fontWeight="600">
          Naive
        </text>
        <text x={labelX} y="134" className="fill-muted-foreground/70" fontSize="11">
          restore index 4
        </text>
        {charRow({
          chars: naiveAfter,
          y: 100,
          caretIdx: naiveCaretIdx,
          dim: true,
          showCount: false,
        })}

        <text x={labelX} y="196" className="fill-signal-violet-fg" fontSize="13" fontWeight="600">
          Numora
        </text>
        <text x={labelX} y="214" className="fill-muted-foreground/70" fontSize="11">
          re-anchor at 3rd digit
        </text>
        {charRow({
          chars: numoraAfter,
          y: 180,
          caretIdx: numoraCaretIdx,
          dim: false,
          showCount: true,
        })}
      </svg>
    </div>
  );
}
