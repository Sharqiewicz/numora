/**
 * Character equivalence utilities for cursor position calculation.
 */

import type { IsCharacterEquivalent } from './cursor-position';

/**
 * Default character equivalence function.
 * Only considers identical characters as equivalent.
 */
export const defaultIsCharacterEquivalent: IsCharacterEquivalent = (char1, char2) => {
  return char1 === char2;
};

