import { CodeBlock } from '@/components/CodeBlock';

export function BeforeInputSection() {
  return (
    <section id="before-input" className="space-y-4 scroll-mt-24">
      <h2>
        Why <code>beforeinput</code>
      </h2>
      <p>
        Formatting from <code>keydown</code> breaks IME input and accessibility tools. Numora's
        primary path runs through <code>beforeinput</code> instead, for these reasons:
      </p>
      <ol>
        <li>
          It fires before the browser edits the field and is cancelable, so only the formatted text
          is ever shown. There is no flash of unformatted text.
        </li>
        <li>
          It tells Numora what the edit is (<code>inputType</code> and <code>data</code>), so the
          intended value and the caret can be computed.
        </li>
        <li>
          Writing the result with <code>setRangeText</code> fires no <code>input</code> event, and
          it does not go through React's tracked <code>value</code> setter.
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
              <td>
                Pass through. The browser makes the change, and the <code>input</code> fallback
                reformats it
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The handler (<code>handleOnBeforeInputNumoraInput</code>) is a pure function. It never
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
        <code>formatted</code> with{' '}
        <code>setRangeText(formatted, 0, currentValue.length, 'end')</code>, sets the cursor to{' '}
        <code>cursorPos</code>, and notifies <code>onChange</code> with <code>raw</code> as the
        value and <code>formatted</code> as the display string.
      </p>
    </section>
  );
}
