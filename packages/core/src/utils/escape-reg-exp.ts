/**
 * Shared utility functions used across multiple features.
 */

/**
 * Escapes special regex characters in a string.
 * This is used when building regex patterns from user-provided separator characters.
 *
 * @param str - The string to escape
 * @returns The escaped string safe for use in regex patterns
 *
 * @example
 * escapeRegExp(".") // Returns: "\\."
 * escapeRegExp("$") // Returns: "\\$"
 * escapeRegExp("1,234") // Returns: "1\\,234"
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}
