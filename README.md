# numora

[![npm version](https://img.shields.io/npm/v/numora.svg)](https://www.npmjs.com/package/numora)
[![npm downloads](https://img.shields.io/npm/dm/numora.svg)](https://www.npmjs.com/package/numora)

A numeric input library for the web. It keeps every value as a string, so an amount never passes through floating point. It has no runtime dependencies and works with any framework or none.

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`numora`](./packages/core) | [![npm version](https://img.shields.io/npm/v/numora.svg)](https://www.npmjs.com/package/numora) | Core, vanilla JS/TypeScript |
| [`numora-react`](./packages/react) | [![npm version](https://img.shields.io/npm/v/numora-react.svg)](https://www.npmjs.com/package/numora-react) | React component wrapper |

## Install

```bash
# Vanilla JS/TypeScript
npm install numora

# React (includes numora)
npm install numora-react
```

## Quick example

```typescript
import { NumoraInput } from 'numora';

const target = document.querySelector<HTMLInputElement>('#amount');
if (target) {
  const input = new NumoraInput(target, {
    decimalMaxLength: 2,
    onValueChange: ({ value, formattedValue }) => console.log(value, formattedValue),
  });
  input.rawValue; // canonical raw value, e.g. '1234.5'
}
```

```tsx
import { NumoraInput } from 'numora-react';

<NumoraInput decimalMaxLength={2} onValueChange={({ value }) => console.log(value)} />
```

Format or parse without an input:

```typescript
import { formatValue, parseValue } from 'numora';

formatValue('1234.5', { locale: 'de-DE', decimalMinLength: 2 }); // '1.234,50'
parseValue('1.234,50', { locale: 'de-DE' });                      // '1234.50'
```

Coming from v4? See [MIGRATION.md](./MIGRATION.md).

## Features

- [Sanitization](https://numeric-input.com/docs/numora/features/sanitization) removes non-numeric characters and mobile keyboard artifacts
- [Formatting](https://numeric-input.com/docs/numora/features/formatting) adds thousand separators in Thousand, Lakh or Wan grouping, on blur or on every keystroke
- [Decimals](https://numeric-input.com/docs/numora/features/decimals) sets the minimum and maximum decimal places and the decimal separator
- [Compact notation](https://numeric-input.com/docs/numora/features/compact-notation) is opt-in (`allowCompactNotation`) and expands "1k" → "1000" and "1.5m" → "1500000" when typed, pasted or passed to `setValue`. A suffix in the middle of a number, such as "1k5", does not scale the prefix
- [Scientific notation](https://numeric-input.com/docs/numora/features/scientific-notation) expands "1.5e-7" → "0.00000015"
- [Leading zeros](https://numeric-input.com/docs/numora/features/leading-zeros) are stripped by default, and `allowLeadingZeros` keeps them

Numora detects the format of pasted text. If `.` and `,` both appear, the last one is the decimal. A mark that repeats is grouping. A single mark is the decimal when it is the field's own decimal separator. Otherwise it is grouping when the digits around it form valid groups (`1,234`, but not `0,123` or `1234,567`), and the decimal when it does not. So `"1.234,56"` pasted into an en-US field is `1,234.56`. Numora never runs this detection on typed keys or on values the app passes in. Dropped and autofilled text is detected the same way, except in a focused field that formats on change (the default), which reads it as its own display text.

## Documentation

The full documentation and a live demo are at [numeric-input.com](https://numeric-input.com/).

## License

MIT - [Kacper Szarkiewicz](https://sharqiewicz.com)
