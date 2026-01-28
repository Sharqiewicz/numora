/**
 * Regex caching utility for performance optimization.
 * Caches compiled RegExp objects to avoid recompilation on every function call.
 */

import { escapeRegExp } from './escape-reg-exp';

const regexCache = new Map<string, RegExp>();

/**
 * Gets a cached RegExp or creates and caches a new one.
 * Use this for dynamic patterns that depend on user input (e.g., separators).
 *
 * @param pattern - The regex pattern string
 * @param flags - Optional regex flags (default: 'g')
 * @returns A cached RegExp object
 *
 * @example
 * // Instead of: new RegExp(escapeRegExp(separator), 'g')
 * getCachedRegex(escapeRegExp(separator), 'g')
 */
export function getCachedRegex(pattern: string, flags: string = 'g'): RegExp {
  const key = `${pattern}:${flags}`;
  let regex = regexCache.get(key);
  if (!regex) {
    regex = new RegExp(pattern, flags);
    regexCache.set(key, regex);
  }
  return regex;
}

/**
 * Gets a cached RegExp for a separator character.
 * Handles escaping of special regex characters automatically.
 *
 * @param separator - The separator character to match
 * @param flags - Optional regex flags (default: 'g')
 * @returns A cached RegExp object that matches the separator
 *
 * @example
 * getCachedSeparatorRegex(',') // Returns cached /,/g
 * getCachedSeparatorRegex('.') // Returns cached /\./g (escaped)
 */
export function getCachedSeparatorRegex(separator: string, flags: string = 'g'): RegExp {
  const escapedPattern = escapeRegExp(separator);
  return getCachedRegex(escapedPattern, flags);
}

/**
 * Clears the regex cache.
 * Useful for testing or when separator configuration changes significantly.
 */
export function clearRegexCache(): void {
  regexCache.clear();
}

/**
 * Gets the current size of the regex cache.
 * Useful for debugging and monitoring.
 */
export function getRegexCacheSize(): number {
  return regexCache.size;
}
