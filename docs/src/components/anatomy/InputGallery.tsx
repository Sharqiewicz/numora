import { sanitizeNumoraInput } from 'numora';
import { DiagramFrame } from './kit';

const cases: { input: string; label: string }[] = [
  { input: '$1,234.56', label: 'Currency symbol + commas' },
  { input: '1.5e-7', label: 'Scientific notation' },
  { input: '1k', label: 'Compact (k)' },
  { input: '2.5M', label: 'Compact (M)' },
  { input: '007', label: 'Leading zeros' },
  { input: '1.2.3', label: 'Multiple decimals' },
  { input: '1 234', label: 'Non-breaking space (mobile keyboards)' },
  { input: 'abc123def', label: 'Letters mixed in' },
  { input: '12,34,567', label: 'Lakh grouping (Indian)' },
];

const th = 'px-3 py-2 text-left text-[13px] font-normal text-muted-foreground';

export function InputGallery() {
  return (
    <DiagramFrame>
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className={th}>User input</th>
            <th className={th}>Sanitized by Numora</th>
            <th className={`${th} hidden sm:table-cell`}>Case</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => {
            const cleaned = sanitizeNumoraInput(c.input, {
              enableCompactNotation: true,
              enableNegative: true,
              enableLeadingZeros: false,
              decimalSeparator: '.',
              thousandSeparator: ',',
            });
            return (
              <tr key={c.input} className="border-t border-border align-top">
                <td className="px-3 py-2 font-mono">
                  "{c.input}"
                  <div className="mt-0.5 font-sans text-[13px] text-muted-foreground sm:hidden">
                    {c.label}
                  </div>
                </td>
                <td className="px-3 py-2 font-mono text-foreground">"{cleaned}"</td>
                <td className="hidden px-3 py-2 text-[13px] text-muted-foreground sm:table-cell">
                  {c.label}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </DiagramFrame>
  );
}
