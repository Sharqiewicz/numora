/**
 * Rank/select over the "significant character" bitvector of a formatted number.
 *
 * ## The primitive
 *
 * A formatted value is the raw value with thousand separators *injected* at group
 * boundaries. Mark every character with 1 if it belongs to the raw value and 0 if it is an
 * injected separator, and the pair of operations that caret preservation needs are the two
 * classic ones over that bitvector:
 *
 * - **rank(value, position)** — how many significant characters precede `position`.
 * - **select(value, k)** — the index just after the k-th significant character.
 *
 * Caret preservation through a re-format is then the composition `select(new, rank(old, caret))`:
 * the caret keeps the same number of raw characters in front of it, wherever the separators
 * end up. Grouping style (Thousand/Lakh/Wan) never enters the computation — it only changes
 * *where* the zeros sit in the bitvector, which both operations already handle.
 *
 * ## What counts as "significant"
 *
 * Everything that is not an injected thousand separator: digits, the decimal separator, and a
 * leading `-`. The decimal separator is deliberately significant — it is a character of the
 * raw value, so the caret must be able to rest relative to it. (An earlier version of this
 * module was named for "meaningful digits" and its comments claimed the decimal separator was
 * skipped; the code always counted it, and counting it is correct.)
 *
 * ## Complexity
 *
 * Both operations are a single O(n) pass with O(1) extra space. Values here are bounded by
 * `decimalMaxLength` plus a handful of integer digits, so n < ~40 and a precomputed prefix-sum
 * array (O(1) rank, O(log n) select) would cost more to build than it saves.
 *
 * @module rank-select
 */

/**
 * `rank` — counts significant (non-thousand-separator) characters before `position`.
 *
 * Multi-character separators are matched as a unit, so the whole separator is skipped rather
 * than each of its code units being counted as significant.
 *
 * @param value - The formatted string value
 * @param position - The index to count up to (exclusive)
 * @param separator - The thousand separator (may be empty, or more than one character)
 * @returns The count of significant characters before `position`
 *
 * @example
 * significantCharRank("1,234", 3, ",")    // 2 — "1" and "2"
 * significantCharRank("1,234.56", 8, ",") // 7 — the decimal separator counts
 */
export function significantCharRank(value: string, position: number, separator: string): number {
  const limit = Math.min(position, value.length);
  const sepLength = separator.length;
  let count = 0;
  let i = 0;
  while (i < limit) {
    if (sepLength > 0 && value.startsWith(separator, i)) {
      i += sepLength;
      continue;
    }
    count++;
    i++;
  }
  return count;
}

/**
 * `select` — returns the index just after the `targetRank`-th significant character.
 *
 * When the character following that index is an injected separator, the returned index sits
 * between the digit and the separator: the caret hugs the LEFT of a separator rather than
 * jumping past it. That is what makes deletion under an irregular grouping style (Lakh/Wan)
 * land predictably; it is a consequence of this definition, not a per-style special case.
 * Pinned in `caret.pins.test.ts`.
 *
 * @param value - The formatted string value
 * @param targetRank - The number of significant characters that must precede the result
 * @param separator - The thousand separator (may be empty, or more than one character)
 * @returns The index just after `targetRank` significant characters, clamped to the length
 *
 * @example
 * positionAfterRank("1,234", 3, ",") // 4 — "1,23|4"
 */
export function positionAfterRank(value: string, targetRank: number, separator: string): number {
  if (targetRank <= 0) return 0;

  const sepLength = separator.length;
  let count = 0;
  let i = 0;
  while (i < value.length) {
    if (sepLength > 0 && value.startsWith(separator, i)) {
      i += sepLength;
      continue;
    }
    count++;
    i++;
    if (count === targetRank) return i;
  }
  return value.length;
}
