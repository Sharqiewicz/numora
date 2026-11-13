# Browser Input Events - How They Work in Numora

This document explains step-by-step what happens in the browser when a user types a character into a Numora input, including why each event was introduced, its intended purpose, how Numora uses it, and where Numora may be missing coverage.

---

## The full event sequence for a single keystroke

When a user presses a key (e.g., `1`) on a focused `<input>` element:

```
keydown  →  beforeinput  →  input  →  keyup
```

Each event is distinct and was added to the browser for a specific reason.

---

## 1. `keydown`

### Why it was introduced
`keydown` is one of the oldest browser events (Netscape 2, circa 1996). It was introduced to give JavaScript a way to intercept keyboard interactions before anything happened - originally to handle shortcut keys and prevent default behaviors like form submission on Enter. At the time, there was no concept of "input events"; `keydown` was the only way to intercept what a user was about to type.

For decades it was misused as the primary hook for input formatting because it was the only option available.

### What it's for
- Intercepting non-printing keys: Enter, Tab, Escape, Arrow keys, Backspace, Delete, Ctrl+A, etc.
- Keyboard shortcuts
- Preventing default keyboard behaviors (e.g., `e.preventDefault()` on `Enter` stops form submission)

### What it is NOT for
`keydown` is a bad fit for character insertion because:
- `e.key` reflects the physical key, not the resulting character (varies by locale and IME)
- It fires before the browser knows what the final character will be (composition events, dead keys, etc.)
- Calling `e.preventDefault()` on `keydown` is a blunt instrument - it prevents the entire key action, which can break accessibility tools and screen readers

### How Numora uses it
Only one thing: `skipOverThousandSeparatorOnDelete` (via `handleOnKeyDownNumoraInput`). In Change mode, with no selection, when the caret is immediately before or after a thousand separator (`,` in `1,234`) and the user presses Delete/Backspace, Numora moves the caret past the separator, so the next character deleted is the digit, not the separator. This is legitimate `keydown` usage because it's about cursor navigation, not character formatting. In React the consumer's `onKeyDown` runs first, and `preventDefault()` there turns this off.

### What Numora removed from here
The old `handleDecimalSeparatorKey` - which used to intercept `,`/`.` key presses and manually convert/insert them. This was the classic misuse of `keydown` for formatting. That job is now done in `beforeinput`.

### Missing anything?
Nothing significant. `keydown` is intentionally minimal in Numora.

---

## 2. `beforeinput` ⭐ The correct hook for input formatting

### Why it was introduced
`beforeinput` was specified in Input Events Level 1 and landed in all major browsers by 2021 (Firefox 87 was the last). It was introduced specifically because developers had been abusing `keydown` for input manipulation for 20 years - causing IME (Chinese/Japanese/Korean input) issues, and accessibility failures.

The goals:
1. **Give a cancelable hook that fires after the browser has resolved what the input WILL be**, but before it mutates the DOM
2. **Support non-keyboard input** - voice dictation, drag-and-drop, virtual keyboards, IME all fire `beforeinput` but may not fire `keydown` reliably

### What it's for
The intended use is: inspect what the user is about to do (via `inputType` and `data`), optionally cancel it, and apply your own transformed version using `setRangeText`. This is the standard pattern for all rich-text editors (Prosemirror, Slate, Lexical all use it).

### Key properties

| Property | Example value | What it tells you |
|---|---|---|
| `inputType` | `'insertText'` | The semantic action being performed |
| `data` | `'1'` | The character being inserted (null for deletions) |
| `cancelable` | `true` | You can block the browser's native mutation |
| `dataTransfer` | `DataTransfer` | For paste/drop, contains the clipboard data |

**`inputType` values you need to know:**

