# numora-react

[![npm version](https://img.shields.io/npm/v/numora-react.svg)](https://www.npmjs.com/package/numora-react)
[![npm downloads](https://img.shields.io/npm/dm/numora-react.svg)](https://www.npmjs.com/package/numora-react)

React component wrapper for [numora](../core/README.md) - a precision-first numeric input library.

## Install

```bash
npm install numora-react
# or pnpm add numora-react / yarn add numora-react
```

`numora` is installed with it; there is nothing else to add.

## Usage

```tsx
import { NumoraInput } from 'numora-react';

function App() {
  const [amount, setAmount] = useState('');
  return (
    <NumoraInput
      value={amount}
      decimalMaxLength={2}
      onValueChange={({ value }) => setAmount(value)}
    />
  );
}
```

`onValueChange` receives `{ value, formattedValue }`: the canonical raw value and the display
string. `onChange` is the event form of the same notification, for form libraries.

## Features

- [Sanitization](https://numora.xyz/docs/numora-react/features/sanitization) - filters invalid characters and mobile keyboard artifacts
- [Formatting](https://numora.xyz/docs/numora-react/features/formatting) - thousand separators (Thousand/Lakh/Wan), format on blur or change
- [Decimals](https://numora.xyz/docs/numora-react/features/decimals) - configurable max decimal places and custom decimal separator
- [Compact Notation](https://numora.xyz/docs/numora-react/features/compact-notation) - expands "1k" → "1000" on paste (opt-in); a suffix is only expanded when it isn't itself followed by a digit or decimal separator, so typing `k` mid-number (e.g. "1k5") doesn't scale the prefix
- [Scientific Notation](https://numora.xyz/docs/numora-react/features/scientific-notation) - always expands "1.5e-7" → "0.00000015" automatically
- [Leading Zeros](https://numora.xyz/docs/numora-react/features/leading-zeros) - configurable leading zero behavior
- [React Hook Form](https://numora.xyz/docs/numora-react/integrations/react-hook-form) - seamless integration via the `Controller` pattern
- Ref forwarding, controlled and uncontrolled modes, all standard input props

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `decimalMaxLength` | `number` | `18` | Maximum decimal places allowed (counts digits after the decimal mark only; DeFi-safe default, set to `2` for fiat) |
| `decimalSeparator` | `string` | `'.'` | Decimal separator character |
| `decimalMinLength` | `number` | `0` | Minimum decimal places (pads with zeros) |
| `formatOn` | `'blur' \| 'change'` | `'blur'` | When to apply formatting |
| `thousandSeparator` | `string` | `','` | Thousand separator character |
| `groupingStyle` | `'thousand' \| 'lakh' \| 'wan' \| 'none'` | `'thousand'` | Grouping style; `'none'` turns grouping off |
| `allowCompactNotation` | `boolean` | `false` | Expand compact notation on paste |
| `allowScientificNotation` | `boolean` | `true` | Expand pasted scientific notation; when `false` the paste is rejected. `value` always expands |
| `allowNegative` | `boolean` | `false` | Allow negative numbers |
| `allowLeadingZeros` | `boolean` | `false` | Allow leading zeros |
| `padLeadingZero` | `boolean` | `false` | Prepend `0` to a bare leading decimal (`.5` → `0.5`) |
| `maxLength` | `number` | `undefined` | Max length of the whole raw value (digits + decimal mark + leading `-`; grouping and `decimalMinLength` padding not counted) |
| `isAllowed` | `(rawValue: string) => boolean` | `undefined` | Reject a keystroke/paste when it returns false (called with the post-sanitization raw value). A callback that throws is treated as "not allowed" (the keystroke is rejected) and the error is reported via `console.error` |
| `locale` | `LocaleTag \| true` | `undefined` | Derive separators and grouping from `Intl.NumberFormat`; `true` uses the runtime default locale. An explicit `thousandSeparator`, `decimalSeparator` or `groupingStyle` wins; `locale` fills the ones you did not set |
| `onValueChange` | `(values: { value: string; formattedValue: string }) => void` | `undefined` | Called when the raw value changes |
| `onChange` | `(e: NumoraInputChangeEvent) => void` | `undefined` | Event form, fired alongside `onValueChange`. `e.target.value` is raw; `e.target.formattedValue` is the display string |

All standard `HTMLInputElement` props are supported except `type` (always `'text'`) and `inputMode` (always `'decimal'`). `value` / `defaultValue` are canonical raw values (ASCII digits, `.` decimal, `-` sign, no grouping), never locale text and never format-detected: `<NumoraInput locale="de-DE" value="1234.5" />` (or `value={1234.5}`) displays `"1.234,5"`, and `value="1.234"` is the number 1.234 (`"1,234"`). The controlled echo pattern (`onChange={e => setV(e.target.value)}`) therefore round-trips in every locale. Pasted text is format-detected (a pasted `"1.234,56"` is 1234.56 in any locale); typed keys are not.

In `onChange`, `e.target.value` is always the **raw** (unformatted) numeric string and `e.target.formattedValue` is the formatted display string (e.g. `"1,234.56"`). The raw value is canonical in every locale (de-DE display `1.234.567,89` is raw `1234567.89`), and there is no toggle: it is always available on the event.

On a ref, `ref.current.value` is the **displayed** text (it is the DOM input) and `ref.current.rawValue` is the canonical raw value. Do not feed `ref.current.value` back into the `value` prop.

| Where | Raw value | Display string |
|-------|-----------|----------------|
| `onValueChange(values)` | `values.value` | `values.formattedValue` |
| `onChange(e)` | `e.target.value` | `e.target.formattedValue` |
| ref | `ref.current.rawValue` | `ref.current.formattedValue` (same as `ref.current.value`) |

## Recipes

```tsx
// Fiat amount: two decimals, padded on blur ('5' shows as '5.00')
<NumoraInput decimalMaxLength={2} decimalMinLength={2} />

// Token amount: as many decimals as the token has (USDC 6, ETH 18 is the default)
<NumoraInput decimalMaxLength={6} />

// The user's own locale for separators and grouping
<NumoraInput locale decimalMaxLength={2} />
```

Both callbacks fire when the raw value changes. A blur that only regroups the display emits nothing; one that changes the raw value does (trailing separator strip, `decimalMinLength` padding, `-0` to `0`). Changing a formatting prop on a mounted field (`locale`, `decimalMaxLength`, ...) re-formats the current value and follows the same rule.

`formatValue` and `parseValue` are re-exported from `numora` for formatting outside an input:

```tsx
import { formatValue } from 'numora-react';

formatValue('1234.5', { locale: 'de-DE', decimalMinLength: 2 }); // '1.234,50'
```

Props removed or renamed since v4 are ignored and, in development, logged with their replacement. See the [migration guide](../../MIGRATION.md).

A `readOnly` or `disabled` input ignores paste entirely (no write, no `onChange`), matching native `<input>` behavior.

## Documentation

Full docs and live demo at [numora.xyz/docs/numora-react](https://numora.xyz/docs/numora-react).

## License

MIT
