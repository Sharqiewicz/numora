import { SanitizationJourney } from '../SanitizationJourney';

export function SanitizationSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="sanitization" className="space-y-4 scroll-mt-24">
      <h2>The sanitization pipeline</h2>
      <p>
        Every value Numora touches, whether typed, pasted or written from code, passes through the
        same ten steps in the same order. Each step is a pure function with one job. Three run only
        when their option is set: step 4 needs <code>allowCompactNotation</code>, step 9 needs{' '}
        <code>padLeadingZero</code> and step 10 needs <code>maxLength</code>. The figure has all
        three on. Before step 1, Numora cuts the text at 10,000 characters.
      </p>
      <p>
        Watch three messy values go through it. Each step marks what it is about to change. Steps
        with nothing to do are skipped:
      </p>
      <SanitizationJourney />
      <p>
        The figure reads its text with the field's own separators. A <a href="#paste">paste</a>{' '}
        first checks the clipboard text for another locale's format. Step 3 also turns the minus
        variants U+2212, U+FF0D and U+FE63 into <code>-</code> and a native decimal mark such as{' '}
        <code>٫</code> into the field's decimal separator. A default field turns <code>$.75</code>{' '}
        into <code>.75</code>, because <code>padLeadingZero</code> is off.
      </p>
    </section>
  );
}
