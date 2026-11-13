/**
 * Mobile keyboard artifact filtering utilities.
 * Handles filtering of unwanted characters that mobile keyboards insert,
 * such as non-breaking spaces, Unicode whitespace variants, and IME formatting characters.
 */

/**
 * Filters mobile keyboard artifacts from input value.
 * Removes non-breaking spaces, zero-width spaces, and other Unicode whitespace variants
 * that mobile keyboards may insert.
 *
 * @param value - Input value to filter
 * @returns Filtered value with mobile keyboard artifacts removed
 *
 * @example
 * filterMobileKeyboardArtifacts("1\u00A0234") // Returns: "1234" (removes non-breaking space)
 * filterMobileKeyboardArtifacts("1 234") // Returns: "1234" (removes regular space)
 */
export function filterMobileKeyboardArtifacts(value: string): string {
  // Also strips bidi control marks (LRM U+200E, RLM U+200F, ALM U+061C, embeddings/overrides
  // U+202A-202E, isolates U+2066-2069) and joiners (ZWNJ U+200C, ZWJ U+200D, word joiner U+2060,
  // emitted by Persian and other IME keyboards). RTL locales (ar-*, he, ur, fa...) emit them around the
  // sign, e.g. U+200E "-1,234.5"; left in place they hide the leading minus from sign detection.
  return value.replace(/[\s\u200B-\u200F\u2060\u061C\u202A-\u202E\u2066-\u2069]/g, '');
}
