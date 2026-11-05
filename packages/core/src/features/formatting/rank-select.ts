/**
 * Rank/select over the "significant character" bitvector of a formatted number.
 *
 * ## The primitive
 *
 * A formatted value is the raw value with thousand separators *injected* at group
 * boundaries. Mark every character 1 if it belongs to the raw value and 0 if it is an
 * injected separator; the two operations caret placement needs are the classic ones:
 *
 * - **rank(value, position)** - how many significant characters precede `position`.
 * - **select(value, k)** - the index just after the k-th significant character.
 *
 * Grouping style (Thousand/Lakh/Wan) never enters the computation - it only changes *where*
 * the zeros sit in the bitvector.
 *
 * ## What counts as "significant"
 *
 * Everything that is not an injected thousand separator: digits, the decimal separator, and
 * a leading `-`. The decimal separator is a character of the raw value, so the caret must be
 * able to rest relative to it.
 *
 * ## Separators are exactly one character
 *
 * `validateNumoraInputOptions` rejects any separator that is not a single UTF-16 code unit
 * (an empty thousand separator means "none"), so every function here compares one character
 * at a time. There is no multi-character path.
 *
 * ## Complexity
 *
 * Every operation is a single O(n) pass with O(1) extra space.
 *
 * @module rank-select
 */

/**
 * `rank` - counts significant (non-thousand-separator) characters before `position`.
 *
 * @param value - The formatted string value
 * @param position - The index to count up to (exclusive)
 * @param separator - The thousand separator: one character, or `''` for none
 *
 * @example
 * significantCharRank("1,234", 3, ",")    // 2 - "1" and "2"
 * significantCharRank("1,234.56", 8, ",") // 7 - the decimal separator counts
 */
export function significantCharRank(value: string, position: number, separator: string): number {
  const limit = Math.min(position, value.length);
  let count = 0;
  for (let i = 0; i < limit; i++) {
    if (value[i] !== separator) count++;
  }
  return count;
}

/**
 * `select` - returns the index just after the `targetRank`-th significant character.
 *
 * When the character following that index is an injected separator, the returned index sits
 * between the digit and the separator: the caret hugs the LEFT of a separator rather than
 * jumping past it. Pinned in `caret.pins.test.ts`.
 *
 * @param value - The formatted string value
 * @param targetRank - The number of significant characters that must precede the result
 * @param separator - The thousand separator: one character, or `''` for none
 * @returns The index just after `targetRank` significant characters, clamped to the length
 *
 * @example
 * positionAfterRank("1,234", 3, ",") // 4 - "1,23|4"
 */
export function positionAfterRank(value: string, targetRank: number, separator: string): number {
  if (targetRank <= 0) return 0;
  let count = 0;
  for (let i = 0; i < value.length; i++) {
    if (value[i] === separator) continue;
    if (++count === targetRank) return i + 1;
  }
  return value.length;
}

/**
 * `rank` and `select` fused for the caret mapper: walks `formatted` and `prefix` (the
 * sanitized text that stood before the caret) in step, ignoring thousand separators on both
 * sides, and returns the index just after the last character of `prefix` that is still the
 * start of `formatted`.
 *
 * When the whole prefix survived (the usual case) this is exactly
 * `positionAfterRank(formatted, rank(prefix))`. When a later transform rewrote the start of
 * the value (a leading zero that the full text drops, a trim, an expansion) the walk stops at
 * the first divergence, which is the longest part of the caret's left context that is
 * unchanged. No allocation, no regex.
 */
export function positionAfterMatchedPrefix(
  formatted: string,
  prefix: string,
  separator: string
): number {
  let j = 0;
  let pos = 0;
  for (let i = 0; i < formatted.length; i++) {
    const ch = formatted[i];
    if (ch === separator) continue;
    while (j < prefix.length && prefix[j] === separator) j++;
    if (j >= prefix.length || prefix[j] !== ch) break;
    j++;
    pos = i + 1;
  }
  return pos;
}
