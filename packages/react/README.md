# numora-react

[![npm version](https://img.shields.io/npm/v/numora-react.svg)](https://www.npmjs.com/package/numora-react)
[![npm downloads](https://img.shields.io/npm/dm/numora-react.svg)](https://www.npmjs.com/package/numora-react)

React component wrapper for [numora](../core/README.md) - a precision-first numeric input library.

## Install

```bash
npm install numora-react
# or pnpm add numora-react / yarn add numora-react
```

## Usage

```tsx
import { NumoraInput } from 'numora-react';

function App() {
  return (
    <NumoraInput
      decimalMaxLength={2}
      thousandSeparator=","
      groupingStyle="thousand"
      onChange={(e) => console.log(e.target.value)}
    />
  );
}
```

## Features

- [Sanitization](https://numora.xyz/docs/numora-react/features/sanitization) - filters invalid characters and mobile keyboard artifacts
- [Formatting](https://numora.xyz/docs/numora-react/features/formatting) - thousand separators (Thousand/Lakh/Wan), format on blur or change
- [Decimals](https://numora.xyz/docs/numora-react/features/decimals) - configurable max decimal places and custom decimal separator
- [Compact Notation](https://numora.xyz/docs/numora-react/features/compact-notation) - expands "1k" → "1000" on paste (opt-in)
- [Scientific Notation](https://numora.xyz/docs/numora-react/features/scientific-notation) - always expands "1.5e-7" → "0.00000015" automatically
- [Leading Zeros](https://numora.xyz/docs/numora-react/features/leading-zeros) - configurable leading zero behavior
- [React Hook Form](https://numora.xyz/docs/numora-react/integrations/react-hook-form) - seamless integration via the `Controller` pattern
- Ref forwarding, controlled and uncontrolled modes, all standard input props

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `decimalMaxLength` | `number` | `18` | Maximum decimal places allowed (DeFi-safe default; set to `2` for fiat) |
| `decimalSeparator` | `string` | `'.'` | Decimal separator character |
| `decimalMinLength` | `number` | `0` | Minimum decimal places (pads with zeros) |
| `formatOn` | `'blur' \| 'change'` | `'blur'` | When to apply formatting |
| `thousandSeparator` | `string` | `','` | Thousand separator character |
| `groupingStyle` | `'thousand' \| 'lakh' \| 'wan'` | `'thousand'` | Grouping style |
| `enableCompactNotation` | `boolean` | `false` | Expand compact notation on paste |
| `enableNegative` | `boolean` | `false` | Allow negative numbers |
| `enableLeadingZeros` | `boolean` | `false` | Allow leading zeros |
| `autoAddLeadingZero` | `boolean` | `false` | Prepend `0` to a bare leading decimal (`.5` → `0.5`) |
| `maxLength` | `number` | `undefined` | Max raw length (digits + decimal separator + leading `-`; thousand separators not counted) |
| `isAllowed` | `(rawValue: string) => boolean` | `undefined` | Reject a keystroke/paste when it returns false (called with the post-sanitization raw value) |
| `locale` | `LocaleTag \| true` | `undefined` | Derive separators from `Intl.NumberFormat`; `true` uses the runtime default locale |
| `onChange` | `(e: NumoraInputChangeEvent) => void` | `undefined` | Synthetic change event. `e.target.value` is raw; `e.target.formattedValue` is the display string |
| `onValueChange` | `(values: { value: string; formattedValue: string }) => void` | `undefined` | Plain-object value callback, fired alongside `onChange` |

All standard `HTMLInputElement` props are supported except `type` (always `'text'`) and `inputMode` (always `'decimal'`).

In `onChange`, `e.target.value` is always the **raw** (unformatted) numeric string and `e.target.formattedValue` is the formatted display string (e.g. `"1,234.56"`). There is no `rawValueMode` toggle: the raw value is always available on the event.

> **Note:** `e.target.value` (raw) is the inverse of reading the DOM node directly — `inputRef.current.value` returns the **formatted** string that's rendered. Use the `onChange` event or `onValueChange` for the raw value; read the ref only when you want the displayed text.

## Documentation

Full docs and live demo at [numora.xyz/docs/numora-react](https://numora.xyz/docs/numora-react).

## License

MIT
