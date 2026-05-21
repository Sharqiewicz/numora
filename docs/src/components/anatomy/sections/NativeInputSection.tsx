import { AnnotatedInput } from '../AnnotatedInput'

export function NativeInputSection() {
  return (
    <section id="native-input" className="space-y-4 scroll-mt-24">
      <h2>What is an <code>&lt;input&gt;</code>, really?</h2>
      <p>
        The HTML <code>&lt;input&gt;</code> element shipped with HTML 2.0 in 1995, but{' '}
        <code>&lt;input type="number"&gt;</code> didn't arrive until HTML5 in 2014 - and it
        arrived broken for the obvious use cases:
      </p>
      <ul>
        <li>Locale-aware thousand separators are forbidden by spec.</li>
        <li>Pasting <code>1,234.56</code> silently empties the field.</li>
        <li>Increment arrows make no sense for currency or token amounts.</li>
      </ul>
      <p>
        The 2017 addition of <code>inputmode="decimal"</code> fixed mobile keyboards
        without solving formatting. The gap never closed; this library exists to bridge it.
      </p>
      <p>
        Every Numora input is therefore a real <code>&lt;input type="text"&gt;</code>, not{' '}
        <code>type="number"</code>. There is no contenteditable div, no shadow DOM, no
        virtual cursor - just the platform primitive with a small, well-defined API. The
        whole library is a thin layer that listens to the right events on this element
        and writes back to it.
      </p>
      <p>
        The four properties Numora reads and writes on every keystroke:
      </p>
      <ul>
        <li><code>value</code> - the displayed string. Numora keeps the formatted value here, so the DOM is always the source of truth.</li>
        <li><code>selectionStart</code> / <code>selectionEnd</code> - the caret position. Read to capture where the user is; written via <code>setSelectionRange</code> after reformatting.</li>
        <li><code>setRangeText(replacement, start, end, selectMode)</code> - the secret weapon. Replaces a range in a single atomic mutation that the browser records as one undo entry.</li>
        <li><code>inputMode</code> + <code>pattern</code> - Numora sets <code>inputmode="decimal"</code> for the mobile numeric pad and generates a <code>pattern</code> regex so the browser's form-validation rules match Numora's runtime rules.</li>
      </ul>
      <AnnotatedInput />
    </section>
  )
}
