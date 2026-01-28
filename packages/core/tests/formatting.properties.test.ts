/**
 * Property-based tests for formatting functions.
 * Uses fast-check to generate random inputs and verify invariants.
 */
import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { formatWithSeparators, calculateCursorPositionAfterFormatting } from '../src/features/formatting';
import { removeThousandSeparators } from '../src/features/sanitization';
import { expandCompactNotation } from '../src/features/compact-notation';
import { expandScientificNotation } from '../src/features/scientific-notation';
import { ThousandStyle } from '../src/types';

describe('Formatting Properties', () => {
  describe('formatWithSeparators', () => {
    it('should preserve all numeric digits (thousand style)', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[1-9]\d{0,15}$/), // Non-zero numeric strings up to 16 digits
          (numStr) => {
            const formatted = formatWithSeparators(numStr, ',', ThousandStyle.Thousand);
            const digitsIn = numStr.replace(/\D/g, '');
            const digitsOut = formatted.replace(/\D/g, '');
            return digitsIn === digitsOut;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all numeric digits (lakh style)', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[1-9]\d{0,15}$/),
          (numStr) => {
            const formatted = formatWithSeparators(numStr, ',', ThousandStyle.Lakh);
            const digitsIn = numStr.replace(/\D/g, '');
            const digitsOut = formatted.replace(/\D/g, '');
            return digitsIn === digitsOut;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve all numeric digits (wan style)', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[1-9]\d{0,15}$/),
          (numStr) => {
            const formatted = formatWithSeparators(numStr, ',', ThousandStyle.Wan);
            const digitsIn = numStr.replace(/\D/g, '');
            const digitsOut = formatted.replace(/\D/g, '');
            return digitsIn === digitsOut;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle decimal numbers without losing precision', () => {
      fc.assert(
        fc.property(
          fc.tuple(
            fc.stringMatching(/^[1-9]\d{0,10}$/),  // Integer part
            fc.stringMatching(/^\d{1,8}$/)         // Decimal part
          ),
          ([intPart, decPart]) => {
            const numStr = `${intPart}.${decPart}`;
            const formatted = formatWithSeparators(numStr, ',', ThousandStyle.Thousand, false, '.');

            // Extract digits from both parts
            const [formattedInt, formattedDec] = formatted.split('.');
            const digitsInInt = intPart;
            const digitsOutInt = formattedInt.replace(/,/g, '');
            const digitsInDec = decPart;
            const digitsOutDec = formattedDec || '';

            return digitsInInt === digitsOutInt && digitsInDec === digitsOutDec;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should be idempotent when applied twice', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[1-9]\d{0,12}$/),
          (numStr) => {
            const formatted1 = formatWithSeparators(numStr, ',', ThousandStyle.Thousand);
            const unformatted = removeThousandSeparators(formatted1, ',');
            const formatted2 = formatWithSeparators(unformatted, ',', ThousandStyle.Thousand);
            return formatted1 === formatted2;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('removeThousandSeparators', () => {
    it('should be inverse of formatWithSeparators', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[1-9]\d{0,12}$/),
          (numStr) => {
            const formatted = formatWithSeparators(numStr, ',', ThousandStyle.Thousand);
            const unformatted = removeThousandSeparators(formatted, ',');
            return unformatted === numStr;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle different separators correctly', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[1-9]\d{0,12}$/),
          fc.constantFrom('.', ' ', "'"),
          (numStr, separator) => {
            const formatted = formatWithSeparators(numStr, separator, ThousandStyle.Thousand, false, ',');
            const unformatted = removeThousandSeparators(formatted, separator);
            return unformatted === numStr;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('expandCompactNotation', () => {
    it('should expand k suffix correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 999 }),
          (num) => {
            const compact = `${num}k`;
            const expanded = expandCompactNotation(compact);
            const expected = (num * 1000).toString();
            return expanded === expected;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should expand m suffix correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 999 }),
          (num) => {
            const compact = `${num}m`;
            const expanded = expandCompactNotation(compact);
            const expected = (num * 1000000).toString();
            return expanded === expected;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle decimal compact notation', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 99 }),
          fc.integer({ min: 1, max: 9 }),
          (intPart, decPart) => {
            const compact = `${intPart}.${decPart}k`;
            const expanded = expandCompactNotation(compact);
            // Use integer math to avoid floating point precision issues
            const expected = (intPart * 1000 + decPart * 100).toString();
            return expanded === expected;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve non-compact values', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[1-9]\d{0,10}$/),
          (numStr) => {
            const result = expandCompactNotation(numStr);
            return result === numStr;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('expandScientificNotation', () => {
    it('should expand positive exponents correctly', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 9 }),
          fc.integer({ min: 1, max: 10 }),
          (base, exp) => {
            const scientific = `${base}e${exp}`;
            const expanded = expandScientificNotation(scientific);
            const expected = (base * Math.pow(10, exp)).toString();
            return expanded === expected;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve non-scientific values', () => {
      fc.assert(
        fc.property(
          fc.stringMatching(/^[1-9]\d{0,10}$/),
          (numStr) => {
            const result = expandScientificNotation(numStr);
            return result === numStr;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('Cursor Position Properties', () => {
  it('cursor position should always be within bounds', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[1-9]\d{0,10}$/),
        fc.nat(20),
        (numStr, cursorOffset) => {
          const formatted = formatWithSeparators(numStr, ',', ThousandStyle.Thousand);
          const oldCursor = Math.min(cursorOffset, numStr.length);

          const newCursor = calculateCursorPositionAfterFormatting(
            numStr,
            formatted,
            oldCursor,
            ',',
            ThousandStyle.Thousand
          );

          return newCursor >= 0 && newCursor <= formatted.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('cursor at end should stay at end after formatting', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[1-9]\d{0,10}$/),
        (numStr) => {
          const formatted = formatWithSeparators(numStr, ',', ThousandStyle.Thousand);
          const oldCursor = numStr.length;

          const newCursor = calculateCursorPositionAfterFormatting(
            numStr,
            formatted,
            oldCursor,
            ',',
            ThousandStyle.Thousand
          );

          return newCursor === formatted.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('cursor at start should stay at start after formatting', () => {
    fc.assert(
      fc.property(
        fc.stringMatching(/^[1-9]\d{0,10}$/),
        (numStr) => {
          const formatted = formatWithSeparators(numStr, ',', ThousandStyle.Thousand);
          const oldCursor = 0;

          const newCursor = calculateCursorPositionAfterFormatting(
            numStr,
            formatted,
            oldCursor,
            ',',
            ThousandStyle.Thousand
          );

          return newCursor === 0;
        }
      ),
      { numRuns: 100 }
    );
  });
});
