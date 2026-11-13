import { describe, it, expect } from 'vitest';
import { formatWithSeparators } from '../src/features/formatting';
import { GroupingStyle } from '../src/types';
import { expandScientificNotation } from '../src/features/scientific-notation';
import { expandCompactNotation } from '../src/features/compact-notation';
import { sanitizeNumoraInput } from '../src/features/sanitization';

/**
 * Performance gate for the large-input formatting path.
 *
 * This exists because `groupDigitsFromRight` and `formatLakhStyle` both used
 * `Array.prototype.unshift` in a loop, making grouping quadratic in the group count. A
 * 160k-digit paste took 905ms - enough to lock the main thread on a single keystroke -
 * and shipped undetected: `formatting.bench.ts` had no large-input case and, until
 * recently, no runner at all.
 *
 * These are wall-clock assertions, so they are deliberately loose. The point is to catch
 * a return to quadratic, not to police small constant-factor drift. Reference timings on
 * the fix commit (Node 22, M-series): n=10000 0.3ms, n=40000 0.9ms, n=160000 3.2ms.
 */

// Wall-clock on a shared CI runner is noisy in one direction only: scheduling can make a
// run slower, never faster. Taking the minimum of several runs discards that noise while
// staying sound - a genuinely quadratic implementation cannot get lucky.
function fastestOf(runs: number, fn: () => void): number {
  let best = Infinity;
  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    fn();
    best = Math.min(best, performance.now() - start);
  }
  return best;
}

const digits = (n: number) => '1'.repeat(n);

// ~15x headroom over the 3.2ms reference: tight enough that a return to quadratic (which
// would be ~900ms, ~280x over) fails unmissably, loose enough not to flake.
const CEILING_MS = 50;

describe('⚡ formatting performance gate', () => {
  it.each([GroupingStyle.Thousand, GroupingStyle.Lakh, GroupingStyle.Wan])(
    'should format a 160k-digit value under the ceiling (%s style)',
    (style) => {
      const value = digits(160000);
      const elapsed = fastestOf(3, () => formatWithSeparators(value, ',', style));
      expect(elapsed).toBeLessThan(CEILING_MS);
    }
  );

  it('should scale roughly linearly, not quadratically, with input size', () => {
    const small = fastestOf(5, () =>
      formatWithSeparators(digits(40000), ',', GroupingStyle.Thousand)
    );
    const large = fastestOf(5, () =>
      formatWithSeparators(digits(160000), ',', GroupingStyle.Thousand)
    );

    // 4x the input. Linear predicts ~4x the time; quadratic predicts ~16x. Assert < 8 -
    // above any plausible linear result, below any plausible quadratic one.
    //
    // Guard against divide-by-noise: at these sizes `small` can round to a sub-0.1ms
    // reading, which would inflate the ratio spuriously. Floor the denominator, and only
    // then compare.
    const ratio = large / Math.max(small, 0.05);
    expect(ratio).toBeLessThan(8);
  });

  it('should stay under the ceiling when the value also has a decimal part', () => {
    const value = `${digits(160000)}.123456789012345678`;
    const elapsed = fastestOf(3, () =>
      formatWithSeparators(value, ',', GroupingStyle.Thousand, '.')
    );
    expect(elapsed).toBeLessThan(CEILING_MS);
  });
});

/**
 * Performance gate for scientific/compact notation expansion (audit #01).
 *
 * Both `expandScientificNotation` and `expandCompactNotation` used to build their
 * mantissa regex as `\d+sep?\d*|sep\d+`. The `sep?` (optional, zero-width-capable)
 * followed by an unbounded `\d*` lets the engine re-split the same digit run between
 * the two quantifiers at every position, so a run of N digits with no valid suffix cost
 * O(N^2) in the regex engine. Reference timings on the vulnerable regex (Node 24,
 * M-series, single run): 1,000 digits + "e" ~153ms, 3,000 digits + "e" ~4.4s, 10,000
 * digits + "e" ~158s; compact (opt-in) was worse at the same sizes.
 *
 * The fix replaced the regex-based matching with a single left-to-right scan (see the
 * doc comments in `scientific-notation.ts` / `compact-notation.ts`): a maximal digit run
 * that isn't followed by a valid suffix is skipped in one jump instead of retried at
 * every offset inside it, which is what keeps this linear.
 */
describe('⚡ notation expansion gate', () => {
  const digitsOf = (n: number) => '9'.repeat(n);

  it('should expand a 10,000-digit value with a dangling "e" under the ceiling', () => {
    const elapsed = fastestOf(3, () => expandScientificNotation(digitsOf(10_000) + 'e'));
    expect(elapsed).toBeLessThan(CEILING_MS);
  });

  it('should expand a 10,000-digit value with a valid exponent under the ceiling', () => {
    const elapsed = fastestOf(3, () => expandScientificNotation(digitsOf(10_000) + 'e5'));
    expect(elapsed).toBeLessThan(CEILING_MS);
  });

  it('should expand a 10,000-digit value with a dangling "x" (no suffix) under the ceiling', () => {
    const elapsed = fastestOf(3, () => expandCompactNotation(digitsOf(10_000) + 'x'));
    expect(elapsed).toBeLessThan(CEILING_MS);
  });

  it('should expand a 10,000-digit value with a valid compact suffix under the ceiling', () => {
    const elapsed = fastestOf(3, () => expandCompactNotation(digitsOf(10_000) + 'k'));
    expect(elapsed).toBeLessThan(CEILING_MS);
  });

  it('should sanitize a 50,000-digit paste with compact notation enabled under the ceiling', () => {
    // Exercises the `MAX_INPUT_LENGTH` cap in `sanitizeNumoraInput`: even a paste 5x the
    // cap must not reach the notation-expansion steps with an unbounded string.
    const elapsed = fastestOf(3, () =>
      sanitizeNumoraInput(digitsOf(50_000) + 'e', { allowCompactNotation: true })
    );
    expect(elapsed).toBeLessThan(CEILING_MS);
  });
});
