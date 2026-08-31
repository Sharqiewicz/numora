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
Only one thing: `skipOverThousandSeparatorOnDelete` - when the cursor is immediately before or after a thousand separator (`,` in `1,234`) and the user presses Delete/Backspace, Numora adjusts the selection so the separator is skipped, not deleted. This is legitimate `keydown` usage because it's about cursor navigation, not character formatting.

### What Numora removed from here
The old `handleDecimalSeparatorKey` - which used to intercept `,`/`.` key presses and manually convert/insert them. This was the classic misuse of `keydown` for formatting. It was moved to `beforeinput`.

### Missing anything?
Nothing significant. `keydown` is intentionally minimal in Numora.

---

## 2. `beforeinput` ⭐ The correct hook for input formatting

### Why it was introduced
`beforeinput` was added to the DOM spec in 2016 (Input Events Level 2) and landed in all major browsers by 2019–2020. It was introduced specifically because developers had been abusing `keydown` for input manipulation for 20 years - causing broken undo history, IME (Chinese/Japanese/Korean input) issues, and accessibility failures.

The goals:
1. **Give a cancelable hook that fires after the browser has resolved what the input WILL be**, but before it mutates the DOM
2. **Preserve the browser's undo/redo stack** - if you use `setRangeText` inside `beforeinput`, the browser records a single atomic undo entry
3. **Support non-keyboard input** - voice dictation, drag-and-drop, virtual keyboards, IME all fire `beforeinput` but may not fire `keydown` reliably

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

| Value | Triggered by | Notes |
|---|---|---|
| `'insertText'` | Typing | Most common, includes numpad |
| `'deleteContentBackward'` | Backspace | |
| `'deleteContentForward'` | Delete | |
| `'deleteByCut'` | Ctrl+X | |
| `'deleteByDrag'` | Drag out of input | |
| `'insertFromPaste'` | Ctrl+V | `e.dataTransfer` has clipboard data |
| `'insertFromDrop'` | Drag into input | |
| `'historyUndo'` | Ctrl+Z | Should NOT be cancelled - let browser handle |
| `'historyRedo'` | Ctrl+Y | Should NOT be cancelled - let browser handle |
| `'insertCompositionText'` | IME in progress | Mid-composition - see IME section below |
| `'insertFromComposition'` | IME confirmed | Composition finished - see IME section below |

### How Numora uses it (`handleOnBeforeInputNumoraInput`)

```
1. Early returns for events Numora doesn't handle:
   - paste/drop → return null (dedicated paste handler exists)

2. Read current DOM state:
   - currentValue = input.value
   - selectionStart, selectionEnd

3. Decimal separator special case:
   - typed ',' or '.' → convert to configured decimal separator
   - already has decimal → e.preventDefault() + return null

4. Compute intendedValue for each inputType:
   - 'insertText'            → insert inputData at cursor
   - 'deleteContentBackward' → remove char before cursor (or selection)
   - 'deleteContentForward'  → remove char after cursor (or selection)
   - 'deleteByCut'/'deleteByDrag' → remove selection
   - default                 → return null (browser handles natively)

5. e.preventDefault() - blocks browser mutation

6. Format intendedValue through the full pipeline:
   sanitize → trim decimals → apply thousand separators

7. setRangeText(formatted, 0, currentValue.length, 'preserve')
   → replaces entire input value with formatted result
   → fires synchronous 'input' event (real browsers only; jsdom skips this)

8. Place cursor at correct position

9. Return { formatted, raw }
   → return value is ignored by the caller; onChange emission
     is handled by handleChange when it receives the 'input' event
```

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

### What Numora is missing here

**IME support is absent.** `insertCompositionText` and `insertFromComposition` both fall into the `default: return null` branch. Numora doesn't intercept IME input at all - the browser inserts the characters directly, then `input` fires and `handleChange` processes the result.

**This is intentional and fine for numeric inputs.** Nobody types `1`, `2`, `3` via IME - digits are standard ASCII and always fire `insertText`. The gap would only matter if Numora handled free-text inputs.

**`historyUndo`/`historyRedo`:** Numora correctly returns `null` here, letting the browser handle undo/redo natively. The browser restores the previous value, then fires `input`, which `handleChange` picks up to emit `onChange`.

**`insertReplacementText`** (browser autocorrect/autocomplete): Falls into `default: return null`. The browser applies the replacement and then `input` fires; `handleChange` catches it.

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

`handleChange` is **not** a single uniform pipeline. It branches three ways, and only the last branch reformats:

