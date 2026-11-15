export function FocusBlurSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="focus-blur" className="space-y-4 scroll-mt-24">
      <h2>Focus and blur</h2>
      <p>
        The <code>formatOn</code> option decides when thousand separators appear. With{' '}
        <code>'change'</code>, the default, Numora groups the value on every edit. With{' '}
        <code>'blur'</code>, the separators show only while the field is not focused. The rest of
        this page calls that blur mode.
      </p>
      <p>
        In blur mode, focusing the field removes the separators and keeps the cursor on the same
        digit. On a mouse click the browser places the cursor after <code>focus</code> fires, so
        Numora waits for the <code>click</code> event before it removes them. The raw value stays
        the same, so only <code>onFormattedValueChange</code> is called.
      </p>
      <p>
        Leaving the field settles the value in both modes. Numora puts the separators back, drops a
        trailing decimal separator, pads the decimals up to <code>decimalMinLength</code> and
        empties a field that holds only a sign or a separator. Your change callback is called only
        if the raw value changed.
      </p>
    </section>
  );
}
