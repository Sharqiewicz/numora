import { PlainVsNumoraFigure } from '../PlainVsNumoraFigure';

export function PlainVsNumoraSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="plain-vs-numora" className="space-y-4 scroll-mt-24">
      <h2>
        Plain <code>&lt;input&gt;</code> vs Numora
      </h2>
      <p>
        Paste messy text such as <code>$1,234.56abc</code> into a plain input and it stays as it
        is. Your code gets that string. Numora cleans and groups the value, so your code gets a
        string that parses as a number:
      </p>
      <PlainVsNumoraFigure />
      <p>
        Typed one key at a time, the same text reads differently, because a typed <code>,</code> is
        a decimal key and <code>b</code> is the billion suffix.
      </p>
    </section>
  );
}
