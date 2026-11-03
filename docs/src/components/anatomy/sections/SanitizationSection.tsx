import { SanitizationStepper } from '../SanitizationStepper';

export function SanitizationSection() {
  return (
    <section id="sanitization" className="space-y-4 scroll-mt-24">
      <h2>The sanitization pipeline</h2>
      <p>
        Every value Numora touches, whether typed, pasted or written from code, passes through the
        same ten-step pipeline of pure functions. Each step has one job and runs in a fixed order.
        The output of step N is the input of step N+1. Some steps run only when their option is
        set. The pipeline runs on every keystroke.
      </p>
      <p>
        Type below to see the value change step by step. Muted rows are steps that did not change
        the value. Steps marked optional run only when their option is configured:
      </p>
      <SanitizationStepper />
    </section>
  );
}
