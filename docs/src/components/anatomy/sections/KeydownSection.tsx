export function KeydownSection() {
  return (
    <section className="space-y-4">
      <h2><code>keydown</code> stays out of the way</h2>
      <p>
        Most input-mask libraries put their formatting logic in <code>keydown</code>{' '}
        because it's the oldest hook available. Numora deliberately does the opposite. The
        <code>keydown</code> handler does <em>one</em> thing:
      </p>
      <ul>
        <li>
          <strong>Skip the cursor over thousand separators on Backspace and Delete.</strong>{' '}
          When the cursor sits next to a <code>,</code> in <code>1,234</code> and you
          press Backspace, Numora moves the selection past the separator so the digit{' '}
          <code>4</code> gets deleted, not the comma.
        </li>
      </ul>
      <p>
        That's it. Decimal-separator handling and character insertion both moved to{' '}
        <code>beforeinput</code> for two reasons:
      </p>
      <ol>
        <li>
          <code>e.key</code> on <code>keydown</code> reports the <em>physical key</em>,
          not the resolved character - which breaks under non-Latin keyboards, dead keys,
          and IME composition. The same key on a Polish keyboard produces different text
          depending on modifiers.
        </li>
        <li>
          <code>keydown</code> fires before the browser has decided what the input will
          be. Cancelling it with <code>preventDefault</code> is a blunt instrument that
          can disable accessibility features and screen readers.
        </li>
      </ol>
      <p>
        <code>beforeinput</code> sidesteps both problems by operating on the resolved
        character and the semantic action. So that's where the real work happens.
      </p>
    </section>
  )
}
