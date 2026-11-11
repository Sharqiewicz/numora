# Changelog — `numora`

## Unreleased

See [MIGRATION.md](../../MIGRATION.md) for a v4 to v5 walkthrough.

### Breaking
- **Options renamed:** `enableNegative`, `enableLeadingZeros`, `enableCompactNotation` are now
  `allowNegative`, `allowLeadingZeros`, `allowCompactNotation`; `autoAddLeadingZero` is
  `padLeadingZero`. The type `FormattingOptions` is `NumoraOptions`. Old names are ignored
  and, in development, logged with their replacement, in both packages.
- **`groupingStyle: 'none'` is the only way to turn grouping off.** `thousandSeparator: ''`
  throws.
- **Vanilla `NumoraInput` exposes properties instead of getters:** `input.rawValue`,
  `input.formattedValue`, `input.element`, the same names as a React ref. They are read-only;
  `setValue()` writes. `getValue()`, `getFormattedValue()`,
  `getElement()` and `valueAsNumber` are removed. `setValue(value, { undoable })` stays.
- **Vanilla `defaultValue` is removed:** use `value`. The constructor forwards only a short
  list of native attributes (`id`, `name`, `className`, `placeholder`, `disabled`, `readOnly`,
  `required`, `tabIndex`, `title`, `autofocus`, `ariaLabel`); set anything else on
  `input.element`.
- **The root of `numora` exports only** `NumoraInput`, `FormatOn`, `GroupingStyle`,
  `getSeparatorsFromLocale`, `formatValue`, `parseValue` and the types. The twelve
  sanitization steps (`normalizeDigits`, `expandScientificNotation`, ...) moved unchanged to
  `numora/pipeline`. `sanitizeNumoraInput`, `formatValueForDisplay`, `displayToRawValue`,
  `normalizeNegativeZero`, `applyLocale`, `validateNumoraInputOptions` and `InputType` moved
  to `numora/internal` (no semver guarantee); `numora-react` no longer re-exports `InputType`.
- **`numora-react` depends on `numora` at an exact version** instead of listing it as a peer
  (ADR 0007). The two packages are released together with the same version.
- **React: a blur that only regroups the display no longer fires `onChange` /
  `onValueChange`.** Both packages notify only when the raw value changed (ADR 0008).
- **The raw value is canonical in every locale**: ASCII digits, `.` as the decimal mark, `-`
  as the sign, no grouping. A de-DE field showing `1.234.567,89` reports `1234567.89`, so
  `Number(raw)` and decimal libraries work for every user. String `value`, React `defaultValue` and
  `setValue()` inputs use the same format: `value="1234.5"` means 1234.5 in every locale.
- **Vanilla `onChange` is renamed `onValueChange`** and receives `{ value, formattedValue }`
  instead of a string: the same name and payload as React's `onValueChange`.
- **`emitRawValue` is removed.** Read `value` or `formattedValue` from the payload instead.
- **`ThousandStyle` is renamed `GroupingStyle`, and the `thousandStyle` option `groupingStyle`.**
  The string values (`'none'`, `'thousand'`, `'lakh'`, `'wan'`) are unchanged. An old
  `thousandStyle` option is ignored and the field uses the default (`thousand`), so a v4
  `thousandStyle: 'lakh'`, `'wan'` or `'none'` silently changes grouping: rename it.
  `GroupingStyle` is now a const object plus a string union instead of a TypeScript `enum`.
- **Event handlers and DOM writers are no longer exported from `numora`:**
  `handleOnBeforeInputNumoraInput`, `handleOnPasteNumoraInput`, `writeStripPreservingUndo`,
  `computeStripSeparatorsResult` and `StripSeparatorsResult` are gone;
  `handleOnKeyDownNumoraInput` and `writeValuePreservingUndo` moved to `numora/internal`,
  next to the shared DOM wiring (`applyBeforeInput`, `applyPaste`, `applyInputFallback`,
  `applyBlur`, `attachFocusStrip`). `handleOnKeyDownNumoraInput` now returns nothing, and the
  `CaretPositionInfo` type it returned is removed from `numora` and `numora-react`.
  `numora/internal` exists for `numora-react` and other first-party
  wrappers and has no semver guarantee.
- **`normalizeFullWidthDigits` removed:** use `normalizeDigits`, which it was a deprecated
  alias of.
