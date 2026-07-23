import { describe, it, expect } from 'vitest';
import {
  significantCharRank,
  positionAfterRank,
} from '../src/features/formatting/rank-select';

/**
 * Unit tests for the two primitives caret preservation is built on. The end-to-end caret
 * behavior lives in caret.{e2e,invariants,pins,properties}; this file pins the primitives
 * themselves, including the multi-character separator case that the old
 * `char !== separator` comparison silently got wrong.
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

describe('multi-character separators', () => {
  // Not reachable through the validated NumoraInput/React constructor (validation.ts forces
  // single-char separators), but these are pure exported utilities and must not drift.
  const sep = ', ';

  it('rank skips the whole separator, not one code unit of it', () => {
    // "1, 234" — before index 6, the significant chars are "1","2","3","4".
    expect(significantCharRank('1, 234', 6, sep)).toBe(4);
  });

  it('select accounts for the separator width', () => {
    expect(positionAfterRank('1, 234', 1, sep)).toBe(1);
    expect(positionAfterRank('1, 234', 2, sep)).toBe(4); // "1, 2|34"
    expect(positionAfterRank('1, 234', 4, sep)).toBe(6);
  });

  it('rank/select stay consistent across a multi-char-separated value', () => {
    const v = '1, 234, 567';
    for (let pos = 0; pos <= v.length; pos++) {
      const k = significantCharRank(v, pos, sep);
      expect(significantCharRank(v, positionAfterRank(v, k, sep), sep)).toBe(k);
    }
  });
});
