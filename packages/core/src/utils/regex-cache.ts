/**
 * Regex caching utility for performance optimization.
 * Caches compiled RegExp objects to avoid recompilation on every function call.
 */

const regexCache = new Map<string, RegExp>();

/**
 * Gets a cached RegExp or creates and caches a new one.
 * Use this for dynamic patterns that depend on user input (e.g., separators).
 *
 * @param pattern - The regex pattern string
 * @param flags - Optional regex flags (default: 'g')
 * @returns A cached RegExp object
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
