import { describe, it, expect } from 'vitest';
import { GroupingStyle } from '../src/types';
import type { FormattingOptions } from '../src/types';
import {
  makeOptions,
  format,
  significantBefore,
  typeDigit,
  backspace,
  forwardDelete,
  selectReplace,
} from './caret-harness';

/**
 * P1 — Parametric caret INVARIANT sweep, driven through the real `beforeinput` flow.
 *
 * Instead of golden caret positions, this asserts the grouping-agnostic invariant that
 * defines correct caret behavior: "the count of significant (non-thousand-separator) chars
 * before the caret is preserved relative to the edit point." Concretely, after typing a digit
 * the caret has exactly one more significant char before it than the edit position did; after
 * deleting a digit it has exactly as many as the surviving position. Plus the universal bound
 * `0 <= caret <= formatted.length`.
 *
 * Values are chosen so the edits are pure separator reflow (no leading-zero / sign / expansion
 * normalization) — those transforms are pinned separately in caret.e2e.test.ts. This is the
 * generalization of test3g across every grouping style, value, position, and edit kind: it is
 * the sweep that catches an off-by-one the enumerated fixtures would miss.
 */

interface Locale {
  name: string;
  o: FormattingOptions;
  sep: string;
  intRaws: string[];
  decRaws: string[]; // only where the decimal char is unambiguous for the harness
}

const LOCALES: Locale[] = [
  {
    name: 'thousand',
    o: makeOptions(),
    sep: ',',
    intRaws: ['5', '99', '1234', '12345', '123456', '1234567890', '999999'],
    decRaws: ['12.5', '1234.5', '1234.56'],
  },
  {
    name: 'lakh',
    o: makeOptions({ groupingStyle: GroupingStyle.Lakh }),
    sep: ',',
    intRaws: ['1234', '12345', '123456', '1234567890', '999999'],
    decRaws: ['1234.56'],
  },
  {
    name: 'wan',
    o: makeOptions({ groupingStyle: GroupingStyle.Wan }),
    sep: ',',
    intRaws: ['1234', '12345', '123456', '1234567890', '999999'],
    decRaws: ['1234.56'],
  },
  {
    name: 'european',
    o: makeOptions({ thousandSeparator: '.', decimalSeparator: ',' }),
    sep: '.',
    intRaws: ['1234', '12345', '123456', '1234567890', '999999'],
    decRaws: [], // European decimals are covered by explicit e2e fixtures
  },
];

const isDigit = (c: string) => c >= '0' && c <= '9';

for (const loc of LOCALES) {
  const { name, o, sep } = loc;
  const values = [...loc.intRaws, ...loc.decRaws].map((raw) => format(raw, o)).filter(Boolean);

  describe(`caret invariants — ${name}`, () => {
    it('insertion: caret rests immediately after the typed digit (+1 significant char)', () => {
      for (const v of values) {
        for (let pos = 0; pos <= v.length; pos++) {
          const r = typeDigit(v, pos, '7', o);
          if (!r) continue; // rejected (e.g. decimal cap) — not a caret case
          const scenario = `${name} type '7' @${pos} "${v}" -> "${r.formatted}"@${r.cursorPos}`;
          expect(r.cursorPos, `${scenario} (bounds lo)`).toBeGreaterThanOrEqual(0);
          expect(r.cursorPos, `${scenario} (bounds hi)`).toBeLessThanOrEqual(r.formatted.length);
          expect(significantBefore(r.formatted, r.cursorPos, sep), scenario).toBe(
            significantBefore(v, pos, sep) + 1
          );
        }
      }
    });

    it('backspace of a digit: caret keeps the surviving significant-char count', () => {
      for (const v of values) {
        for (let pos = 1; pos <= v.length; pos++) {
          if (!isDigit(v[pos - 1])) continue; // skip separators/decimal (structural)
          const r = backspace(v, pos, o);
          if (!r) continue;
          const scenario = `${name} bksp @${pos} "${v}" -> "${r.formatted}"@${r.cursorPos}`;
          expect(r.cursorPos, `${scenario} (bounds hi)`).toBeLessThanOrEqual(r.formatted.length);
          expect(significantBefore(r.formatted, r.cursorPos, sep), scenario).toBe(
            significantBefore(v, pos - 1, sep)
          );
        }
      }
    });

    it('forward-delete of a digit: caret stays at the edit point (significant count preserved)', () => {
      for (const v of values) {
        for (let pos = 0; pos < v.length; pos++) {
          if (!isDigit(v[pos])) continue; // skip separators/decimal (keydown-skip handles those)
          const r = forwardDelete(v, pos, o);
          if (!r) continue;
          const scenario = `${name} del @${pos} "${v}" -> "${r.formatted}"@${r.cursorPos}`;
          expect(r.cursorPos, `${scenario} (bounds hi)`).toBeLessThanOrEqual(r.formatted.length);
          expect(significantBefore(r.formatted, r.cursorPos, sep), scenario).toBe(
            significantBefore(v, pos, sep)
          );
        }
      }
    });

    it('selection-replace with a digit: caret rests after the inserted digit', () => {
      for (const v of values) {
        // replace each single digit
        for (let a = 0; a < v.length; a++) {
          if (!isDigit(v[a])) continue;
          const r = selectReplace(v, a, a + 1, '7', o);
          if (!r) continue;
          const scenario = `${name} selrep[${a},${a + 1}]'7' "${v}" -> "${r.formatted}"@${r.cursorPos}`;
          expect(significantBefore(r.formatted, r.cursorPos, sep), scenario).toBe(
            significantBefore(v, a, sep) + 1
          );
        }
        // select-all replace
        const all = selectReplace(v, 0, v.length, '7', o);
        if (all) {
          expect(significantBefore(all.formatted, all.cursorPos, sep), `${name} selrep-all "${v}"`).toBe(1);
        }
      }
    });
  });
}
