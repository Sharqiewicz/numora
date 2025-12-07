/**
 * Expands compact notation (k, m, b) to full numbers using string manipulation.
 * Handles formats like: 1k, 1.5m, 2B (case-insensitive)
 *
 * @param value - The string value that may contain compact notation
 * @returns The expanded numeric string
 *
 * @example
 * expandCompactNotation("1k")     // "1000"
 * expandCompactNotation("1.5m")   // "1500000"
 * expandCompactNotation("2B")     // "2000000000"
 * expandCompactNotation("0.5k")   // "500"
 */
export function expandCompactNotation(value: string): string {
  // Match patterns: number followed by k/m/b (case-insensitive)
  // Regex: (\d+\.?\d*) captures the number (with optional decimal)
  //        \s* allows optional whitespace
  //        ([kmb]) captures the suffix (case-insensitive with 'i' flag)
  const compactNotationRegex = /(\d+\.?\d*)\s*([kmb])/gi;

  return value.replace(compactNotationRegex, (match, number, suffix) => {
    const num = parseFloat(number);

    // Define multipliers for each suffix
    const multipliers: Record<string, number> = {
      k: 1000,
      m: 1000000,
      b: 1000000000,
    };

    const multiplier = multipliers[suffix.toLowerCase()];
    const result = num * multiplier;

    // Return as string to maintain precision
    // For integers return as-is, for decimals trim trailing zeros
    if (Number.isInteger(result)) {
      return result.toString();
    }

    // For decimal results, use toFixed to handle precision then trim trailing zeros
    return result.toFixed(10).replace(/\.?0+$/, '');
  });
}
