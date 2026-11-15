import { CodeBlock } from '@/components/CodeBlock';

export function BeforeInputSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
    <section id="before-input" className="space-y-4 scroll-mt-24">
      <h2>
        Why <code>beforeinput</code>
      </h2>
      <p>
        Formatting from <code>keydown</code> breaks IME input and accessibility tools. Numora
        formats from <code>beforeinput</code> instead, for three reasons:
      </p>
      <ol>
        <li>
          It fires before the browser edits the field and is cancelable, so only the formatted text
          is ever shown. There is no flash of unformatted text.
        </li>
        <li>
          It tells Numora what the edit is (<code>inputType</code> and <code>data</code>), so Numora
          can compute the intended value and the cursor position.
        </li>
        <li>
          It fires for keyboard, voice dictation, virtual keyboards and autocorrect, including cases
          where <code>keydown</code> never fires.
        </li>
      </ol>
      <p>
        It also fires for drag-and-drop and IME text. Numora lets the browser insert those and
        reformats the field on the <code>input</code> event that follows.
      </p>
      <p>
        What Numora does depends on the <code>inputType</code>:
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
                <code>deleteContentBackward</code> / <code>deleteContentForward</code>
              </td>
              <td>Backspace / Delete</td>
              <td>
                Remove the selection, or the character before or after the cursor, then format and
                apply
              </td>
            </tr>
            <tr>
              <td>
                <code>deleteByCut</code>
              </td>
              <td>Ctrl/Cmd+X</td>
              <td>Remove the selection, then format and apply</td>
            </tr>
            <tr>
              <td>
                <code>deleteByDrag</code>, word and line deletions
              </td>
              <td>Dragging text out, Ctrl/Alt+Backspace, Cmd+Backspace</td>
              <td>
                Remove the selection, or everything before or after the cursor when nothing is
                selected, then format and apply
              </td>
            </tr>
            <tr>
              <td>
                <code>insertFromPaste</code>
              </td>
              <td>Ctrl/Cmd+V</td>
              <td>
                Never arrives. The <code>paste</code> handler cancels the paste first
              </td>
            </tr>
            <tr>
              <td>
                <code>historyUndo</code> / <code>historyRedo</code>
              </td>
              <td>Ctrl/Cmd+Z / Ctrl+Y (Cmd+Shift+Z)</td>
              <td>
                Pass through. Numora's own writes are not in the browser's undo history. The{' '}
                <code>input</code> fallback reformats whatever the browser changes
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        The handler reads the field and the event but never writes to them. It returns one of three
        results, and the caller applies it:
      </p>
      <ul>
        <li>
          <code>skip</code>: the caller does nothing and the browser continues.
        </li>
        <li>
          <code>reject</code>: the caller calls <code>preventDefault()</code> and leaves the value
          alone.
        </li>
        <li>
          <code>handled</code>: the caller calls <code>preventDefault()</code>, writes the formatted
          value with <code>setRangeText</code>, places the cursor and reports the change.
        </li>
      </ul>
      <p>
        <code>setRangeText</code> fires no <code>input</code> event. Your change callback gets both
        strings, as <a href="#raw-vs-formatted">Raw value vs formatted value</a> shows.
      </p>
      <details>
        <summary className="cursor-pointer text-caption text-muted-foreground">
          The handler's full decision order (<code>handleOnBeforeInputNumoraInput</code>)
        </summary>
        <CodeBlock language="text">
          {`1. Read currentValue and selectionStart/End from the field,
   inputType and data from the event
2. insertText of a decimal key ('.', ',' or another keyboard's decimal mark)
     the value outside the selection already
     has a decimal separator,
     decimalMaxLength is 0, or
     the key is a non-ASCII mark that is the
     configured thousandSeparator        → { type: 'reject' }
     otherwise                           → convert to the configured separator
3. insertText of a digit after the decimal
   separator, past the decimal cap       → { type: 'reject' }
4. Compute intendedValue per inputType:
     insertText            → splice data over the selection
     deleteContentBackward → remove the selection, or the char before the cursor
     deleteContentForward  → remove the selection, or the char after the cursor
                             (both: when that char is the thousand separator,
                             also remove the digit beyond it)
     deleteByCut/Drag      → remove the selection
     word/line backward    → remove the selection, or everything before the cursor
     word/line forward     → remove the selection, or everything after the cursor
     anything else (drop, IME composition,
     undo, redo)                         → { type: 'skip' } (the browser continues)
5. insertText only: scientific notation in
   the result, allowScientificNotation off → { type: 'reject' }
6. insertText only: maxLength exceeded   → { type: 'reject' }
7. formatInputValue(intendedValue)       → sanitize → trim decimals →
                                           group (Change mode only)
     result equals the current value     → { type: 'reject' } (nothing to report)
8. isAllowed(raw) returns false          → { type: 'reject' }
9. Cursor: computeCaretFromEdit(...)     → rank of the sanitized text left of the
                                           cursor, found again in the formatted string
     formatting changed nothing          → the cursor the edit itself would leave
10. { type: 'handled', formatted, raw, cursorPos }`}
        </CodeBlock>
      </details>
    </section>
  );
}
