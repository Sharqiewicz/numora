---
title: Numora Examples
description: Learn how to implement Numora with practical examples covering all features
---

# Using Numora

Here are practical examples of how to implement Numora in different scenarios, covering all features and use cases.

## Basic Usage

The simplest way to create a numeric input with Numora:

```typescript
import { NumoraInput } from 'numora';

// Get your container element
const container = document.querySelector('#my-input');

// Create a basic numeric input
const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  onChange: (value) => console.log('Current value:', value),
});
```

## Currency Input Example

Here's how to create a currency input with specific formatting:

```typescript
import { NumoraInput, FormatOn, ThousandStyle } from 'numora';

const container = document.querySelector('#currency-input');

const currencyInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  decimalMinLength: 2, // Always show 2 decimal places
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
  formatOn: FormatOn.Change, // Real-time formatting
  placeholder: '0.00',
  onChange: (value) => {
    console.log('Currency value:', value);
  },
});
```

## Cryptocurrency Amount Input

For cryptocurrency applications requiring more decimal places:

```typescript
import { NumoraInput } from 'numora';

const container = document.querySelector('#crypto-input');

const cryptoInput = new NumoraInput(container, {
  decimalMaxLength: 18, // Common for tokens like ETH
  placeholder: '0.000000000000000000',
  onChange: (value) => {
    console.log('Crypto amount:', value);
  },
});
```

## Compact Notation Example

Numora can expand compact notation (like "1k" → "1000") when enabled:

```typescript
import { NumoraInput } from 'numora';

const container = document.querySelector('#compact-input');

const compactInput = new NumoraInput(container, {
  decimalMaxLength: 18,
  enableCompactNotation: true, // Enable compact notation expansion
  onChange: (value) => {
    console.log('Expanded value:', value);
  },
});

// When user pastes "1.5k" or you call setValue("1.5k")
// It automatically expands to "1500"
compactInput.setValue('1.5k'); // Display: "1,500" (if thousand separator enabled)
```

## Scientific Notation Example

Scientific notation is always automatically expanded:

```typescript
import { NumoraInput } from 'numora';

const container = document.querySelector('#scientific-input');

const scientificInput = new NumoraInput(container, {
  decimalMaxLength: 18,
  onChange: (value) => {
    console.log('Expanded value:', value);
  },
});

// Scientific notation is ALWAYS automatically expanded
// User can paste "1.5e-7" and it becomes "0.00000015"
// User can paste "2e+5" and it becomes "200000"
```

## Comma/Dot Conversion Example

When `thousandStyle` is `None`, typing comma or dot automatically converts to the configured `decimalSeparator`:

```typescript
import { NumoraInput, ThousandStyle } from 'numora';

const container = document.querySelector('#comma-dot-input');

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

## Format on Blur vs Change

Choose when to apply formatting:

```typescript
import { NumoraInput, FormatOn } from 'numora';

// Format on change (real-time)
const realTimeInput = new NumoraInput(container1, {
  formatOn: FormatOn.Change,
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
  decimalMaxLength: 2,
});

// Format on blur (clean editing)
const blurInput = new NumoraInput(container2, {
  formatOn: FormatOn.Blur,
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
  decimalMaxLength: 2,
});
```

## Raw Value Mode

Get unformatted values while displaying formatted values:

```typescript
import { NumoraInput } from 'numora';

const container = document.querySelector('#raw-value-input');

const rawValueInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  thousandSeparator: ',',
  rawValueMode: true, // Get unformatted values in onChange
  onChange: (value) => {
    // value is "1234.56" (unformatted)
    // Display shows "1,234.56" (formatted)
    console.log('Raw value for calculations:', value);
  },
});
```

## Minimum Decimal Places

Automatically pad values with zeros:

```typescript
import { NumoraInput } from 'numora';

const container = document.querySelector('#min-decimals-input');

const minDecimalsInput = new NumoraInput(container, {
  decimalMaxLength: 4,
  decimalMinLength: 2, // Always show at least 2 decimal places
  onChange: (value) => {
    // "1" becomes "1.00"
    // "1.5" becomes "1.50"
    // "1.123" stays "1.123"
    console.log('Value:', value);
  },
});
```

## Display Formatting Utilities

Use Numora's formatting utilities for display purposes:

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

## Form Integration Example

Here's how to integrate Numora within a form:

```html
<form id="payment-form">
  <div id="amount-input"></div>
  <button type="submit">Submit Payment</button>
</form>

