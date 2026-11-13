# Migrating from v4 to v5

v5 is a breaking release of `numora` and `numora-react`. Both packages now share one version
number and are released together.

In development, every removed or renamed option below logs a `console.warn` naming its
replacement. Old names are ignored, not aliased, so rename them. An ignored option falls back
to the default. The one exception is `thousandSeparator: ''`, which is an invalid option. Vanilla throws.
React throws in development; in production it logs the error and keeps the last valid options.

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
| `maxDecimals` (React; vanilla already used `decimalMaxLength`) | `decimalMaxLength` (default is now `18`, was `2` in both packages) |
| `thousandStyle` / `ThousandStyle` | `groupingStyle` / `GroupingStyle` (default is now `'thousand'`, with `,` as the separator. Vanilla v4 defaulted to none. React v4 defaulted to `'thousand'` but grouped only when you passed `thousandSeparator` or `locale`, so a field that passed neither now shows grouping. `locale` now also sets the grouping style: an `en-IN` field shows `12,34,567` where v4 showed `1,234,567`. Pass `groupingStyle: 'thousand'` to keep the old grouping) |
| `thousandSeparator: ''` | `groupingStyle: 'none'` (an empty separator is invalid: vanilla throws, as in v4; React throws outside production, as in v4, and in production logs the error and keeps the last valid options, or the defaults on a first render, so grouping usually stays on. A v4 production build did not validate and showed no grouping) |
| `rawValueMode` | removed: the raw value is always reported |
| type `FormattingOptions` | `NumoraOptions` |
| `formatOn` left out (was `'blur'`) | the default is now `'change'`; pass `formatOn: 'blur'` to keep grouping on blur only. This matters in React and in a vanilla field that set `thousandStyle`; other vanilla v4 fields had no grouping |

`allowScientificNotation` is new in v5 and defaults to `true`.

## The raw value is canonical

Every raw value is ASCII digits, `.` as the decimal mark, `-` as the sign, no grouping, in
every locale. A de-DE field showing `1.234.567,89` reports `1234567.89`. Values you pass in
(`value` in React, `defaultValue` in both packages, `setValue()`) use the same format and are never read as
locale text.

A raw value stored by v4 from a comma-decimal field (`1234,5`) still reads as 1234.5 in every
field, and is logged in development so you can find it and store `1234.5` instead.

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
| `getValue()` | `input.rawValue`. v4 returned the display text unless `rawValueMode` was set; read `input.formattedValue` for that |
| `getElement()` | `input.element` |
| `valueAsNumber` | removed: `Number(input.rawValue)`, or a decimal library |
| `setValue(value, { undoable })` | `setValue(value)`. The option is gone, and the browser's undo does not step back over text Numora wrote. `setValue` reads its argument as a raw value, then sanitizes and groups it. `,` is a decimal mark there, so pass `'1234.5'`, not display text: `setValue('1,234.5')` gives `1.2345`. The same applies to `defaultValue` |
| `value` getter and setter | read `input.rawValue` or `input.formattedValue`; write with `setValue()`. Assigning `input.value = x` no longer writes to the field and does not throw; only TypeScript reports it |
| `defaultValue` option | still the initial value, but v5 no longer copies it to the element's `defaultValue`, so `form.reset()` empties the field instead of restoring it. A `value` option, which also set the initial value in v4, is ignored and logged in development; use `defaultValue`, and write later with `setValue()` |
| `disable()`, `enable()`, `addEventListener()`, `removeEventListener()` | use `input.element` |
| `onChange(value: string)` | `onValueChange({ value, formattedValue })`, the same name and payload as React |
| any `HTMLInputElement` property as an option | `id`, `name`, `className`, `placeholder`, `disabled`, `readOnly`, `required`, `tabIndex`, `title`, `autofocus`, `ariaLabel`; set anything else on `input.element` |

The `options` argument is now optional, and `update(options)` changes options on a live field.

`setValue()` does not call `onValueChange` and is not checked by `isAllowed`: it is your own
write. On a focused `formatOn: 'blur'` field it now writes the ungrouped editing text.

The class no longer sets a `pattern` attribute. If you relied on `validity.patternMismatch`,
set your own `pattern` on `input.element`. Numora leaves it alone.

The handle uses the same names as a React ref: `rawValue`, `formattedValue` and `setValue()`.
The element is `input.element`; in React the ref is the element itself. There is no `input.value`. On the element, `input.element.value` is the
display text, so the raw value is spelled `rawValue`. An `onChange` option is ignored
and, in development, logged with its replacement.

## React `NumoraInput`

- `onChange` and `onValueChange` no longer fire on a blur that only regroups the display.
  They fire when the raw value changed. If you mirror `formattedValue` in state, use
  `onFormattedValueChange`, which also reports the blur regroup.
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
  Assigning to it throws in strict mode, which covers ES modules.
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
  the vanilla method. It calls neither `onChange` nor `onValueChange` and skips `isAllowed`.
  `onFormattedValueChange` still fires when the text changes.
- `react-dom` is no longer a peer dependency.
- `getSeparatorsFromLocale` is re-exported from `numora-react`.
- `InputType` is no longer re-exported.

## Imports

The root of `numora` now exports only `NumoraInput`, `FormatOn`, `GroupingStyle`,
`getSeparatorsFromLocale`, `formatValue`, `parseValue` and the types.

| You imported from `numora` | v5 |
|---|---|
| `removeThousandSeparators`, `filterMobileKeyboardArtifacts`, `expandCompactNotation`, `expandScientificNotation`, `removeNonNumericCharacters`, `removeExtraDecimalSeparators`, `removeLeadingZeros`, `prependLeadingZero`, `truncateToMaxLength` | same names from `numora/pipeline`, which has no semver guarantee. Prefer `parseValue` when you only need the result |
| `formatValueForDisplay` | `formatValue(raw, options)` |
| `sanitizeNumoraInput` | `parseValue(text, options)` for text in the configured format |
| `normalizeFullWidthDigits` | `normalizeDigits` from `numora/pipeline` |
| `handleOnBeforeInputNumoraInput`, `handleOnPasteNumoraInput`, `handleOnKeyDownNumoraInput`, `writeValuePreservingUndo` (now `writeValue`), `validateNumoraInputOptions`, `applyLocale`, `InputType` | not public. Some remain on `numora/internal`, which has no semver guarantee |

## New: `onFormattedValueChange`

Both packages have a callback for the display string. It fires every time Numora rewrites the field, including the blur regroup, the focus strip, `setValue()` and a locale change, which
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
