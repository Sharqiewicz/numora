import { CodeBlock } from '@/components/CodeBlock'
import { FormatOn, ThousandStyle } from 'numora'
import { NumoraInput } from 'numora-react'

export function BeforeInputSection() {
  return (
    <section className="space-y-4">
      <h2><code>beforeinput</code> + undo/redo</h2>
      <p>
        <code>beforeinput</code> was added to the DOM spec in 2016 specifically because
        developers had been abusing <code>keydown</code> for input manipulation for two
        decades - breaking undo history, IME input, and accessibility along the way.
        Numora's primary path runs entirely through <code>beforeinput</code> for three
        reasons:
      </p>
      <ol>
        <li>It is cancelable.</li>
        <li>
          When you write the formatted value with <code>setRangeText</code> after
          cancelling, the browser records a single atomic undo entry - Ctrl+Z restores
          the previous value perfectly.
        </li>
        <li>
          It fires for every input vector: keyboard, voice dictation, drag-and-drop,
          virtual keyboards, autocorrect, IME - even when <code>keydown</code> doesn't
          fire at all.
        </li>
      </ol>
      <p>The <code>inputType</code> values Numora dispatches on:</p>
      <table>
        <thead>
          <tr><th>Value</th><th>Triggered by</th><th>Numora action</th></tr>
        </thead>
        <tbody>
          <tr><td><code>insertText</code></td><td>Typing</td><td>Format and apply via <code>setRangeText</code></td></tr>
          <tr><td><code>deleteContentBackward</code></td><td>Backspace</td><td>Compute deletion, format, apply</td></tr>
          <tr><td><code>deleteContentForward</code></td><td>Delete</td><td>Compute deletion, format, apply</td></tr>
          <tr><td><code>deleteByCut</code></td><td>Ctrl+X</td><td>Remove selection, format, apply</td></tr>
          <tr><td><code>insertFromPaste</code></td><td>Ctrl+V</td><td>Defer to dedicated <code>paste</code> handler</td></tr>
          <tr><td><code>historyUndo</code> / <code>historyRedo</code></td><td>Ctrl+Z / Ctrl+Y</td><td>Pass through; let the browser restore</td></tr>
        </tbody>
      </table>
      <p>The handler runs in nine steps:</p>
      <CodeBlock language="text">
{`1. Early return for paste/drop      → dedicated paste handler takes over
2. Read currentValue, selectionStart/End from the DOM
3. Special-case decimal separator   → convert ',' or '.' to configured sep,
                                      block second decimal if one exists
4. Compute intendedValue per inputType:
     insertText            → splice data at cursor
     deleteContentBackward → remove char before cursor (or selection)
     deleteContentForward  → remove char after cursor (or selection)
     deleteByCut/Drag      → remove selection
     default               → return null (browser handles natively)
5. e.preventDefault()                → block the browser mutation
6. formatInputValue(intendedValue)   → sanitize → trim → apply separators
7. target.setRangeText(formatted, 0, currentValue.length, 'end')
                                     → atomic replace, single undo entry
8. updateCursorPosition(...)         → restore caret based on digit count
9. Return { formatted, raw }`}
      </CodeBlock>
      <p>
        Try it: type <code>1234567</code> below, then press <kbd>Ctrl</kbd>+<kbd>Z</kbd>.
        The browser restores <em>both</em> the digit and the comma in a single undo step:
      </p>
      <div className="my-6 rounded-lg border bg-muted/30 p-4">
        <NumoraInput
          formatOn={FormatOn.Change}
          thousandSeparator=","
          thousandStyle={ThousandStyle.Thousand}
          maxDecimals={2}
          placeholder="Type 1234567, then Ctrl+Z"
          className="w-full rounded border bg-background px-3 py-2 font-mono outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
    </section>
  )
}
