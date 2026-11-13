# Numora Developer Guide

A guide for people who work on Numora itself. For using the library, see the package READMEs and the docs site.

## Contents

1. [What Numora is](#what-numora-is)
2. [Core principles](#core-principles)
3. [Repository layout](#repository-layout)
4. [Entry points](#entry-points)
5. [How a keystroke flows](#how-a-keystroke-flows)
6. [Sanitization and value sources](#sanitization-and-value-sources)
7. [Development setup](#development-setup)
8. [Testing](#testing)
9. [Adding a feature](#adding-a-feature)
10. [Troubleshooting](#troubleshooting)
11. [Further reading](#further-reading)

## What Numora is

Numora is a numeric input for financial apps, where a wrong digit is a real error. It keeps every value as a string, so there are no floating-point errors:

```javascript
0.1 + 0.2 === 0.3  // false (0.30000000000000004)
```

Numora does no arithmetic. It cleans, trims and formats text.

What it does:

- Strips anything that is not part of a number.
- Limits decimals (`decimalMaxLength`, `decimalMinLength`) and total raw length (`maxLength`).
- Groups digits (`groupingStyle`: `thousand`, `lakh`, `wan`, `none`) and keeps the caret where the user expects it.
- Expands scientific notation (`1.5e-7` to `0.00000015`) and, when enabled, compact notation (`1k` to `1000`).
- Reads separators from a `locale`.
- Has no runtime dependencies.

## Core principles

1. **Strings only.** A value is never converted to `Number` while it is being processed.
2. **Two kinds of value.** The raw value is canonical: ASCII digits, `.` as the decimal mark, an optional leading `-`, no grouping, the same in every locale. The display value is what the field shows, in the field's locale. See ADR 0004.
3. **The core has no framework code.** `numora-react` is a thin adapter over the same DOM-event functions.
4. **Behavior changes are recorded.** Decisions that are not obvious from the code live in `docs/adr/`.

## Repository layout

This is a pnpm workspace (`pnpm-workspace.yaml`).

```
packages/core/      numora: the vanilla input (NumoraInput), headless functions, pipeline
packages/react/     numora-react: the React component
docs/               the documentation site
docs/adr/           architecture decision records
scripts/            check-bundle-size.mjs, check-docs-drift.mjs, diff-fuzz.mjs
```

Core source (`packages/core/src/`):

```
index.ts                  public API
pipeline.ts               entry point: the individual sanitization steps
internal.ts               entry point: wiring shared with numora-react (not stable)
NumoraInput.ts            the vanilla class
headless.ts               formatValue, parseValue
config.ts, types.ts, validation.ts
features/
  sanitization.ts         sanitizeNumoraInput, ValueSource
  foreign-format.ts       reads pasted text of unknown format
  decimal-separators.ts, decimals.ts, fullwidth-digits.ts, unicode-minus.ts
  scientific-notation.ts, compact-notation.ts
  non-numeric-characters.ts, leading-zeros.ts, prepend-leading-zero.ts
  max-length.ts, mobile-keyboard-filtering.ts
  formatting/             thousand-grouping.ts, rank-select.ts, caret-position-utils.ts,
                          dom-writes.ts, index.ts
utils/
  event-handlers.ts       pure beforeinput / keydown / paste handlers
  dom-events.ts           apply* functions that run a handler and write the DOM
  caret.ts                caret placement
  format-utils.ts, locale.ts, resolve-options.ts, app-value.ts,
  removed-options.ts, mantissa-scan.ts
```

React source is `packages/react/src/index.tsx` and `use-isomorphic-layout-effect.ts`.

Other files worth knowing: `knip.json` (unused code check), `biome.json` (lint and format), `packages/core/bench/` (benchmarks), `.github/workflows/ci.yml`.

## Entry points

`numora` has three entry points (see `packages/core/package.json`).

| Import | What is in it | Stable? |
| --- | --- | --- |
| `numora` | `NumoraInput`, option types, `GroupingStyle`, `FormatOn`, `getSeparatorsFromLocale`, `formatValue`, `parseValue` | Yes |
| `numora/pipeline` | The individual sanitization steps as pure string functions, for building a custom pipeline | No. No semver guarantee: a step can change or go in a minor version. |
| `numora/internal` | DOM-event and DOM-write primitives that `numora-react` reuses | No. May change in a minor version. Do not use it in app code. |

`numora-react` exports the `NumoraInput` component and re-exports `FormatOn`, `GroupingStyle`, `formatValue`, `parseValue` and `getSeparatorsFromLocale`. It depends on `numora` at an exact version (ADR 0007).

Public option names (shared by the vanilla class and React): `locale`, `formatOn` (default `'change'`), `thousandSeparator`, `decimalSeparator`, `groupingStyle`, `decimalMaxLength`, `decimalMinLength`, `maxLength`, `allowNegative`, `allowLeadingZeros`, `padLeadingZero`, `allowCompactNotation`, `allowScientificNotation`, `isAllowed`. The source of truth is `NumoraOptions` in `packages/core/src/types.ts`.

Vanilla specifics: `defaultValue` for the first value, `setValue()` for later writes, `update(options)` to change options, `rawValue`, `formattedValue`, `element`, `destroy()`. Callbacks are `onValueChange({ value, formattedValue })` and `onFormattedValueChange(formattedValue)`.

`onValueChange` fires only when the raw value changes (ADR 0008). `onFormattedValueChange` fires whenever the display text is rewritten, including a blur regroup and `setValue()` (ADR 0013).

## How a keystroke flows

Numora formats on `beforeinput`, not `input`. The event is still cancelable, so only formatted text is ever shown. `packages/core/INPUT_EVENTS.md` explains each browser event and why.

The handlers in `utils/event-handlers.ts` are pure. They compute a result and change neither the input nor the event:

- `handleOnBeforeInputNumoraInput` returns `handled` (with `formatted`, `raw`, `cursorPos`), `reject` or `skip`.
- `handleOnPasteNumoraInput` returns `handled` or `reject`.
- `handleOnKeyDownNumoraInput` only skips the caret over a thousand separator on Delete and Backspace.

The `apply*` functions in `utils/dom-events.ts` (`applyBeforeInput`, `applyPaste`, `applyInputFallback`, `applyBlur`, `applySetValue`, `attachFocusStrip`) call a handler, then do `preventDefault()` (`applyBeforeInput` and `applyPaste` only) and the DOM write (`writeValue`, which uses `setRangeText`, so no `input` event fires), and return what the caller needs: the values to report, the written string for `applySetValue`, or a detach function for `attachFocusStrip`. `NumoraInput` and the React component both call these and fire the callbacks from their own `emit()`, which keeps the two packages behaving the same.

Edits the browser applies itself (autofill, drop, undo) reach the `input` event. `applyInputFallback` handles them.

The caret keeps no state between events. It is computed from the edit itself (`computeCaretFromEdit` in `utils/caret.ts`): take the text before the caret as it would look after sanitization, count its digits, and select that rank in the formatted string (`features/formatting/rank-select.ts`). When the browser inserts text, `computeCaretAfterRewrite` is used.

Typed `,` and `.` are both decimal keys in every field (ADR 0015).

## Sanitization and value sources

`sanitizeNumoraInput(value, options, source)` in `features/sanitization.ts` runs the whole pipeline. The order matters. In short:

1. Cap the input length and filter mobile-keyboard artifacts (non-breaking spaces).
2. Read the text according to its source (below).
3. Remove thousand separators.
4. Normalize fullwidth digits, Unicode minus signs and decimal-separator glyphs.
5. Expand compact notation (only with `allowCompactNotation`).
6. Expand scientific notation.
7. Remove non-numeric characters, then extra decimal separators.
8. Remove leading zeros (unless `allowLeadingZeros`).
9. Prepend a zero before a bare decimal mark (`padLeadingZero`).
10. Truncate to `maxLength`.

Decimal trimming and grouping happen after this, in `utils/format-utils.ts`. Read the source for the exact order.

### ValueSource

The third argument says where the string came from, because that decides how `.` and `,` are read.

| Source | Meaning | How `.` and `,` are read |
| --- | --- | --- |
| `display` (default) | The field's own text: typing, blur, the DOM value | The field's `thousandSeparator` groups and its `decimalSeparator` is the decimal |
| `foreign` | Text of unknown format: paste, and text the browser inserted (drop, autofill) unless the field is focused and formats on change, where it is read as `display` | Foreign-format detection (ADR 0006) |
| `canonical` | A value the app passes: `value`, `defaultValue`, `setValue()` | `.` is always the decimal, and `,` is read as a decimal mark too (ADR 0004, ADR 0015). Never grouping, never detected. |

Foreign-format rules (ADR 0006): if both `.` and `,` appear, the last one is the decimal mark. If only one kind appears and it repeats, it is grouping. A single mark is the decimal mark when it is the field's own `decimalSeparator`. Otherwise it is grouping when it forms valid groups (three digits, or four for Wan), and the decimal mark when it does not.

The output of `sanitizeNumoraInput` is always display text. The raw value is derived from it with `displayToRawValue`.

### Adding a step to the pipeline

Each step is a pure string function in its own file under `features/`. To add one:

1. Write the function and its tests.
2. Call it from `sanitizeNumoraInput` at the right place in the order.
3. If it should be usable on its own, export it from `pipeline.ts`.
4. If it needs an option, see the next section.

## Development setup

Use pnpm. The version is pinned in the root `package.json` (`packageManager`).

```bash
git clone <repo-url> numora
cd numora
pnpm install
pnpm build
```

Root scripts (run from the repo root):

| Script | What it does |
| --- | --- |
| `pnpm build` | Builds `packages/*`. Build `numora` first when you work on React: `pnpm --filter numora build` |
| `pnpm dev` | Watch builds for the packages |
| `pnpm dev:all` | Builds core, then runs the package watchers and the docs site |
| `pnpm test` | Runs the Vitest suites of both packages |
| `pnpm bench` | Runs the core benchmarks |
| `pnpm typecheck` | `tsc --noEmit` in each package |
| `pnpm lint` | Biome lint of each package's `src`, warnings are errors |
| `pnpm check` | `biome check` for the whole repo |
| `pnpm format` / `pnpm format:check` | Biome format |
| `pnpm size` | Gzip bundle-size budget check. Run it after `pnpm build`. |
| `pnpm docs:drift` | Fails if a gated document names an identifier that was removed or renamed |
| `pnpm knip` | Finds unused files and exports |
| `pnpm docs:dev` / `pnpm docs:build` | Run or build the docs site |
| `pnpm clean` | Removes build output |

CI (`.github/workflows/ci.yml`) runs build, typecheck, test, lint, size, docs:drift and knip. Run the same before opening a PR.

`scripts/diff-fuzz.mjs` compares two builds of core on random inputs. Use it to show a refactor changed no behavior. Its header comment has the usage.

## Testing

Tests use Vitest.

- `packages/core/tests/` tests the core. Roughly: the `NumoraInput` class and event order, each feature in `features/`, the caret (`caret.*.test.ts`, including property tests with fast-check), formatting, locales, security, and regression pins for past bugs.
- `packages/react/tests/` tests the component: the controlled-value contract, event order, locales, SSR, invalid options, and parity with the vanilla class. `pnpm --filter numora-react test` builds core first (`pretest`).
- `packages/core/tests/perf.gate.test.ts` is a performance gate. `packages/core/bench/` holds benchmarks.

Run one package or one file:

```bash
pnpm --filter numora test
pnpm --filter numora exec vitest run tests/decimals.test.ts
```

Test names change often, so look in the directory instead of trusting a list here. When you fix a bug, add a test that fails without the fix.

## Adding a feature

A new option touches several places. Use an existing option such as `padLeadingZero` as a model and follow it with a search.

1. **Type.** Add the option to `NumoraOptions` in `types.ts`, with a doc comment. Both the vanilla class and React take this shape.
2. **Defaults and validation.** Check `config.ts`, `utils/resolve-options.ts` and `validation.ts`.
3. **Logic.** Put the pure string function in `features/`, and call it from the pipeline (above) or from the formatting code in `utils/format-utils.ts`.
4. **Caret.** If the feature changes the text, check the caret tests. The caret is computed from the sanitized text before it, so a new step must be part of the same pipeline.
5. **React.** The component passes options to the same core functions. Check `packages/react/src/index.tsx` and add a parity test.
6. **Option changes.** An option change reformats the live value (ADR 0008).
7. **Tests.** Core unit tests, plus a React test if the option has a prop.
8. **Docs.** Update the package READMEs, the docs site and `MIGRATION.md` if it is a breaking change. Add an ADR for any decision a future reader would question.
9. **Checks.** Run `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck`, `pnpm size`, `pnpm docs:drift` and `pnpm knip`. If the bundle grows past its budget, raise the budget in `scripts/check-bundle-size.mjs` and say why in the comment there.

## Troubleshooting

**The caret jumps.** Look at `utils/caret.ts` and `features/formatting/rank-select.ts`. The caret tests in `packages/core/tests/caret.*.test.ts` show the expected behavior. Reproduce with a test before changing anything.

**Decimals are not limited.** Check that `decimalMaxLength` reaches the pipeline. The default is 18. `maxLength` is applied before decimal trimming and can leave fewer decimals than `decimalMaxLength`.

**Scientific notation is not expanded.** Typed and pasted values are expanded only when `allowScientificNotation` is not `false`. With `false`, such a paste is rejected. Values the app passes are always expanded.

**A pasted number is read wrongly.** Pasted text goes through foreign-format detection (ADR 0006). A lone `.` or `,` in valid groups of three is grouping, not a decimal mark, unless it is the field's own `decimalSeparator`: a default field reads `1,234` as `1234` and `1.234` as `1.234`.

**A value from the app looks wrong.** The app value is read as a canonical raw value (ADR 0004, ADR 0015). In development a warning is logged when a string is not one.

**React tests fail on import.** React tests use the built `numora`. Run `pnpm --filter numora build`.

**`pnpm docs:drift` fails.** A gated document (this guide, the READMEs, `INPUT_EVENTS.md`) uses an identifier that was renamed or removed. The script prints the reason. Fix the document.

## Further reading

- `packages/core/README.md`, `packages/react/README.md`: usage.
- `packages/core/INPUT_EVENTS.md`: browser input events and how Numora uses them.
- `MIGRATION.md`: changes from v4 to v5.
- `docs/adr/`: decisions. Start with 0004 (canonical raw value), 0006 (foreign-format detection), 0008 (option changes), 0011 (`setValue`), 0012 (React controlled contract), 0013 (`onFormattedValueChange`), 0015 (`,` and `.` as decimal keys and marks).
