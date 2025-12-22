# numora-react

[![npm version](https://img.shields.io/npm/v/numora-react.svg)](https://www.npmjs.com/package/numora-react)
[![npm downloads](https://img.shields.io/npm/dm/numora-react.svg)](https://www.npmjs.com/package/numora-react)

React component wrapper for [Numora](https://github.com/Sharqiewicz/numora) - a precision-first numeric input library for DeFi and financial applications.

## Features

| Feature | Description |
|---------|-------------|
| **React Component** | Drop-in replacement for `<input>` with numeric formatting |
| **Decimal Precision Control** | Configure maximum decimal places with `maxDecimals` prop |
| **Thousand Separators** | Customizable thousand separators with `thousandSeparator` prop |
| **Grouping Styles** | Support for different grouping styles (`thousand`, `lakh`, `wan`) |
| **Format on Blur/Change** | Choose when to apply formatting: on blur or on change |
| **Compact Notation Expansion** | When enabled via `enableCompactNotation`, expands compact notation during paste (e.g., `"1k"` → `"1000"`, `"1.5m"` → `"1500000"`) |
| **Scientific Notation Expansion** | Always automatically expands scientific notation (e.g., `"1.5e-7"` → `"0.00000015"`, `"2e+5"` → `"200000"`) |
| **Paste Event Handling** | Intelligent paste handling with automatic sanitization, formatting, and cursor positioning |
| **Cursor Position Preservation** | Smart cursor positioning that works with thousand separators, even during formatting |
| **Thousand Separator Skipping** | On delete/backspace, cursor automatically skips over thousand separators for better UX |
| **Mobile Keyboard Optimization** | Automatic `inputmode="decimal"` for mobile numeric keyboards |
| **Mobile Keyboard Filtering** | Automatically filters non-breaking spaces and Unicode whitespace artifacts from mobile keyboards |
| **Non-numeric Character Filtering** | Automatic removal of invalid characters |
| **Comma/Dot Conversion** | When `thousandStyle` is not set (or `None`), typing comma or dot automatically converts to the configured decimal separator |
| **TypeScript Support** | Full TypeScript definitions included |
| **Ref Forwarding** | Supports React ref forwarding for direct input access |
| **Standard Input Props** | Accepts all standard HTMLInputElement props |

**Note:** Some advanced features from the core package (like `decimalMinLength`, `enableNegative`, `enableLeadingZeros`, `rawValueMode`) are not yet exposed through the React component props. For full control, consider using the core `numora` package directly.

## Comparison

| Feature | numora-react | react-number-format | Native Number Input |
|---------|--------------|---------------------|---------------------|
| **React Component** | ✅ Yes | ✅ Yes | ⚠️ Basic |
| **Decimal Precision Control** | ✅ Max | ✅ Max | ❌ Limited |
| **Thousand Separators** | ✅ Customizable | ✅ Yes | ❌ No |
| **Custom Decimal Separator** | ✅ Yes | ✅ Yes | ❌ No (always `.`) |
| **Formatting Options** | ✅ Blur/Change modes | ✅ Multiple modes | ❌ No |
| **Cursor Preservation** | ✅ Advanced | ✅ Basic | ❌ N/A |
| **Mobile Support** | ✅ Yes | ✅ Yes | ⚠️ Limited |
| **TypeScript Support** | ✅ Yes | ✅ Yes | ⚠️ Partial |
| **Dependencies** | ⚠️ React + numora | ⚠️ React required | ✅ None |
| **Framework Support** | ✅ React | ❌ React only | ✅ All |
| **Scientific Notation** | ✅ Auto-expand | ⚠️ Limited | ❌ No |
| **Compact Notation** | ✅ Yes (on paste when enabled) | ❌ No | ❌ No |
| **Paste Handling** | ✅ Intelligent | ✅ Yes | ⚠️ Basic |
| **Ref Forwarding** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Grouping Styles** | ✅ Thousand/Lakh/Wan | ⚠️ Thousand only | ❌ No |
| **Comma/Dot Conversion** | ✅ Yes | ⚠️ Limited | ❌ No |

## Installation

```bash
npm install numora-react
# or
yarn add numora-react
# or
pnpm add numora-react
```

**Note:** `numora-react` depends on `numora` core package, which will be installed automatically.

## Usage

### Basic Example

```tsx
import { NumoraInput } from 'numora-react';

function App() {
  return (
    <NumoraInput
      maxDecimals={2}
      onChange={(e) => {
        console.log('Value:', e.target.value);
      }}
    />
  );
}
```

### Advanced Example

```tsx
import { NumoraInput } from 'numora-react';
import { useRef } from 'react';

function PaymentForm() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <NumoraInput
      ref={inputRef}
      maxDecimals={18}
      formatOn="change"
      thousandSeparator=","
      thousandStyle="thousand"
      enableCompactNotation={true} // Enable compact notation expansion on paste
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

### Compact Notation Example

```tsx
import { NumoraInput } from 'numora-react';

function App() {
  return (
    <NumoraInput
      maxDecimals={18}
      enableCompactNotation={true} // Enable compact notation expansion
      onChange={(e) => {
        console.log('Value:', e.target.value);
      }}
    />
  );
}

// When user pastes "1.5k", it automatically expands to "1500"
// Scientific notation like "1.5e-7" is always automatically expanded
```

### Scientific Notation Example

```tsx
import { NumoraInput } from 'numora-react';

function App() {
  return (
    <NumoraInput
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

### With Form Libraries

#### React Hook Form

`NumoraInput` works seamlessly with react-hook-form. You can use it in two modes:

**Uncontrolled Mode** (for basic forms):
```tsx
import { useForm } from 'react-hook-form';
import { NumoraInput } from 'numora-react';

function Form() {
  const { register, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <NumoraInput
        {...register('amount')}
        maxDecimals={2}
        thousandSeparator=","
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

**Controlled Mode** (required when using `setValue()`):
When you need to programmatically update the form value using `setValue()`, use controlled mode with `useWatch` or `watch`:

```tsx
import { useForm, useWatch } from 'react-hook-form';
import { NumoraInput } from 'numora-react';

function Form() {
  const form = useForm();
  const { register, setValue } = form;
  const amountString = useWatch({ control: form.control, name: 'amount' });

  return (
    <>
      <NumoraInput
        {...register('amount')}
        value={amountString || ''}  // Controlled mode - required for setValue
        maxDecimals={2}
        thousandSeparator=","
      />
      <button onClick={() => setValue('amount', '1000')}>
        Set to 1000
      </button>
    </>
  );
}
```

**Alternative pattern** (passing register directly):
```tsx
const form = useForm<FormFieldValues>();
const { setValue } = form;
const amountString = useWatch({ control: form.control, name: 'amount' });

<NumoraInput
  register={form.register('amount')}
  value={amountString || ''}
  maxDecimals={2}
/>
```

**Note:** `numora-react` does not require `react-hook-form` as a dependency. It works with react-hook-form when it's present in your project.

#### Formik

```tsx
import { useFormik } from 'formik';
import { NumoraInput } from 'numora-react';

function Form() {
  const formik = useFormik({
    initialValues: { amount: '' },
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <NumoraInput
        name="amount"
        value={formik.values.amount}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        maxDecimals={2}
        thousandSeparator=","
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Controlled Component

```tsx
import { NumoraInput } from 'numora-react';
import { useState } from 'react';

function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <NumoraInput
      value={value}
      onChange={(e) => setValue(e.target.value)}
      maxDecimals={2}
      thousandSeparator=","
    />
  );
}
```

### Uncontrolled Component

```tsx
import { NumoraInput } from 'numora-react';
import { useRef } from 'react';

function UncontrolledInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const value = inputRef.current?.value;
    console.log('Value:', value);
  };

  return (
    <>
      <NumoraInput
        ref={inputRef}
        maxDecimals={2}
        thousandSeparator=","
      />
      <button onClick={handleSubmit}>Get Value</button>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `maxDecimals` | `number` | `2` | Maximum number of decimal places allowed |
| `formatOn` | `'blur' \| 'change'` | `'blur'` | When to apply formatting: `'blur'` or `'change'` |
| `thousandSeparator` | `string` | `','` | Character used as thousand separator |
| `thousandStyle` | `'thousand' \| 'lakh' \| 'wan'` | `'thousand'` | Grouping style for thousand separators |
| `enableCompactNotation` | `boolean` | `false` | Enable compact notation expansion (e.g., `"1k"` → `"1000"`) on paste |
| `onChange` | `(e: ChangeEvent<HTMLInputElement> \| ClipboardEvent<HTMLInputElement>) => void` | `undefined` | Callback when value changes |
| `additionalStyle` | `string` | `undefined` | Additional CSS styles (deprecated, use `style` prop) |

All standard HTMLInputElement props are also supported (e.g., `placeholder`, `className`, `disabled`, `id`, `onFocus`, `onBlur`, etc.), except:
- `type` - Always set to `'text'` (required for formatting)
- `inputMode` - Always set to `'decimal'` (for mobile keyboards)

**Note:** Scientific notation expansion (e.g., `"1.5e-7"` → `"0.00000015"`) always happens automatically and is not configurable.

## API Reference

### NumoraInput

A React component that wraps the core Numora functionality in a React-friendly API.

**Props:** See [Props](#props) section above.

**Ref:** The component forwards refs to the underlying `<input>` element.

## TypeScript

Full TypeScript support is included. The component is typed with proper interfaces:

```tsx
import { NumoraInput } from 'numora-react';

// All props are fully typed
const input = (
  <NumoraInput
    maxDecimals={18} // ✅ TypeScript knows this is a number
    formatOn="change" // ✅ TypeScript knows valid values
    enableCompactNotation={true} // ✅ TypeScript knows this is boolean
    onChange={(e) => {
      // ✅ e is properly typed as ChangeEvent<HTMLInputElement>
      console.log(e.target.value);
    }}
  />
);
```

## Related Packages

- [`numora`](../core/README.md) - Core framework-agnostic library with full feature set and display formatting utilities

## License

MIT
