---
title: Numora Examples
description: Learn how to implement Numora with practical examples
---

# Using Numora

Here are practical examples of how to implement Numora in different scenarios.

## Basic Usage

The simplest way to create a numeric input with Numora:

```javascript
import { NumericInput } from 'numora';

// Get your container element
const container = document.querySelector('#my-input');

// Create a basic numeric input
const numericInput = new NumericInput(container, {
  maxDecimals: 2,
  onChange: (value) => console.log('Current value:', value),
});
```

## Currency Input Example

Here's how to create a currency input with specific formatting:

```javascript
import { NumericInput } from 'numora';

const container = document.querySelector('#currency-input');

const currencyInput = new NumericInput(container, {
  maxDecimals: 2, // Standard for most currencies
  placeholder: '0.00',
  onChange: (value) => {
    // Format the value as currency
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);

    console.log('Currency value:', formattedValue);
  },
});
```

## Cryptocurrency Amount Input

For cryptocurrency applications requiring more decimal places:

```javascript
import { NumericInput } from 'numora';

const container = document.querySelector('#crypto-input');

const cryptoInput = new NumericInput(container, {
  maxDecimals: 8, // Common for cryptocurrency amounts
  placeholder: '0.00000000',
  onChange: (value) => {
    console.log('Crypto amount:', value);
  },
});
```

## Form Integration Example

Here's how to integrate Numora within a form:

```html
<form id="payment-form">
  <div id="amount-input"></div>
  <button type="submit">Submit Payment</button>
</form>

<script>
  import { NumericInput } from 'numora';

  const form = document.querySelector('#payment-form');
  const container = document.querySelector('#amount-input');

  let currentValue = '0';

  const amountInput = new NumericInput(container, {
    maxDecimals: 2,
    placeholder: 'Enter amount',
    onChange: (value) => {
      currentValue = value;
    },
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Access the current value
    console.log('Submitting amount:', currentValue);

    // Process form...
  });
</script>
```

## Advanced Configuration Example

Using more advanced options for specific use cases:

```javascript
import { NumericInput } from 'numora';

const container = document.querySelector('#advanced-input');

const advancedInput = new NumericInput(container, {
  maxDecimals: 3,
  placeholder: 'Enter number',

  // Style customization
  className: 'custom-numeric-input',
  style: {
    width: '200px',
    padding: '8px',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },

  // Event handlers
  onChange: (value) => {
    console.log('Value changed:', value);
  },
  onFocus: () => {
    console.log('Input focused');
  },
  onBlur: () => {
    console.log('Input blurred');
  },
});
```

## Validation Example

Implementing custom validation with Numora:

```javascript
import { NumericInput } from 'numora';

const container = document.querySelector('#validated-input');

const validatedInput = new NumericInput(container, {
  maxDecimals: 2,
  onChange: (value) => {
    const numValue = Number(value);

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

1. Always provide an `onChange` handler to track value changes
2. Set appropriate `maxDecimals` based on your use case
3. Include placeholder text for better user experience
4. Implement proper error handling and validation
5. Clean up instances when they're no longer needed

## Common Patterns

Here are some common patterns when using Numora:

### Formatting Display Values

```javascript
const input = new NumericInput(container, {
  maxDecimals: 2,
  onChange: (value) => {
    // Format for display
    const displayValue = Number(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    document.querySelector('#display-value').textContent = displayValue;
  },
});
```

### Input Restrictions

```javascript
const input = new NumericInput(container, {
  maxDecimals: 2,
  onChange: (value) => {
    const numValue = Number(value);

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

These examples should give you a good starting point for implementing Numora in your projects. Remember to adjust the configurations based on your specific needs and requirements.
