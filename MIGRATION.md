# Migrating from v4 to v5

v5 is a breaking release of `numora` and `numora-react`. Both packages now share one version
number and are released together.

In development, every removed or renamed option below logs a `console.warn` naming its
replacement. Old names are ignored, not aliased, so rename them. An ignored option falls back
to the default.

## Install

`numora-react` now depends on `numora` itself. Install one package:

```bash
npm install numora-react   # React
npm install numora         # vanilla
```

If your React app also lists `numora`, keep it at the same version as `numora-react`.

## Renamed options (both packages)

| v4 | v5 |
|---|---|
| `enableNegative` | `allowNegative` |
| `enableLeadingZeros` | `allowLeadingZeros` |
| `enableCompactNotation` | `allowCompactNotation` |
| `autoAddLeadingZero` | `padLeadingZero` |
| `maxDecimals` | `decimalMaxLength` (default is now `18`, was `2` in React) |
| `thousandStyle` / `ThousandStyle` | `groupingStyle` / `GroupingStyle` |
| `thousandSeparator: ''` | `groupingStyle: 'none'` (an empty separator now throws) |
| `emitRawValue`, `rawValueMode` | removed: the raw value is always reported |
| type `FormattingOptions` | `NumoraOptions` |
| `formatOn` left out (was `'blur'`) | the default is now `'change'`; pass `formatOn: 'blur'` to keep grouping on blur only |

New in v5: `allowScientificNotation` (default `true`).

## The raw value is canonical

Every raw value is ASCII digits, `.` as the decimal mark, `-` as the sign, no grouping, in
every locale. A de-DE field showing `1.234.567,89` reports `1234567.89`. Values you pass in
(`value`, `defaultValue` in React, `setValue()`) use the same format and are never read as
locale text.

## Vanilla `NumoraInput`

```ts
// v4
const input = new NumoraInput(container, { defaultValue: '1234.5', onChange: (value) => {} });
input.getValue();
input.getElement().disabled = true;
input.valueAsNumber;

// v5
const input = new NumoraInput(container, { defaultValue: '1234.5', onValueChange: ({ value, formattedValue }) => {} });
input.rawValue;         // '1234.5' (read-only: write with input.setValue('2'))
input.formattedValue;   // '1,234.5'
input.element.disabled = true;
Number(input.rawValue);
```

| v4 | v5 |
|---|---|
| `getValue()` | `input.rawValue` |
| `getFormattedValue()` | `input.formattedValue` |
| `getElement()` | `input.element` |
| `valueAsNumber` | removed: `Number(input.rawValue)`, or a decimal library |
| `setValue(value, { undoable })` | `setValue(value)`. The option is gone: the write was never an undo step |
| `defaultValue` option | unchanged: the initial value. A `value` option is ignored and logged in development; write later with `setValue()` |
| `disable()`, `enable()`, `addEventListener()`, `removeEventListener()` | use `input.element` |
| `onChange(value: string)` | `onValueChange({ value, formattedValue })`, the same name and payload as React |
| any `HTMLInputElement` property as an option | `id`, `name`, `className`, `placeholder`, `disabled`, `readOnly`, `required`, `tabIndex`, `title`, `autofocus`, `ariaLabel`; set anything else on `input.element` |

The `options` argument is now optional, and `update(options)` changes options on a live field.

`setValue()` does not call `onValueChange` and is not checked by `isAllowed`: it is your own
write. On a focused `formatOn: 'blur'` field it now writes the ungrouped editing text.

The class no longer sets a `pattern` attribute. If you relied on `validity.patternMismatch`,
set your own `pattern` on `input.element`. Numora leaves it alone.

The handle has the same three names as a React ref: `rawValue`, `formattedValue` and the
element. There is no `input.value`. On the element, `input.element.value` is the
display text, so the raw value is spelled `rawValue`. An `onChange` option is ignored
and, in development, logged with its replacement.

## React `NumoraInput`

- `onChange` and `onValueChange` no longer fire on a blur that only regroups the display.
  They fire when the raw value changed. If you mirror `formattedValue` in state, read
  `ref.current.value` on blur instead.
- `ref.current.rawValue` is the canonical raw value. `ref.current.value` is the display text,
  because the ref is the DOM input. Inside `onChange`, `e.target.value` is the raw value, so form
  libraries get the number. Do not feed `ref.current.value` back into the `value` prop.
