import { SanitizationStepper } from '../SanitizationStepper'
import { SanitizationPipelineDiagram } from '../diagrams'

export function SanitizationSection() {
  return (
    <section id="sanitization" className="space-y-4 scroll-mt-24">
      <h2>The sanitization pipeline</h2>
      <p>
        Every value Numora touches - typed character, pasted clipboard, programmatic
        write - passes through a single pipeline of seven pure functions. Each one has
        one job and runs in a fixed order; the output of step N is the input of step N+1.
        The whole pipeline runs on every keystroke.
      </p>
      <SanitizationPipelineDiagram />
      <p>
        Type below and watch the value transform step by step. Greyed-out rows are steps
        that didn't change the value:
      </p>
      <SanitizationStepper />
    </section>
  )
}
