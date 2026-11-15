import { CodeBlock } from '@/components/CodeBlock';

export function DefaultVsValueSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
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
        A controlled input (<code>value=</code>) makes React write <code>input.value</code> back
        whenever it differs from the prop. That undoes what <code>setRangeText</code> just wrote and
        breaks formatting. <code>defaultValue</code> sets the DOM value once at mount, so{' '}
        <code>setRangeText</code> is the only thing that changes it while the user types.
      </p>
      <p>
        When you pass a <code>value</code> prop, or change an option, a layout effect compares the
        prop with the DOM as raw text. Both sides are sanitized first, so grouping does not count,
        and a half-typed <code>1.</code> that the parent echoes back as <code>1.</code> is equal. A
        different string for the same number counts as a change, such as <code>1</code> for{' '}
        <code>1.</code> or <code>1.50</code> for <code>1.5</code>.
      </p>
      <p>
        If the two differ, or the options changed, the effect formats the prop and writes it with{' '}
        <code>writeValue</code>. That write does not call <code>onChange</code>, unless the new
        options change the raw value, as a smaller <code>decimalMaxLength</code> can.
      </p>
      <p>
        This is also how a controlled field holds its <code>value</code>. An edit goes into the DOM
        first, and Numora calls <code>onChange</code> and <code>onValueChange</code>. It then
        renders the component again, even if the parent kept its state. The layout effect runs, sees
        that the DOM differs from <code>value</code>, and writes the field back before the browser
        paints. If the parent accepted the edit, the prop already matches and nothing is written.
      </p>
    </section>
  );
}