- **`NumoraInput` methods `disable`, `enable`, `addEventListener` and `removeEventListener`
  removed:** they only forwarded to the element. Use `input.element.disabled` and
  `input.element.addEventListener(...)` instead.
- **`numora-react` re-exports `GroupingStyle`** instead of `ThousandStyle`, and ships a
  `'use client'` directive so Next.js server components can import it directly.
- **`numora-react`: `maxDecimals` is renamed `decimalMaxLength` and its default changes from
  2 to 18; `thousandStyle` is renamed `groupingStyle`; `rawValueMode` is removed**
  (`e.target.value` is always the raw value). The old props are ignored, so a v4
  `maxDecimals={2}` field accepts 18 decimals until it is renamed. In development the
  component logs a warning naming the replacement, and the old props no longer reach the DOM.

### Fixed
- **React: browser-inserted text while focused keeps typing rules** (autofill, drop, IME
  commit): `1.` is no longer padded to `1.00` or stripped to `1` until blur, same as vanilla.
- **Compact notation keeps small decimals:** `0.0001k` gives `0.1` (was `0000.1`) and
  `0.00001k` gives `0.01`.
- **A leading `+` on a scientific-notation mantissa is a sign, not a digit:** `+1e-3` gives
  `0.001` (was `0.01`) and `+1e3` gives `1000`.
- **Comma-decimal locales accept a typed `.` as the decimal key** when the value has no
  decimal yet (numpads and phones emit `.`). Before, de-DE silently dropped it and typing
  `1234567.89` gave 123 456 789. A typed `,` in dot-decimal locales is still rejected.
- **Pasted and browser-inserted numbers are read with foreign-format detection**: when both
  `.` and `,` appear the last one is the decimal; a mark forming valid three-digit groups is
  grouping; anything else is the decimal. Pasting `1.5` into de-DE now gives 1.5 (was 15), and
  `1,234,567.89` gives 1234567.89 (was 1.23456789).
- **Focusing a de-DE field with decimals no longer fires `onChange`** in blur mode.
- **Every `Intl` locale works with `locale`:**
  - bidi and zero-width marks are stripped, so RTL locales keep the minus sign on paste;
  - every contiguous Unicode digit set is folded to ASCII, including astral ones;
  - locales with non-contiguous digits (hanidec) derive separators from Latin digits instead
    of throwing;
  - underscore tags such as `de_DE` (Java, Python, Android) are read as `de-DE` instead of
    silently falling back to en-US separators.
- **`decimalSeparator: ','` on its own no longer throws:** when no thousand separator or
  locale is given, the thousand separator defaults to `.` (`1.234,5`). An explicit conflict
  still throws.
- **The `input` fallback no longer misreads a focused Change-mode field's own grouping as a
  decimal:** an IME commit or drop that left `12,3456` gave `12.3456`; it now gives `123,456`.
  Such a field reads browser-inserted text in its own format; Blur-mode and unfocused fields
  keep foreign-format detection.
- **The field is not rewritten during an IME composition** (`isComposing`); the final
  `input` event formats the committed text.
- **Re-initialising `NumoraInput` on an element after `destroy()` keeps the value:** the
  leftover display text (`1.234,56`) was read as a canonical value (`1.23456`).
- **React: focus is read from the input's own root**, so fields inside a shadow root or an
  iframe keep typing rules while focused.
- **`allowScientificNotation: false` is honoured when a paste completes a token:** pasting
  `e-7` after `1.5` is rejected instead of expanding to `0.00000015`.
- **A malformed token such as `1e3.5` is dropped whole** instead of leaving `.5`.
- **React: changing `locale` or a separator prop repaints a mounted field.** Switching de-DE
  to fr-FR left `1.234.567,89` on screen; an uncontrolled field never repainted at all.

### Added
- **`formatValue(value, options?)` and `parseValue(text, options?)`:** format a canonical raw
  value for display, or read display text back, with no input element
  (`formatValue('1234.5', { locale: 'de-DE', decimalMinLength: 2 })` is `'1.234,50'`). Also
  re-exported from `numora-react`.
- **`update(options)` on vanilla `NumoraInput`:** changes options on a live field. The raw
  value is kept and re-formatted; `onValueChange` fires only if the raw value changed. React does
  the same when formatting props change.
