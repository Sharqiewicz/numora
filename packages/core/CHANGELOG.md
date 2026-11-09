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
- **Event handlers and DOM writers moved from `numora` to `numora/internal`:**
  `handleOnBeforeInputNumoraInput`, `handleOnPasteNumoraInput`, `handleOnKeyDownNumoraInput`,
  `writeValuePreservingUndo`, `writeStripPreservingUndo`, `computeStripSeparatorsResult` and
  `StripSeparatorsResult`. `numora/internal` exists for `numora-react` and other first-party
  wrappers and has no semver guarantee.
- **`numora-react` re-exports `GroupingStyle`** instead of `ThousandStyle`, and ships a
  `'use client'` directive so Next.js server components can import it directly.

### Fixed
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
  `false` to reject pasted scientific notation instead of expanding it; the field is left
  unchanged rather than dropping the `e` (`1.5e-7` would otherwise become `1.57`). Values
  the app passes in (`value`, `defaultValue`, `setValue()`) always expand.
- **Dev-only warning for an invalid `locale`.** `Intl.NumberFormat` rejecting the tag used to
  fall back silently to `,` grouping and `.` decimal; it now logs a `console.warn` naming the
  tag, except when `NODE_ENV` is `production`.

### Changed
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
- **Caret engine simplified to the standard rank/select mapping.** `computeCursorPosition`
  now preserves the caret by anchoring on the separator-free ("raw") value: it maps the
  caret's raw index from the old value to the new one, then re-finds that position (select).
  This is the canonical masking-library technique (text-mask / imask / maskito). Two linear
  passes, O(n), replacing the previous O(n·m) character-equivalence scan. The raw→raw mapping
  uses rank (index-from-start) for pure separator reflow and for value-normalizing changes
  that occur after the caret (e.g. decimal trim); it switches to distance-from-end when the
  change occurs before the caret (leading-zero add/remove, sign, compact/scientific expansion).
- **Behavior:** verified against a full old-vs-new differential over the real `beforeinput`
  flow (~700 reachable real-edit scenarios). Formatted output is identical in every case. The
  caret is identical except for **deletions in `Lakh`/`Wan` grouping**, where the caret now
  rests on the left side of a regrouped thousand separator instead of the right (both are
  valid positions; this matches the hug-left convention used elsewhere). Thousand grouping,
  decimals, negatives, leading zeros, and compact expansion are caret-identical to before.

### Removed (internal, not on the public API surface)
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
  real-flow `caret.e2e.test.ts`. See `plans/README.md` (Plan 008) and `june_audit.md` for the
  full rationale.
- `features/formatting/change-detection.ts` and `cursor-boundary.ts` became runtime-dead as a
  side effect and are candidate follow-up removals (kept for now; each still carries its own
  test suite, and `getCaretPosInBoundary` may serve future prefix/suffix caret work).
