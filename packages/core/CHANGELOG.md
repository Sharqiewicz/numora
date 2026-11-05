# Changelog — `numora`

## Unreleased

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
