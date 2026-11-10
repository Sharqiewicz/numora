# numora

[![npm version](https://img.shields.io/npm/v/numora.svg)](https://www.npmjs.com/package/numora)
[![npm downloads](https://img.shields.io/npm/dm/numora.svg)](https://www.npmjs.com/package/numora)

A precision-first numeric input library for any web application. Zero dependencies, TypeScript-first, framework agnostic.

## Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`numora`](./packages/core) | [![npm version](https://img.shields.io/npm/v/numora.svg)](https://www.npmjs.com/package/numora) | Core - vanilla JS/TypeScript |
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
    onChange: ({ value, formattedValue }) => console.log(value, formattedValue),
  });
  input.value; // canonical raw value, e.g. '1234.5'
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

- [Sanitization](https://numora.xyz/docs/numora/features/sanitization) - filters invalid characters, mobile keyboard artifacts, and non-numeric input
- [Formatting](https://numora.xyz/docs/numora/features/formatting) - thousand separators with Thousand/Lakh/Wan grouping styles, format on blur or change
- [Decimals](https://numora.xyz/docs/numora/features/decimals) - configurable min/max decimal places, custom decimal separator
- [Compact Notation](https://numora.xyz/docs/numora/features/compact-notation) - expands "1k" → "1000", "1.5m" → "1500000" on paste/setValue; a suffix mid-number (e.g. "1k5") is left alone rather than scaling the prefix
- [Scientific Notation](https://numora.xyz/docs/numora/features/scientific-notation) - automatically expands "1.5e-7" → "0.00000015"
- [Leading Zeros](https://numora.xyz/docs/numora/features/leading-zeros) - configurable leading zero behavior

Pasted text is read with foreign-format detection: if `.` and `,` both appear, the last one is the decimal; a mark that forms groups of three digits is grouping; any other single mark is the decimal. So `"1.234,56"` pasted into an en-US field is `1,234.56`. Typed keys and values the app passes in are never detected.

## Documentation

Full documentation, live demo, and examples at [numora.xyz](https://numora.xyz/).

## License

MIT - [Kacper Szarkiewicz](https://sharqiewicz.com)
