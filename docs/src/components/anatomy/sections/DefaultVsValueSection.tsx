import { CodeBlock } from '@/components/CodeBlock';

export function DefaultVsValueSection() {
  return (
    <section id="default-vs-value" className="space-y-4 scroll-mt-24">
      <h2>
        <code>defaultValue</code> vs <code>value</code>
      </h2>
      <p>
        <code>NumoraInput</code> renders the underlying <code>&lt;input&gt;</code> with{' '}
        <code>defaultValue</code>, not <code>value</code>:
      </p>
      <CodeBlock language="tsx">{`<input defaultValue={initialDisplayValue} ref={internalInputRef} />`}</CodeBlock>
      <p>
        A controlled input (<code>value=</code>) makes React overwrite{' '}
        <code>input.value</code> on every render. That undoes what <code>setRangeText</code> just wrote
        and breaks formatting and undo history. <code>defaultValue</code> sets the DOM value once
        at mount, so <code>setRangeText</code> is the only thing that changes it while the user
        types.
      </p>
      <p>
        When you pass a <code>value</code> prop, a layout effect formats it and compares the result
        with the DOM. If they differ, it writes the new value with{' '}
        <code>writeValuePreservingUndo</code>, so undo history survives external updates. That
        write does not call <code>onChange</code>.
      </p>
    </section>
  );
}
