import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { GroupingStyle } from '../src/types';
import type { NumoraOptions } from '../src/types';
import {
  makeOptions,
  format,
  significantBefore,
  typeDigit,
  backspace,
  forwardDelete,
} from './caret-harness';

/**
 * P3 — Property-based caret invariants via fast-check, driven through the real `beforeinput`
 * flow. Generated inputs cover ground the enumerated sweeps cannot enumerate; the invariants
 * are the same grouping-agnostic ones as caret.invariants.test.ts.
 *
 * Digits are drawn from 1-9 (no zeros) so every edit stays a pure separator reflow — deleting
 * a digit can never expose a leading zero, and inserts never create one. Leading-zero / sign /
 * expansion normalization is pinned separately in caret.e2e.test.ts.
 */

const isDigit = (c: string) => c >= '0' && c <= '9';
const nonZeroDigits = fc
  .array(fc.integer({ min: 1, max: 9 }), { minLength: 1, maxLength: 16 })
  .map((a) => a.join(''));

const LOCALES: Array<{ name: string; o: NumoraOptions; sep: string }> = [
  { name: 'thousand', o: makeOptions(), sep: ',' },
  { name: 'lakh', o: makeOptions({ groupingStyle: GroupingStyle.Lakh }), sep: ',' },
  { name: 'wan', o: makeOptions({ groupingStyle: GroupingStyle.Wan }), sep: ',' },
  { name: 'european', o: makeOptions({ thousandSeparator: '.', decimalSeparator: ',' }), sep: '.' },
];

const RUNS = { numRuns: 200 };

for (const { name, o, sep } of LOCALES) {
  describe(`caret properties — ${name}`, () => {
    it('caret is always within bounds after inserting any digit at any position', () => {
      fc.assert(
        fc.property(
          nonZeroDigits,
          fc.nat(),
          fc.integer({ min: 0, max: 9 }),
          (raw, posNat, digit) => {
            const v = format(raw, o);
            const pos = posNat % (v.length + 1);
            const r = typeDigit(v, pos, String(digit), o);
            if (!r) return; // rejected → not a caret case
            expect(r.cursorPos).toBeGreaterThanOrEqual(0);
            expect(r.cursorPos).toBeLessThanOrEqual(r.formatted.length);
          }
        ),
        RUNS
      );
    });

    it('inserting a digit lands the caret one significant char past the edit point', () => {
      fc.assert(
        fc.property(
          nonZeroDigits,
          fc.nat(),
          fc.integer({ min: 1, max: 9 }),
          (raw, posNat, digit) => {
            const v = format(raw, o);
            const pos = posNat % (v.length + 1);
            const r = typeDigit(v, pos, String(digit), o);
            if (!r) return;
            expect(significantBefore(r.formatted, r.cursorPos, sep)).toBe(
              significantBefore(v, pos, sep) + 1
            );
          }
        ),
        RUNS
      );
    });

    it('backspacing a digit preserves the surviving significant-char count', () => {
      fc.assert(
        fc.property(nonZeroDigits, fc.nat(), (raw, posNat) => {
          const v = format(raw, o);
          const digitEnds = [];
          for (let i = 1; i <= v.length; i++) if (isDigit(v[i - 1])) digitEnds.push(i);
          const pos = digitEnds[posNat % digitEnds.length];
          const r = backspace(v, pos, o);
          if (!r) return;
          expect(significantBefore(r.formatted, r.cursorPos, sep)).toBe(
            significantBefore(v, pos - 1, sep)
          );
        }),
        RUNS
      );
    });

    it('forward-deleting a digit keeps the caret at the edit point', () => {
      fc.assert(
        fc.property(nonZeroDigits, fc.nat(), (raw, posNat) => {
          const v = format(raw, o);
          const digitStarts = [];
          for (let i = 0; i < v.length; i++) if (isDigit(v[i])) digitStarts.push(i);
          const pos = digitStarts[posNat % digitStarts.length];
          const r = forwardDelete(v, pos, o);
          if (!r) return;
          expect(significantBefore(r.formatted, r.cursorPos, sep)).toBe(
            significantBefore(v, pos, sep)
          );
        }),
        RUNS
      );
    });
  });
}
