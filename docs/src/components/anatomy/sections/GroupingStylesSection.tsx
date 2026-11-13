import { GroupingStylesDiagram } from '../diagrams';

export function GroupingStylesSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="grouping-styles" className="space-y-4 scroll-mt-24">
      <h2>Thousand grouping styles</h2>
      <p>
        Regions group large numbers differently. Numora has three grouping styles, plus{' '}
        <code>'none'</code>.
      </p>
      <GroupingStylesDiagram />
    </section>
  );
}