- **After `beforeinput` / `paste` / `focus` / `blur` (internal writes):** these handlers apply their own value via `withInternalWrite`, which sets `suppressNextInputEvent` for the duration of the write. The synchronous `input` event that `setRangeText` fires (real browsers; jsdom skips it, so tests dispatch it manually) therefore hits an early `return`. The originating handler has already called `handleValueChange`, so returning here is what prevents `onChange` from double-firing.

- **After undo/redo:** `beforeinput` returns `{ type: 'skip' }` without `preventDefault`, so the browser applies the restore natively and fires `input` with `inputType` `historyUndo`/`historyRedo`. `handleChange` **deliberately does not reformat** — it just broadcasts the restored value. Re-formatting here would push another `setRangeText` step onto the undo stack and break the natural Ctrl+Z walk-back. This is the core of the undo-preservation design.

- **Programmatic changes:** external code sets `input.value` and dispatches `new Event('input')`. This is the only branch that runs `formatInputValue`, and when the value changes it routes the write through `writeValuePreservingUndo` rather than assigning `target.value` directly — so even a programmatic write keeps undo history intact.

`handleValueChange` (and therefore `onChange`) is reached from every branch except the suppressed one.

### Missing anything?
The vanilla `handleChange` reformats on every `input` event. This is intentional - it's the correct fallback for any path that doesn't go through `beforeinput`.

---

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
`handleOnPasteNumoraInput` in the paste handler:
1. `e.preventDefault()` - blocks native paste
2. Reads `e.clipboardData.getData('text')`
3. Splices clipboard text into the current value at the active selection
4. Runs the combined value through the full sanitize → format pipeline
5. Sets `input.value` directly and repositions cursor
6. Returns `{ formatted, raw }` - caller (`handlePaste`) then dispatches a synthetic `input` event so `handleChange` fires `onChange`

**Note:** `beforeinput` fires for `insertFromPaste` before `paste` fires. Numora returns `null` from `handleOnBeforeInputNumoraInput` for paste (`inputType === 'insertFromPaste'`), deferring entirely to the `paste` handler.

---

## Full examples

### User types `5` in an input showing `1,234`

```
Cursor at position 5 (end of "1,234")

keydown: key='5'
  → Numora: check thousand-separator skip → no
  → No action

beforeinput: inputType='insertText', data='5'
  → currentValue = "1,234", selectionStart=5, selectionEnd=5
  → not a decimal separator key
  → intendedValue = "1,2345"
  → e.preventDefault()
  → formatInputValue("1,2345")
      remove thousand sep → "12345"
      format with separators → "12,345"
  → setRangeText("12,345", 0, 5)  [fires synchronous 'input' in real browsers]
  → cursor → position 6

input: (fired by setRangeText, synchronous)
  → handleChange runs
  → formatInputValue("12,345") → idempotent, same value → oldValue === newValue
  → updateCursorPosition: no-op (value unchanged)
  → handleValueChange("12,345", "12345")  ← emits onChange

keyup: key='5' → ignored
```

**Result:** `12,345`, cursor after `5`.

---

### User types `.` in an input showing `1`

```
beforeinput: inputType='insertText', data='.'
  → currentValue = "1"
  → e.data === '.' → decimal block:
      decimalSep = '.'
      valueOutsideSelection = "1"
      "1".includes('.') = false → proceed
      inputData = '.'
  → intendedValue = "1."
  → e.preventDefault()
  → formatInputValue("1.")
      sanitize: keeps "1." (trailing decimal preserved)
      trimToDecimalMaxLength: decimal part is '' → no trim → "1."
      formatNumoraInput: no thousand sep → "1."
  → setRangeText("1.", 0, 1)
  → intendedValue === newValue → setSelectionRange(2, 2)

input: (synchronous from setRangeText)
  → handleChange: formatInputValue("1.") → same value → no-op
  → handleValueChange("1.", "1.")  ← emits onChange
```

**Result:** `1.`, cursor after the dot.

---

### User types `.` but `1.5` already has a decimal

```
beforeinput: inputType='insertText', data='.'
  → currentValue = "1.5"
  → valueOutsideSelection = "1.5"
  → "1.5".includes('.') = true
  → e.preventDefault() + return null
  → no setRangeText → no 'input' event → handleChange not called
```

**Result:** Nothing changes. Duplicate decimal blocked.

---

### User presses Ctrl+Z (undo)

