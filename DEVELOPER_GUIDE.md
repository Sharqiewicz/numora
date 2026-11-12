# Numora Developer Guide

**A Comprehensive Guide to Understanding and Contributing to Numora**

Version: 1.0
Last Updated: 2025-01-27

---

## 📖 Table of Contents

1. [What is Numora?](#what-is-numora)
2. [Core Principles](#core-principles)
3. [Architecture Overview](#architecture-overview)
4. [Module Breakdown](#module-breakdown)
5. [Data Flow](#data-flow)
6. [Development Setup](#development-setup)
7. [Testing](#testing)
8. [Adding New Features](#adding-new-features)
9. [Key Concepts](#key-concepts)
10. [Common Patterns](#common-patterns)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 What is Numora?

Numora is a **precision-first numeric input library** designed specifically for DeFi and financial applications where accuracy is critical.

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
✅ **Precision control** - Configurable decimal places
✅ **Smart formatting** - Thousands separators with cursor preservation
✅ **Scientific notation** - Automatic expansion (1.5e-7 → 0.00000015)
✅ **Mobile-friendly** - Decimal keyboard on mobile devices
✅ **Zero dependencies** - Lightweight and secure
✅ **Framework adapters** - React, Vue (planned), Vanilla JS

### Use Cases

- 💰 Cryptocurrency wallets (precise token amounts)
- 📊 Trading platforms (accurate price inputs)
- 💳 Payment forms (exact currency amounts)
- 🏦 Financial calculators (decimal precision critical)

---

## 🧭 Core Principles

### 1. String-Only State

**All numeric values are stored and manipulated as strings.**

```typescript
// ✅ Good - String manipulation
const value = "1.234567890123456789";
const trimmed = value.slice(0, value.indexOf('.') + 3); // "1.23"

// ❌ Bad - Number conversion loses precision
const value = 1.234567890123456789;
const rounded = Number(value.toFixed(2)); // Precision lost!
```

### 2. Zero Dependencies

The core library has **zero runtime dependencies** to ensure:
- Small bundle size
- Security (no supply chain attacks)
- Predictable behavior
- Easy auditing

### 3. Framework Agnostic

The core is pure TypeScript. Framework adapters are thin wrappers:

```
packages/core/       ← Pure TS logic (no framework deps)
packages/react/      ← React wrapper
packages/vue/        ← Vue wrapper (planned)
```

### 4. Progressive Enhancement

Features are layered:

```
Base:        Input sanitization + decimal control
Layer 1:     Scientific notation expansion
Layer 2:     Thousands separator formatting
Layer 3:     Advanced cursor positioning
```

---

## 🏗️ Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                  User Interface                 │
│              (Types, Pastes, Deletes)           │
└────────────────────┬────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────┐
│              NumoraInput Class                   │
│         (Presentation & Coordination)           │
│  - Creates <input> element                      │
│  - Manages event listeners                      │
│  - Coordinates between handlers                 │
└─────┬──────────────┬────────────────────────────┘
      │              │
      ▼              ▼
┌──────────┐  ┌─────────────────────────────────┐
│ Event    │  │    Utility Modules              │
│ Handlers │◄─┤  (Pure Functions)               │
└────┬─────┘  └─────────────────────────────────┘
     │                     │
     │                     ├─► Sanitization
     │                     ├─► Decimals
     │                     ├─► Formatting
     │                     └─► Scientific Notation
     │
     ▼
┌─────────────────────────────────────────────────┐
│           DOM Update & Cursor Positioning       │
└─────────────────────────────────────────────────┘
```

### Data Flow

```
User Input ("1.5e-7")
    ↓
┌─────────────────────────────────┐
│  Step 1: Event Capture          │
│  keydown → track caret position │
│  input → trigger processing     │
└─────────────┬───────────────────┘
              ↓
┌─────────────────────────────────┐
│  Step 2: Sanitization           │
│  - Expand scientific notation   │
│    "1.5e-7" → "0.00000015"     │
│  - Remove non-numeric chars     │
│  - Remove extra dots            │
└─────────────┬───────────────────┘
              ↓
┌─────────────────────────────────┐
│  Step 3: Decimal Control        │
│  - Trim to decimalMaxLength     │
│  - Replace commas with dots     │
└─────────────┬───────────────────┘
              ↓
┌─────────────────────────────────┐
│  Step 4: Formatting (Optional)  │
│  - Add thousands separators     │
│    "1000000" → "1,000,000"     │
└─────────────┬───────────────────┘
              ↓
┌─────────────────────────────────┐
│  Step 5: Cursor Positioning     │
│  - Calculate new cursor position│
│  - Preserve relative position   │
└─────────────┬───────────────────┘
              ↓
Update DOM (input.value & cursor)
```

---

## 📦 Module Breakdown

### File Structure

```
packages/core/src/
├── NumoraInput.ts                # Main presentation class
├── index.ts                      # Public API exports
├── features/
│   ├── sanitization.ts           # Input cleaning pipeline
│   ├── decimals.ts               # Decimal handling utilities
│   ├── scientific-notation.ts    # Scientific notation expansion
│   ├── non-numeric-characters.ts # Character filtering
│   └── formatting/               # 🆕 MODULAR (recently refactored)
│       ├── thousand-grouping.ts  # Number formatting logic
│       ├── cursor-position.ts    # Cursor calculation (complex!)
│       ├── change-detection.ts   # Change tracking utilities
│       ├── digit-counting.ts     # Digit manipulation utilities
│       ├── index.ts              # Public API
│       └── README.md             # Detailed module docs
└── utils/
    └── event-handlers.ts         # User interaction handlers
```

---

### Module Details

#### 1. **NumoraInput.ts** - Main Class

**Purpose:** Presentation layer that manages the DOM input element and coordinates events.

**Key Responsibilities:**
- Create and configure `<input>` element
- Attach event listeners
- Maintain state (caret position tracking)
- Call appropriate handlers
- Provide public API

**Example:**
```typescript
const input = new NumoraInput(container, {
  decimalMaxLength: 6,
  placeholder: "Enter amount",
  onValueChange: ({ value, formattedValue }) => console.log(value, formattedValue)
});

input.rawValue;  // "123.456"
input.setValue("789.012");
```

**Caret:** no caret state is kept between events. `beforeinput` and paste compute the new
caret from the edit itself (`computeCaretFromEdit`); browser-inserted `input` events use
`computeCaretAfterRewrite` (mapped while focused, end of value while unfocused).

---

#### 2. **event-handlers.ts** - Event Processing

**Purpose:** Handle user interactions and coordinate sanitization/formatting.

**Three Main Handlers:**

All three are **pure**: they compute a result and mutate neither the input nor
the event. The caller owns `preventDefault()` and the DOM write.

```typescript
// 1. onBeforeInput - Main input processing
handleOnBeforeInputNumoraInput(
  e: InputEvent,
  decimalMaxLength: number,
  formattingOptions?: NumoraOptions
): BeforeInputResult

// 2. onKeyDown - Track caret & skip over separators
handleOnKeyDownNumoraInput(
  e: KeyboardEvent,
  formattingOptions?: NumoraOptions
): void

// 3. onPaste - Handle clipboard data
handleOnPasteNumoraInput(
  e: ClipboardEvent,
  decimalMaxLength: number,
  formattingOptions?: NumoraOptions
): PasteResult
```

Both result types are tagged unions telling the caller what to do:

```typescript
type BeforeInputResult =
  | { type: 'handled'; formatted: string; raw: string; cursorPos: number }
  | { type: 'reject' }   // caller calls preventDefault(), writes nothing
  | { type: 'skip' };    // caller lets the browser apply the edit natively

type PasteResult =
  | { type: 'handled'; formatted: string; raw: string; cursorPos: number }
  | { type: 'reject' };
```

**Flow:**
```
keydown → handleOnKeyDownNumoraInput()
            ↓ (returns caret info)
beforeinput → handleOnBeforeInputNumoraInput(event, decimalMaxLength, options)
            ↓ (sanitize → format → compute caret)
            ↓ caller: preventDefault() + writeValue()
paste → handleOnPasteNumoraInput(event, decimalMaxLength, options)
```

Formatting happens on **`beforeinput`**, not `input` - see the "Event
architecture" notes below and `packages/core/INPUT_EVENTS.md`. Intercepting
before the browser commits the mutation means only the formatted text is ever
shown, and `setRangeText` fires no `input` event.

---

#### 3. **sanitization.ts** - Input Cleaning

**Purpose:** Remove invalid characters and normalize input.

**Pipeline:**
```typescript
export const sanitizeNumoraInput = (
  value: string,
  options?: SanitizationOptions
): string => {
  // Filter mobile keyboard artifacts
  let sanitized = filterMobileKeyboardArtifacts(value);
  // Remove thousand separators
  if (options?.thousandSeparator) {
    sanitized = removeThousandSeparators(sanitized, options.thousandSeparator);
  }
  // Expand compact notation (if enabled)
  if (options?.allowCompactNotation) {
    sanitized = expandCompactNotation(sanitized);
  }
  // Expand scientific notation
  sanitized = expandScientificNotation(sanitized);
  // Remove non-numeric characters
  sanitized = removeNonNumericCharacters(sanitized, options?.allowNegative, options?.decimalSeparator);
  // Remove extra decimal separators
  sanitized = removeExtraDecimalSeparators(sanitized, options?.decimalSeparator || DEFAULT_DECIMAL_SEPARATOR);
  // Remove leading zeros (if not allowed)
  if (!options?.allowLeadingZeros) {
    sanitized = removeLeadingZeros(sanitized);
  }
  return sanitized;
};
```

**Example:**
```typescript
sanitizeNumoraInput("$1,234.56abc", { thousandSeparator: ',' });  // "1234.56"
sanitizeNumoraInput("1.5e-7");        // "0.00000015"
sanitizeNumoraInput("1..2.3");        // "1.23"
```

---

#### 4. **decimals.ts** - Decimal Utilities

**Purpose:** Control decimal precision and separator handling.

**Key Functions:**

```typescript
// Replace commas with dots (locale normalization)
replaceCommasWithDots("1,234.56")  // "1.234.56"

// Prevent duplicate decimal points
alreadyHasDecimal(keyboardEvent)  // true/false

// Trim to max decimal places
trimToMaxDecimals("1.23456", 2)  // "1.23"

// Remove extra dots
removeExtraDots("1..2.3")  // "1.23"
```

**Current Limitations (TODOs):**
```typescript
// @TODO: support a choice between comma and dot as decimal separator
// @TODO: add support for specialChars
```

---

#### 5. **scientific-notation.ts** - Scientific Notation

**Purpose:** Expand scientific notation to decimal format using only strings.

**Examples:**
```typescript
expandScientificNotation("1.5e-7")   // "0.00000015"
expandScientificNotation("2e+5")     // "200000"
expandScientificNotation("1.23e-4")  // "0.000123"
expandScientificNotation("5e0")      // "5"
```

**Algorithm:**
1. Parse regex: `/([+-]?\d+\.?\d*)[eE]([+-]?\d+)/g`
2. Extract base and exponent
3. Move decimal point using string manipulation
4. Handle positive/negative exponents differently
5. Trim trailing zeros

---

#### 6. **formatting/** - Number Formatting Module 🆕

**Recently refactored into focused sub-modules!**

See [`packages/core/src/features/formatting/README.md`](packages/core/src/features/formatting/README.md) for complete documentation.

**Sub-modules:**

**a) thousand-grouping.ts** - Number formatting (group sizes live in a `GROUP_SIZES` table: thousand `[3, 3]`, lakh `[3, 2]`, wan `[4, 4]`)
```typescript
formatWithSeparators("1234567", ",", "thousand")  // "1,234,567"
formatWithSeparators("1234567", ",", "lakh")      // "12,34,567"
formatWithSeparators("1234567", ",", "wan")       // "123,4567"
```

**c) cursor-position.ts** - Cursor preservation (⚠️ Most complex!)
```typescript
// When "1000" becomes "1,000" after typing last zero:
calculateCursorPositionAfterFormatting(
  "100",   // old value
  "1,000", // new value
  3,       // old cursor (after last 0)
  ",",     // separator
  "thousand"
)
// Returns: 5 (cursor after last 0 in formatted value)
```

**d) change-detection.ts** - Track what changed
```typescript
findChangedRangeFromCaretPositions(
  { selectionStart: 2, selectionEnd: 2, endOffset: 1 },
  "1,234",
  "1,34"
)
// Returns: { start: 2, end: 3, deletedLength: 1, isDelete: true }
```

**e) digit-counting.ts** - Digit utilities
```typescript
// Count actual digits (excluding separators)
countMeaningfulDigitsBeforePosition("1,234", 3, ",")  // 2 (digits "1" and "2")
```

---

## 🔄 Data Flow (Detailed)

### Example: User Types "4" in "1000" → becomes "1,0004"

```typescript
Step 1: keydown event
    ↓
handleOnKeyDownNumoraInput(e)
  - Captures: selectionStart=4, selectionEnd=4
  - Returns: { selectionStart: 4, selectionEnd: 4 }
  ────────────────────────────────────────────────
Step 2: beforeinput event fires (value still "1000" - not yet committed)
    ↓
handleOnBeforeInputNumoraInput(e, decimalMaxLength=2, options)
  Intended value: "10004"
    ↓
  sanitizeNumoraInput("10004", options)    → "10004"
  trimToDecimalMaxLength("10004", 2)     → "10004"
    ↓
  formatWithSeparators("10004", ",", "thousand")
    → "10,004"
    ↓
  calculateCursorPositionAfterFormatting(
    "1000",   // old formatted
    "10,004", // new formatted
    4,        // old cursor
    ","
  )
    → Returns: 6 (cursor after last "4")
    ↓
  target.value = "10,004"
  target.setSelectionRange(6, 6)
  ────────────────────────────────────────────────
Step 3: DOM updated
  Display: "10,004" with cursor after last "4"
```

---

## 💻 Development Setup

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/numora.git
cd numora

# Install dependencies
npm install

# Navigate to core package
cd packages/core
```

### Project Structure

```
numora/
├── packages/
│   ├── core/          # Main library
│   ├── react/         # React adapter
│   └── vue/           # Vue adapter (planned)
├── docs/              # Documentation site
├── GAP_ANALYSIS.md    # Feature status tracking
└── DEVELOPER_GUIDE.md # This file
```

### Available Scripts

```bash
# In packages/core/

# Run tests
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report

# Build
npm run build         # Build for production

# Development
npm run dev           # Development mode
```

---

## 🧪 Testing

### Test Structure

```
packages/core/tests/
├── NumoraInput.test.ts            # Main class tests
├── formatting.test.ts             # Formatting logic
├── formatting.cursor.test.ts      # Cursor positioning (complex!)
└── scientific-notation.test.ts    # Scientific notation expansion
```

### Running Tests

```bash
cd packages/core
npm test
```

### Test Status

```
✅ NumoraInput.test.ts:           52 tests passing
✅ formatting.test.ts:            42 tests passing
⚠️  formatting.cursor.test.ts:    30/36 passing (6 pre-existing failures)
✅ scientific-notation.test.ts:   30 tests passing
──────────────────────────────────────────────────
Total: 154/160 passing (96% pass rate)
```

### Writing Tests

**Pattern:**
```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from '../src/utils/yourModule';

describe('yourFunction', () => {
  it('should handle basic case', () => {
    expect(yourFunction("input")).toBe("expected");
  });

  it('should handle edge case', () => {
    expect(yourFunction("")).toBe("");
  });
});
```

---

## ✨ Adding New Features

### Example: Adding Shorthand Parsing (k, m, b)

**Feature:** Convert "1k" → "1000", "1.5m" → "1500000", "2b" → "2000000000"

**Step 1: Create Utility Function**

File: `packages/core/src/utils/shorthand.ts`

```typescript
/**
 * Expands shorthand notation (k, m, b) to full numbers.
 * @param value - Input that may contain shorthand
 * @returns Expanded numeric string
 */
export function expandShorthand(value: string): string {
  // Match patterns like: 1k, 1.5m, 2B (case-insensitive)
  const shorthandRegex = /(\d+\.?\d*)\s*([kmb])/gi;

  return value.replace(shorthandRegex, (match, number, suffix) => {
    const multiplier = {
      'k': '1000',
      'm': '1000000',
      'b': '1000000000'
    }[suffix.toLowerCase()];

    // Use string arithmetic to maintain precision
    const base = parseFloat(number);
    const mult = parseFloat(multiplier);
    return (base * mult).toString();
  });
}
```

**Step 2: Add to Sanitization Pipeline**

File: `packages/core/src/features/sanitization.ts`

```typescript
import { expandCompactNotation } from './compact-notation';

export const sanitizeNumoraInput = (
  value: string,
  options?: SanitizationOptions
): string => {
  let sanitized = filterMobileKeyboardArtifacts(value);
  if (options?.thousandSeparator) {
    sanitized = removeThousandSeparators(sanitized, options.thousandSeparator);
  }
  if (options?.allowCompactNotation) {
    sanitized = expandCompactNotation(sanitized);  // 🆕 Add this
  }
  sanitized = expandScientificNotation(sanitized);
  sanitized = removeNonNumericCharacters(sanitized, options?.allowNegative, options?.decimalSeparator);
  sanitized = removeExtraDecimalSeparators(sanitized, options?.decimalSeparator || DEFAULT_DECIMAL_SEPARATOR);
  if (!options?.allowLeadingZeros) {
    sanitized = removeLeadingZeros(sanitized);
  }
  return sanitized;
};
```

**Step 3: Write Tests**

File: `packages/core/tests/shorthand.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { expandShorthand } from '../src/utils/shorthand';

describe('expandShorthand', () => {
  describe('thousands (k)', () => {
    it('should expand 1k to 1000', () => {
      expect(expandShorthand('1k')).toBe('1000');
    });

    it('should expand 1.5k to 1500', () => {
      expect(expandShorthand('1.5k')).toBe('1500');
    });

    it('should be case-insensitive', () => {
      expect(expandShorthand('1K')).toBe('1000');
    });
  });

  describe('millions (m)', () => {
    it('should expand 1m to 1000000', () => {
      expect(expandShorthand('1m')).toBe('1000000');
    });

    it('should expand 2.5m to 2500000', () => {
      expect(expandShorthand('2.5m')).toBe('2500000');
    });
  });

  describe('billions (b)', () => {
    it('should expand 1b to 1000000000', () => {
      expect(expandShorthand('1b')).toBe('1000000000');
    });
  });

  describe('edge cases', () => {
    it('should handle no shorthand', () => {
      expect(expandShorthand('1234')).toBe('1234');
    });

    it('should handle multiple shorthands', () => {
      expect(expandShorthand('1k and 2m')).toContain('1000');
    });
  });
});
```

**Step 4: Update Documentation**

1. Update `GAP_ANALYSIS.md`:
```markdown
- [x] Shorthand parsing (k, m, b)  ← Change from ❌ to ✅
```

2. Add to exports in `packages/core/src/index.ts`:
```typescript
export * from './utils/shorthand';
```

**Step 5: Run Tests**

```bash
npm test
```

---

## 🧠 Key Concepts

### 1. String-Only Arithmetic

**Why?**

JavaScript's `Number` type uses IEEE 754 floating-point, which has precision issues:

```javascript
// ❌ Problem
0.1 + 0.2 = 0.30000000000000004
1.005 * 100 = 100.49999999999999999

// ✅ Solution (Numora approach)
"0.1" + "0.2" → sanitize → "0.3"  (as strings)
```

**How Numora Does It:**

```typescript
// Never convert to Number during processing
const value = "1.234567890123456789";
const [integer, decimal] = value.split('.');
const trimmed = `${integer}.${decimal.slice(0, 2)}`; // "1.23"
```

---

### 2. Cursor Position Preservation

**The Challenge:**

When you add formatting (commas), the cursor position changes:

```
User types in "1000" (cursor at position 4)
         ↓
Format to "1,000"
         ↓
Where should cursor be? Position 4 lands on comma!
Should be position 5 (after last zero)
```

**The Solution:**

1. **Track "meaningful digits"** (non-separator characters)
2. **Count digits before cursor** in old value
3. **Find same digit count** in new value
4. **Place cursor after that digit**

**Algorithm:**

```typescript
// Example: "100|0" → "1,000|"
// (| shows cursor position)

Step 1: Count meaningful digits before cursor in old value
  "1000" with cursor at 4
  → 4 digits before cursor

Step 2: Format the value
  "1000" → "1,000"

Step 3: Find position for 4 digits in new value
  "1,000" → count digits, skip separators
  1 (pos 0), 0 (pos 2), 0 (pos 3), 0 (pos 4)
  → position after 4th digit = 5

Result: Cursor at position 5 in "1,000"
```

**See:** `features/formatting/cursor-position.ts` for full implementation.

---

### 3. Delete vs Backspace Handling

**The Difference:**

```
Backspace: Deletes character BEFORE cursor, cursor moves LEFT
Delete:    Deletes character AFTER cursor, cursor STAYS

Example with "1,234"

Backspace at position 3: "1,|34" → "1|34" (position 1)
Delete at position 2:    "1,|234" → "1,|34" (position 2)
```

**Detection:**

```typescript
handleOnKeyDownNumoraInput(e: KeyboardEvent) {
  if (e.key === 'Delete') {
    return {
      selectionStart,
      selectionEnd,
      endOffset: 1  // ← Signals Delete key
    };
  }

  if (e.key === 'Backspace') {
    return {
      selectionStart,
      selectionEnd,
      endOffset: 0  // ← Signals Backspace
    };
  }
}
```

---

### 4. Event Flow

**Complete Event Sequence:**

```
1. User presses key
   ↓
2. keydown event fires
   → handleOnKeyDownNumoraInput()
   → Capture caret position
   → Store selectionStart, selectionEnd, endOffset
   ↓
3. beforeinput event fires (value NOT yet changed - still cancelable)
   → handleOnBeforeInputNumoraInput()
   → Compute intended value from the pending edit
   → Sanitize value
   → Format value
   → Calculate new cursor position using stored caret info
   → Return { type: 'handled', formatted, raw, cursorPos }
   ↓
   Caller: preventDefault() + writeValue(el, formatted, cursorPos)
   (setRangeText: no input event)
   ↓
4. User sees formatted value with cursor in correct position
```

---

## 🎨 Common Patterns

### Pattern 1: Adding a Sanitization Step

```typescript
// 1. Create function in utils/
export function yourSanitizer(value: string): string {
  // Your logic here
  return sanitized;
}

// 2. Add to pipeline in sanitization.ts
export const sanitizeNumericInput = (value: string): string => {
  const step1 = expandScientificNotation(value);
  const step2 = yourSanitizer(step1);  // ← Add here
  const step3 = removeNonNumericCharacters(step2);
  return removeExtraDots(step3);
};

// 3. Write tests
// 4. Export from index.ts
```

### Pattern 2: Adding Configuration Options

```typescript
// 1. Extend interface in NumoraInput.ts
interface NumoraInputOptions extends Partial<HTMLInputElement> {
  decimalMaxLength?: number;
  yourNewOption?: YourType;  // ← Add here
}

// 2. Use in constructor
constructor(container: HTMLElement, options: NumoraInputOptions) {
  this.options = { ...options };
  // Access via this.options.yourNewOption
}

// 3. Pass to utilities as needed
```

### Pattern 3: Formatting Algorithm

```typescript
// Always follow this structure for number formatting:

1. Split into integer and decimal parts
   const [integer, decimal] = value.split('.');

2. Process integer part
   const formatted = processInteger(integer);

3. Reassemble
   return decimal ? `${formatted}.${decimal}` : formatted;

4. Preserve trailing decimal point
   if (value.endsWith('.')) return formatted + '.';
```

---

## 🐛 Troubleshooting

### Issue: Cursor Jumps to Wrong Position

**Symptoms:** After typing, cursor moves to unexpected location.

**Probable Causes:**
1. Formatting added/removed separators
2. Change detection failed
3. Digit counting error

**Debug Steps:**
```typescript
// Add logging in event-handlers.ts
console.log('Old value:', oldValue);
console.log('New value:', newValue);
console.log('Old cursor:', oldCursorPosition);
console.log('Calculated cursor:', newCursorPosition);
console.log('Change range:', changeRange);
```

**Fix:** Check `features/formatting/cursor-position.ts` logic.

---

### Issue: Decimal Places Not Enforced

**Symptoms:** Input allows more decimals than `decimalMaxLength`.

**Check:**
1. Is `trimToDecimalMaxLength()` being called?
2. Is `decimalMaxLength` passed correctly?
3. Is there a race condition?

**Debug:**
```typescript
console.log('decimalMaxLength:', decimalMaxLength);
console.log('Value before trim:', value);
console.log('Value after trim:', trimToDecimalMaxLength(value, decimalMaxLength, decimalSeparator));
```

---

### Issue: Scientific Notation Not Expanding

**Symptoms:** "1e-7" stays as "1e-7" instead of "0.0000001".

**Check:**
1. Is `expandScientificNotation()` in the pipeline?
2. Is the regex matching your format?

**Debug:**
```typescript
import { expandScientificNotation } from './utils/scientific-notation';
console.log(expandScientificNotation("1e-7"));  // Should be "0.0000001"
```

---

### Issue: Tests Failing

**Common causes:**

1. **Import paths changed:**
   ```typescript
   // ❌ Old path
   import { formatWithSeparators } from '../src/utils/formatting';

   // ✅ New path (after refactoring)
   import { formatWithSeparators } from '../src/features/formatting/thousand-grouping';
   // OR use re-export
   import { formatWithSeparators } from '../src/features/formatting';
   ```

2. **Expected behavior changed:**
   - Review test expectations
   - Check if refactoring intentionally changed behavior

3. **Missing test data:**
   - Verify test fixtures
   - Check mock data

**Fix:**
```bash
# Run specific test file
npm test -- formatting.test.ts

# Run with verbose output
npm test -- --reporter=verbose

# Update snapshots (if using)
npm test -- -u
```

---

##📚 Additional Resources

- **GAP_ANALYSIS.md** - Feature status and roadmap
- **formatting/README.md** - Detailed formatting module docs
- **packages/core/README.md** - Core package docs
- **Tests** - Best examples of usage

---

## 🤝 Contributing

Ready to contribute? Great!

1. **Pick a feature** from GAP_ANALYSIS.md
2. **Create a branch**: `git checkout -b feature/your-feature`
3. **Follow this guide** to implement
4. **Write tests** (aim for >90% coverage)
5. **Update docs** (GAP_ANALYSIS.md, JSDoc comments)
6. **Submit PR** with clear description

**Questions?** Open an issue or check existing documentation.

---

## 🎓 Learning Path

### Beginner (Week 1)
- [ ] Read this guide
- [ ] Explore file structure
- [ ] Run tests locally
- [ ] Make simple change (add comment, fix typo)

### Intermediate (Week 2-3)
- [ ] Understand data flow
- [ ] Read `sanitization.ts` fully
- [ ] Implement simple feature (e.g., trim leading zeros)
- [ ] Write tests

### Advanced (Week 4+)
- [ ] Master cursor positioning logic
- [ ] Understand formatting module
- [ ] Implement complex feature (e.g., locale support)
- [ ] Refactor for performance

---

**Happy Coding! 🚀**

*Last updated: 2025-01-27*
