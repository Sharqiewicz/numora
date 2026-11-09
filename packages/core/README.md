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
import { NumoraInput, FormatOn, GroupingStyle } from 'numora';

const input = new NumoraInput(document.querySelector('#amount'), {
  decimalMaxLength: 2,
  decimalMinLength: 2,
  thousandSeparator: ',',
  groupingStyle: GroupingStyle.Thousand,
  formatOn: FormatOn.Blur,
  onChange: ({ value, formattedValue }) => console.log(value, formattedValue),
});

// Get / set value (always the canonical raw value: digits, '.' decimal, '-' sign, no grouping)
input.setValue('1234.56');
console.log(input.getValue()); // '1234.56'
console.log(input.getFormattedValue()); // '1,234.56'
console.log(input.valueAsNumber); // 1234.56
```

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
| `thousandSeparator` | `string` | `','` | Thousand separator character |
| `groupingStyle` | `GroupingStyle` | `GroupingStyle.Thousand` | Grouping style: `Thousand`, `Lakh`, `Wan`, or `None` |
| `formatOn` | `FormatOn` | `FormatOn.Blur` | When to apply formatting: `Blur` or `Change` |
| `enableCompactNotation` | `boolean` | `false` | Expand compact notation on paste/setValue |
| `enableScientificNotation` | `boolean` | `true` | Expand pasted scientific notation; when `false` the paste is rejected. App values always expand |
| `enableNegative` | `boolean` | `false` | Allow negative numbers |
| `enableLeadingZeros` | `boolean` | `false` | Allow leading zeros |
| `autoAddLeadingZero` | `boolean` | `false` | Prepend `0` to a bare leading decimal (`.5` → `0.5`) |
| `maxLength` | `number` | `undefined` | Max raw length (digits + decimal separator + leading `-`; thousand separators not counted) |
| `isAllowed` | `(rawValue: string) => boolean` | `undefined` | Reject a keystroke/paste when it returns false (called with the post-sanitization raw value). A callback that throws is treated as "not allowed" (the keystroke is rejected) and the error is reported via `console.error` |
| `locale` | `string \| true` | `undefined` | Derive separators from `Intl.NumberFormat`; `true` uses the runtime default locale |
| `onChange` | `(values: { value: string; formattedValue: string }) => void` | `undefined` | Called when value changes. `value` is the canonical raw value, `formattedValue` the display string |
| `value` | `string` | `undefined` | Initial value (controlled) |
| `defaultValue` | `string` | `undefined` | Initial value (uncontrolled) |

The `locale` option derives only `Thousand` and `Lakh` grouping; `Wan` is never inferred (set `groupingStyle` explicitly) and the `tok` locale's 2-2-2 grouping is unsupported.

The raw value is canonical for every locale: ASCII digits, `.` as the decimal, a leading `-`, no
grouping (`1.234.567,89` in de-DE is raw `1234567.89`). `onChange`, `getValue()` and `value`
all emit it; `getFormattedValue()` returns the display string. `value` / `defaultValue` /
`setValue` accept canonical raw values only - never locale text, never format-detected
(`setValue('1.234')` in de-DE is the number 1.234, shown as `1,234`).
`valueAsNumber` is `Number(raw)` (`NaN` for an empty field); its setter writes the number
canonically (`valueAsNumber = 1234.5` under `locale: 'de-DE'` displays `"1.234,5"`) and throws `RangeError` if the value is negative while
`enableNegative` is `false`, or if the value is non-finite (`Infinity`, `-Infinity`, `NaN`).

A value that sanitizes to an all-zero negative (e.g. typing `-0` or `-0.00`) is normalized
to `0` on blur. The same normalization is exported standalone as `normalizeNegativeZero(value,
decimalSeparator)` for callers who need it outside a live `NumoraInput`.

All standard `HTMLInputElement` properties are also supported (`placeholder`, `className`, `disabled`, etc.).

## Documentation

Full docs and live demo at [numora.xyz/docs/numora](https://numora.xyz/docs/numora).

## Framework Adapters

- **React**: [`numora-react`](../react/README.md)

## License

MIT