| Value | Triggered by | Numora |
|---|---|---|
| `'insertText'` | Typing | Handled (includes numpad and decimal keys) |
| `'deleteContentBackward'` | Backspace | Handled |
| `'deleteContentForward'` | Delete | Handled |
| `'deleteByCut'` | Ctrl+X | Handled (deletes the selection) |
| `'deleteByDrag'` | Drag out of input | Handled (deletes the selection) |
| `'deleteSoftLineBackward'`, `'deleteHardLineBackward'`, `'deleteWordBackward'` | Cmd/Alt + Backspace | Handled (deletes the selection, or to the start) |
| `'deleteSoftLineForward'`, `'deleteHardLineForward'`, `'deleteWordForward'` | Cmd/Alt + Delete | Handled (deletes the selection, or to the end) |
| `'insertFromPaste'` | Ctrl+V | Skipped; the `paste` handler owns it. The `paste` event fires first and Numora cancels it, so this `beforeinput` normally never arrives |
| `'insertFromDrop'` | Drag into input | Skipped; the browser inserts it and the `input` fallback reformats |
| `'historyUndo'` / `'historyRedo'` | Ctrl+Z / Ctrl+Y | Skipped; the browser makes the change and the `input` fallback handles it |
| `'insertCompositionText'` | IME in progress | Skipped - see IME section below |
| `'insertFromComposition'` | IME confirmed | Skipped - see IME section below |

### How Numora uses it (`handleOnBeforeInputNumoraInput`)

The helper is pure. It never touches the input or the event; it returns one of three results:

- `{ type: 'handled', formatted, raw, cursorPos }` - cancel the edit and write `formatted`
- `{ type: 'reject' }` - cancel the edit, change nothing, fire no callback
- `{ type: 'skip' }` - leave the edit to the browser

```
1. Decimal key (insertText with '.', ',' or a non-ASCII decimal mark):
   - both '.' and ',' are decimal keys in every field (ADR 0015), including when one of
     them is the thousand separator: en-US typing ',' inserts '.', de-DE typing '.' inserts ','
   - a non-ASCII glyph equal to the configured thousandSeparator → reject
   - decimalMaxLength 0 → reject (no fractional part allowed)
   - the value outside the selection already has a decimal → reject
   - otherwise the key is replaced by the configured decimal separator
     (the Arabic decimal separator U+066B, Arabic comma, fullwidth comma/full stop and
     ideographic full stop are normalized the same way `sanitizeNumoraInput` does for
     values that arrive any other way)

2. A digit typed after the decimal separator that would exceed decimalMaxLength → reject

3. Compute intendedValue and the intended caret for each inputType:
   - insertText                          → insert the data at the selection
   - deleteContentBackward/Forward       → remove the char (or selection); next to a thousand
                                           separator, remove the digit beyond it too
                                           (mobile fallback when keydown did not skip it)
   - deleteByCut/deleteByDrag, line and word deletions → remove the selection / to the edge
   - anything else (paste, drop, history, IME, replacement) → skip

4. insertText only: scientific notation while allowScientificNotation is false → reject;
   sanitized length above maxLength → reject

5. Format intendedValue through the full pipeline (formatInputValue):
   sanitize → trim decimals → apply thousand separators (Change mode)

6. Formatted value equals the current value → reject (a no-op keystroke fires no callback)

7. isAllowed(raw) returns false (or throws) → reject

8. Caret: computeCaretFromEdit
   → sanitize + trim the text LEFT of the caret as it stood after the edit
     (everything left of the edit + the inserted text), exactly as the full value was
   → its length is the caret rank: significant chars (digits, decimal separator, sign)
     before the caret, thousand separators ignored
   → select that rank in the formatted string: the index just after the last character of
     the sanitized prefix that is still the start of the final value
   → handles non-contiguous edits (a decimal trim, a dropped leading zero, `1k` -> `1,000`,
     sign toggle, select-and-replace, Backspace over a separator) because the prefix is
     rebuilt from the edit, not guessed from a diff
   → inserted text is already in the field's locale (a typed `.` is mapped to `,` in de-DE),
     so the prefix is never re-detected as foreign format in isolation
   → separators are exactly one character (enforced by validation)

9. Return { type: 'handled', formatted, raw, cursorPos }
```

The caller is `applyBeforeInput` in `utils/dom-events.ts`, shared by vanilla and React:

