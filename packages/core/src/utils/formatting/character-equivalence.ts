/**
 * Character equivalence utilities for cursor position calculation.
 * Handles cases where characters are transformed during formatting
 * (e.g., allowed decimal separators normalized to canonical separator).
 */

import type { ChangeRange } from './constants';
import type { IsCharacterEquivalent } from './cursor-position';

/**
 * Creates a character equivalence function for decimal separators.
 * Handles cases where user types an allowed decimal separator (e.g., ',')
 * that gets normalized to the canonical separator (e.g., '.').
 *
 * @param allowedDecimalSeparators - Array of allowed decimal separator characters
 * @param decimalSeparator - The canonical decimal separator
 * @param thousandsSeparator - The thousands separator (to avoid false matches)
 * @returns Character equivalence function
 */
export function createDecimalSeparatorEquivalence(
  allowedDecimalSeparators: string[],
  decimalSeparator: string,
  thousandsSeparator?: string
): IsCharacterEquivalent {
  return (char1, char2, context) => {
    const { typedRange } = context;

    // If characters are identical, they're equivalent
    if (char1 === char2) {
      return true;
    }

    // Check if char1 is an allowed decimal separator and char2 is the canonical one
    if (
      typedRange &&
      context.oldIndex >= typedRange.start &&
      context.oldIndex < typedRange.end &&
      allowedDecimalSeparators.includes(char1) &&
      char2 === decimalSeparator
    ) {
      // Make sure char1 is not the thousands separator
      if (thousandsSeparator && char1 === thousandsSeparator) {
        return false;
      }
      return true;
    }

    return false;
  };
}

/**
 * Default character equivalence function.
 * Only considers identical characters as equivalent.
 */
export const defaultIsCharacterEquivalent: IsCharacterEquivalent = (char1, char2) => {
  return char1 === char2;
};

