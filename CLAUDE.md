# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Numora is a precision-first numeric input library for financial/DeFi apps. All numeric values are manipulated as **strings only** - never converted to `Number` to avoid IEEE 754 floating-point errors.

Two published packages:
- `numora` (`packages/core`) - vanilla TypeScript, zero runtime dependencies
- `numora-react` (`packages/react`) - React component wrapper, depends on `numora` as a peer

`docs/` is a TanStack Start SSR site (Vite + TanStack Router + Tailwind v4) hosted on Netlify.

## Commands

Uses **pnpm** workspaces (`pnpm-workspace.yaml`).

```bash
# From repo root
pnpm build           # Build all packages (core + react)
pnpm test            # Run all package tests
pnpm docs:dev        # Start docs site (http://localhost:3000)
pnpm dev:all         # Build core then watch all packages + docs concurrently

# Per-package (from repo root)
pnpm --filter numora build
pnpm --filter numora test
pnpm --filter numora-react build
pnpm --filter numora-react test

# Run a single test file
pnpm --filter numora test -- formatting.test.ts
pnpm --filter numora-react test -- NumoraInput.test.tsx

# Watch mode
pnpm --filter numora-react test:watch

# Docs linting/formatting (uses Biome)
pnpm --filter docs lint
pnpm --filter docs check
```

Core builds with Vite (`vite build && tsc --emitDeclarationOnly`). React builds with Rollup (`rollup -c`). Tests use Vitest with `jsdom` environment; core also uses `fast-check` for property-based tests.

Path alias `@` maps to `packages/core/src/` in both packages' Vite/Rollup configs.

## Architecture

### Core Package (`packages/core/src/`)

```
NumoraInput.ts           - Vanilla TS class: creates <input>, attaches listeners, public API
index.ts                 - Public exports
config.ts                - Default option values
types.ts                 - FormatOn, ThousandStyle enums; FormattingOptions interface
validation.ts            - Options validation (throws on invalid config)
utils/
  event-handlers.ts      - handleOnBeforeInputNumoraInput, handleOnChangeNumoraInput,
                           handleOnKeyDownNumoraInput, handleOnPasteNumoraInput
  format-utils.ts        - formatInputValue, formatValueForDisplay (entry points for pipeline)
  locale.ts              - applyLocale, getSeparatorsFromLocale
  input-pattern.ts       - getNumoraPattern (HTML pattern attribute)
  escape-reg-exp.ts      - escapeRegExp util
  regex-cache.ts         - regex memoization
features/
  sanitization.ts        - sanitizeNumoraInput pipeline
  decimals.ts            - trimToMaxDecimals, getSeparators
  scientific-notation.ts - expandScientificNotation ("1.5e-7" → "0.00000015")
  compact-notation.ts    - expandCompactNotation ("1k" → "1000")
  leading-zeros.ts       - removeLeadingZeros
  non-numeric-characters.ts
  mobile-keyboard-filtering.ts
  formatting/
    index.ts             - Re-exports + formatWithSeparators, updateCursorPosition, skipOverThousandSeparatorOnDelete
    thousand-grouping.ts - formatWithSeparators (Thousand/Lakh/Wan grouping styles)
    cursor-position.ts   - updateCursorPosition (most complex module - cursor preservation after formatting)
    change-detection.ts  - findChangedRangeFromCaretPositions
    digit-counting.ts    - countMeaningfulDigitsBeforePosition
    cursor-boundary.ts   - skipOverThousandSeparatorOnDelete
    constants.ts         - GROUPING_CONFIG
```

### React Package (`packages/react/src/`)

The React `NumoraInput` component does **not** instantiate the vanilla `NumoraInput` class. It is a `forwardRef` component that directly calls the same core event-handler functions via its own React-aware wrappers in `handlers.ts`.

`index.tsx` exports:
- `NumoraInput` - the React component
- `NumoraInputChangeEvent` / `NumoraHTMLInputElement` - types for the synthetic change event
- Re-exports `FormatOn`, `ThousandStyle`, `FormattingOptions`, `CaretPositionInfo` from `numora`

### Data Flow & Event Architecture

The primary input path goes through `beforeinput`, **not** `input`. This is intentional: `beforeinput` fires before the browser commits the mutation, so `e.preventDefault()` + `setRangeText` can apply a formatted value while preserving the browser's undo/redo history. React's synthetic `onBeforeInput` fires during bubbling (too late for cancellation), so the listener is registered directly on the DOM element with `addEventListener`.

**Typing path:**
1. `keydown` → `handleOnKeyDownNumoraInput` - skips cursor over separators on Delete/Backspace; returns `CaretPositionInfo`
2. `beforeinput` → `handleOnBeforeInputNumoraInput` - computes intended value, calls `formatInputValue`, calls `setRangeText` with formatted result, repositions cursor; calls `onChange` in React
3. A synthetic `input` event is dispatched to keep React's value tracker in sync (controlled components); `isHandledByBeforeInputRef` flag prevents `handleChange` from double-firing `onChange`
4. `handleChange` only processes undo/redo and other browser-native `input` events where the flag is false

**Paste path:** `onPaste` intercepts clipboard data, calls `handleOnPasteNumoraInput`/`handleNumoraOnPaste`, synthesises a change event.

**Blur-mode formatting:** `FormatOn.Blur` adds separators on blur and strips them on focus for editing. `FormatOn.Change` applies separators on every keystroke.

### Key Types and Options

`FormattingOptions` (passed through the call stack to all formatting functions):
- `formatOn`: `FormatOn.Blur` (default) | `FormatOn.Change`
- `thousandSeparator`: string (default `','`)
- `ThousandStyle`: `ThousandStyle.None` (default) | `Thousand` | `Lakh` | `Wan`
- `decimalSeparator`: string (default `'.'`)
- `decimalMinLength`, `enableCompactNotation`, `enableNegative`, `enableLeadingZeros`, `rawValueMode`

`rawValueMode`: when true, `onChange` emits the raw value without separators. In React, `e.target.value` always returns the raw value; `e.target.formattedValue` is the display string with separators.

### Sanitization Pipeline (order matters)

`sanitizeNumoraInput` in `features/sanitization.ts`:
1. Filter mobile keyboard artifacts
2. Remove thousand separators (if configured)
3. Expand compact notation (if `enableCompactNotation`)
4. Expand scientific notation
5. Remove non-numeric characters
6. Remove extra decimal separators
7. Remove leading zeros (if `!enableLeadingZeros`)

### Adding Features

New features in `packages/core/src/features/` should be pure functions with no side effects. Wire them into `sanitization.ts` (for input sanitization) or `utils/format-utils.ts` (for formatting). Export from `packages/core/src/index.ts`. Tests go in `packages/core/tests/`.
