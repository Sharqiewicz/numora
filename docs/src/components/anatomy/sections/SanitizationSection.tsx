import { SanitizationJourney } from '../SanitizationJourney';

export function SanitizationSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="sanitization" className="space-y-4 scroll-mt-24">
      <h2>The sanitization pipeline</h2>
      <p>
        Every value Numora touches, whether typed, pasted or written from code, passes through the
        same ten steps in the same order. Each step is a pure function with one job. Some run only
        when their option is set.
      </p>
      <p>
        Watch three messy values go through it. Each step marks what it is about to change. Steps
        with nothing to do are skipped:
      </p>
      <SanitizationJourney />
      <p>
        The figure reads its text with the field's own separators. A <a href="#paste">paste</a>{' '}
        first checks the clipboard text for another locale's format.
      </p>
    </section>
  );
}
