/**
 * Single-pass mantissa scanner shared by the scientific- and compact-notation expanders.
 *
 * Both expanders used to be a single `String.replace` with a mantissa alternation of the
 * form `\d+sep?\d*|sep\d+`. That pattern lets the regex engine split a digit run between
 * `\d+` and `\d*` at every position, so a pasted run of N digits with no matching suffix
 * cost O(N^2) - a few thousand digits froze the main thread for seconds. Computing the
 * digit-run boundary once, deterministically, from the start position is what keeps both
 * scans linear.
 */

export function isDigit(ch: string | undefined): boolean {
  return ch !== undefined && ch >= '0' && ch <= '9';
}

/**
 * Result of a mantissa match: `end` is the index just past the whole mantissa; `sepEnd`
 * is the index just past the FIRST decimal separator consumed while building it, or -1 if
 * the match consumed no separator at all (a plain digit run).
 */
export interface MantissaMatch {
  end: number;
  sepEnd: number;
}

/**
 * Finds the numeric mantissa starting at `start`, mirroring the unambiguous grammar
 * `\d+(?:sep\d*)?|sep\d+`: a digit run optionally extended by one decimal separator and
 * more digits, or a bare leading-decimal (separator then >=1 digit). Returns `null` if no
 * mantissa starts at `start`.
 */
export function matchMantissaAt(
  value: string,
  start: number,
  decimalSeparator: string
): MantissaMatch | null {
  const len = value.length;

  if (isDigit(value[start])) {
    let k = start;
    while (k < len && isDigit(value[k])) k++;

    if (value.startsWith(decimalSeparator, k)) {
      const sepEnd = k + decimalSeparator.length;
      let m = sepEnd;
      while (m < len && isDigit(value[m])) m++;
      return { end: m, sepEnd };
    }
    return { end: k, sepEnd: -1 };
  }

  if (value.startsWith(decimalSeparator, start)) {
    const sepEnd = start + decimalSeparator.length;
    if (isDigit(value[sepEnd])) {
      let m = sepEnd;
      while (m < len && isDigit(value[m])) m++;
      return { end: m, sepEnd };
    }
  }

  return null;
}

/**
 * Callers that found a mantissa with nothing valid after it must decide where to resume.
 * Skipping straight to `match.end` is only safe when the character right after the failed
 * mantissa is NOT itself a decimal separator: a second separator sitting there (e.g. ".0.b",
 * or ".0.5e3") can start a *different* valid mantissa that reuses a digit already scanned.
 * In that case only the span up to (and including) the first separator actually consumed is
 * dead, so the scan re-anchors right after it. This cannot regress to quadratic: each such
 * re-anchor permanently consumes at least one separator character, so it can happen at most
 * once per separator in the string.
 *
 * @returns the index to resume scanning from (the span `[start, index)` is copied verbatim)
 */
export function failedMantissaResumeIndex(
  value: string,
  match: MantissaMatch,
  decimalSeparator: string
): number {
  return match.sepEnd !== -1 && value.startsWith(decimalSeparator, match.end)
    ? match.sepEnd
    : match.end;
}
