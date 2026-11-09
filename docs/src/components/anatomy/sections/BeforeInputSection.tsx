import { CodeBlock } from '@/components/CodeBlock';
import { FormatOn, GroupingStyle } from 'numora';
import { NumoraInput } from 'numora-react';
import { DiagramFrame, demoInputClass } from '../kit';

export function BeforeInputSection() {
  return (
    <section id="before-input" className="space-y-4 scroll-mt-24">
      <h2>
        <code>beforeinput</code> + undo/redo
      </h2>
      <p>
        Formatting from <code>keydown</code> breaks undo history, IME input and accessibility
        tools. Numora's primary path runs through <code>beforeinput</code> instead, for three
        reasons:
      </p>
      <ol>
        <li>It is cancelable.</li>
        <li>
          When you write the formatted value with <code>setRangeText</code> after cancelling, the
          browser records a single atomic undo entry. Ctrl/Cmd+Z restores the previous value in one step.
        </li>
        <li>
          It fires for every input vector: keyboard, voice dictation, drag-and-drop, virtual
          keyboards, autocorrect and IME, including cases where <code>keydown</code> never fires.
        </li>
      </ol>
      <p>
        Numora branches on these <code>inputType</code> values:
      </p>
      <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            <th>Value</th>
            <th>Triggered by</th>
            <th>Numora action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>insertText</code>
            </td>
            <td>Typing</td>
            <td>
              Format and apply via <code>setRangeText</code>
            </td>
          </tr>
          <tr>
            <td>
              <code>deleteContentBackward</code>
            </td>
            <td>Backspace</td>
            <td>Compute deletion, format, apply</td>
          </tr>
          <tr>
            <td>
              <code>deleteContentForward</code>
            </td>
            <td>Delete</td>
            <td>Compute deletion, format, apply</td>
          </tr>
          <tr>
            <td>
              <code>deleteByCut</code>
            </td>
            <td>Ctrl/Cmd+X</td>
            <td>Remove selection, format, apply</td>
          </tr>
          <tr>
            <td>
              <code>insertFromPaste</code>
            </td>
            <td>Ctrl/Cmd+V</td>
            <td>
              Defer to dedicated <code>paste</code> handler
            </td>
          </tr>
          <tr>
            <td>
              <code>historyUndo</code> / <code>historyRedo</code>
            </td>
            <td>Ctrl/Cmd+Z / Ctrl+Y (Cmd+Shift+Z)</td>
            <td>Pass through; let the browser restore</td>
          </tr>
        </tbody>
      </table>
      </div>
      <p>
        The handler (<code>handleOnBeforeInputNumoraInput</code>) is a pure function: it never
        touches the DOM or the event. It returns a tagged result, and the caller applies it:
      </p>
      <CodeBlock language="text">
        {`1. paste / drop / unknown inputType   → { type: 'skip' }
                                                (browser or paste handler continues)
2. Read currentValue, selectionStart/End from the DOM
3. Decimal separator typed (',' or '.')
     second decimal separator            → { type: 'reject' }
     otherwise                           → convert to the configured separator
4. Digit typed past the decimal cap      → { type: 'reject' }
5. Compute intendedValue per inputType:
     insertText            → splice data at the cursor
     deleteContentBackward → remove char before cursor (or selection)
     deleteContentForward  → remove char after cursor (or selection)
     deleteByCut/Drag      → remove selection
     line deletions        → remove to line start / end
6. maxLength exceeded on insert          → { type: 'reject' }
7. formatInputValue(intendedValue)       → sanitize → trim → apply separators
8. isAllowed(raw) returns false          → { type: 'reject' }
9. computeCaretFromEdit(...)            → rank of the sanitized text left of the
                                           caret, found again in the formatted string
10. { type: 'handled', formatted, raw, cursorPos }`}
      </CodeBlock>
      <p>
        On <code>reject</code> the caller calls <code>preventDefault()</code> and leaves the value
        alone. On <code>handled</code> it calls <code>preventDefault()</code>, writes{' '}
        <code>formatted</code> with <code>setRangeText(formatted, 0, currentValue.length, 'end')</code>{' '}
        (one atomic undo entry), sets the cursor to <code>cursorPos</code>, and notifies{' '}
        <code>onChange</code> with <code>raw</code> as the value and <code>formatted</code> as the
        display string.
      </p>
      <p>
        Type <code>1234567</code> below, then press <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Z</kbd>. The
        browser undoes the digit and the comma it added in a single step:
      </p>
      <DiagramFrame variant="demo">
        <NumoraInput
          formatOn={FormatOn.Change}
          thousandSeparator=","
          groupingStyle={GroupingStyle.Thousand}
          decimalMaxLength={2}
          aria-label="Undo test input"
          placeholder="1234567"
          className={demoInputClass}
        />
      </DiagramFrame>
    </section>
  );
}
