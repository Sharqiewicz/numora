import { AnnotatedInput } from '../AnnotatedInput'

export function NativeInputSection() {
  return (
    <section className="space-y-4">
      <h2>What is an <code>&lt;input&gt;</code>, really?</h2>
      <p>
        Every Numora input is a real <code>&lt;input type="text"&gt;</code>. There is no
        contenteditable div, no shadow DOM, no virtual cursor - just the platform
        primitive with a small, well-defined API. The whole library is a thin layer that
        listens to the right events on this element and writes back to it.
      </p>
      <p>
        The four properties Numora reads and writes on every keystroke:
      </p>
      <ul>
        <li><code>value</code> - the displayed string. Numora keeps the formatted value here, so the DOM is always the source of truth.</li>
        <li><code>selectionStart</code> / <code>selectionEnd</code> - the caret position. Read to capture where the user is; written via <code>setSelectionRange</code> after reformatting.</li>
        <li><code>setRangeText(replacement, start, end, selectMode)</code> - the secret weapon. Replaces a range in a single atomic mutation that the browser records as one undo entry.</li>
        <li><code>inputMode</code> + <code>pattern</code> - Numora sets <code>inputmode="decimal"</code> for the mobile numeric pad and generates a <code>pattern</code> regex via <code>getNumoraPattern</code> so the browser's form-validation rules match Numora's runtime rules.</li>
      </ul>
      <AnnotatedInput />
    </section>
  )
}
