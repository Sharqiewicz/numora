---
title: React Guide
description: Using Numora with React
---

# Numora for React

React component wrapper for [Numora](https://github.com/Sharqiewicz/numora) - a precision-first numeric input library for DeFi and financial applications.

## Installation

```bash
npm install numora-react
# or
yarn add numora-react
# or
pnpm add numora-react
# or
bun add numora-react
```

**Note:** `numora-react` depends on `numora` core package, which will be installed automatically.

## Basic Usage

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

## Advanced Example

```tsx
import { NumericInput } from 'numora-react';
import { useRef } from 'react';

function PaymentForm() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <NumericInput
      ref={inputRef}
      maxDecimals={18}
      formatOn="change"
      thousandsSeparator=","
      thousandsGroupStyle="thousand"
      shorthandParsing={true} // Enable compact notation expansion on paste
      placeholder="Enter amount"
      className="payment-input"
      onChange={(e) => {
        const value = e.target.value;
        console.log('Formatted value:', value);
      }}
      onFocus={(e) => {
        console.log('Input focused');
      }}
      onBlur={(e) => {
        console.log('Input blurred');
      }}
    />
  );
}
```

## Compact Notation Example

```tsx
import { NumericInput } from 'numora-react';

function App() {
  return (
    <NumericInput
      maxDecimals={18}
      shorthandParsing={true} // Enable compact notation expansion
      onChange={(e) => {
        console.log('Value:', e.target.value);
      }}
    />
  );
}

// When user pastes "1.5k", it automatically expands to "1500"
// Scientific notation like "1.5e-7" is always automatically expanded
```

## Scientific Notation Example

```tsx
import { NumericInput } from 'numora-react';

function App() {
  return (
    <NumericInput
      maxDecimals={18}
      onChange={(e) => {
        console.log('Value:', e.target.value);
      }}
    />
  );
}

// Scientific notation is ALWAYS automatically expanded
// User can paste "1.5e-7" and it becomes "0.00000015"
// User can paste "2e+5" and it becomes "200000"
```

## Controlled Component

```tsx
import { NumericInput } from 'numora-react';
import { useState } from 'react';

function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <NumericInput
      value={value}
      onChange={(e) => setValue(e.target.value)}
      maxDecimals={2}
      thousandsSeparator=","
    />
  );
}
```

## Uncontrolled Component

```tsx
import { NumericInput } from 'numora-react';
import { useRef } from 'react';

function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const value = inputRef.current?.value;
    console.log('Value:', value);
  };

  return (
    <>
      <NumericInput
        ref={inputRef}
        maxDecimals={2}
        thousandsSeparator=","
      />
      <button onClick={handleSubmit}>Get Value</button>
    </>
  );
}
```

## Form Library Integration

### React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { NumericInput } from 'numora-react';

function Form() {
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <NumericInput
        {...register('amount')}
        maxDecimals={2}
        thousandsSeparator=","
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Formik

```tsx
import { useFormik } from 'formik';
import { NumericInput } from 'numora-react';

function Form() {
  const formik = useFormik({
    initialValues: { amount: '' },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <NumericInput
        name="amount"
        value={formik.values.amount}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        maxDecimals={2}
        thousandsSeparator=","
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxDecimals` | `number` | `2` | Maximum number of decimal places allowed |
| `formatOn` | `'blur' \| 'change'` | `'blur'` | When to apply formatting: `'blur'` or `'change'` |
| `thousandsSeparator` | `string` | `','` | Character used as thousand separator |
| `thousandsGroupStyle` | `'thousand' \| 'lakh' \| 'wan'` | `'thousand'` | Grouping style for thousand separators |
| `shorthandParsing` | `boolean` | `false` | Enable compact notation expansion (e.g., `"1k"` → `"1000"`) on paste |
| `onChange` | `(e: ChangeEvent<HTMLInputElement> \| ClipboardEvent<HTMLInputElement>) => void` | `undefined` | Callback when value changes |
| `additionalStyle` | `string` | `undefined` | Additional CSS styles (deprecated, use `style` prop) |

All standard HTMLInputElement props are also supported (e.g., `placeholder`, `className`, `disabled`, `id`, `onFocus`, `onBlur`, etc.), except:
- `type` - Always set to `'text'` (required for formatting)
- `inputMode` - Always set to `'decimal'` (for mobile keyboards)

**Note:** Scientific notation expansion (e.g., `"1.5e-7"` → `"0.00000015"`) always happens automatically and is not configurable.

## TypeScript

Full TypeScript support is included. The component is typed with proper interfaces:

```tsx
import { NumericInput } from 'numora-react';

// All props are fully typed
const input = (
  <NumericInput
    maxDecimals={18} // ✅ TypeScript knows this is a number
    formatOn="change" // ✅ TypeScript knows valid values
    shorthandParsing={true} // ✅ TypeScript knows this is boolean
    onChange={(e) => {
      // ✅ e is properly typed as ChangeEvent<HTMLInputElement>
      console.log(e.target.value);
    }}
  />
);
```

## Features

The React wrapper supports all core Numora features:

- ✅ Decimal precision control
- ✅ Thousand separators with customizable grouping styles
- ✅ Format on blur/change modes
- ✅ Compact notation expansion (when enabled)
- ✅ Scientific notation expansion (always automatic)
- ✅ Paste event handling
- ✅ Cursor position preservation
- ✅ Mobile keyboard optimization
- ✅ TypeScript support
- ✅ Ref forwarding

**Note:** Some advanced features from the core package (like `decimalMinLength`, `enableNegative`, `enableLeadingZeros`, `rawValueMode`) are not yet exposed through the React component props. For full control, consider using the core `numora` package directly.

## Related Packages

- [`numora`](../vanilla) - Core framework-agnostic library with full feature set and display formatting utilities
