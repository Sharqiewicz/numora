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
import { NumoraInput, FormatOn, ThousandStyle } from 'numora';

const input = new NumoraInput(document.querySelector('#amount'), {
  decimalMaxLength: 2,
  decimalMinLength: 2,
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
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
- [Compact Notation](https://numora.xyz/docs/numora/features/compact-notation) - expands "1k" → "1000" on paste/setValue (opt-in)
- [Scientific Notation](https://numora.xyz/docs/numora/features/scientific-notation) - always expands "1.5e-7" → "0.00000015" automatically
- [Leading Zeros](https://numora.xyz/docs/numora/features/leading-zeros) - configurable leading zero behavior

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `decimalMaxLength` | `number` | `2` | Maximum decimal places allowed |
| `decimalMinLength` | `number` | `0` | Minimum decimal places (pads with zeros) |
| `decimalSeparator` | `string` | `'.'` | Decimal separator character |
| `thousandSeparator` | `string` | `','` | Thousand separator character |
| `thousandStyle` | `ThousandStyle` | `ThousandStyle.None` | Grouping style: `Thousand`, `Lakh`, `Wan`, or `None` |
| `formatOn` | `FormatOn` | `FormatOn.Blur` | When to apply formatting: `Blur` or `Change` |
| `enableCompactNotation` | `boolean` | `false` | Expand compact notation on paste/setValue |
| `enableNegative` | `boolean` | `false` | Allow negative numbers |
| `enableLeadingZeros` | `boolean` | `false` | Allow leading zeros |
| `rawValueMode` | `boolean` | `false` | Return unformatted values in `onChange` |
| `onChange` | `(value: string) => void` | `undefined` | Called when value changes |
| `value` | `string` | `undefined` | Initial value (controlled) |
| `defaultValue` | `string` | `undefined` | Initial value (uncontrolled) |

All standard `HTMLInputElement` properties are also supported (`placeholder`, `className`, `disabled`, etc.).

## Documentation

Full docs and live demo at [numora.xyz/docs/numora](https://numora.xyz/docs/numora).

## Framework Adapters

- **React**: [`numora-react`](../react/README.md)

## License

MIT