```typescript
const result = handleOnBeforeInputNumoraInput(e, opts.decimalMaxLength, opts);
if (result.type === 'skip') return;
e.preventDefault();
if (result.type === 'handled') {
  writeValue(el, result.formatted, result.cursorPos); // setRangeText: no 'input' event
  return { value: result.raw, formattedValue: result.formatted };
}
```

The wrapper passes the returned values to `emit()`, which calls `onValueChange` (React also `onChange`) and `onFormattedValueChange`. Nothing waits for an `input` event.

### What is IME?

**IME (Input Method Editor)** is software that lets users type characters that can't be represented on a standard keyboard - most commonly for East Asian languages (Chinese, Japanese, Korean), which have thousands of characters.

Instead of one key per character, the user types phonetic sequences and the IME presents a candidate list to choose from:

```
User types: n  i  h  o  n
IME shows candidates: 日本  二本  煮本  ...
User selects: 日本
```

This maps to a two-phase `beforeinput` sequence:

```
user types 'n'
  → beforeinput: inputType='insertCompositionText', data='n'  (mid-composition)
  → input (browser shows 'n' underlined - a "composition" in progress)

user types 'i'
  → beforeinput: inputType='insertCompositionText', data='ni'
  → input (composition updates to 'ni')

user selects '日本' from candidate list
  → beforeinput: inputType='insertFromComposition', data='日本'  (final)
  → input (composition replaced with '日本')
```

During composition, the browser owns the input - it shows intermediate phonetic characters underlined. `insertCompositionText` should generally NOT be cancelled or formatted, because the composition isn't finished yet. `insertFromComposition` is the safe point to act on the final value.

### What Numora does here

**IME composition is left to the browser.** `insertCompositionText` and `insertFromComposition` both fall into the `default` branch, which returns `{ type: 'skip' }`. Numora doesn't intercept IME input - the browser inserts the characters directly, then `input` fires. The `input` listener ignores events while `e.isComposing`; the final non-composing `input` runs `applyInputFallback` on the committed text. The value stays correct (sanitization still runs); the caret is best-effort during composition, because there is no pre-edit caret to map from.

**This is intentional and fine for numeric inputs.** Nobody types `1`, `2`, `3` via IME - digits are standard ASCII and always fire `insertText`. The gap would only matter if Numora handled free-text inputs.

**`historyUndo`/`historyRedo`:** `skip`. If the browser makes such a change, it fires `input`, which the fallback treats like any other browser-made change.

**`insertReplacementText`** (browser autocorrect/autocomplete): `skip`. The browser applies the replacement and then `input` fires; the fallback catches it.

---

## 3. `input`

### Why it was introduced
`input` was introduced in HTML5 (circa 2009) to fill a gap: `keydown`/`keyup` don't fire for non-keyboard input (paste, drag-drop, spell-check replacements, voice input). `input` fires whenever the value actually changes, regardless of how the change happened. It's the universal "value changed" signal.

### What it's for
- Reacting to the new value after it's already in the DOM
- Syncing external state (React, Vue, etc.) to the DOM
- The canonical event for "something was typed/deleted/pasted"

