# numora-react

[![npm version](https://img.shields.io/npm/v/numora-react.svg)](https://www.npmjs.com/package/numora-react)
[![npm downloads](https://img.shields.io/npm/dm/numora-react.svg)](https://www.npmjs.com/package/numora-react)

The React component for [numora](../core/README.md), a numeric input library that keeps every value as a string.

## Install

```bash
npm install numora-react
# or pnpm add numora-react / yarn add numora-react
```

`numora` is installed with it. There is nothing else to add.

## Usage

```tsx
import { NumoraInput } from 'numora-react';

function App() {
  const [amount, setAmount] = useState('');
  return (
    <NumoraInput
      value={amount}
      decimalMaxLength={2}
      onValueChange={({ value }) => setAmount(value)}
    />
  );
}
```

`onValueChange` receives `{ value, formattedValue }`, the canonical raw value and the display
string. `onChange` is the event form of the same notification, for form libraries.

## Features

- [Sanitization](https://numora.xyz/docs/numora-react/features/sanitization) removes non-numeric characters and mobile keyboard artifacts
- [Formatting](https://numora.xyz/docs/numora-react/features/formatting) adds thousand separators in Thousand, Lakh or Wan grouping, on blur or on every keystroke
- [Decimals](https://numora.xyz/docs/numora-react/features/decimals) sets the minimum and maximum decimal places and the decimal separator
- [Compact notation](https://numora.xyz/docs/numora-react/features/compact-notation) is opt-in and expands "1k" → "1000" on paste. A suffix followed by a digit or a decimal separator is not expanded, so "1k5" does not scale the prefix
- [Scientific notation](https://numora.xyz/docs/numora-react/features/scientific-notation) expands "1.5e-7" → "0.00000015" by default; `allowScientificNotation={false}` rejects it
- [Leading zeros](https://numora.xyz/docs/numora-react/features/leading-zeros) are stripped by default, and `allowLeadingZeros` keeps them
- [React Hook Form](https://numora.xyz/docs/numora-react/integrations/react-hook-form) works through the `Controller` pattern
- Ref forwarding, controlled and uncontrolled modes, all standard input props

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `undefined` | Controlled value, as a canonical raw value. The field always shows this value: an edit your handler does not store is put back |
| `defaultValue` | `string` | `undefined` | Initial value of an uncontrolled field, as a canonical raw value |
| `decimalMaxLength` | `number` | `18` | Maximum decimal places allowed (counts digits after the decimal mark only; DeFi-safe default, set to `2` for fiat) |
| `decimalSeparator` | `string` | `'.'` | Decimal separator character |
| `decimalMinLength` | `number` | `0` | Minimum decimal places (pads with zeros) |
| `formatOn` | `'change' \| 'blur'` | `'change'` | When grouping is applied: on every keystroke, or on blur |
| `thousandSeparator` | `string` | `','` | Thousand separator character |
| `groupingStyle` | `'thousand' \| 'lakh' \| 'wan' \| 'none'` | `'thousand'` | Grouping style; `'none'` turns grouping off |
| `allowCompactNotation` | `boolean` | `false` | Expand compact notation ("1k" → "1000") on paste and in `value` |
| `allowScientificNotation` | `boolean` | `true` | Expand scientific notation; when `false`, typed, pasted or inserted scientific notation is rejected (autofill restores the previous value). App values (`value`, `defaultValue`) always expand |
| `allowNegative` | `boolean` | `false` | Allow negative numbers |
| `allowLeadingZeros` | `boolean` | `false` | Allow leading zeros |
| `padLeadingZero` | `boolean` | `false` | Prepend `0` to a bare leading decimal (`.5` → `0.5`) |
| `maxLength` | `number` | `undefined` | Max length of the whole raw value (digits + decimal mark + leading `-`; grouping and `decimalMinLength` padding not counted) |
| `isAllowed` | `(rawValue: string) => boolean` | `undefined` | Reject a keystroke/paste when it returns false (called with the post-sanitization raw value). A callback that throws is treated as "not allowed" (the keystroke is rejected) and the error is reported via `console.error` |
| `locale` | `LocaleTag \| boolean` | `undefined` | Derive separators and grouping from `Intl.NumberFormat`; `true` uses the runtime default locale and `false` is the same as leaving it out. An explicit `thousandSeparator`, `decimalSeparator` or `groupingStyle` wins; `locale` fills the ones you did not set |
| `onValueChange` | `(values: { value: string; formattedValue: string }) => void` | `undefined` | Called when the raw value changes |
| `onFormattedValueChange` | `(formattedValue: string) => void` | `undefined` | Called with the display string every time Numora rewrites the field, including the blur regroup, the focus strip, `ref.setValue()`, a new `value` and a formatting-prop change. Not called on mount |
| `onChange` | `(e: NumoraInputChangeEvent) => void` | `undefined` | Event form, fired alongside `onValueChange`. `e.target.value` is raw; `e.target.formattedValue` is the display string |

All standard `HTMLInputElement` props work except `type`, which is always `'text'`, and `inputMode`, which is always `'decimal'`. `autoComplete="off"` and `spellCheck={false}` are defaults, and a value you pass wins.

Your own `onKeyDown` and `onPaste` run before Numora's handling. Call `e.preventDefault()` in one and Numora skips that key or paste.

Invalid options throw during render in development, for example a separator longer than one character or `decimalMinLength` above `decimalMaxLength`. In a production build (`NODE_ENV === 'production'`) the field does not take the page down: it logs the error with `console.error` and keeps the last valid options, or the defaults if the first render was invalid. Fix the error in development; the production fallback can show a format you did not ask for.

`value` and `defaultValue` are canonical raw values: ASCII digits, `.` decimal, `-` sign, no grouping. Numora never reads them as locale text and never format-detects them. `<NumoraInput locale="de-DE" value="1234.5" />` displays `"1.234,5"`, and `value="1.234"` is the number 1.234, displayed as `"1,234"`. Both props are typed `string`, so a `number` is a type error. At runtime Numora converts a number with `String()` and logs it in development, because a JS number may already have lost precision.

A controlled field always shows its `value` prop. Store the raw value from `onValueChange` (or `e.target.value` in `onChange`) and pass it back, as in the example above, and it round-trips in every locale. If your handler does not store an edit, Numora puts the field back to `value` and the caret moves to the end, the same as a native controlled `<input>`.

Numora does format-detect pasted text, so a pasted `"1.234,56"` is 1234.56 in any locale. It does not detect typed keys.

In `onChange`, `e.target.value` is the raw numeric string and `e.target.formattedValue` is the display string, such as `"1,234.56"`. The raw value is canonical in every locale, so a de-DE display of `1.234.567,89` is raw `1234567.89`. There is no toggle. Both are on every event.

The ref is the DOM input, so `ref.current.value` is the displayed text. `ref.current.rawValue` is the canonical raw value. Do not feed `ref.current.value` back into the `value` prop. Type the ref as `useRef<NumoraHTMLInputElement>(null)`. `rawValue` and `formattedValue` are read-only, read the field's current text, and exist as soon as the ref is set.

`ref.current.setValue('1234.5')` writes a canonical raw value into an uncontrolled field, the same as the vanilla `setValue()`. It is your own write, so it calls neither `onChange` nor `onValueChange` and is not checked by `isAllowed`. The new text still reaches `onFormattedValueChange`. `setValue(value, { undoable: false })` writes without an undo step. A controlled field goes straight back to its `value` prop, so change the prop instead.

| Where | Raw value | Display string |
|-------|-----------|----------------|
| `value` / `defaultValue` props | what you pass in | - |
| `onValueChange(values)` | `values.value` | `values.formattedValue` |
| `onChange(e)` | `e.target.value` | `e.target.formattedValue` |
| `onFormattedValueChange(text)` | - | `text` |
| ref | `ref.current.rawValue`, written with `ref.current.setValue()` | `ref.current.formattedValue` (same as `ref.current.value`) |
| native form submit, `FormData` | - | the input's `name` posts the display string |

**Native form submission posts the display string.** A `<NumoraInput name="amount">` inside a plain `<form>` puts `1,234.56` (or `1.234,56` in de-DE) into `FormData`, not `1234.56`. Either read it back with `parseValue(formData.get('amount'), options)` using the field's options, or leave the visible input without a `name` and mirror the raw value into `<input type="hidden" name="amount" value={amount} />`.

Numora sets no `pattern` attribute. The bare `locale` prop means `true` and reads the runtime's locale, which on the server is the server's locale. Pass an explicit tag such as `locale="de-DE"` for a server-rendered field. In development a server render with `locale={true}` logs a warning.

## Recipes

```tsx
// Fiat amount: two decimals, padded on blur ('5' shows as '5.00')
<NumoraInput decimalMaxLength={2} decimalMinLength={2} />

// Token amount: as many decimals as the token has (USDC 6, ETH 18 is the default)
<NumoraInput decimalMaxLength={6} />

// The user's own locale for separators and grouping
<NumoraInput locale decimalMaxLength={2} />
```

`onChange` and `onValueChange` fire when the raw value changes. A blur that only regroups the display emits nothing. A blur that changes the raw value does: a trailing separator strip, `decimalMinLength` padding, or `-0` to `0`. Changing a formatting prop such as `locale` or `decimalMaxLength` on a mounted field re-formats the current value and follows the same rule.

`onFormattedValueChange` fires when the text in the field changes, whatever the cause, so it also covers the blur regroup, the focus strip and a new locale. Use it to mirror the field, for example in an animated overlay:

```tsx
const [text, setText] = useState(() => formatValue(amount, options)); // mount calls no callback

<NumoraInput {...options} value={amount} onValueChange={({ value }) => setAmount(value)} onFormattedValueChange={setText} />
```

`formatValue`, `parseValue` and `getSeparatorsFromLocale` are re-exported from `numora` for formatting outside an input:

```tsx
import { formatValue } from 'numora-react';

formatValue('1234.5', { locale: 'de-DE', decimalMinLength: 2 }); // '1.234,50'
```

Props removed or renamed since v4 are ignored and, in development, logged with their replacement. See the [migration guide](../../MIGRATION.md).

A `readOnly` or `disabled` input ignores paste, as a native `<input>` does. Numora writes nothing and calls no `onChange`.

## Documentation

Full docs and live demo at [numora.xyz/docs/numora-react](https://numora.xyz/docs/numora-react).

## License

MIT
