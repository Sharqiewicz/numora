import { describe, it, expect } from 'vitest';
import { positionAfterMatchedPrefix } from '../src/features/formatting/rank-select';

/**
 * Unit tests for the primitive caret preservation is built on. The end-to-end caret
 * behavior lives in caret.{e2e,invariants,pins,properties}; this file pins the primitives
 * themselves. Separators are exactly one character (validation enforces it), so there is no
 * multi-character case.
 */

describe('positionAfterMatchedPrefix', () => {
  it('lands after the last significant prefix character when the whole prefix survived', () => {
    expect(positionAfterMatchedPrefix('1,234,567', '12345', ',')).toBe(7); // 1,234,5|67
    expect(positionAfterMatchedPrefix('1,234', '1', ',')).toBe(1);
    expect(positionAfterMatchedPrefix('1,234', '', ',')).toBe(0);
  });

  it('skips separators that sit inside the prefix too', () => {
    expect(positionAfterMatchedPrefix('1,234', '1,2', ',')).toBe(3); // 1,2|34
  });

  it('stops at the first divergence when the value was rewritten', () => {
    // the full text dropped a leading zero the prefix still had
    expect(positionAfterMatchedPrefix('5', '0', ',')).toBe(0);
    expect(positionAfterMatchedPrefix('12.5', '12.9', ',')).toBe(3);
  });

  it('never runs past the formatted value', () => {
    expect(positionAfterMatchedPrefix('1,234', '123456', ',')).toBe(5);
  });
});
