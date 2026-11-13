import { SanitizationJourney } from '../SanitizationJourney';

export function SanitizationSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="sanitization" className="space-y-4 scroll-mt-24">
      <h2>The sanitization pipeline</h2>
      <p>
        Every value Numora touches, whether typed, pasted or written from code, passes through the
        same ten-step pipeline of pure functions. Each step has one job and runs in a fixed order.
        The output of step N is the input of step N+1. Some steps run only when their option is set.
        The pipeline runs on every keystroke.
      </p>
      <p>
        Watch one messy value go through it. Only the steps that change it are shown. The figure
        reads its text as the field's own format. A real paste first detects the format of the
        clipboard text, so a pasted <code>1.234,56</code> becomes <code>1234.56</code>, not what the
        figure would show:
      </p>
      <SanitizationJourney />
    </section>
  );
}
