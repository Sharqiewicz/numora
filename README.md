# numora

[![npm version](https://img.shields.io/npm/v/numora.svg)](https://www.npmjs.com/package/numora)

A lightweight, framework-agnostic numeric input library for handling currency and decimal inputs in **financial/DeFi** applications. Built with TypeScript and designed for modern web applications with:

- **Zero dependencies** - minimal footprint for your bundle
- **Type safety** - fully typed API for better developer experience
- **Framework agnostic** - use with any framework or vanilla JavaScript
- **Customizable** - extensive options to fit your specific needs

## Features

- Validates and sanitizes numeric input
- Limits decimal places
- Handles paste events
- Converts commas to dots
- Prevents multiple decimal points
- Customizable with various options
- Framework-agnostic core with adapters for popular frameworks

## Installation

```bash
npm install numora
# or
yarn add numora
# or
pnpm add numora
```

## Usage

```typescript
import { NumericInput } from 'numora';

// Get the container element where you want to mount the input
const container = document.querySelector('#my-input-container');

// Create a new NumericInput instance
const numericInput = new NumericInput(container, {
  maxDecimals: 2,
  onChange: (value) => {
    console.log('Value changed:', value);
    // Do something with the value
  },
  // ... all other input properties you want
});
```

## Options

The NumericInput constructor accepts the following options:
| Option | Type | Default | Description |
| --------------- | -------- | --------- | -------------------------------------------------------- |
| maxDecimals | number | 2 | Maximum number of decimal places allowed |
| onChange | function | undefined | Callback function that runs when the input value changes |
| supports all input properties | - | - | - |

## Framework Adapters

Numora is also available for popular frameworks:

- React: `numora-react` (in progress)
- Vue: `numora-vue` (in progress)
- Svelte: `numora`

## License

MIT