```
beforeinput: inputType='historyUndo', data=null
  → falls into default: → return null
  → e.preventDefault() is NOT called
  → browser handles undo natively
  → browser restores previous value via its internal undo stack
  → 'input' fires with the restored value

input:
  → handleChange: formatInputValue(restoredValue) → formats if needed
  → handleValueChange(formatted, raw)  ← emits onChange
```

---

### User pastes `1,234.56abc`

```
beforeinput: inputType='insertFromPaste'
  → return null immediately (deferred to paste handler)
  → e.preventDefault() NOT called here

paste:
  → handlePaste: e.preventDefault()
  → clipboardData = "1,234.56abc"
  → combinedValue = "" + "1,234.56abc" + "" = "1,234.56abc"
  → formatInputValue("1,234.56abc") → sanitize → "1234.56" → format → "1,234.56"
  → input.value = "1,234.56"
  → cursor repositioned
  → dispatches synthetic 'input' event

input: (synthetic, from handlePaste)
  → handleChange: formatInputValue("1,234.56") → idempotent, same value
  → handleValueChange("1,234.56", "1234.56")  ← emits onChange
```

**Result:** `1,234.56`, invalid characters stripped.

---

## How tests simulate the browser event sequence

Tests use `simulateTyping` / `simulateDelete` helpers that replicate the exact browser sequence:

```typescript
function simulateTyping(el, char) {
  const beforeInput = new InputEvent('beforeinput', {
    bubbles: true, cancelable: true, inputType: 'insertText', data: char,
  });
  el.dispatchEvent(beforeInput);

  if (beforeInput.defaultPrevented) {
    // setRangeText was called inside handleBeforeInput.
    // Real browsers fire a synchronous 'input' from setRangeText; jsdom does not.
    el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
    return;
  }

  // Native insertion path (beforeinput not handled):
  el.value = el.value.slice(0, start) + char + el.value.slice(end);
  el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText' }));
}
```

Tests that set `.value` directly and dispatch `new Event('input')` bypass `beforeinput` entirely and only exercise the programmatic fallback path in `handleChange`.

---

## Event reference summary

| Event | Cancelable | Has `inputType` | Browser version | Numora action |
|---|---|---|---|---|
| `keydown` | Yes | No | Netscape 2 (1996) | Thousand-separator cursor skip only |
| `beforeinput` | Yes | Yes | Chrome 60 / Firefox 87 / Safari 10.1 | Format + apply via setRangeText |
| `input` | No | Sometimes | HTML5 (2009) | Always runs full pipeline; emits onChange |
| `keyup` | Yes | No | Netscape 2 (1996) | Ignored |
| `paste` | Yes | No | IE 5 (1999) | Sanitize + apply clipboard value; dispatch synthetic input |
| `focus` | No | No | DOM Level 2 (2000) | Strip thousand separators (Blur mode) |
| `blur` | No | No | DOM Level 2 (2000) | Re-apply thousand separators (Blur mode) |

## Numora coverage gaps

| Scenario | Status | Impact |
|---|---|---|
| IME input (`insertCompositionText`) | Not handled (falls to default → `null`, caught by `handleChange`) | Low for numeric inputs; users rarely type numbers via IME |
| `insertReplacementText` (autocorrect) | Falls to default → `null`, caught by `handleChange` | May briefly show unformatted value; minor |
| React component tests | **None exist** | High - no tests for any React-specific behavior |
| Mobile virtual keyboard | `beforeinput` fires but may have different `data` values on some Android keyboards | Unknown - not systematically tested |

---

## numora-react - React-specific event handling

The `numora-react` package wraps the core event handlers in a React component. The event sequence is the same, but React's architecture requires one critical exception: `beforeinput` cannot use React's event system and must be attached natively.

### Minimum React version: 17

`numora-react` requires React **≥ 17**. React 16 reached EOL in 2022; the dev dependency and all testing targets React 19.

### Event handler attachment - mixed model

`beforeinput` is handled via native `addEventListener` on the element. All other handlers use React's synthetic event system via JSX props.

| Handler | Attachment | Type | What Numora does |
|---|---|---|---|
| `beforeinput` | native `addEventListener` on element | `InputEvent` (DOM) | Format + apply via `setRangeText`; store `formattedValue` on element |
| `onChange` | React JSX prop | `ChangeEvent<HTMLInputElement>` | Skip internal writes; pass undo/redo through; reformat programmatic writes. Emits `onChange` / `onValueChange` |
| `onKeyDown` | React JSX prop | `KeyboardEvent<HTMLInputElement>` | `skipOverThousandSeparatorOnDelete`; forward to consumer |
| `onPaste` | React JSX prop | `ClipboardEvent<HTMLInputElement>` | Sanitize clipboard; set value; synthesise change event |
| `onFocus` | React JSX prop | `FocusEvent<HTMLInputElement>` | Blur mode: strip thousand separators for editing |
| `onBlur` | React JSX prop | `FocusEvent<HTMLInputElement>` | Blur mode: re-apply separators; synthesise change event |

