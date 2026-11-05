import { describe, it, expect } from 'vitest';
import { significantCharRank, positionAfterRank, positionAfterMatchedPrefix } from '../src/features/formatting/rank-select';

/**
 * Unit tests for the two primitives caret preservation is built on. The end-to-end caret
 * behavior lives in caret.{e2e,invariants,pins,properties}; this file pins the primitives
 * themselves. Separators are exactly one character (validation enforces it), so there is no
 * multi-character case.
 */

describe('significantCharRank (rank)', () => {
  it('counts non-separator chars before a position', () => {
    expect(significantCharRank('1,234', 3, ',')).toBe(2);
    expect(significantCharRank('1,234', 0, ',')).toBe(0);
    expect(significantCharRank('1,234', 5, ',')).toBe(4);
  });

  it('counts the decimal separator as significant', () => {
    expect(significantCharRank('1,234.56', 8, ',')).toBe(7);
  });

  it('counts a leading minus as significant', () => {
    expect(significantCharRank('-1,234', 6, ',')).toBe(5);
  });

  it('clamps a position past the end', () => {
    expect(significantCharRank('1,234', 99, ',')).toBe(4);
  });

  it('treats an empty separator as "everything is significant"', () => {
    expect(significantCharRank('1234', 3, '')).toBe(3);
  });
});

describe('positionAfterRank (select)', () => {
  it('returns the index just after the k-th significant char', () => {
    expect(positionAfterRank('1,234', 1, ',')).toBe(1);
    expect(positionAfterRank('1,234', 2, ',')).toBe(3);
    expect(positionAfterRank('1,234', 4, ',')).toBe(5);
  });

  it('returns 0 for rank 0 and clamps an over-large rank to the length', () => {
    expect(positionAfterRank('1,234', 0, ',')).toBe(0);
    expect(positionAfterRank('1,234', 99, ',')).toBe(5);
  });

  it('hugs the left of a separator rather than skipping past it', () => {
    // 1 significant char precedes index 1; index 1 is the separator itself.
    expect(positionAfterRank('1,234', 1, ',')).toBe(1);
  });

  it('round-trips with rank on the same string', () => {
    const v = '1,234,567.89';
    for (let pos = 0; pos <= v.length; pos++) {
      const k = significantCharRank(v, pos, ',');
      expect(significantCharRank(v, positionAfterRank(v, k, ','), ',')).toBe(k);
    }
  });
});

describe('positionAfterMatchedPrefix (fused rank + select)', () => {
  it('equals select(rank(prefix)) when the whole prefix survived', () => {
    expect(positionAfterMatchedPrefix('1,234,567', '12345', ',')).toBe(7); // 1,234,5|67
    expect(positionAfterMatchedPrefix('1,234', '1', ',')).toBe(1);
    expect(positionAfterMatchedPrefix('1,234', '', ',')).toBe(0);
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
