const steps = [
  'Mobile keyboard filter',
  'Strip thousand separators',
  'Expand compact notation',
  'Expand scientific notation',
  'Remove non-numeric',
  'Strip extra decimals',
  'Trim leading zeros',
  'Prepend leading zero',
  'Truncate to max length',
];

export function SanitizationPipelineDiagram() {
  const lineX = 40;
  const firstY = 24;
  const gap = 36;
  const lastY = firstY + (steps.length - 1) * gap;

  return (
    <div className="my-10">
      <svg
        viewBox={`0 0 360 ${lastY + 24}`}
        role="img"
        aria-label="Nine ordered sanitization stages, line saturation rises as the value gets cleaner"
        className="mx-auto block w-full max-w-sm"
      >
        <line
          x1={lineX}
          x2={lineX}
          y1={firstY}
          y2={lastY}
          className="stroke-border"
          strokeWidth="1.25"
        />
        {steps.map((s, i) => {
          const y = firstY + i * gap;
          const opacityLevel = 0.35 + (i / (steps.length - 1)) * 0.65;
          return (
            <g key={s}>
              <circle
                cx={lineX}
                cy={y}
                r="5"
                className="fill-signal-sky"
                fillOpacity={opacityLevel}
              />
              <text x={lineX + 18} y={y + 4} className="fill-foreground" fontSize="13">
                {s}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
