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
  return value.replace(/[\s\u200B]/g, '');
}
