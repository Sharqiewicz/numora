import { CodeBlock } from '@/components/CodeBlock'

export function DefaultVsValueSection() {
  return (
    <section className="space-y-4">
      <h2><code>defaultValue</code> vs <code>value</code></h2>
      <p>
        <code>NumoraInput</code> renders the underlying <code>&lt;input&gt;</code> with{' '}
        <code>defaultValue</code>, not <code>value</code>:
      </p>
      <CodeBlock language="tsx">{`<input defaultValue={initialDisplayValue} ref={internalInputRef} />`}</CodeBlock>
      <p>
        A controlled React input (<code>value=</code>) makes the reconciler overwrite{' '}
        <code>input.value</code> on every render - undoing what <code>setRangeText</code>{' '}
        just wrote and breaking both formatting and undo history. <code>defaultValue</code>{' '}
        tells React "set the DOM value once at mount, then leave it alone," leaving{' '}
        <code>setRangeText</code> as the sole mutation path during typing.
      </p>
      <p>
        When you pass a <code>value</code> prop, an effect syncs it directly into the DOM
        without firing events - programmatic value changes don't need undo history or
        cursor management.
      </p>
    </section>
  )
}
