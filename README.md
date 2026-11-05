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
# Core (vanilla JS/TypeScript)
npm install numora

# React
npm install numora-react
```

## Quick example

```typescript
import { NumoraInput } from 'numora';

const input = new NumoraInput(document.querySelector('#amount'), {
  decimalMaxLength: 2,
  thousandSeparator: ',',
  onChange: (value) => console.log(value),
});
```

```tsx
import { NumoraInput } from 'numora-react';

<NumoraInput decimalMaxLength={2} thousandSeparator="," onChange={(e) => console.log(e.target.value)} />
```

## Features

- [Sanitization](https://numora.xyz/docs/numora/features/sanitization) - filters invalid characters, mobile keyboard artifacts, and non-numeric input
- [Formatting](https://numora.xyz/docs/numora/features/formatting) - thousand separators with Thousand/Lakh/Wan grouping styles, format on blur or change
- [Decimals](https://numora.xyz/docs/numora/features/decimals) - configurable min/max decimal places, custom decimal separator
- [Compact Notation](https://numora.xyz/docs/numora/features/compact-notation) - expands "1k" → "1000", "1.5m" → "1500000" on paste/setValue; a suffix mid-number (e.g. "1k5") is left alone rather than scaling the prefix
- [Scientific Notation](https://numora.xyz/docs/numora/features/scientific-notation) - automatically expands "1.5e-7" → "0.00000015"
- [Leading Zeros](https://numora.xyz/docs/numora/features/leading-zeros) - configurable leading zero behavior

Pasted text is sanitized under the field's *own* configured separators, not whatever locale it was copied from - the source locale can't be inferred from a bare string. Paste `"1 234,56"` into an en-US-configured input (`,` decimal not expected) and it becomes `123456`; paste `"12,34,567"` and it becomes `1234567`. Integrators who need to accept foreign-formatted clipboard text should pre-parse it themselves - in an `onPaste` handler (React) or before calling `setValue` - rather than relying on Numora to guess the source format.

## Documentation

Full documentation, live demo, and examples at [numora.xyz](https://numora.xyz/).

## License

MIT - [Kacper Szarkiewicz](https://sharqiewicz.com)
