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
  onChange: (value) => console.log(value),
});

// Get / set value
input.value = '1234.56';
console.log(input.valueAsNumber); // 1234.56
```

## Features

- [Sanitization](https://numora.xyz/docs/numora/features/sanitization) - filters invalid characters and mobile keyboard artifacts
- [Formatting](https://numora.xyz/docs/numora/features/formatting) - thousand separators (Thousand/Lakh/Wan), format on blur or change
- [Decimals](https://numora.xyz/docs/numora/features/decimals) - min/max decimal places, custom decimal separator, raw value mode
- [Compact Notation](https://numora.xyz/docs/numora/features/compact-notation) - expands "1k" → "1000" on paste/setValue (opt-in); a suffix is only expanded when it isn't itself followed by a digit or decimal separator, so typing `k` in the middle of a number (e.g. "1k5") doesn't scale the prefix
- [Scientific Notation](https://numora.xyz/docs/numora/features/scientific-notation) - always expands "1.5e-7" → "0.00000015" automatically
- [Leading Zeros](https://numora.xyz/docs/numora/features/leading-zeros) - configurable leading zero behavior

Paste is sanitized under the field's own configured separators, not the clipboard text's source locale, which can't be inferred from a bare string: pasting `"1 234,56"` into an en-US-configured field yields `123456`, and pasting `"12,34,567"` yields `1234567`. A `readOnly` or `disabled` field ignores paste entirely (no write, no `onChange`), matching native `<input>` behavior. Integrators accepting foreign-formatted clipboard text should pre-parse it before calling `setValue`.

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
| `enableNegative` | `boolean` | `false` | Allow negative numbers |
| `enableLeadingZeros` | `boolean` | `false` | Allow leading zeros |
| `autoAddLeadingZero` | `boolean` | `false` | Prepend `0` to a bare leading decimal (`.5` → `0.5`) |
| `maxLength` | `number` | `undefined` | Max raw length (digits + decimal separator + leading `-`; thousand separators not counted) |
| `isAllowed` | `(rawValue: string) => boolean` | `undefined` | Reject a keystroke/paste when it returns false (called with the post-sanitization raw value). A callback that throws is treated as "not allowed" (the keystroke is rejected) and the error is reported via `console.error` |
| `locale` | `string \| true` | `undefined` | Derive separators from `Intl.NumberFormat`; `true` uses the runtime default locale |
| `emitRawValue` | `boolean` | `false` | Return unformatted (raw) values in `onChange` |
| `onChange` | `(value: string) => void` | `undefined` | Called when value changes |
| `value` | `string` | `undefined` | Initial value (controlled) |
| `defaultValue` | `string` | `undefined` | Initial value (uncontrolled) |

`value` / `defaultValue` / `setValue` are strings in the field's **display** format (locale
separators allowed, grouping optional) - e.g. under `locale: 'de-DE'`, `setValue('1.234,5')`.
`valueAsNumber` is the escape hatch for a plain JS number: the setter converts it to the
configured decimal separator (`valueAsNumber = 1234.5` under `locale: 'de-DE'` displays
`"1.234,5"`, not `"12.345"`) and throws `RangeError` if the value is negative while
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
