---
title: Getting Started with Numora
description: Learn how to get started with Numora, a precision-first numeric input library for DeFi and financial applications.
---

Numora is a lightweight, framework-agnostic numeric input library specifically designed for handling currency and decimal inputs in financial and DeFi applications. It provides a robust solution for common challenges in financial input handling while maintaining zero dependencies.

## Key Features

Numora provides a comprehensive set of features for numeric input handling:

- **Zero Dependencies** - No external dependencies, minimal bundle size
- **Framework Agnostic** - Works with any framework or vanilla JavaScript
- **Decimal Precision Control** - Configure minimum and maximum decimal places
- **Thousand Separators** - Customizable thousand separators with multiple grouping styles (Thousand, Lakh, Wan, None)
- **Custom Decimal Separator** - Support for different decimal separators (e.g., `.` or `,`)
- **Format on Blur/Change** - Choose when to apply formatting: on blur (clean editing) or on change (real-time)
- **Compact Notation Expansion** - When enabled, expands compact notation during paste/setValue (e.g., `"1k"` → `"1000"`)
- **Scientific Notation Expansion** - Always automatically expands scientific notation (e.g., `"1.5e-7"` → `"0.00000015"`)
- **Negative Number Support** - Optional support for negative numbers
- **Leading Zeros Support** - Control leading zero behavior
- **Raw Value Mode** - Get unformatted numeric values while displaying formatted values
- **Paste Event Handling** - Intelligent paste handling with automatic sanitization and formatting
- **Cursor Position Preservation** - Smart cursor positioning that works with thousand separators
- **Mobile Keyboard Optimization** - Automatic `inputmode="decimal"` for mobile numeric keyboards
- **Mobile Keyboard Filtering** - Automatically filters non-breaking spaces and Unicode whitespace artifacts
- **Comma/Dot Conversion** - Automatic conversion of commas to dots (or custom decimal separator)
- **Display Formatting Utilities** - Utility functions for formatting numbers for display
- **TypeScript Support** - Full TypeScript definitions included

## Installation

### Core Package (Vanilla JS/TypeScript)

```bash
npm install numora
# or
yarn add numora
# or
pnpm add numora
# or
bun add numora
```

### React Package

```bash
npm install numora-react
# or
yarn add numora-react
# or
pnpm add numora-react
# or
bun add numora-react
```

## Quick Start

### Vanilla JavaScript/TypeScript

```typescript
import { NumoraInput } from 'numora';

// Get the container element where you want to mount the input
const container = document.querySelector('#my-input-container');

// Create a new NumoraInput instance
const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  onChange: (value) => {
    console.log('Value changed:', value);
  },
});
```

### React

```tsx
import { NumericInput } from 'numora-react';

function App() {
  return (
    <NumericInput
      maxDecimals={2}
      onChange={(e) => {
        console.log('Value:', e.target.value);
      }}
    />
  );
}
```

## Basic Example

Here's a simple example that demonstrates Numora's core functionality:

```typescript
import { NumoraInput } from 'numora';

const container = document.querySelector('#amount-input');

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  placeholder: 'Enter amount',
  onChange: (value) => {
    console.log('Current value:', value);
  },
});
```

## Advanced Configuration

Numora supports extensive configuration options:

```typescript
import { NumoraInput, FormatOn, ThousandStyle } from 'numora';

const container = document.querySelector('#advanced-input');

const numoraInput = new NumoraInput(container, {
  // Decimal options
  decimalMaxLength: 18,
  decimalMinLength: 2, // Pads with zeros: "1" becomes "1.00"
  decimalSeparator: '.',
  
  // Thousand separator options
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
  formatOn: FormatOn.Change, // or FormatOn.Blur
  
  // Additional features
  enableCompactNotation: true, // Expands "1k" → "1000" on paste
  enableNegative: false,
  enableLeadingZeros: false,
  rawValueMode: true, // Get unformatted values in onChange
  
  // Event handler
  onChange: (value) => {
    console.log('Raw value:', value);
  },
});
```

## When to Use Numora

Numora is ideal for:

- **Financial applications** requiring precise numeric input
- **DeFi applications** handling cryptocurrency amounts
- **Trading platforms** needing accurate price inputs
- **Payment forms** requiring exact currency amounts
- **Financial calculators** where decimal precision is critical
- **Any project** needing reliable decimal/currency input handling
- **Applications** requiring framework-agnostic input solutions

## Next Steps

- Check out the [Examples](/docs/general/example) page for more detailed usage examples
- Read the [API Reference](/docs/vanilla) for complete documentation
- Explore [Framework Guides](/docs/react) for React, Vue, and Svelte integration
- See the [Swap Example](/docs/general/swap) for a real-world DeFi use case
