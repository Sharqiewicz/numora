# Migrating from v4 to v5

v5 is a breaking release of `numora` and `numora-react`. Both packages now share one version
number and are released together.

In development, every removed or renamed option below logs a `console.warn` naming its
replacement. Old names are ignored, not aliased, so rename them: an ignored option falls back
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
const input = new NumoraInput(container, { value: '1234.5', onValueChange: ({ value, formattedValue }) => {} });
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
| `defaultValue` option | `value` option |
| `disable()`, `enable()`, `addEventListener()`, `removeEventListener()` | use `input.element` |
| `onChange(value: string)` | `onValueChange({ value, formattedValue })`, the same name and payload as React |
| any `HTMLInputElement` property as an option | `id`, `name`, `className`, `placeholder`, `disabled`, `readOnly`, `required`, `tabIndex`, `title`, `autofocus`, `ariaLabel`; set anything else on `input.element` |

The `options` argument is now optional, and `update(options)` changes options on a live field.

The handle has the same three names as a React ref: `rawValue`, `formattedValue` and the
element. There is no `input.value`: on the element (`input.element.value`) `value` is the
display text, so the raw value is always spelled `rawValue`. An `onChange` option is ignored
and, in development, logged with its replacement.

## React `NumoraInput`

- `onChange` and `onValueChange` no longer fire on a blur that only regroups the display.
  They fire when the raw value changed. If you mirror `formattedValue` in state, read
  `ref.current.value` on blur instead.
- `ref.current.rawValue` is the canonical raw value; `ref.current.value` is the display text
  (the ref is the DOM input). Inside `onChange`, `e.target.value` is the raw value, so form
  libraries get the number. Do not feed `ref.current.value` back into the `value` prop.
- Changing a formatting prop on a mounted field re-formats the current value, and reports a
  change only if the raw value changed.
- `InputType` is no longer re-exported.

## Imports

The root of `numora` now exports only `NumoraInput`, `FormatOn`, `GroupingStyle`,
`getSeparatorsFromLocale`, `formatValue`, `parseValue` and the types.

| You imported from `numora` | v5 |
|---|---|
| `removeThousandSeparators`, `normalizeForeignFormat`, `filterMobileKeyboardArtifacts`, `normalizeDigits`, `normalizeUnicodeMinus`, `expandCompactNotation`, `expandScientificNotation`, `removeNonNumericCharacters`, `removeExtraDecimalSeparators`, `removeLeadingZeros`, `prependLeadingZero`, `truncateToMaxLength` | same names from `numora/pipeline` |
| `formatValueForDisplay` | `formatValue(raw, options)` |
| `sanitizeNumoraInput`, `displayToRawValue` | `parseValue(text, options)` for text in the configured format |
| `normalizeFullWidthDigits` | `normalizeDigits` from `numora/pipeline` |
| `handleOnBeforeInputNumoraInput`, `handleOnPasteNumoraInput`, `handleOnKeyDownNumoraInput`, `writeValuePreservingUndo`, `validateNumoraInputOptions`, `applyLocale`, `InputType` | not public. Some remain on `numora/internal`, which has no semver guarantee |

## New: format and parse without an input

```ts
import { formatValue, parseValue } from 'numora'; // or 'numora-react'

formatValue('1234.5', { locale: 'de-DE', decimalMinLength: 2 }); // '1.234,50'
parseValue('1.234,50', { locale: 'de-DE' });                      // '1234.50'
```

`parseValue` reads the configured format only: under the default options `,` is grouping, so
`parseValue('1,5')` is `'15'`.