### What it is NOT for
- Preventing or modifying input (it's not cancelable)
- Anything timing-sensitive (fires after mutation, too late to intercept)

### How Numora uses it

The `input` listener is the fallback for every change `beforeinput` did not handle. Typing never gets here: Numora's own writes use `setRangeText`, which dispatches no `input` event (HTML spec; verified in Chrome and jsdom), so no guard is needed to avoid double handling.

The vanilla class and React both call `applyInputFallback(el, focused, previous, opts)`, where `previous` is the field text after the last write Numora made. It does the following:

- **Composing:** the listener returns early while `e.isComposing`. The final non-composing `input` reconciles the committed text.
- **Nothing changed:** the value equals `previous`, so there is nothing to rewrite or report.
- **Scientific notation refused:** with `allowScientificNotation: false`, the field goes back to `previous` and nothing is reported.
- **Browser-made and programmatic changes:** a change the browser makes itself (autofill, drop, IME commit) or external code that sets `input.value` and dispatches `new Event('input')` (a form library resetting the field). When the field is focused, it runs `formatInputValue` under the field's real `formatOn` mode - the same typing-time formatting a keystroke would produce. A focused Change-mode field reads the value as its own display format; a focused Blur-mode field reads it with foreign-format detection, and so does an unfocused field. When the field is **not** focused, there is no mid-edit state to respect, so the value is formatted for resting display (grouped, as if `FormatOn.Change`), so a Blur-mode field left ungrouped by an autofill isn't stuck that way.
- **`isAllowed` refuses it:** the field goes back to `previous`.
- When the text changes, the write goes through `writeValue` rather than assigning `input.value`, so `setRangeText` fires no further `input` event.

It returns `{ value, formattedValue }` and the wrapper's `emit()` reports it: `onValueChange` (React also `onChange`), then `onFormattedValueChange` if the text is new.

### Missing anything?
Nothing. Reformatting every `input` event that `beforeinput` did not handle is the correct fallback for any path that doesn't go through `beforeinput`.


---

### Caret for `input` events `beforeinput` did not handle

Autofill, IME commit and programmatic dispatches reach `applyInputFallback` without an edit. Vanilla
and React share `computeCaretAfterRewrite`: while the field is focused the caret is mapped with
the same rank logic (the text left of the browser's caret, sanitized, selected in the new value);
while unfocused it goes to the end. If the value was re-read wholesale as a foreign format, the
caret goes to the end.

## 4. `keyup`

### Why it was introduced
`keyup` completes the keyboard event trio (`keydown` → `keypress` → `keyup`, though `keypress` is deprecated). It was intended for detecting when a key is released - useful for detecting long-press, implementing "hold to repeat" behaviors, or knowing a modifier key was released.

### What it's for
Release detection. Not useful for most input handling because by the time `keyup` fires, the input has already been modified.

### How Numora uses it
Not at all. Correctly ignored.

---

## 5. `paste` (bonus - not in the main sequence)

### Why it was introduced
Clipboard events (`cut`, `copy`, `paste`) were introduced to give applications control over clipboard operations. Without them, there was no way to intercept what was being pasted and transform it.

### What it's for
- Reading clipboard data via `e.clipboardData.getData('text')`
- Preventing the native paste and applying a sanitized/formatted version instead
- `e.preventDefault()` in `paste` prevents the pasted text from appearing; you then manually set the value

### How Numora uses it
`applyPaste` (in `utils/dom-events.ts`) always calls `e.preventDefault()`. A `readOnly` or `disabled` field then takes nothing - no write, no callback - matching what a native `<input readOnly>`/`<input disabled>` does. In React the same check runs first in `handlePaste`, so the consumer's `onPaste` does not run for those fields either.

`handleOnPasteNumoraInput` computes the result:
1. Reads `e.clipboardData.getData('text/plain')`
2. Reads the clipboard slice with foreign-format detection (ADR 0006, `normalizeForeignFormat`): the field's own separators are only a hint, so de-DE `1.5` is 1,5 and en-US `1.234,56` is 1,234.56. The slice is rewritten to the field's locale text
3. Splices it into the current value at the active selection
4. Rejects the paste when `allowScientificNotation` is `false` and the combined value holds scientific notation
5. Runs the combined value through the full sanitize → format pipeline (thousand separators are always stripped first), then `isAllowed`
6. Computes the caret from the edit (`computeCaretFromEdit`)
7. Returns `{ type: 'handled', formatted, raw, cursorPos }` or `{ type: 'reject' }` (`raw` is the canonical raw value: ASCII digits, `.` decimal, no grouping)

`applyPaste` then writes `formatted` with `writeValue` (`setRangeText`, so no `input` event) and returns `{ value, formattedValue }`. A paste that leaves the text unchanged writes and reports nothing. The wrapper (`emit()` in both packages) notifies the callbacks.

**Note:** the `paste` event fires before `beforeinput` with `insertFromPaste`, and `applyPaste` always cancels it, so the browser normally sends no `beforeinput` for a paste. If one does arrive, `handleOnBeforeInputNumoraInput` returns `{ type: 'skip' }` for it (the `default` branch) and leaves the paste to the `paste` handler.

---

## Full examples

### User types `5` in an input showing `1,234`

```
Cursor at position 5 (end of "1,234")

keydown: key='5'
  → skipOverThousandSeparatorOnDelete → not a delete key → no action

beforeinput: inputType='insertText', data='5'
  → currentValue = "1,234", selectionStart=5, selectionEnd=5
  → not a decimal key
  → intendedValue = "1,2345"
  → formatInputValue("1,2345")
      remove thousand sep → "12345"
      format with separators → "12,345"
  → { type: 'handled', formatted: "12,345", raw: "12345", cursorPos: 6 }
  → applyBeforeInput: e.preventDefault()
  → writeValue("12,345", caret 6)  [setRangeText; dispatches no 'input' event]
  → emit({ value: "12345", formattedValue: "12,345" })  ← onValueChange, onFormattedValueChange

input: (not fired - the input fallback does not run)

keyup: key='5' → ignored
```

**Result:** `12,345`, cursor after `5`.

---

### User types `.` in an input showing `1`

```
beforeinput: inputType='insertText', data='.'
  → '.' is a decimal key (so is ',', ADR 0015)
  → not the thousand separator, decimalMaxLength > 0
  → valueOutsideSelection = "1" has no decimal → proceed
  → inputData = decimalSeparator
  → intendedValue = "1."
  → formatInputValue("1.") → "1." (a trailing decimal separator is kept while typing)
  → { type: 'handled', formatted: "1.", raw: "1.", cursorPos: 2 }
  → e.preventDefault(), writeValue("1.", caret 2), emit(...)
```

**Result:** `1.`, cursor after the dot. In an en-US field, typing `,` gives the same result, because both keys are decimal keys. In a de-DE field, `.` and `,` both insert `,`.

---

### User types `.` but `1.5` already has a decimal

```
beforeinput: inputType='insertText', data='.'
  → currentValue = "1.5"
  → valueOutsideSelection = "1.5" already includes the decimal separator
  → { type: 'reject' }
  → e.preventDefault(), no write, no callback
```

**Result:** Nothing changes. Duplicate decimal blocked.

---

### User pastes `1,234.56abc`

```
paste:
  → applyPaste: e.preventDefault()  [so no beforeinput 'insertFromPaste' follows]
  → handleOnPasteNumoraInput:
      clipboard text/plain = "1,234.56abc"
      read with foreign-format detection (ADR 0006), then spliced into the current value
      formatInputValue(combinedValue, ..., true) → sanitize → "1234.56" → group → "1,234.56"
      → { type: 'handled', formatted: "1,234.56", raw: "1234.56", cursorPos: 8 }
  → writeValue("1,234.56", caret 8)  [setRangeText; dispatches no 'input' event]
  → emit({ value: "1234.56", formattedValue: "1,234.56" })
```

**Result:** `1,234.56`, invalid characters stripped. No `input` event is dispatched, in either package.

---

## How tests simulate the browser event sequence

Tests use `simulateTyping` / `simulateDelete` helpers (`tests/NumoraInput.test.ts`) that replicate the browser sequence:

```typescript
function simulateTyping(el, char) {
  const beforeInput = new InputEvent('beforeinput', {
    bubbles: true, cancelable: true, inputType: 'insertText', data: char,
  });
  el.dispatchEvent(beforeInput);

  // Numora handled or rejected it. setRangeText fires no 'input' event, in browsers or jsdom,
  // so there is nothing left to simulate.
  if (beforeInput.defaultPrevented) return;

  // Native insertion path (beforeinput skipped):
  el.value = el.value.slice(0, start) + char + el.value.slice(end);
  el.setSelectionRange(start + char.length, start + char.length);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
}
```

Tests that set `.value` directly and dispatch `new Event('input')` bypass `beforeinput` entirely and only exercise the programmatic fallback path (`applyInputFallback`).

---

## Event reference summary

| Event | Cancelable | Has `inputType` | Browser version | Numora action |
|---|---|---|---|---|
| `keydown` | Yes | No | Netscape 2 (1996) | Thousand-separator caret skip on Delete/Backspace (Change mode only) |
| `beforeinput` | Yes | Yes | Chrome 60 / Firefox 87 / Safari 10.1 | Format + apply via `setRangeText`; reject no-op or disallowed edits |
| `input` | No | Sometimes | HTML5 (2009) | Fallback only: reformats changes `beforeinput` did not handle (autofill, drop, IME commit, dispatched events). Skipped while composing |
| `keyup` | Yes | No | Netscape 2 (1996) | Ignored |
| `paste` | Yes | No | IE 5 (1999) | Always cancelled; read with foreign-format detection, sanitize, write via `setRangeText`. No-op on `readOnly`/`disabled` |
| `focus` | No | No | DOM Level 2 (2000) | Strip thousand separators (Blur mode; mouse focus waits for `click`) - neither package reports a raw change for this strip |
| `blur` | No | No | DOM Level 2 (2000) | Settle the value at rest (grouping, `decimalMinLength` padding, trailing separator strip, `-0` → `0`) in every mode - `onValueChange` fires only if the raw value actually changed |

## Numora coverage gaps

| Scenario | Status | Impact |
|---|---|---|
| IME input (`insertCompositionText`) | Not handled (`beforeinput` skips it; the `input` fallback reconciles the final non-composing `input`) | Low for numeric inputs; users rarely type numbers via IME. Caret is best-effort during composition |
| `insertReplacementText` (autocorrect) | `beforeinput` skips it; the `input` fallback catches it | May briefly show unformatted value; minor |
| Mobile virtual keyboard | `beforeinput` fires but may have different `data` values on some Android keyboards | Unknown - not systematically tested |

---

## numora-react - React-specific event handling

The `numora-react` package wraps the core event handlers in a React component. The event sequence is the same, but React's architecture requires one critical exception: `beforeinput` cannot use React's event system and must be attached natively.

### Minimum React version: 17

`numora-react` requires React **≥ 17**. React 16 reached EOL in 2022; the dev dependency and all testing targets React 19.

### Event handler attachment - mixed model

`beforeinput` is handled via native `addEventListener` on the element. The `onChange`, `onKeyDown`, `onPaste` and `onBlur` handlers use React's synthetic event system via JSX props. `focus` is a native listener too, set up by `attachFocusStrip`. Every handler calls one `apply*` step from `utils/dom-events.ts` (shared with the vanilla class), then `emit()`.

| Handler | Attachment | What Numora does |
|---|---|---|
| `beforeinput` | native `addEventListener` on the element, once at mount | `applyBeforeInput(e, stateRef.current.formattingOptions)`: cancels and writes via `setRangeText`; `emit(input, values)` |
| `onChange` (`handleChange`) | React JSX prop | The `input` fallback: `applyInputFallback(el, focused, lastValue.current, formattingOptions)`, then `emit`. Ignored while `isComposing` |
| `onKeyDown` | React JSX prop | Runs the consumer's `onKeyDown` first, then `handleOnKeyDownNumoraInput` unless the consumer called `preventDefault()` |
| `onPaste` | React JSX prop | `readOnly`/`disabled` fields do nothing. Otherwise the consumer's `onPaste` runs first, then `applyPaste`, then `emit` unless the consumer called `preventDefault()` |
| `focus` / `mousedown` / `click` | native, via `attachFocusStrip` | Blur mode: strip thousand separators for editing; reports the new text through `onFormattedValueChange` only (raw value unchanged, so `onChange` / `onValueChange` stay silent) |
| `onBlur` | React JSX prop | `applyBlur`, then `emit`; then the consumer's `onBlur` |

### Why `beforeinput` must use native `addEventListener`

React's `onBeforeInput` prop is not the native `beforeinput` event. React builds it itself from `textInput`, `keypress` and composition events, so it fires only for inserted text, never for deletions, and its `nativeEvent` is not the native `beforeinput`. It carries no `inputType`, so Numora cannot tell which edit is about to happen, and it cannot cancel a deletion because none is ever reported.

This was verified empirically: switching to React's `onBeforeInput` prop caused all validation and sanitisation to silently fail - any character could be typed.

A listener attached directly to the element receives the real `beforeinput`, with its `inputType`, before the browser applies the mutation, so `preventDefault()` works. It is also why ProseMirror, Slate, and Lexical all use native `addEventListener` for `beforeinput`.

### `emit()` - the one place callbacks fire

```typescript
const emit = (el, values?) => {
  const text = el.value;
  lastValue.current = text;
  if (values) {
    onChange?.(createSyntheticChangeEvent(el, values.value));
    onValueChange?.(values);
  }
  if (text !== reported.current) {
    reported.current = text;
    onFormattedValueChange?.(text);
  }
  if (!values) return;
  // controlled: render again so the layout effect restores `value` if the parent kept its state
  if (controlledValue !== undefined) resync((n) => n + 1);
};
```

`onChange` is invoked **directly** rather than left to React's synthetic dispatch: Numora's own writes fire no `input` event, so React's `onChange` would never run for them. `values` is passed only when the raw value changed; a new display text is reported either way, through `onFormattedValueChange`.

### Keeping options current without re-registering

`formattingOptions` (locale, separators, etc.) and the callbacks can all change after mount. Re-registering the listener every time they change would leave a one-render window with no listener. Instead a single `stateRef` mirror is refreshed in a layout effect (which runs synchronously after each commit, before paint) so the handlers always read the latest values:

```typescript
useIsomorphicLayoutEffect(() => {
  stateRef.current = {
    onChange, onValueChange, onFormattedValueChange, isAllowed, formattingOptions, controlledValue,
  };
  // ...then re-sync the DOM if `value` or the formatting options changed
});
```

### `setRangeText` fires no `input` event

`writeValue` calls `el.setRangeText(value, 0, el.value.length, 'end')` and then `setSelectionRange`. Per the HTML spec `setRangeText` dispatches no `input` event (verified in Chrome and jsdom), so React's `handleChange` does not run for Numora's own writes (typing, paste, blur, focus strip). Each step calls `emit` itself, once.

### Uncontrolled `defaultValue` - why not `value=`

The component renders `<input defaultValue={initialDisplayValue} />`, never `<input value={...} />`.

React-controlled inputs (`value=`) have the reconciler overwrite `input.value` on every render - undoing what `setRangeText` just wrote and breaking formatting. `defaultValue` means React writes the DOM value once at mount and never touches it again, leaving `setRangeText` as the sole mutation path during typing.

### Controlled `value` prop - bypasses the event sequence, echoed value compared by raw

When a `value` prop is passed, a layout effect syncs changes directly into the DOM. No
`input`/`beforeinput` events fire for this path - it's a direct DOM write, gated by an
equality check so the effect is a no-op on the overwhelmingly common controlled pattern:
`onChange={(e) => setValue(e.target.value)}` feeding straight back into `value={value}`.

The equality check compares **sanitized raw values**, not formatted display strings:

```typescript
if (
  changed ||
  sanitizeNumoraInput(input.value, formattingOptions) !==
    sanitizeNumoraInput(controlledValueString, formattingOptions, 'canonical')
) {
  // parent value genuinely differs -> format for editing (Blur mode, focused) or
  // resting display (everything else) and write it, via writeValue.
}
```

This matters because `formatValueForDisplay`/`formatForDisplay` strip a trailing decimal separator and pad to `decimalMinLength` - both display-only transforms. Comparing *those* outputs against the DOM value made a trailing
`"1."` round-trip through the parent as `"1"` (the dot silently eaten while the user was
mid-keystroke), `"0.05"` collapse, and a `decimalMinLength: 2` field snap to `"1.00"` after
every keystroke - because the comparison itself was already lossy, not just the write.
`sanitizeNumoraInput` performs none of those transforms, so comparing its output is a
faithful "is this the same number" check: equal means the parent echoed the same value back
(don't touch the DOM mid-entry); different means the parent genuinely changed it (external
update, clamping, a numeric round-trip that lost precision, ...) and the field re-syncs to
it.

In Blur mode, while the field is focused, a genuinely-different value is formatted for
*editing* (no thousand separators - the real `formatOn`) rather than resting display, so a
programmatic update mid-typing doesn't inject commas and snap the caret to the end.

When the field is controlled, `emit` also re-renders the component after every change to the raw value, so an edit the parent does not store is put back to `value` (ADR 0012). A change to the display text alone, such as the blur regroup or the focus strip, does not re-render. `ref.setValue()` on a controlled field always re-renders, so a value the parent does not hold is put back.

### `handleChange` is the `input` fallback

The React `handleChange` is the same fallback as the vanilla `input` listener. Typing never gets here (`beforeinput` handles it); autofill, drop, IME commit and dispatched `input` events do.

```typescript
const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  const el = e.target as NumoraHTMLInputElement;
  // Mid-composition text is the IME's: the final non-composing `input` reconciles it.
  if ((e.nativeEvent as InputEvent).isComposing) return;
  const focused = isFocused(el);
  emit(el, applyInputFallback(el, focused, lastValue.current, formattingOptions));
};
```

### `formattedValue` stored on the DOM element; `e.target.value` is raw

There is no raw-value toggle in either package: `e.target.value` is always the canonical raw value. The synthetic change event's `target` is a
`Proxy` whose `value` getter returns the **raw** value, while the display string is
exposed as `formattedValue` - a getter defined on the DOM element, typed via the
exported `NumoraHTMLInputElement` interface. It reads `input.value`, so it never goes stale, and consumers can read it off the forwarded `ref` at any time. The element also has `rawValue` and `setValue()`.

```typescript
// In an onChange handler:
e.target.value           // → "1234.56"   (raw, always)
e.target.formattedValue  // → "1,234.56"  (display string)

// Access the element property via the exported type:
import { type NumoraHTMLInputElement } from 'numora-react'
(ref.current as NumoraHTMLInputElement).formattedValue  // → "1,234.56"

// Or use the dedicated data callback:
<NumoraInput onValueChange={({ value, formattedValue }) => console.log(value, formattedValue)} />
```

### Paste and blur call `onChange` through `emit`

**Paste**: `applyPaste` calls `e.preventDefault()`, so no native `input` event follows, and it writes with `setRangeText`, which fires none either. `handlePaste` passes the returned values to `emit`, which calls `onChange` with a synthetic change event.

**Blur**: `applyBlur` writes with `writeValue` (no DOM event fires) and returns values only when the raw value changed (trailing separator strip, `decimalMinLength` padding, `-0` to `0`). Regrouping alone is written but not reported. `emit` reports the new text through `onFormattedValueChange` either way.

### Full event flow - React component, user types `4` in `1,234`

```
keydown: key='4'
  → handleKeyDown (React synthetic, bubbled from root)
  → consumer onKeyDown first
  → handleOnKeyDownNumoraInput → skipOverThousandSeparatorOnDelete → not a delete key → no-op

beforeinput: inputType='insertText', data='4'  [native listener, fires AT the element]
  → applyBeforeInput(e, formattingOptions)
      handleOnBeforeInputNumoraInput: currentValue = "1,234", selectionStart = 5
      intendedValue = "1,2344"
      → { type: 'handled', formatted: "12,344", raw: "12344", cursorPos: 6 }
      e.preventDefault()  ← browser mutation suppressed
      writeValue(input, "12,344", 6)
        ↳ setRangeText("12,344", 0, 5, 'end')   ← dispatches no 'input' event
        ↳ caret positioned after '4'
      returns { value: "12344", formattedValue: "12,344" }
  → emit(input, values)
      onChange?.(createSyntheticChangeEvent(input, "12344"))
      onValueChange?.({ value: "12344", formattedValue: "12,344" })
      onFormattedValueChange?.("12,344")

input: (not fired - setRangeText is silent, so handleChange does not run)

keyup: key='4' → ignored
```

**Result:** DOM shows `12,344`. The consumer's `onChange` receives `e.target.value === "12344"` (raw - the synthetic event's `target` proxies `value` to the raw string) and `e.target.formattedValue === "12,344"`. `onValueChange` receives `{ value: "12344", formattedValue: "12,344" }`.

`onChange` is invoked **from the `beforeinput` handler** here (through `emit`; paste, blur and the `input` fallback call the same `emit`), not via React's synthetic dispatch of an `input` event. No `input` event follows the write, so `onChange` fires exactly once.
