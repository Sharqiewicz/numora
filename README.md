# numora

[![npm version](https://img.shields.io/npm/v/numora.svg)](https://www.npmjs.com/package/numora)
[![npm downloads](https://img.shields.io/npm/dm/numora.svg)](https://www.npmjs.com/package/numora)

A precision-first numeric input library for DeFi and financial applications. Built with TypeScript, zero dependencies, and designed for accuracy-critical use cases.

## 🚀 Quick Start

```bash
# Core package (vanilla JS/TypeScript)
npm install numora

# React
npm install numora-react
```

## 📦 Packages

| Package | Version | Description |
|---------|---------|-------------|
| [`numora`](./packages/core) | [![npm version](https://img.shields.io/npm/v/numora.svg)](https://www.npmjs.com/package/numora) | Core framework-agnostic library |
| [`numora-react`](./packages/react) | [![npm version](https://img.shields.io/npm/v/numora-react.svg)](https://www.npmjs.com/package/numora-react) | React component wrapper |

## ✨ Features

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

## 🎯 Why Numora?

### The Problem

Standard HTML number inputs and JavaScript's `Number` type have serious limitations:

```javascript
// ❌ JavaScript floating-point precision issues
0.1 + 0.2 === 0.3  // false! (0.30000000000000004)
1.005 * 100        // 100.49999999999999

// ❌ HTML number input limitations
<input type="number">  // Can't handle custom formatting
                       // Poor mobile keyboard support
                       // Loses leading zeros
```

### The Solution

Numora provides:

✅ **String-only arithmetic** - No floating-point errors  
✅ **Precision control** - Configurable decimal places (min/max)  
✅ **Smart formatting** - Thousands separators with cursor preservation  
✅ **Scientific notation** - Automatic expansion (1.5e-7 → 0.00000015)  
✅ **Compact notation** - Expand "1k" → "1000" on paste/setValue  
✅ **Mobile-friendly** - Decimal keyboard on mobile devices  
✅ **Zero dependencies** - Lightweight and secure  
✅ **Framework adapters** - React, Vue (planned), Vanilla JS  

## 📖 Documentation

- [Core Package Documentation](./packages/core/README.md)
- [React Package Documentation](./packages/react/README.md)
- [Live Demo](https://numora.xyz/)
- [Developer Guide](./DEVELOPER_GUIDE.md)

## 💻 Examples

### Vanilla JavaScript/TypeScript

```typescript
import { NumoraInput, FormatOn, ThousandStyle } from 'numora';

const container = document.querySelector('#my-input-container');

const numoraInput = new NumoraInput(container, {
  decimalMaxLength: 18,
  decimalMinLength: 2, // Pads with zeros
  thousandSeparator: ',',
  thousandStyle: ThousandStyle.Thousand,
  formatOn: FormatOn.Change,
  enableCompactNotation: true, // Expands "1k" → "1000" on paste
  onChange: (value) => {
    console.log('Value:', value);
  },
});
```

### React

```tsx
import { NumoraInput } from 'numora-react';

function App() {
  return (
    <NumoraInput
      maxDecimals={18}
      thousandSeparator=","
      formatOn="change"
      onChange={(e) => {
        console.log('Value:', e.target.value);
      }}
    />
  );
}
```

## 🛠️ Use Cases

- 💰 Cryptocurrency wallets (precise token amounts)
- 📊 Trading platforms (accurate price inputs)
- 💳 Payment forms (exact currency amounts)
- 🏦 Financial calculators (decimal precision critical)

## 📄 License

MIT

## 👤 Author

**Kacper Szarkiewicz**

- Website: [sharqiewicz.com](https://sharqiewicz.com)
- Email: contact@sharqiewicz.com
