---
title: Vanilla JS Guide
description: Using Numora with Vanilla JavaScript/TypeScript
---

# Numora for Vanilla JavaScript/TypeScript

Complete guide to using the core `numora` package in vanilla JavaScript or TypeScript applications.

## Installation

```bash
npm install numora
# or
yarn add numora
# or
pnpm add numora
# or
bun add numora
```

## Basic Usage

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

## Advanced Configuration

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

## Compact Notation Example

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

## Scientific Notation Example

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

## Comma/Dot Conversion Example

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

## Programmatic Value Control

```typescript
import { NumoraInput } from 'numora';

const container = document.querySelector('#my-input-container');
const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
});

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

## Using Display Formatting Utilities

Numora exports utility functions for formatting numbers for display:

```typescript
import { formatPercent, formatLargePercent, formatLargeNumber, condenseDecimalZeros } from 'numora';

// Format as percentage
const percent = formatPercent('0.01', 2); // "1.00%"
const largePercent = formatLargePercent('1000', 2); // "100000%"

// Format large numbers with scale notation
const large = formatLargeNumber('1234567'); // "1.23M"
const small = formatLargeNumber('1234'); // "1.23k"

// Condense decimal zeros
const condensed = condenseDecimalZeros('0.000001', 8); // "0₆1"
const condensed2 = condenseDecimalZeros('0.000123', 8); // "0₃123"
```

## Using Event Handlers Directly

For more control, you can use Numora's event handlers directly:

```typescript
import { handleOnChangeNumoraInput, handleOnPasteNumoraInput, handleOnKeyDownNumoraInput } from 'numora';

const input = document.querySelector('#my-input') as HTMLInputElement;

input.addEventListener('input', (e) => {
  handleOnChangeNumoraInput(e, 2, undefined, {
    formatOn: FormatOn.Change,
    thousandSeparator: ',',
    ThousandStyle: ThousandStyle.Thousand,
  });
});

input.addEventListener('paste', (e) => {
  handleOnPasteNumoraInput(e as ClipboardEvent, 2, {
    enableCompactNotation: true,
  });
});

input.addEventListener('keydown', (e) => {
  handleOnKeyDownNumoraInput(e as KeyboardEvent, {
    formatOn: FormatOn.Change,
    thousandSeparator: ',',
    ThousandStyle: ThousandStyle.Thousand,
  });
});
```

## Complete Options Reference

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

## API Reference

### NumoraInput Class

#### Constructor

```typescript
new NumoraInput(container: HTMLElement, options?: NumoraInputOptions)
```

#### Methods

- `getValue(): string` - Get the current value
- `setValue(value: string): void` - Set a new value
- `disable(): void` - Disable the input
- `enable(): void` - Enable the input
- `getElement(): HTMLInputElement` - Get the underlying HTMLInputElement
- `addEventListener(event: string, callback: EventListener): void` - Add event listener
- `removeEventListener(event: string, callback: EventListener): void` - Remove event listener

#### Properties

- `value: string` - Get/set the current value
- `valueAsNumber: number` - Get/set the value as a number

### Event Handlers

- `handleOnChangeNumoraInput(e: Event, decimalMaxLength: number, caretPositionBeforeChange?: CaretPositionInfo, formattingOptions?: FormattingOptions): void`
- `handleOnPasteNumoraInput(e: ClipboardEvent, decimalMaxLength: number, formattingOptions?: FormattingOptions): string`
- `handleOnKeyDownNumoraInput(e: KeyboardEvent, formattingOptions?: FormattingOptions): CaretPositionInfo | undefined`

### Formatting Utilities

- `formatPercent(value: string, decimals?: number, decimalSeparator?: string, thousandSeparator?: string, thousandStyle?: ThousandStyle): string`
- `formatLargePercent(value: string, decimals?: number, options?: FormatLargePercentOptions): string`
- `formatLargeNumber(value: string, options?: FormatLargeNumberOptions): string`
- `condenseDecimalZeros(value: string, maxDecimalDigits?: number, decimalSeparator?: string): string`

## Examples

### Currency Input

```typescript
import { NumoraInput, FormatOn, ThousandStyle } from 'numora';

const container = document.querySelector('#currency-input');

const currencyInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  decimalMinLength: 2,
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
  formatOn: FormatOn.Change,
  placeholder: '0.00',
});
```

### Cryptocurrency Input

```typescript
import { NumoraInput } from 'numora';

const container = document.querySelector('#crypto-input');

const cryptoInput = new NumoraInput(container, {
  decimalMaxLength: 18, // For tokens like ETH
  placeholder: '0.000000000000000000',
  enableCompactNotation: true, // Allow "1k" → "1000"
});
```

### Form Integration

```typescript
import { NumoraInput } from 'numora';

const form = document.querySelector('#payment-form');
const container = document.querySelector('#amount-input');

let currentValue = '0';

const amountInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  decimalMinLength: 2,
  thousandSeparator: ',',
  formatOn: FormatOn.Blur,
  rawValueMode: true,
  onChange: (value) => {
    currentValue = value; // Unformatted value for calculations
  },
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Submitting amount:', currentValue);
  // Process form with unformatted value
});
```

## Best Practices

1. **Use appropriate decimal places** - 2 for currency, 18 for tokens
2. **Enable compact notation for DeFi** - Users often paste "1k" or "1.5m"
3. **Use raw value mode for calculations** - Get unformatted values for blockchain transactions
4. **Choose format on blur for clean editing** - Better UX when users are typing
5. **Use format on change for real-time feedback** - Show formatting as user types
6. **Handle edge cases** - Empty inputs, zero values, very large numbers
7. **Clean up instances** - Remove event listeners when component is destroyed