- **The vanilla `options` argument is optional:** `new NumoraInput(target)`.
- **React: `ref.current.rawValue`** reads the canonical raw value next to `formattedValue`.
- **`allowScientificNotation`** option (default `true`, same behaviour as v4). Set it to
  `false` to reject scientific notation typed, pasted or inserted by the user instead of
  expanding it (`1.5e-7` would otherwise become `1.57`): paste and multi-character `beforeinput`
  insertions leave the field unchanged, and the `input` fallback (autofill, drop, IME commit)
  restores the previous value without firing `onChange`. Values the app passes in (`value`,
  React `defaultValue`, `setValue()`) always expand.
- **New types on the root:** `NumoraValues` and `LocaleTag`.
- **Dev-only warning for an invalid `locale`.** `Intl.NumberFormat` rejecting the tag used to
  fall back silently to `,` grouping and `.` decimal; it now logs a `console.warn` naming the
  tag, except when `NODE_ENV` is `production`.

### Changed
- **`numora` and `numora-react` ship minified, without comments, with sourcemaps.** A React
  consumer loads 9.7 KB gzip (was 19.6 KB).
- **Vanilla and React share one DOM event implementation** (`beforeinput`, paste, `input`
  fallback, blur, focus strip), so the two behave the same by construction. Visible effects:
  - vanilla Blur mode with `groupingStyle: 'none'` now settles the value on blur (padding,
    trailing separator strip, `-0` to `0`), as React already did;
  - when scientific notation is rejected in the `input` fallback, the restored value's caret
    goes to the end in both packages.
- **Caret computed from the edit itself.** The new caret rank is the rank of the text left of
  the edit plus the inserted text, sanitized with the same options, selected in the new display
  string (`computeCaretFromEdit`). Replaces the common-prefix / distance-from-end guess and
  fixes edits that change the value in several places, e.g. pasting `1.99999999999` into
  `1|23` with 8 decimals now leaves the caret after the last surviving digit
  (`11.99999999|`, was `11.999999|99`). `computeCursorPosition` is removed (internal).
- **React and vanilla place the caret the same way** for `input` events not handled by
  `beforeinput` (autofill, IME): mapped while focused, end of value while unfocused.
- **No regex is built per keystroke**; the sanitizer uses literal loops (`regex-cache.ts`
  removed). Mapper: 9 µs at 1000 digits, was 15 µs. Run `pnpm bench`.
- **Separators are exactly one character** (already enforced by validation). The standalone
  exports `expandCompactNotation`, `expandScientificNotation`, `removeNonNumericCharacters`
  and `removeExtraDecimalSeparators` now assume it.

### Changed (internal, earlier)
- **Caret engine moved to a rank/select mapping** (anchoring on the separator-free value; O(n)
  instead of the O(n·m) character-equivalence scan). Superseded by `computeCaretFromEdit`
  above. Formatted output was identical in ~700 reachable real-edit scenarios; the caret
  differed only for deletions in `Lakh`/`Wan` grouping, where it now rests left of a regrouped
  separator.

### Removed (internal, not on the public API surface)
- Smaller internals with identical behaviour (checked against the previous build with
  differential fuzzing): one table-driven grouper replaces `formatting/constants.ts`, the
  unused rank/select helpers `significantCharRank` and `positionAfterRank` are gone, the two
  DOM writers share one implementation, and the notation, leading-zero and foreign-format
  features each take a single code path.
- Deleted `features/formatting/cursor-position.ts` (`calculateCursorPositionAfterFormatting`,
  the unreachable digit-counting handlers, and the `_dcCache` memo) — ~600 lines now made
  dead by the rank/select swap. This symbol was exported only from the internal
  `features/formatting` barrel, **not** from the package entry (`src/index.ts`), so consumers
  importing from `numora` are unaffected. Deep imports of
  `numora/.../features/formatting/cursor-position` (undocumented) will break; treat this as a
  major bump only if you relied on such a deep import.

### Notes
- The deleted algorithm's tests (`formatting.cursor.test.ts`) validated a synthetic
  pre-keystroke calling convention the runtime never uses; they were retired in favour of the
  real-flow `caret.e2e.test.ts`.
- `features/formatting/change-detection.ts`, `cursor-boundary.ts` and `digit-counting.ts`
  became runtime-dead and have been deleted along with their tests.
