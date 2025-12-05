# Caret Position Logic Analysis: Reference vs Our Implementation

## Executive Summary

After analyzing the reference implementation (react-number-format) and comparing it with our current implementation, I've identified several key differences and opportunities for improvement. The reference uses a **character mapping approach** while we use a **digit counting approach**. Both have merits, but the reference implementation handles edge cases more robustly.

## Key Differences

### 1. **Core Algorithm: Character Mapping vs Digit Counting**

#### Reference Implementation (Character Mapping)
- **Approach**: Maps characters from `currentValue` → `formattedValue` using character-by-character comparison
- **Method**: `getCaretPosition()` creates an index map, then finds closest mapped characters on left/right of cursor
- **Advantages**:
  - Handles character transformations (e.g., `,` → `.` for decimal separator)
  - Works with `isCharacterSame` callback for equivalent characters
  - More robust for complex formatting scenarios
  - Better handles prefix/suffix scenarios

#### Our Implementation (Digit Counting)
- **Approach**: Counts meaningful digits and maps digit indices to positions
- **Method**: `calculateCursorPositionAfterFormatting()` counts digits before cursor, then finds position with same digit count
- **Advantages**:
  - Simpler mental model
  - More efficient for simple cases
  - Easier to understand and maintain
- **Disadvantages**:
  - Less robust for character transformations
  - Doesn't handle equivalent characters (e.g., allowed decimal separators) as elegantly

### 2. **Character Equivalence Handling**

#### Reference: `isCharacterSame` Callback
```typescript
// Handles cases where user types ',' but formatted value has '.'
if (
  currentValueIndex >= to.start &&
  currentValueIndex < to.end &&
  allowedDecimalSeparators?.includes(curChar) &&
  newChar === decimalSeparator
) {
  return true; // Consider them equivalent
}
```

**Our Gap**: We don't have equivalent character handling. When user types `,` and it gets normalized to `.`, our cursor calculation might not account for this properly.

### 3. **Caret Boundary System**

#### Reference: `getCaretBoundary()` + `getCaretPosInBoundary()`
- Defines which positions are editable (boolean array)
- Prevents cursor from being placed in prefix/suffix/format characters
- Used for arrow key navigation and click positioning

**Our Gap**: We don't have a caret boundary system. This could cause issues if we add prefix/suffix support in the future.

### 4. **Mobile/Cross-Browser Handling**

#### Reference: `setPatchedCaretPosition()`
```typescript
setCaretPosition(el, caretPos); // Immediate
setTimeout(() => {
  if (el.value === currentValue && el.selectionStart !== caretPos) {
    setCaretPosition(el, caretPos); // Retry for mobile Chrome
  }
}, 0);
```

**Our Gap**: We set cursor position directly without retry mechanism for mobile browsers.

### 5. **Input Value Tracking**

#### Reference: Uses `curValue` (raw input) vs `formattedValue`
- Tracks both the raw input value and formatted value
- Uses raw input for character mapping, which is more accurate

**Our Gap**: We primarily work with formatted values, which can cause issues when characters are transformed.

### 6. **Change Detection Priority**

#### Reference: `findChangedRangeFromCaretPositions` → `findChangeRange`
- Prioritizes caret position-based detection (more accurate)
- Falls back to string comparison only when needed

**Our Implementation**: We use both but may not prioritize caret-based detection consistently.

## Recommended Improvements

### Priority 1: High Impact, Medium Effort

#### 1.1 Add Character Equivalence Handling
**File**: `src/utils/formatting/cursor-position.ts`

Add support for equivalent characters (e.g., `,` and `.` when both are allowed decimal separators):

```typescript
interface CursorPositionOptions {
  // ... existing options
  isCharacterEquivalent?: (char1: string, char2: string, context: {
    oldValue: string;
    newValue: string;
    typedRange: ChangeRange;
  }) => boolean;
}
```

**Benefit**: Fixes cursor jumping when user types allowed decimal separator that gets normalized.

#### 1.2 Improve Mobile Browser Support
**File**: `src/utils/event-handlers.ts`

Add retry mechanism for setting cursor position:

```typescript
function setCaretPositionWithRetry(
  el: HTMLInputElement,
  caretPos: number,
  currentValue: string
) {
  el.setSelectionRange(caretPos, caretPos);
  
  // Retry for mobile Chrome
  setTimeout(() => {
    if (el.value === currentValue && el.selectionStart !== caretPos) {
      el.setSelectionRange(caretPos, caretPos);
    }
  }, 0);
}
```

**Benefit**: Fixes cursor position issues on mobile browsers.

### Priority 2: Medium Impact, High Effort

#### 2.1 Implement Caret Boundary System
**Files**: 
- `src/utils/formatting/cursor-boundary.ts` (new)
- `src/utils/formatting/cursor-position.ts`

Create a boundary system to define editable positions:

```typescript
export function getCaretBoundary(
  formattedValue: string,
  options: {
    thousandSeparator?: string;
    decimalSeparator?: string;
  }
): boolean[] {
  // Return array where true = editable position
}
```

**Benefit**: Better handling of arrow keys, clicks, and future prefix/suffix support.

#### 2.2 Track Raw Input Value
**File**: `src/utils/event-handlers.ts`

Track both raw input and formatted value for more accurate cursor calculation:

```typescript
interface InputState {
  rawValue: string;      // What user actually typed
  formattedValue: string; // After formatting
}
```

**Benefit**: More accurate cursor positioning when characters are transformed.

### Priority 3: Low Impact, Consider for Future

#### 3.1 Hybrid Approach
Consider combining both approaches:
- Use digit counting for simple cases (faster)
- Fall back to character mapping for complex transformations

#### 3.2 Add Comprehensive Edge Case Tests
Test scenarios:
- Typing allowed decimal separator that gets normalized
- Rapid typing/deletion
- Copy-paste operations
- Mobile keyboard behavior
- Arrow key navigation through separators

## Implementation Strategy

### Phase 1: Quick Wins (1-2 days)
1. Add character equivalence handling for decimal separators
2. Add mobile browser retry mechanism
3. Improve change detection prioritization

### Phase 2: Foundation (3-5 days)
1. Implement caret boundary system
2. Track raw input value
3. Refactor cursor calculation to use both raw and formatted values

### Phase 3: Polish (2-3 days)
1. Add comprehensive edge case tests
2. Optimize performance
3. Document behavior

## Code Quality Observations

### What We're Doing Well
✅ Clean separation of concerns (digit-counting, cursor-position, change-detection)
✅ Good TypeScript typing
✅ Well-documented functions
✅ Handles decimal separator configuration

### Areas for Improvement
⚠️ Missing character equivalence handling
⚠️ No mobile browser workarounds
⚠️ No caret boundary system
⚠️ Limited edge case coverage

## Conclusion

Our digit-counting approach is solid and works well for most cases. However, the reference implementation's character mapping approach handles edge cases more robustly, especially:
- Character transformations (normalization)
- Equivalent characters
- Mobile browser quirks
- Complex formatting scenarios

**Recommendation**: Implement Priority 1 improvements first (character equivalence + mobile support), then evaluate if Priority 2 is needed based on user feedback and edge cases encountered.

