/**
 * Truncates the raw value to `maxLength` characters. Counts every character of the raw
 * (post-sanitization, pre-format) string - digits, decimal separator, and a leading `-`.
 *
 * If truncation would leave a trailing decimal separator or a bare `-`, those are stripped
 * so the result is never a malformed intermediate state purely from the truncation itself.
 */
export function truncateToMaxLength(
  value: string,
  maxLength: number,
  decimalSeparator: string = '.'
): string {
  if (maxLength < 0 || value.length <= maxLength) return value;
  let truncated = value.slice(0, maxLength);
  if (truncated.endsWith(decimalSeparator)) truncated = truncated.slice(0, -1);
  if (truncated === '-') return '';
  return truncated;
}