<script type="module">
  import { NumoraInput } from 'numora';

  const form = document.querySelector('#payment-form');
  const container = document.querySelector('#amount-input');

  let currentValue = '0';

  const amountInput = new NumoraInput(container, {
    decimalMaxLength: 2,
    decimalMinLength: 2,
    thousandSeparator: ',',
    formatOn: FormatOn.Blur,
    placeholder: 'Enter amount',
    onChange: (value) => {
      currentValue = value;
    },
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log('Submitting amount:', currentValue);
    // Process form...
  });
</script>
```

## Advanced Configuration Example

Using more advanced options for specific use cases:

```typescript
import { NumoraInput, FormatOn, ThousandStyle } from 'numora';

const container = document.querySelector('#advanced-input');

const advancedInput = new NumoraInput(container, {
  // Decimal configuration
  decimalMaxLength: 18,
  decimalMinLength: 2,
  decimalSeparator: '.',
  
  // Thousand separator configuration
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
  formatOn: FormatOn.Change,
  
  // Feature flags
  enableCompactNotation: true,
  enableNegative: false,
  enableLeadingZeros: false,
  rawValueMode: true,
  
  // Standard input properties
  placeholder: 'Enter number',
  className: 'custom-numeric-input',
  disabled: false,
  
  // Event handlers
  onChange: (value) => {
    console.log('Value changed:', value);
  },
});
```

## Programmatic Value Control

Control the input value programmatically:

```typescript
import { NumoraInput } from 'numora';

const container = document.querySelector('#programmatic-input');
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
```

## Validation Example

Implementing custom validation with Numora:

```typescript
import { NumoraInput } from 'numora';

const container = document.querySelector('#validated-input');

const validatedInput = new NumoraInput(container, {
  decimalMaxLength: 2,
  onChange: (value) => {
    const numValue = parseFloat(value) || 0;

    // Example validation rules
    if (numValue < 0) {
      container.classList.add('error');
      showError('Value cannot be negative');
    } else if (numValue > 1000) {
      container.classList.add('error');
      showError('Value cannot exceed 1000');
    } else {
      container.classList.remove('error');
      clearError();
    }
  },
});

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  container.parentNode.appendChild(errorDiv);
}

function clearError() {
  const errorMessage = container.parentNode.querySelector('.error-message');
  if (errorMessage) {
    errorMessage.remove();
  }
}
```

## Best Practices

When using Numora, consider these best practices:

1. **Always provide an `onChange` handler** to track value changes
2. **Set appropriate `decimalMaxLength`** based on your use case (2 for currency, 18 for tokens)
3. **Use `decimalMinLength`** when you need consistent decimal display
4. **Choose the right `formatOn` mode**: `Blur` for clean editing, `Change` for real-time feedback
5. **Enable `rawValueMode`** when you need unformatted values for calculations
6. **Use `enableCompactNotation`** for DeFi applications where users might paste "1k" or "1.5m"
7. **Include placeholder text** for better user experience
8. **Implement proper error handling** and validation
9. **Clean up instances** when they're no longer needed (if using in SPA frameworks)

## Common Patterns

### Formatting Display Values

```typescript
import { NumoraInput, formatLargeNumber } from 'numora';

const input = new NumoraInput(container, {
  decimalMaxLength: 2,
  onChange: (value) => {
    // Format for display using Numora utilities
    const displayValue = formatLargeNumber(value, {
      decimals: 2,
      decimalsUnder: 1000,
    });
    
    document.querySelector('#display-value').textContent = displayValue;
  },
});
```

### Input Restrictions

```typescript
const input = new NumoraInput(container, {
  decimalMaxLength: 2,
  onChange: (value) => {
    const numValue = parseFloat(value) || 0;

    // Enforce minimum value
    if (numValue < 0) {
      input.setValue('0');
    }

    // Enforce maximum value
    if (numValue > 999999.99) {
      input.setValue('999999.99');
    }
  },
});
```

### Token-Specific Configuration

```typescript
// Different tokens have different decimal places
const tokenConfigs = {
  USDC: { decimals: 6 },
  ETH: { decimals: 18 },
  BTC: { decimals: 8 },
};

function createTokenInput(container, tokenSymbol) {
  const config = tokenConfigs[tokenSymbol];
  return new NumoraInput(container, {
    decimalMaxLength: config.decimals,
    placeholder: `0.${'0'.repeat(config.decimals)}`,
    onChange: (value) => {
      console.log(`${tokenSymbol} amount:`, value);
    },
  });
}
```

These examples should give you a good starting point for implementing Numora in your projects. Remember to adjust the configurations based on your specific needs and requirements.
