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
      maxDecimals={2}
      thousandSeparator=","
      thousandStyle="thousand"
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
| `maxDecimals` | `number` | `2` | Maximum decimal places allowed |
| `formatOn` | `'blur' \| 'change'` | `'blur'` | When to apply formatting |
| `thousandSeparator` | `string` | `','` | Thousand separator character |
| `thousandStyle` | `'thousand' \| 'lakh' \| 'wan'` | `'thousand'` | Grouping style |
| `enableCompactNotation` | `boolean` | `false` | Expand compact notation on paste |
| `onChange` | `(e: ChangeEvent<HTMLInputElement>) => void` | `undefined` | Called when value changes |

All standard `HTMLInputElement` props are supported except `type` (always `'text'`) and `inputMode` (always `'decimal'`).

Both `e.target.value` (formatted) and `e.target.rawValue` (unformatted) are available in `onChange`.

## Documentation

Full docs and live demo at [numora.xyz/docs/numora-react](https://numora.xyz/docs/numora-react).

## License

MIT
