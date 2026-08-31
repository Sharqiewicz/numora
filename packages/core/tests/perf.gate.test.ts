import { describe, it, expect } from 'vitest';
import { formatWithSeparators } from '../src/features/formatting';
import { GroupingStyle } from '../src/types';

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
    const small = fastestOf(5, () => formatWithSeparators(digits(40000), ',', GroupingStyle.Thousand));
    const large = fastestOf(5, () => formatWithSeparators(digits(160000), ',', GroupingStyle.Thousand));

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
    const elapsed = fastestOf(3, () => formatWithSeparators(value, ',', GroupingStyle.Thousand, false, '.'));
    expect(elapsed).toBeLessThan(CEILING_MS);
  });
});
