/**
 * Caret mapping over a formatted number: the raw value with thousand separators *injected*
 * at group boundaries. A character is "significant" when it is not an injected separator:
 * digits, the decimal separator and a leading `-`. Grouping style never enters the
 * computation - it only changes where the injected separators sit.
 *
 * Separators are exactly one character (`validateNumoraInputOptions` enforces it; an empty
 * thousand separator means "none"), so every comparison is one character at a time.
 *
 * @module rank-select
 */

/**
 * Walks `formatted` and `prefix` (the sanitized text that stood before the caret) in step,
 * ignoring thousand separators on both sides, and returns the index just after the last
 * character of `prefix` that is still the start of `formatted`.
 *
 * When the whole prefix survived (the usual case) this is the index just after its last
 * significant character. When a later transform rewrote the start of
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
    // Past the end of `prefix`, `prefix[j]` is undefined: not a separator and never equal to `ch`.
    while (prefix[j] === separator) j++;
    if (prefix[j] !== ch) break;
    j++;
    pos = i + 1;
  }
  return pos;
}
