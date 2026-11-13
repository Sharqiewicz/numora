# numora

[![npm version](https://img.shields.io/npm/v/numora.svg)](https://www.npmjs.com/package/numora)
[![npm downloads](https://img.shields.io/npm/dm/numora.svg)](https://www.npmjs.com/package/numora)

A numeric input library for any framework or none. It keeps every value as a string and has no runtime dependencies.

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
  onValueChange: ({ value, formattedValue }) => console.log(value, formattedValue),
});

input.setValue('1234.56');    // canonical raw value: digits, '.' decimal, '-' sign, no grouping
input.rawValue;               // '1234.56'
input.formattedValue;         // '1,234.56'
input.element;                // the <input>, for any native attribute or listener

input.update({ locale: 'de-DE' });   // change options on the live field: shows '1.234,56'
input.destroy();                     // remove Numora's listeners
```

`target` is either an `<input>` to adopt in place or any other element to mount a new
`<input>` into. `options` is optional, so `new NumoraInput(target)` works.

### Without an input

```typescript
import { formatValue, parseValue } from 'numora';

formatValue('1234.5');                                             // '1,234.5'
formatValue('1234.5', { locale: 'de-DE', decimalMinLength: 2 });   // '1.234,50'
parseValue('1.234,50', { locale: 'de-DE' });                       // '1234.50'
```

Both take the same options as the input and return strings. `formatValue` turns a canonical
raw value into what a field shows at rest: grouped, padded to `decimalMinLength`, and cut to
`decimalMaxLength` without rounding. `parseValue` is its inverse. It reads the configured
format only and does not guess. Under the default options `,` is grouping, so
`parseValue('1,5')` is `'15'`. Anything that is not a number gives `''`. `isAllowed` is ignored.

## Features

- [Sanitization](https://numeric-input.com/docs/numora/features/sanitization) removes non-numeric characters and mobile keyboard artifacts
- [Formatting](https://numeric-input.com/docs/numora/features/formatting) adds thousand separators in Thousand, Lakh or Wan grouping, on blur or on every keystroke
- [Decimals](https://numeric-input.com/docs/numora/features/decimals) sets the minimum and maximum decimal places and the decimal separator
- [Compact notation](https://numeric-input.com/docs/numora/features/compact-notation) is opt-in and expands "1k" → "1000" when typed, pasted or passed to `setValue`. A suffix followed by a digit or a decimal separator is not expanded, so "1k5" does not scale the prefix
- [Scientific notation](https://numeric-input.com/docs/numora/features/scientific-notation) expands "1.5e-7" → "0.00000015" by default; `allowScientificNotation: false` rejects it
- [Leading zeros](https://numeric-input.com/docs/numora/features/leading-zeros) are stripped by default, and `allowLeadingZeros` keeps them

Numora detects the format of pasted text, and of text the browser inserts through a plain `input` event (ADR 0006). The exception is a focused `formatOn: 'change'` field, which reads inserted text as its own display text. The rules, in order:

1. If `.` and `,` both appear, the last one is the decimal.
2. A mark repeated more than once is grouping.
3. A single mark equal to the field's decimal separator is the decimal.
4. A single mark is grouping when one to three digits with no leading zero come before it and exactly three after it (`1,234`). A Wan field also accepts up to four digits before and exactly four after (`123,4567`). So `0,123` and `1234,567` read as decimals.
5. Any other single mark is the decimal.

So `"1.234"` pasted into a de-DE field is `1234`, `"1.5"` is `1,5`, and `"1.234,56"` pasted into an en-US field is `1,234.56`.

Numora never detects typed keys. The `,` and `.` keys are both decimal keys in every field: either one types the field's decimal separator, and Numora ignores it when a decimal already exists.

A `readOnly` or `disabled` field ignores paste, as a native `<input>` does. Numora writes nothing and calls no `onValueChange`.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `decimalMaxLength` | `number` | `18` | Maximum decimal places allowed (counts digits after the decimal mark only) |
| `decimalMinLength` | `number` | `0` | Minimum decimal places (pads with zeros) |
| `decimalSeparator` | `string` | `'.'` | Decimal separator character |
| `thousandSeparator` | `string` | `','` | Thousand separator character (exactly one; use `groupingStyle: 'none'` to turn grouping off) |
| `groupingStyle` | `'thousand' \| 'lakh' \| 'wan' \| 'none'` | `'thousand'` | Grouping style |
| `formatOn` | `'change' \| 'blur'` | `'change'` | When grouping is applied: on every keystroke, or on blur |
| `allowCompactNotation` | `boolean` | `false` | Expand compact notation ("1k" → "1000") when typed, pasted or passed to `setValue` |
| `allowScientificNotation` | `boolean` | `true` | Expand scientific notation; when `false`, typed, pasted or inserted scientific notation is rejected (autofill restores the previous value). App values (`defaultValue`, `setValue`) always expand. Typed text never expands: a typed `e` is not accepted, only pasted or inserted text is. |
| `allowNegative` | `boolean` | `false` | Allow negative numbers |
| `allowLeadingZeros` | `boolean` | `false` | Allow leading zeros |
| `padLeadingZero` | `boolean` | `false` | Prepend `0` to a bare leading decimal (`.5` → `0.5`) |
| `maxLength` | `number` | `undefined` | Max length of the whole raw value (digits + decimal mark + leading `-`; grouping and `decimalMinLength` padding not counted) |
| `isAllowed` | `(rawValue: string) => boolean` | `undefined` | Reject an edit the user makes (typing, paste, drop, autofill) when it returns false (called with the post-sanitization raw value). A callback that throws is treated as "not allowed" (the keystroke is rejected) and the error is reported via `console.error` |
| `locale` | `LocaleTag \| boolean` | `undefined` | Derive separators and grouping from `Intl.NumberFormat`; `true` uses the runtime default locale and `false` is the same as leaving it out. An explicit `thousandSeparator`, `decimalSeparator` or `groupingStyle` wins; `locale` fills the ones you did not set |
| `onValueChange` | `(values: { value: string; formattedValue: string }) => void` | `undefined` | Called when value changes. `value` is the canonical raw value, `formattedValue` the display string |
| `onFormattedValueChange` | `(formattedValue: string) => void` | `undefined` | Called with the display string every time Numora rewrites the field, including the blur regroup, the focus strip, `setValue()` and a format-only `update()`. Not called on creation |
| `defaultValue` | `string` | `undefined` | Initial value, as a canonical raw value (the same name as the React prop). An adopted `<input>` keeps its own value unless this is passed. Write later with `setValue()` |
| `id`, `name`, `className`, `placeholder`, `disabled`, `readOnly`, `required`, `tabIndex`, `title`, `autofocus`, `ariaLabel` | | | Forwarded to the element. Set anything else on `input.element` |

The `locale` option derives only `Thousand` and `Lakh` grouping. It never infers `Wan`, so set `groupingStyle` explicitly. Numora does not support the `tok` locale's 2-2-2 grouping.

The raw value is canonical for every locale: ASCII digits, `.` as the decimal, a leading `-`, no
grouping. In de-DE, `1.234.567,89` is raw `1234567.89`. `onValueChange` and `input.rawValue` report
the raw value. `input.formattedValue` is the display string, the same text as `input.element.value`.

The `defaultValue` option and `setValue()` accept canonical raw values only. Numora never reads them as
locale text and never format-detects them, so `setValue('1.234')` in de-DE is the number 1.234,
shown as `1,234`. Both are typed `string`. Numora converts a `number` with `String()` and logs it
in development, because it may already have lost precision.

`setValue()` is your own write, so it does not call `onValueChange` and is not checked by
`isAllowed`. Both exist for edits the user makes. The new text still reaches
`onFormattedValueChange`. On a focused `formatOn: 'blur'` field it writes
the ungrouped editing text, and grouping is applied on blur as usual.

Invalid options throw, from the constructor and from `update()`: for example a separator longer
than one character or `decimalMinLength` above `decimalMaxLength`. Numora does not fall back to
defaults, because a money field with the wrong format is worse than an error.

Numora sets no `pattern` attribute and leaves alone one you set yourself.

`onValueChange` fires when the raw value changes. A blur or an `update()` that only regroups the
display emits nothing. One that changes the raw value does: a trailing separator strip,
`decimalMinLength` padding, `-0` to `0`, or digits cut by a smaller `decimalMaxLength`.

`onFormattedValueChange` fires when the text in the field changes, whatever the cause. Use it
to mirror the field, for example in an animated overlay:

```ts
const input = new NumoraInput(host, {
  defaultValue: '1234567',
  onFormattedValueChange: (text) => morph.update(text),
});
morph.update(input.formattedValue); // creation calls no callback
```

It also fires for the rewrites `onValueChange` leaves out: the blur regroup, the focus strip,
`setValue()` and a new locale. The same text is never reported twice in a row.

Options removed or renamed since v4 are ignored and, in development, logged with their
replacement. See the [migration guide](../../MIGRATION.md).

## Recipes

```typescript
// Fiat amount: two decimals, padded on blur ('5' shows as '5.00')
new NumoraInput(target, { decimalMaxLength: 2, decimalMinLength: 2 });

// Token amount: as many decimals as the token has (USDC 6, ETH 18 is the default)
new NumoraInput(target, { decimalMaxLength: 6 });

// The user's own locale for separators and grouping
new NumoraInput(target, { locale: true, decimalMaxLength: 2 });
```

In a framework wrapper (Svelte action, Vue directive), take the number from `onValueChange`
or `input.rawValue`. Binding to the element itself (`bind:value`, `v-model`, a native form
submit) reads the display text, grouping included.

## Entry points

| Import | Contents |
|--------|----------|
| `numora` | `NumoraInput`, `FormatOn`, `GroupingStyle`, `getSeparatorsFromLocale`, `formatValue`, `parseValue`, types |
| `numora/pipeline` | The individual sanitization steps as pure string functions (`normalizeDigits`, `expandScientificNotation`, `removeThousandSeparators`, ...) for a custom pipeline. No semver guarantee: a step can change or go in a minor release. Use `parseValue` when you only need the result |
| `numora/internal` | Plumbing shared with `numora-react`. No semver guarantee |

## Documentation

Full docs and live demo at [numeric-input.com/docs/numora](https://numeric-input.com/docs/numora).

## Framework adapters

- React: [`numora-react`](../react/README.md)

## License

MIT
