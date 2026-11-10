# Changelog — `numora`

## Unreleased

### Breaking
- **The raw value is canonical in every locale**: ASCII digits, `.` as the decimal mark, `-`
  as the sign, no grouping. A de-DE field showing `1.234.567,89` reports `1234567.89`, so
  `Number(raw)` and decimal libraries work for every user. String `value`, `defaultValue` and
  `setValue()` inputs use the same format: `value="1234.5"` means 1234.5 in every locale.
- **Vanilla `onChange` receives `{ value, formattedValue }`** instead of a string. `getValue()`
  returns the raw value; use the new `getFormattedValue()` for the display string.
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
  removed:** they only forwarded to the element. Use `getElement().disabled` and
  `getElement().addEventListener(...)` instead.
- **`numora-react` re-exports `GroupingStyle`** instead of `ThousandStyle`, and ships a
  `'use client'` directive so Next.js server components can import it directly.

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

### Added
- **`enableScientificNotation`** option (default `true`, same behaviour as v4). Set it to
  `false` to reject scientific notation typed, pasted or inserted by the user instead of
  expanding it (`1.5e-7` would otherwise become `1.57`): paste and multi-character `beforeinput`
  insertions leave the field unchanged, and the `input` fallback (autofill, drop, IME commit)
  restores the previous value without firing `onChange`. Values the app passes in (`value`,
  `defaultValue`, `setValue()`) always expand.
- **New root exports:** `normalizeForeignFormat`, `normalizeDigits`, `normalizeUnicodeMinus`,
  `displayToRawValue`, `normalizeNegativeZero` and the types `NumoraValues`, `ValueSource` and
  `LocaleTag`.
- **Dev-only warning for an invalid `locale`.** `Intl.NumberFormat` rejecting the tag used to
  fall back silently to `,` grouping and `.` decimal; it now logs a `console.warn` naming the
  tag, except when `NODE_ENV` is `production`.

### Changed
- **`numora` and `numora-react` ship minified, without comments, with sourcemaps.** A React
  consumer loads 10.0 KB gzip (was 19.6 KB).
- **Vanilla and React share one DOM event implementation** (`beforeinput`, paste, `input`
  fallback, blur, focus strip), so the two behave the same by construction. Visible effects:
  - vanilla Blur mode with `thousandSeparator: ''` now settles the value on blur (padding,
    trailing separator strip, `-0` to `0`), as React already did;
  - when scientific notation is rejected in the `input` fallback, the restored value's caret
    goes to the end in both packages.
  - Blur `onChange` still differs on purpose: vanilla fires only when the raw value changed,
    React also fires when only the display changed, so mirrors of `formattedValue` stay in
    sync.
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