### Why `beforeinput` must use native `addEventListener`

React's synthetic event system uses **delegation**: a single listener at the root container fires handlers during the **bubbling phase**. For `beforeinput` this is fatal - by the time the bubbling phase reaches the root, the browser has already committed the character to the DOM. Calling `e.nativeEvent.preventDefault()` at that point is a no-op; the character is already there.

This was verified empirically: switching to React's `onBeforeInput` prop caused all validation and sanitisation to silently fail - any character could be typed.

A listener attached directly to the element fires **synchronously at the element**, before the browser decides whether to apply the mutation. This is the only position where `preventDefault()` works for `beforeinput`. It is also why ProseMirror, Slate, and Lexical all use native `addEventListener` for `beforeinput`.

```typescript
// Registered once at mount. Options read via stateRef - no re-registration needed.
useEffect(() => {
  const input = internalInputRef.current;
  if (!input) return;

  const onBeforeInput = (e: InputEvent) => {
    const result = handleOnBeforeInputNumoraInput(
      e,
      stateRef.current.decimalMaxLength,
      stateRef.current.formattingOptions
    );

    switch (result.type) {
      case 'skip':
        return;                       // let the browser apply it natively (e.g. undo)
      case 'reject':
        e.preventDefault();           // no write, no onChange, undo untouched
        return;
      case 'handled': {
        e.preventDefault();
        withInternalWrite(() =>
          writeValuePreservingUndo(input, result.formatted, result.cursorPos)
        );
        (input as NumoraHTMLInputElement).formattedValue = result.formatted;
        stateRef.current.onChange?.(createSyntheticChangeEvent(input, result.raw));
        stateRef.current.onValueChange?.({
          value: result.raw,
          formattedValue: result.formatted,
        });
        break;
      }
    }
  };

  input.addEventListener('beforeinput', onBeforeInput);
  return () => input.removeEventListener('beforeinput', onBeforeInput);
}, [withInternalWrite]);
```

`onChange` is invoked **directly** here rather than left to React's synthetic
dispatch: React's value-tracker diff can silently drop `onChange` when the
tracker and `input.value` happen to align after concurrent renders.

### Keeping options current without re-registering

`formattingOptions` (locale, separators, etc.), `decimalMaxLength`, and the callbacks can all change after mount. Re-registering the listener every time they change would leave a one-render window with no listener. Instead a single `stateRef` mirror is refreshed via `useLayoutEffect` (which runs synchronously after each commit, before paint) so the handler always reads the latest values:

```typescript
const stateRef = useRef({ onChange, onValueChange, decimalMaxLength, formattingOptions });
useLayoutEffect(() => {
  stateRef.current = { onChange, onValueChange, decimalMaxLength, formattingOptions };
});
```

### `setRangeText` fires a synchronous `input` event

Inside the native `beforeinput` handler, the core calls `target.setRangeText(formatted, 0, len, 'end')`. This fires a synchronous native `input` event. React's root listener sees it and calls `onChange` → `handleChange`. React 18's automatic batching only batches `setState` calls - `handleChange` does not call `setState`, it just reads `e.target.value` (already set by `setRangeText`) and emits callbacks. Batching has no effect on the result.

### Uncontrolled `defaultValue` - why not `value=`

The component renders `<input defaultValue={initialDisplayValue} />`, never `<input value={...} />`.

React-controlled inputs (`value=`) have the reconciler overwrite `input.value` on every render - undoing what `setRangeText` just wrote and breaking both formatting and undo history. `defaultValue` means React writes the DOM value once at mount and never touches it again, leaving `setRangeText` as the sole mutation path during typing.

### Controlled `value` prop - bypasses the event sequence

When a `value` prop is passed, a `useEffect` syncs changes directly into the DOM:

```typescript
useEffect(() => {
  if (controlledValue === undefined) return;
  const { formatted, raw } = formatValueForDisplay(
    String(controlledValue),
    decimalMaxLength,
    formattingOptions
  );
  if (formatted !== input.value) {
    input.value = formatted;
    (input as NumoraHTMLInputElement).formattedValue = formatted;
    onValueChange?.({ value: raw, formattedValue: formatted });
  }
}, [controlledValue, decimalMaxLength, formattingOptions, onValueChange]);
```

