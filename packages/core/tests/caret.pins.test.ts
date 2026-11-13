import { describe, it, expect } from 'vitest';
import { GroupingStyle } from '../src/types';
import {
  makeOptions,
  typeDigit,
  selectReplace,
  backspace,
  forwardDelete,
  paste,
} from './caret-harness';

/**
 * P2 — Pins for behaviors that are intentional-but-easy-to-break, plus the thin-spot
 * categories mined from mask-library test suites (separator deletion, selection spanning a
 * separator, paste that changes grouping depth, decimal-part edits, locale variants,
 * rejection paths). Golden values here; the invariant sweeps live in caret.invariants /
 * caret.properties.
 */

const thousand = makeOptions();
const lakh = makeOptions({ groupingStyle: GroupingStyle.Lakh });
const wan = makeOptions({ groupingStyle: GroupingStyle.Wan });
const european = makeOptions({ thousandSeparator: '.', decimalSeparator: ',' });
const negative = makeOptions({ allowNegative: true });
const capped = makeOptions({ maxLength: 4 });

describe('caret pins — Lakh/Wan deletion hug-side (emergent from select)', () => {
  // rank/select hugs the LEFT of a regrouped separator on deletion (vs the old algorithm's
  // right). This is NOT a grouping-style special case: `positionAfterMatchedPrefix` returns the index
  // just after the k-th significant char, and when the next char is an injected separator
  // that index sits between digit and separator. Lakh/Wan only make it visible more often,
  // because their group sizes are irregular. Changing it means changing the select
  // definition for every style at once — pinned so that is a deliberate act.
  it('wan: forward-delete a digit regroups; caret hugs left of the new separator', () => {
    const r = forwardDelete('123,456', 1, wan);
    expect(r?.formatted).toBe('1,3456');
    expect(r?.cursorPos).toBe(1); // "1|,3456"
  });

  it('lakh: forward-delete a digit regroups; caret hugs left of the new separator', () => {
    const r = forwardDelete('1,234,567,890', 3, lakh);
    expect(r?.formatted).toBe('12,45,67,890');
    expect(r?.cursorPos).toBe(2); // "12|,45,67,890"
  });
});

describe('caret pins — deleting the thousand separator itself', () => {
  it('backspace with the caret just after a separator deletes the digit before it', () => {
    // "1,|234" → keydown skips the comma → backspace removes "1" → "234"
    const r = backspace('1,234', 2, thousand);
    expect(r?.formatted).toBe('234');
    expect(r?.cursorPos).toBe(0);
  });

  it('forward-delete with the caret just before a separator deletes the digit after it', () => {
    // "1|,234" → keydown skips the comma → delete removes "2"; caret stays at the delete point
    const r = forwardDelete('1,234', 1, thousand);
    expect(r?.formatted).toBe('134');
    expect(r?.cursorPos).toBe(1); // "1|34"
  });
});

describe('caret pins — selection spanning a separator', () => {
  it('replacing "1,2" (spans the comma) with "9" → "934"', () => {
    const r = selectReplace('1,234', 0, 3, '9', thousand);
    expect(r?.formatted).toBe('934');
    expect(r?.cursorPos).toBe(1); // "9|34"
  });
});

describe('caret pins — paste that changes grouping depth', () => {
  it('appending "000" to "999" pushes to a new group; caret at end', () => {
    const r = paste('999', 3, 3, '000', thousand);
    expect(r?.formatted).toBe('999,000');
    expect(r?.cursorPos).toBe(r?.formatted.length);
  });

  it('mid-string paste that trims the tail leaves the caret after the pasted digits', () => {
    // "1.12345678" is already at DEC_MAX (8) decimals. Pasting "99" after the decimal point
    // pushes the fraction to 10 digits, so the sanitizer drops the last 2. Those 2 chars are
    // removed at the TAIL and must not be subtracted from the caret at the paste point.
    const r = paste('1.12345678', 2, 2, '99', thousand);
    expect(r?.formatted).toBe('1.99123456');
    expect(r?.cursorPos).toBe(4); // "1.99|123456"
  });

  it('paste into the integer part reflows separators without losing the caret', () => {
    const r = paste('1,234', 1, 1, '567', thousand);
    expect(r?.formatted).toBe('1,567,234');
    expect(r?.cursorPos).toBe(5); // "1,567|,234"
  });
});

describe('caret pins — decimal (fraction) part editing', () => {
  it('typing in the fraction keeps the caret after the typed digit', () => {
    const r = typeDigit('1,234.56', 8, '7', thousand); // end of fraction
    expect(r?.formatted).toBe('1,234.567');
    expect(r?.cursorPos).toBe(9);
  });

  it('European: typing in the fraction (decimal ",")', () => {
    const r = typeDigit('1.234,5', 7, '6', european);
    expect(r?.formatted).toBe('1.234,56');
    expect(r?.cursorPos).toBe(8);
  });
});

describe('caret pins — negative sign', () => {
  it('typing a digit at the front of a negative value keeps the sign and lands after the digit', () => {
    const r = typeDigit('-123', 1, '9', negative); // "-|123" → "-9123"
    expect(r?.formatted).toBe('-9,123');
    expect(r?.cursorPos).toBe(2); // "-9|,123"
  });
});

describe('caret pins — rejection paths', () => {
  it('maxLength rejects an over-cap keystroke (no caret change)', () => {
    // "1,234" is already 4 raw digits at maxLength 4 → next digit rejected.
    const r = typeDigit('1,234', 5, '5', capped);
    expect(r).toBeNull();
  });
});
