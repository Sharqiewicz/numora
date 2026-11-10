/**
 * Number formatting utilities with thousand separators.
 * Supports multiple grouping styles: thousand (Western), lakh (Indian), wan (Chinese)
 */

import { GroupingStyle } from '../../types';

// [first group, rest groups] sizes counted from the right. `none` (or anything unknown) is ungrouped.
const GROUP_SIZES: Partial<Record<GroupingStyle, [number, number]>> = {
  thousand: [3, 3],
  lakh: [3, 2],
  wan: [4, 4],
};

/**
 * Formats a numeric string with thousand separators based on the specified group style.
 *
 * @param value - The numeric string to format (e.g., "1234567")
 * @param separator - The separator character to use (e.g., ",")
 * @param groupStyle - The grouping style: 'none' (no separators), 'thousand' (1,234,567), 'lakh' (12,34,567), or 'wan' (123,4567)
 * @param decimalSeparator - The decimal separator character (default: '.')
 * @returns The formatted string with separators
 *
 * @example
 * formatWithSeparators("1234567", ",", "thousand") // "1,234,567"
 * formatWithSeparators("1234567", ",", "lakh")     // "12,34,567"
 * formatWithSeparators("1234567", ",", "wan")      // "123,4567"
 * formatWithSeparators("1234.56", ",", "thousand", '.') // "1,234.56"
 * formatWithSeparators("1234,56", ",", "thousand", ',') // "1,234,56"
 */
export function formatWithSeparators(
  value: string,
  separator: string,
  groupStyle: GroupingStyle = GroupingStyle.Thousand,
  decimalSeparator: string = '.'
): string {
  const sign = value.startsWith('-') ? '-' : '';
  const [integerPart, decimalPart = ''] = value.slice(sign.length).split(decimalSeparator);
  const sizes = GROUP_SIZES[groupStyle];

  // Leading zeros are grouped as part of the full integer ("0001234" -> "0,001,234").
  // Everything else ('', '-', '.', '.5', '0') falls out of the same path: an empty or
  // short integer part has no group boundary to mark.
  return (
    sign +
    (sizes ? groupDigitsFromRight(integerPart, separator, sizes[0], sizes[1]) : integerPart) +
    // Keep the decimal separator even when no decimal digits follow.
    (value.includes(decimalSeparator) ? decimalSeparator + decimalPart : '')
  );
}

/**
 * Groups digits right to left: the first (rightmost) group has `firstSize` digits, every
 * further group `restSize`. Thousand 3/3, Lakh 3/2, Wan 4/4.
 *
 * Collected with `push` and reversed once; `unshift` would re-index the whole array per
 * group, making this quadratic in the group count (a pasted 160k-digit value cost ~900ms).
 */
function groupDigitsFromRight(
  integerPart: string,
  separator: string,
  firstSize: number,
  restSize: number
): string {
  const groups: string[] = [];
  let size = firstSize;
  for (let i = integerPart.length; i > 0; i -= size, size = restSize) {
    groups.push(integerPart.slice(Math.max(0, i - size), i));
  }
  return groups.reverse().join(separator);
}
