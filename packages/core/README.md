# numora/core

A lightweight, framework-agnostic numeric input library for handling currency and decimal inputs in **financial/DeFi** applications. Built with TypeScript with **zero-dependencies**.

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
npm install numora/core
# or
yarn add numora/core
# or
pnpm add numora/core
```

## Usage

```typescript
import { NumericInput } from 'numora/core';

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

- React: `@numora/react`
- Vue: `@numora/vue`
- Svelte: `@numora/svelte`

## License

MIT
