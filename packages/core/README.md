# Vanilla TypeScript Numeric Input

A lightweight, framework-agnostic numeric input component for handling currency and decimal inputs. Built with TypeScript and no dependencies.

## Features

- Validates and sanitizes numeric input
- Limits decimal places
- Handles paste events
- Converts commas to dots (for international number formats)
- Prevents multiple decimal points
- Customizable with various options

## Installation

1. Copy the TypeScript files to your project:
   - `NumericInput.ts`
   - `helpers.ts`
   - `maxDecimals.ts`

2. Compile the TypeScript files using your preferred build tool (webpack, rollup, tsc, etc.)

## Usage

```typescript
import { NumericInput } from './path/to/NumericInput';

// Get the container element where you want to mount the input
const container = document.getElementById('my-input-container');

// Create a new NumericInput instance
const numericInput = new NumericInput(container, {
  readOnly: false,
  additionalStyle: 'my-custom-class',
  maxDecimals: 2,
  defaultValue: '0.0',
  autoFocus: true,
  onChange: (value) => {
    console.log('Value changed:', value);
    // Do something with the value
  }
});

// Get the current value
const value = numericInput.getValue();

// Set a new value
numericInput.setValue('123.45');

// Disable/enable the input
numericInput.disable();
numericInput.enable();

// Focus the input
numericInput.focus();

// Add additional event listeners
numericInput.addEventListener('blur', () => {
  console.log('Input lost focus');
});
```

## Options

The NumericInput constructor accepts the following options:

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| readOnly | boolean | false | Makes the input read-only |
| additionalStyle | string | '' | Additional CSS classes to add to the input |
| maxDecimals | number | 15 | Maximum number of decimal places allowed |
| defaultValue | string | '' | Initial value of the input |
| autoFocus | boolean | false | Whether to focus the input when mounted |
| onChange | function | undefined | Callback function that runs when the input value changes |

## Demo

See the `index.html` and `demo.ts` files for a complete example of how to use the component.

## Browser Compatibility

This component is compatible with all modern browsers that support ES6.

## License

MIT