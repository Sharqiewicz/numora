import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { makeOptions, paste, typeDigit, backspace, forwardDelete, selectReplace } from './caret-harness';
import { GroupingStyle } from '../src/types';

/** Renders `formatted` with the caret as `|`, so expectations read like the UI. */
const bar = (r: { formatted: string; cursorPos: number } | null) =>
  r ? r.formatted.slice(0, r.cursorPos) + '|' + r.formatted.slice(r.cursorPos) : 'rejected';

const en = makeOptions();
const de = makeOptions({ thousandSeparator: '.', decimalSeparator: ',' });

describe('caret computed from the edit (non-contiguous changes)', () => {
  it('paste with decimal trim: caret sits after the last pasted char that survived', () => {
    // "1|23" + "1.99999999999" -> 11.99999999 (8 decimals); the old LCP/from-end guess gave 11.999999|99
    expect(bar(paste('123', 1, 1, '1.99999999999', en))).toBe('11.99999999|');
  });
  it('paste with trim into a grouped value keeps the rank of the pasted tail', () => {
    expect(bar(paste('1,234.5', 3, 3, '9.12345678', en))).toBe('129.12345678|');
  });
  it('paste with leading-zero removal', () => {
    expect(bar(paste('1,234', 0, 0, '00012', en))).toBe('12|1,234');
  });
  it('select-and-replace', () => {
    expect(bar(selectReplace('1,234,567', 0, 9, '9', en))).toBe('9|');
    expect(bar(selectReplace('1.234', 0, 3, '9', de))).toBe('9|34');
  });
  it('typed "." is the decimal key in de-DE and the caret follows it', () => {
    expect(bar(typeDigit('1.234', 5, '.', de))).toBe('1.234,|');
  });
  it('de-DE paste: foreign token is read whole, caret counted on the normalized text', () => {
    // "1.234" pasted into an empty-ish spot is grouping; its 1.23 prefix must not read as a decimal
    expect(bar(paste('9', 1, 1, '1.234', de))).toBe('91.234|');
  });
  it('deletion across a separator', () => {
    expect(bar(backspace('1,234', 2, en))).toBe('|234');
    expect(bar(forwardDelete('1,234', 1, en))).toBe('1|34');
  });
  it('sign toggle', () => {
    expect(bar(typeDigit('1,234', 0, '-', makeOptions({ enableNegative: true })))).toBe('-|1,234');
  });
  it('compact expansion', () => {
    expect(bar(typeDigit('1', 1, 'k', makeOptions({ enableCompactNotation: true })))).toBe('1,000|');
  });
  it('a sign typed after "e" re-reads the whole value: caret goes to the end, not to 0', () => {
    // "1e|5" + "-" -> 1e-5 -> 0.00001; the sanitized prefix "1" matches nothing at the start
    expect(bar(typeDigit('1e5', 2, '-', en))).toBe('0.00001|');
  });
  it('lakh and wan grouping', () => {
    expect(bar(typeDigit('1,23,456', 6, '7', makeOptions({ groupingStyle: GroupingStyle.Lakh })))).toBe('12,34,7|56');
  });
});

describe('caret properties with non-contiguous edits', () => {
  const digits = fc.array(fc.integer({ min: 1, max: 9 }), { minLength: 1, maxLength: 12 }).map((a) => a.join(''));
  for (const [name, o, sep, dec] of [['en', en, ',', '.'], ['de', de, '.', ',']] as const) {
    it(`${name}: after a paste the caret is within bounds and never before the pasted survivors' rank floor`, () => {
      fc.assert(
        fc.property(digits, fc.nat(), digits, fc.nat({ max: 14 }), (base, p, clipInt, fracLen) => {
          const v = base;
          const pos = p % (v.length + 1);
          const clip = clipInt + dec + '9'.repeat(fracLen);
          const r = paste(v, pos, pos, clip.replace(',', '.').replace('.', dec), o);
          if (!r) return;
          expect(r.cursorPos).toBeGreaterThanOrEqual(0);
          expect(r.cursorPos).toBeLessThanOrEqual(r.formatted.length);
          // caret is never inside a fraction longer than the cap, and never before the left part's rank
          const left = v.slice(0, pos).length;
          const sig = r.formatted.slice(0, r.cursorPos).split(sep).join('').length;
          expect(sig).toBeGreaterThanOrEqual(Math.min(left, r.formatted.split(sep).join('').length));
        }),
        { numRuns: 200 }
      );
    });
  }
});

import { computeCaretFromEdit, computeCaretAfterRewrite } from '../src/utils/caret';

describe('computeCaretFromEdit / computeCaretAfterRewrite (unit)', () => {
  it('reads the text before the caret as the field would, then selects its rank', () => {
    expect(computeCaretFromEdit('1,23', '1,234', 8, en, true)).toBe(4);
    expect(computeCaretFromEdit('', '1,234', 8, en, true)).toBe(0);
  });
  it('does not re-detect a prefix in isolation (de-DE "1.23" stays grouping text)', () => {
    // display text: "." is grouping in de-DE, so "1.23" is the digits 123
    expect(computeCaretFromEdit('1.23', '1.234', 8, de, true)).toBe(4);
  });
  it('fallback: unfocused goes to the end, focused maps the rank', () => {
    expect(computeCaretAfterRewrite('1234', 2, '1,234', 8, en, false)).toBe(5);
    expect(computeCaretAfterRewrite('1234', 2, '1,234', 8, en, true)).toBe(3);
  });
  it('fallback: a wholesale foreign re-read puts the caret at the end', () => {
    // de-DE field, browser value "1,234.5" (en-US text): detection reads it differently than display
    const v = '1,234.5';
    expect(computeCaretAfterRewrite(v, 3, '1.234,5', 8, de, true)).toBe(7);
  });
});

describe('paste with trim: caret after the last surviving pasted char (properties)', () => {
  const ints = fc.array(fc.integer({ min: 1, max: 9 }), { minLength: 1, maxLength: 10 }).map((a) => a.join(''));
  for (const [name, o, dec] of [['en', en, '.'], ['de', de, ',']] as const) {
    it(`${name}: a pasted fraction longer than the cap leaves the caret at the end`, () => {
      fc.assert(
        fc.property(ints, fc.nat(), ints, fc.integer({ min: 9, max: 16 }), (base, p, head, nines) => {
          const pos = p % (base.length + 1);
          // foreign-format-safe clip: single decimal mark, no grouping
          const r = paste(base, pos, pos, head + dec + '9'.repeat(nines), o);
          expect(r).not.toBeNull();
          // everything right of the paste point is cut by the trim, so the caret ends the value
          expect(r!.cursorPos).toBe(r!.formatted.length);
        }),
        { numRuns: 200 }
      );
    });
  }
});