No events fire. This is correct - programmatic value changes do not need undo history or cursor management.

### `handleChange` mirrors the vanilla three-way branch

The React `handleChange` has the same shape as the vanilla class's:

```typescript
const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  if (suppressNextInputEventRef.current) return;          // 1. our own setRangeText

  const numInput = e.target as NumoraHTMLInputElement;
  const inputType = (e.nativeEvent as InputEvent).inputType;

  if (inputType === InputType.HistoryUndo || inputType === InputType.HistoryRedo) {
    // 2. Undo/redo: broadcast the restored string, never re-format. Re-formatting
    //    would push another undo step and break the natural Ctrl+Z walk-back.
    const raw = toRawValue(numInput.value, formattingOptions.thousandSeparator);
    numInput.formattedValue = numInput.value;
    onChange?.(createSyntheticChangeEvent(numInput, raw));
    onValueChange?.({ value: raw, formattedValue: numInput.value });
    return;
  }

  // 3. Programmatic write: format, and route the write through
  //    writeValuePreservingUndo rather than assigning .value directly.
  const { formatted, raw } = formatValueForDisplay(numInput.value, decimalMaxLength, formattingOptions);
  if (formatted !== numInput.value) {
    withInternalWrite(() => writeValuePreservingUndo(numInput, formatted, formatted.length));
  }
  numInput.formattedValue = formatted;
  onChange?.(createSyntheticChangeEvent(numInput, raw));
  onValueChange?.({ value: raw, formattedValue: formatted });
};
```

### `formattedValue` stored on the DOM element; `e.target.value` is raw

There is no `emitRawValue` toggle in React. The synthetic change event's `target` is a
`Proxy` whose `value` getter returns the **raw** value, while the display string is
exposed as `formattedValue` — a custom property on the DOM element, typed via the
exported `NumoraHTMLInputElement` interface. It stays in sync with the DOM without
triggering re-renders, and consumers can read it off the forwarded `ref` at any time.

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

### Paste and blur synthesise a `ChangeEvent`

**Paste**: `handleOnPasteNumoraInput` calls `e.preventDefault()`, which suppresses the native `input` event - React's `onChange` would never fire. After applying the formatted value, the component creates a synthetic `ChangeEvent` and calls `onChange` directly.

**Blur** (`FormatOn.Blur` mode): `handleBlur` writes `input.value` directly (no DOM event fires). Same pattern - a synthetic `ChangeEvent` is created so consumers see a consistent `onChange` call for the formatted-on-blur value.

### Full event flow - React component, user types `4` in `1,234`

```
keydown: key='4'
  → handleKeyDown (React synthetic, bubbled from root)
  → skipOverThousandSeparatorOnDelete → no separator adjacent → no-op
  → consumer onKeyDown forwarded

beforeinput: inputType='insertText', data='4'  [native listener, fires AT the element]
  → handleOnBeforeInputNumoraInput(e, decimalMaxLength, formattingOptions)
      currentValue = "1,234", selectionStart = 5
      intendedValue = "1,2344"
      → { type: 'handled', formatted: "12,344", raw: "12344", cursorPos: 6 }
      e.preventDefault()  ← browser mutation suppressed
      withInternalWrite(() => writeValuePreservingUndo(input, "12,344", 6))
        ↳ suppressNextInputEventRef = true for the duration of the write
        ↳ setRangeText("12,344", 0, 5, 'end')
            ↳ [synchronous] native 'input' fires
                → React root sees 'input' → handleChange
                → early return (suppressNextInputEventRef is true)  ← no double-fire
        ↳ cursor positioned after '4'
      input.formattedValue = "12,344"
      onChange?.(createSyntheticChangeEvent(input, "12344"))   ← called directly
      onValueChange?.({ value: "12344", formattedValue: "12,344" })

input: (fired synchronously above and suppressed - handleChange did not emit)

keyup: key='4' → ignored
```

**Result:** DOM shows `12,344`. The consumer's `onChange` receives `e.target.value === "12344"` (raw — the synthetic event's `target` proxies `value` to the raw string) and `e.target.formattedValue === "12,344"`. `onValueChange` receives `{ value: "12344", formattedValue: "12,344" }`.

Note that `onChange` is invoked **directly from the `beforeinput` handler**, not via React's synthetic dispatch of the `input` event — that path is deliberately suppressed to prevent double-firing.
