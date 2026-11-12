import type { GroupingStyle } from 'numora';
import { NumoraInput } from 'numora-react';
import { GroupingStylesDiagram } from '../diagrams';
import { DiagramFrame, demoInputClass } from '../kit';

const styles: { label: string; style: GroupingStyle; example: string; description: string }[] = [
  {
    label: "'thousand'",
    style: 'thousand',
    example: '1,000,000',
    description: 'Western convention. Group by three digits from the right.',
  },
  {
    label: "'lakh'",
    style: 'lakh',
    example: '10,00,000',
    description: 'Indian convention. Three on the right, then groups of two.',
  },
  {
    label: "'wan'",
    style: 'wan',
    example: '100,0000',
    description: 'East Asian convention. Four-digit groups (myriad / 万).',
  },
];

export function GroupingStylesSection() {
  return (
    <section id="grouping-styles" className="space-y-4 scroll-mt-24">
      <h2>Thousand grouping styles</h2>
      <p>
        Regions group large numbers differently. Numora has three grouping styles, plus{' '}
        <code>'none'</code>. Type <code>10000000</code> in all three to compare:
      </p>
      <GroupingStylesDiagram />
      <DiagramFrame variant="demo">
        <div className="grid gap-5 md:grid-cols-3">
          {styles.map((s) => (
            <div key={s.label} className="space-y-2">
              <div className="font-mono text-caption font-medium text-foreground">{s.label}</div>
              <NumoraInput
                formatOn="change"
                thousandSeparator=","
                groupingStyle={s.style}
                decimalMaxLength={2}
                aria-label={`${s.style} grouping`}
                placeholder={s.example}
                className={demoInputClass}
              />
              <div className="font-mono text-caption text-muted-foreground">
                e.g. <span className="text-foreground">{s.example}</span>
              </div>
              <div className="text-caption text-muted-foreground">{s.description}</div>
            </div>
          ))}
        </div>
      </DiagramFrame>
    </section>
  );
}
