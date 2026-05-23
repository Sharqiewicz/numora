/**
 * Normalizes fullwidth digits (U+FF10–U+FF19) to ASCII digits (0–9).
 * Japanese and Chinese IME keyboards commonly input fullwidth digits
 * that look identical to ASCII digits but are stripped by numeric filtering.
 */

/**
 * @param value - Input value potentially containing fullwidth digits
 * @returns Value with fullwidth digits converted to ASCII
 *
 * @example
 * normalizeFullWidthDigits("１２３") // Returns: "123"
 */
export function normalizeFullWidthDigits(value: string): string {
  return value.replace(/[\uFF10-\uFF19]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) - 0xFEE0)
  );
}
