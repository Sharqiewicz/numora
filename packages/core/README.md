# numora

[![npm version](https://img.shields.io/npm/v/numora.svg)](https://www.npmjs.com/package/numora)
[![npm downloads](https://img.shields.io/npm/dm/numora.svg)](https://www.npmjs.com/package/numora)

A lightweight, framework-agnostic numeric input library for handling currency and decimal inputs in **financial/DeFi** applications. Built with TypeScript and designed for modern web applications with:

- **Zero dependencies** - minimal footprint for your bundle
- **Type safety** - fully typed API for better developer experience
- **Framework agnostic** - use with any framework or vanilla JavaScript
- **Customizable** - extensive options to fit your specific needs

## Demo

Check out the [live demo](https://numora.xyz/) to see Numora in action.

## Features

| Feature | Description |
|---------|-------------|
| **⭐️ Zero Dependencies** | No external dependencies, minimal bundle size |
| **⭐️ Framework Agnostic** | Works with any framework or vanilla JavaScript |
| **Decimal Precision Control** | Configure minimum and maximum decimal places (`decimalMinLength`, `decimalMaxLength`) |
| **Minimum Decimal Places** | Automatically pad values with zeros to ensure minimum decimal places (e.g., `"1"` with `decimalMinLength: 2` becomes `"1.00"`) |
| **Thousand Separators** | Customizable thousand separators with multiple grouping styles (`Thousand`, `Lakh`, `Wan`, `None`) |
| **Custom Decimal Separator** | Support for different decimal separators (e.g., `.` or `,`) |
| **Format on Blur/Change** | Choose when to apply formatting: `on blur (clean editing)` or `on change (real-time)` |
| **Compact Notation Expansion** | When enabled, expands compact notation during paste/setValue (e.g., `"1k"` → `"1000"`, `"1.5m"` → `"1500000"`, `"2B"` → `"2000000000"`) |
| **Scientific Notation Expansion** | Always automatically expands scientific notation (e.g., `"1.5e-7"` → `"0.00000015"`, `"2e+5"` → `"200000"`) |
| **Negative Number Support** | Optional support for negative numbers with `enableNegative` |
| **Leading Zeros Support** | Control leading zero behavior with `enableLeadingZeros` |
| **Raw Value Mode** | Get unformatted numeric values while displaying formatted values |
| **Paste Event Handling** | Intelligent paste handling with automatic sanitization, formatting, and cursor positioning |
| **Cursor Position Preservation** | Smart cursor positioning that works with thousand separators, even during formatting |
| **Thousand Separator Skipping** | On delete/backspace, cursor automatically skips over thousand separators for better UX |
| **Mobile Keyboard Optimization** | Automatic `inputmode="decimal"` for mobile numeric keyboards |
| **Mobile Keyboard Filtering** | Automatically filters non-breaking spaces and Unicode whitespace artifacts from mobile keyboards |
| **Non-numeric Character Filtering** | Automatic removal of invalid characters |
| **Comma/Dot Conversion** | When `thousandStyle` is `None`, typing comma or dot automatically converts to the configured `decimalSeparator` |
| **Character Equivalence** | Automatic conversion of commas to dots (or custom decimal separator) for easier input |
| **Sanitization** | Comprehensive input sanitization for security and data integrity |
| **TypeScript Support** | Full TypeScript definitions included |

## 📊 Comparison

| Feature | Numora | react-number-format | Native Number Input |
|---------|--------|---------------------|---------------------|
| **Framework Support** | ✅ All frameworks | ❌ React only | ✅ All frameworks |
| **Dependencies** | ✅ Zero | ⚠️ React required | ✅ Zero |
| **Raw Value Mode** | ✅ Yes | ⚠️ Limited | ❌ No |
| **Comma/Dot Conversion** | ✅ Yes | ⚠️ Limited | ❌ No |
| **Scientific Notation** | ✅ Auto-expand | ❌ No | ❌ No |
| **Display Formatting Utils** | ❌ No | ❌ No | ❌ No |
| **Compact Notation** | ✅ Auto-expand | ❌ No | ❌ No |
| **Mobile Support** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **Decimal Precision Control** | ✅ Yes | ✅ Yes | ❌ Limited |
| **Thousand Separators** | ✅ Customizable | ✅ Yes | ❌ No |
| **Custom Decimal Separator** | ✅ Yes | ✅ Yes | ❌ No (always `.`) |
| **Formatting Options** | ✅ Blur/Change modes | ✅ Multiple modes | ❌ No |
| **Cursor Preservation** | ✅ Advanced | ✅ Basic | ❌ N/A |
| **TypeScript Support** | ✅ Yes | ✅ Yes | ⚠️ Partial |
| **Paste Handling** | ✅ Intelligent | ✅ Yes | ⚠️ Basic |
| **Grouping Styles** | ✅ Thousand/Lakh/Wan | ✅ Thousand/Lakh/Wan | ❌ No |
| **Leading Zeros Control** | ✅ Yes | ✅ Yes | ❌ No |

## Installation

```bash
npm install numora
# or
bun add numora
# or
pnpm add numora
```

## Usage

### Basic Example

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

### Advanced Example

```typescript
import { NumoraInput, FormatOn, ThousandStyle } from 'numora';

const container = document.querySelector('#my-input-container');

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
  enableCompactNotation: true, // Expands "1k" → "1000" on paste/setValue
  enableNegative: false,
  enableLeadingZeros: false,
  rawValueMode: true, // Get unformatted values in onChange

  // Standard input properties
  placeholder: 'Enter amount',
  className: 'numora-input',

  // Event handler
  onChange: (value) => {
    console.log('Raw value:', value); // Unformatted if rawValueMode is true
    console.log('Display value:', numoraInput.value); // Formatted display value
    console.log('As number:', numoraInput.valueAsNumber); // Parsed as number
  },
});
```

### Compact Notation Example

```typescript
import { NumoraInput } from 'numora';

const container = document.querySelector('#my-input-container');

const numoraInput = new NumoraInput(container, {
  enableCompactNotation: true,
  onChange: (value) => {
    console.log('Value:', value);
  },
});

// When user pastes "1.5k" or you call setValue("1.5k")
// It automatically expands to "1500"
numoraInput.setValue('1.5k'); // Display: "1,500" (if thousand separator enabled)
```

### Scientific Notation Example

```typescript
import { NumoraInput } from 'numora';

const container = document.querySelector('#my-input-container');

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 18,
  onChange: (value) => {
    console.log('Value:', value);
  },
});

// Scientific notation is ALWAYS automatically expanded
// User can paste "1.5e-7" and it becomes "0.00000015"
// User can paste "2e+5" and it becomes "200000"
```

### Comma/Dot Conversion Example

```typescript
import { NumoraInput, ThousandStyle } from 'numora';

const container = document.querySelector('#my-input-container');

const numoraInput = new NumoraInput(container, {
  decimalSeparator: ',', // European format
  thousandStyle: ThousandStyle.None, // Required for comma/dot conversion
  decimalMaxLength: 2,
});

// When thousandStyle is None:
// - User types "." → automatically converted to ","
// - User types "," → automatically converted to ","
// This makes it easier for users without knowing the exact separator
```

### Programmatic Value Control

```typescript
// Get the current value
const currentValue = numoraInput.getValue();
// or
const currentValue = numoraInput.value;

// Set a new value
numoraInput.setValue('1234.56');
// or
numoraInput.value = '1234.56';

// Set from a number
numoraInput.valueAsNumber = 1234.56;

// Get as a number
const numericValue = numoraInput.valueAsNumber;

// Enable/disable the input
numoraInput.disable();
numoraInput.enable();

// Access the underlying HTMLInputElement
const inputElement = numoraInput.getElement();
inputElement.addEventListener('focus', () => {
  console.log('Input focused');
});
```

## Options

The NumoraInput constructor accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `decimalMaxLength` | `number` | `2` | Maximum number of decimal places allowed |
| `decimalMinLength` | `number` | `0` | Minimum number of decimal places (pads with zeros) |
| `decimalSeparator` | `string` | `'.'` | Character used as decimal separator |
| `thousandSeparator` | `string` | `','` | Character used as thousand separator (set to empty string to disable) |
| `thousandStyle` | `ThousandStyle` | `ThousandStyle.None` | Grouping style: `Thousand`, `Lakh`, `Wan`, or `None` |
| `formatOn` | `FormatOn` | `FormatOn.Blur` | When to apply formatting: `Blur` or `Change` |
| `enableCompactNotation` | `boolean` | `false` | Enable expansion of compact notation (e.g., "1k" → "1000") on paste/setValue |
| `enableNegative` | `boolean` | `false` | Allow negative numbers |
| `enableLeadingZeros` | `boolean` | `false` | Allow leading zeros before decimal point |
| `rawValueMode` | `boolean` | `false` | Return unformatted values in `onChange` callback |
| `onChange` | `(value: string) => void` | `undefined` | Callback function that runs when the input value changes |
| `value` | `string` | `undefined` | Initial value (controlled mode) |
| `defaultValue` | `string` | `undefined` | Initial default value (uncontrolled mode) |

All standard HTMLInputElement properties are also supported (e.g., `placeholder`, `className`, `disabled`, `id`, etc.).

**Note:** Scientific notation expansion (e.g., `"1.5e-7"` → `"0.00000015"`) always happens automatically and is not configurable.

## Framework Adapters

Numora is also available for popular frameworks:

- **React**: [`numora-react`](../react/README.md) - React component wrapper
- **Vue**: Coming soon
- **Svelte**: Use the core package directly

## License

MIT
