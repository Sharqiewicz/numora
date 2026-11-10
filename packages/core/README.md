# numora

[![npm version](https://img.shields.io/npm/v/numora.svg)](https://www.npmjs.com/package/numora)
[![npm downloads](https://img.shields.io/npm/dm/numora.svg)](https://www.npmjs.com/package/numora)

A lightweight, framework-agnostic numeric input library. Zero dependencies, TypeScript-first.

## Install

```bash
npm install numora
# or pnpm add numora / bun add numora
```

## Usage

```typescript
import { NumoraInput } from 'numora';

const target = document.querySelector<HTMLInputElement>('#amount');
if (!target) throw new Error('#amount not found');

const input = new NumoraInput(target, {
  decimalMaxLength: 2,
  decimalMinLength: 2,
  onChange: ({ value, formattedValue }) => console.log(value, formattedValue),
});

input.value = '1234.56';      // canonical raw value: digits, '.' decimal, '-' sign, no grouping
input.value;                  // '1234.56'
input.formattedValue;         // '1,234.56'
input.element;                // the <input>, for any native attribute or listener

input.update({ locale: 'de-DE' });   // change options on the live field: shows '1.234,56'
input.destroy();                     // remove Numora's listeners
```

`target` is either an `<input>` to adopt in place or any other element to mount a new
`<input>` into. `options` is optional: `new NumoraInput(target)` works.

### Without an input

```typescript
import { formatValue, parseValue } from 'numora';

formatValue('1234.5');                                             // '1,234.5'
formatValue('1234.5', { locale: 'de-DE', decimalMinLength: 2 });   // '1.234,50'
parseValue('1.234,50', { locale: 'de-DE' });                       // '1234.50'
```

Both take the same options as the input and return strings. `formatValue` turns a canonical
raw value into what a field shows at rest (grouped, padded to `decimalMinLength`, cut to
`decimalMaxLength` without rounding). `parseValue` is its inverse and reads the configured
format only, with no guessing: under the default options `,` is grouping, so
`parseValue('1,5')` is `'15'`. Anything that is not a number gives `''`. `isAllowed` is ignored.

## Features

- [Sanitization](https://numora.xyz/docs/numora/features/sanitization) - filters invalid characters and mobile keyboard artifacts
- [Formatting](https://numora.xyz/docs/numora/features/formatting) - thousand separators (Thousand/Lakh/Wan), format on blur or change
- [Decimals](https://numora.xyz/docs/numora/features/decimals) - min/max decimal places, custom decimal separator, canonical raw value
- [Compact Notation](https://numora.xyz/docs/numora/features/compact-notation) - expands "1k" → "1000" on paste/setValue (opt-in); a suffix is only expanded when it isn't itself followed by a digit or decimal separator, so typing `k` in the middle of a number (e.g. "1k5") doesn't scale the prefix
- [Scientific Notation](https://numora.xyz/docs/numora/features/scientific-notation) - always expands "1.5e-7" → "0.00000015" automatically
- [Leading Zeros](https://numora.xyz/docs/numora/features/leading-zeros) - configurable leading zero behavior

Pasted text (and text the browser inserts through a plain `input` event) is read with foreign-format detection (ADR 0006): if `.` and `,` both appear the last one is the decimal; a mark repeated more than once is grouping; a single mark equal to the field's decimal separator is the decimal; a single mark followed by exactly three digits (Lakh/Wan group sizes included) is grouping; any other single mark is the decimal. So `"1.234"` pasted into a de-DE field is `1234`, `"1.5"` is `1,5`, and `"1.234,56"` pasted into an en-US field is `1,234.56`. Typed keys are never detected. In a comma-decimal locale the `.` key is a decimal key (ignored when a decimal already exists); in en-US a typed `,` is rejected. A `readOnly` or `disabled` field ignores paste entirely (no write, no `onChange`), matching native `<input>` behavior.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `decimalMaxLength` | `number` | `18` | Maximum decimal places allowed |
| `decimalMinLength` | `number` | `0` | Minimum decimal places (pads with zeros) |
| `decimalSeparator` | `string` | `'.'` | Decimal separator character |
| `thousandSeparator` | `string` | `','` | Thousand separator character (exactly one; use `groupingStyle: 'none'` to turn grouping off) |
| `groupingStyle` | `GroupingStyle` | `GroupingStyle.Thousand` | Grouping style: `Thousand`, `Lakh`, `Wan`, or `None` |
| `formatOn` | `FormatOn` | `FormatOn.Blur` | When to apply formatting: `Blur` or `Change` |
| `allowCompactNotation` | `boolean` | `false` | Expand compact notation on paste/setValue |
| `allowScientificNotation` | `boolean` | `true` | Expand scientific notation; when `false`, typed, pasted or inserted scientific notation is rejected (autofill restores the previous value). App values always expand |
| `allowNegative` | `boolean` | `false` | Allow negative numbers |
| `allowLeadingZeros` | `boolean` | `false` | Allow leading zeros |
| `padLeadingZero` | `boolean` | `false` | Prepend `0` to a bare leading decimal (`.5` → `0.5`) |
| `maxLength` | `number` | `undefined` | Max raw length (digits + decimal separator + leading `-`; thousand separators not counted) |
| `isAllowed` | `(rawValue: string) => boolean` | `undefined` | Reject a keystroke/paste when it returns false (called with the post-sanitization raw value). A callback that throws is treated as "not allowed" (the keystroke is rejected) and the error is reported via `console.error` |
| `locale` | `string \| true` | `undefined` | Derive separators from `Intl.NumberFormat`; `true` uses the runtime default locale |
| `onChange` | `(values: { value: string; formattedValue: string }) => void` | `undefined` | Called when value changes. `value` is the canonical raw value, `formattedValue` the display string |
| `value` | `string` | `undefined` | Initial value, as a canonical raw value. An adopted `<input>` keeps its own value unless this is passed |
| `id`, `name`, `className`, `placeholder`, `disabled`, `readOnly`, `required`, `tabIndex`, `title`, `autofocus`, `ariaLabel` | | | Forwarded to the element. Set anything else on `input.element` |

The `locale` option derives only `Thousand` and `Lakh` grouping; `Wan` is never inferred (set `groupingStyle` explicitly) and the `tok` locale's 2-2-2 grouping is unsupported.

The raw value is canonical for every locale: ASCII digits, `.` as the decimal, a leading `-`, no
grouping (`1.234.567,89` in de-DE is raw `1234567.89`). `onChange` and `input.value` report
it; `input.formattedValue` is the display string. The `value` option, `input.value = ...` and
`setValue()` accept canonical raw values only - never locale text, never format-detected
(`setValue('1.234')` in de-DE is the number 1.234, shown as `1,234`). `setValue(value, {
undoable: false })` writes without an undo step.

`onChange` fires when the raw value changes. A blur or an `update()` that only regroups the
display emits nothing; one that changes the raw value does (trailing separator strip,
`decimalMinLength` padding, `-0` to `0`, digits cut by a smaller `decimalMaxLength`).

Options removed or renamed since v4 are ignored and, in development, logged with their
replacement. See the [migration guide](../../MIGRATION.md).

## Entry points

| Import | Contents |
|--------|----------|
| `numora` | `NumoraInput`, `FormatOn`, `GroupingStyle`, `getSeparatorsFromLocale`, `formatValue`, `parseValue`, types |
| `numora/pipeline` | The individual sanitization steps as pure string functions (`normalizeDigits`, `expandScientificNotation`, `removeThousandSeparators`, ...) for a custom pipeline |
| `numora/internal` | Plumbing shared with `numora-react`. No semver guarantee |

## Documentation

Full docs and live demo at [numora.xyz/docs/numora](https://numora.xyz/docs/numora).

## Framework Adapters

- **React**: [`numora-react`](../react/README.md)

## License

MIT
