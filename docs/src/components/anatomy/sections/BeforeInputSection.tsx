import { CodeBlock } from '@/components/CodeBlock';

export function BeforeInputSection() {
  return (
    // biome-ignore lint/correctness/useUniqueElementIds: stable anchor id, linked by hash
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
          It fires for keyboard, voice dictation, virtual keyboards and autocorrect, including cases
          where <code>keydown</code> never fires. It also fires for drag-and-drop and IME text, but
          Numora lets the browser insert those and reformats the field on the <code>input</code>{' '}
          event that follows.
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
                <code>deleteByDrag</code>, word and line deletions
              </td>
              <td>Dragging text out, Ctrl/Alt+Backspace, Cmd+Backspace</td>
              <td>
                Remove the selection, or everything before or after the caret when nothing is
                selected, then format and apply
              </td>
            </tr>
            <tr>
              <td>
                <code>insertFromPaste</code>
              </td>
              <td>Ctrl/Cmd+V</td>
              <td>
                Does not arrive: the <code>paste</code> handler cancels the paste first
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
        The handler (<code>handleOnBeforeInputNumoraInput</code>) reads the field and the event but
        never writes to them. It returns a tagged result, and the caller applies it:
      </p>
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
     deleteContentBackward → remove the selection, or the char before the caret
     deleteContentForward  → remove the selection, or the char after the caret
                             (both: when that char is the thousand separator,
                             also remove the digit beyond it)
     deleteByCut/Drag      → remove the selection
     word/line backward    → remove the selection, or everything before the caret
     word/line forward     → remove the selection, or everything after the caret
     anything else (drop, IME composition,
     undo, redo)                         → { type: 'skip' } (the browser continues)
5. insertText only: scientific notation in
   the result, allowScientificNotation off → { type: 'reject' }
6. insertText only: maxLength exceeded   → { type: 'reject' }
7. formatInputValue(intendedValue)       → sanitize → trim decimals →
                                           group (Change mode only)
     result equals the current value     → { type: 'reject' } (nothing to report)
8. isAllowed(raw) returns false          → { type: 'reject' }
9. Caret: computeCaretFromEdit(...)      → rank of the sanitized text left of the
                                           caret, found again in the formatted string
     formatting changed nothing          → the caret the edit itself would leave
10. { type: 'handled', formatted, raw, cursorPos }`}
      </CodeBlock>
      <p>
        On <code>skip</code> the caller does nothing. On <code>reject</code> it calls{' '}
        <code>preventDefault()</code> and leaves the value alone. On <code>handled</code> it calls{' '}
        <code>preventDefault()</code>, writes <code>formatted</code> with{' '}
        <code>setRangeText(formatted, 0, currentValue.length, 'end')</code>, sets the cursor to{' '}
        <code>cursorPos</code>, and reports the change: <code>onValueChange</code> gets{' '}
        <code>raw</code> as <code>value</code> and <code>formatted</code> as{' '}
        <code>formattedValue</code>. React also calls <code>onChange</code> with an event whose{' '}
        <code>target.value</code> is <code>raw</code>.
      </p>
    </section>
  );
}