- Changing a formatting prop on a mounted field re-formats the current value, and reports a
  change only if the raw value changed.
- `value` and `defaultValue` are typed `string`. `value={1234.5}` is a type error. Pass
  `value="1234.5"`. At runtime a number is still converted with `String()`, and logged in
  development. The same applies to the vanilla `defaultValue` option and `setValue()`.
- `NumoraHTMLInputElement` declares `rawValue` and `formattedValue` as required and read-only.
  Type refs as `useRef<NumoraHTMLInputElement>(null)` and drop any `?? ''` fallbacks or casts.
  A `useRef<HTMLInputElement>(null)` still compiles but does not see the two properties.
  `formattedValue` now reads the field's current text, the same as `ref.current.value`.
  Assigning to it throws.
- `locale` (`true`) on a server-rendered field uses the server's locale and logs a warning in
  development. Pass an explicit tag such as `locale="de-DE"`.
- A controlled field always shows its `value` prop. An edit your `onChange` / `onValueChange`
  handler does not store is put back, with the caret at the end, as a native controlled
  `<input>` does. In v4 the rejected text stayed in the field.
- `autoComplete` and `spellCheck` are now defaults (`"off"`, `false`) that your own props
  override. `type` and `inputMode` stay fixed.
- Your `onKeyDown` and `onPaste` run before Numora's handling, and `e.preventDefault()` in
  either stops Numora from handling that key or paste. `onPaste` therefore sees the field
  before the pasted text is written.
- `ref.current.rawValue` and `formattedValue` exist as soon as the ref is set, so a parent
  layout effect or a callback ref can read them.
- `locale` accepts a boolean, so `locale={useBrowserLocale}` type-checks. `false` is the same
  as leaving it out.
- New: `ref.current.setValue(value)` writes an uncontrolled field, the same as
  the vanilla method. It calls no callback and skips `isAllowed`.
- `react-dom` is no longer a peer dependency.
- `getSeparatorsFromLocale` is re-exported from `numora-react`.
- `InputType` is no longer re-exported.

## Imports

The root of `numora` now exports only `NumoraInput`, `FormatOn`, `GroupingStyle`,
`getSeparatorsFromLocale`, `formatValue`, `parseValue` and the types.

| You imported from `numora` | v5 |
|---|---|
| `removeThousandSeparators`, `normalizeForeignFormat`, `filterMobileKeyboardArtifacts`, `normalizeDigits`, `normalizeUnicodeMinus`, `expandCompactNotation`, `expandScientificNotation`, `removeNonNumericCharacters`, `removeExtraDecimalSeparators`, `removeLeadingZeros`, `prependLeadingZero`, `truncateToMaxLength` | same names from `numora/pipeline`, which has no semver guarantee. Prefer `parseValue` when you only need the result |
| `formatValueForDisplay` | `formatValue(raw, options)` |
| `sanitizeNumoraInput`, `displayToRawValue` | `parseValue(text, options)` for text in the configured format |
| `normalizeFullWidthDigits` | `normalizeDigits` from `numora/pipeline` |
| `handleOnBeforeInputNumoraInput`, `handleOnPasteNumoraInput`, `handleOnKeyDownNumoraInput`, `writeValuePreservingUndo` (now `writeValue`), `validateNumoraInputOptions`, `applyLocale`, `InputType` | not public. Some remain on `numora/internal`, which has no semver guarantee |

## New: `onFormattedValueChange`

Both packages have a callback for the display string. It fires every time Numora rewrites the
field, including the blur regroup, the focus strip, `setValue()` and a locale change, which
`onValueChange` does not report. If you kept an overlay or a label in sync with `focus`, `blur`
or `click` listeners, replace them with it:

```ts
new NumoraInput(host, { onFormattedValueChange: (text) => overlay.update(text) });
```

```tsx
<NumoraInput onFormattedValueChange={setText} />
```

It does not fire on creation or mount. `formatValue(defaultValue, options)` gives the first text.

## New: format and parse without an input

```ts
import { formatValue, parseValue } from 'numora'; // or 'numora-react'

formatValue('1234.5', { locale: 'de-DE', decimalMinLength: 2 }); // '1.234,50'
parseValue('1.234,50', { locale: 'de-DE' });                      // '1234.50'
```

`parseValue` reads the configured format only. Under the default options `,` is grouping, so
`parseValue('1,5')` is `'15'`.
