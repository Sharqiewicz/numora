/**
 * Caret boundary system for defining editable positions in formatted numeric inputs.
 * Prevents cursor from being placed in non-editable areas (separators, prefix, suffix).
 */

/**
 * Determines which positions in a formatted value are editable.
 * Returns a boolean array where true = editable position, false = non-editable.
 *
 * @param formattedValue - The formatted string value
 * @param options - Configuration options
 * @returns Boolean array indicating editable positions (length = formattedValue.length + 1)
 *
 * @example
 * getCaretBoundary("1,234.56", { thousandSeparator: ",", decimalSeparator: "." })
 * // Returns: [true, true, false, true, true, true, false, true, true, ...]
 * //          (editable at positions 0,1,3,4,5,7,8,...)
 */
export function getCaretBoundary(
  formattedValue: string,
  options: {
    thousandSeparator?: string;
    decimalSeparator?: string;
    prefix?: string;
    suffix?: string;
  } = {}
): boolean[] {
  const {
    thousandSeparator,
    decimalSeparator = '.',
    prefix = '',
    suffix = '',
  } = options;

  const boundary = Array.from({ length: formattedValue.length + 1 }).map(() => true);

  // Mark prefix positions as non-editable
  if (prefix) {
    boundary.fill(false, 0, prefix.length);
  }

  // Mark suffix positions as non-editable
  if (suffix) {
    const suffixStart = formattedValue.length - suffix.length;
    boundary.fill(false, suffixStart + 1, formattedValue.length + 1);
  }

  // Mark separator positions as non-editable
  for (let i = 0; i < formattedValue.length; i++) {
    const char = formattedValue[i];
    if (
      (thousandSeparator && char === thousandSeparator) ||
      char === decimalSeparator
    ) {
      boundary[i] = false;
      // Also mark position after separator as non-editable if it's not a digit
      if (i + 1 < formattedValue.length && !/\d/.test(formattedValue[i + 1])) {
        boundary[i + 1] = false;
      }
    }
  }

  // Ensure at least one position is editable
  if (!boundary.some((b) => b)) {
    boundary.fill(true);
  }

  return boundary;
}

/**
 * Corrects caret position to be within editable boundaries.
 * Moves cursor to nearest editable position if current position is non-editable.
 *
 * @param value - The formatted string value
 * @param caretPos - The current caret position
 * @param boundary - The boundary array from getCaretBoundary()
 * @param direction - Optional direction to search ('left' or 'right')
 * @returns Corrected caret position within editable area
 *
 * @example
 * const boundary = getCaretBoundary("1,234", { thousandSeparator: "," });
 * getCaretPosInBoundary("1,234", 1, boundary, 'right')
 * // Returns: 2 (moves from separator position to next digit)
 */
export function getCaretPosInBoundary(
  value: string,
  caretPos: number,
  boundary: boolean[],
  direction?: 'left' | 'right'
): number {
  const valLn = value.length;

  // Clamp caret position to valid range
  caretPos = Math.max(0, Math.min(caretPos, valLn));

  if (direction === 'left') {
    // Search left for editable position
    while (caretPos >= 0 && !boundary[caretPos]) {
      caretPos--;
    }
    // If no editable position found on left, use first editable position
    if (caretPos === -1) {
      caretPos = boundary.indexOf(true);
    }
  } else if (direction === 'right') {
    // Search right for editable position
    while (caretPos <= valLn && !boundary[caretPos]) {
      caretPos++;
    }
    // If no editable position found on right, use last editable position
    if (caretPos > valLn) {
      caretPos = boundary.lastIndexOf(true);
    }
  } else {
    // No direction: find nearest editable position
    if (!boundary[caretPos]) {
      // Try right first
      let rightPos = caretPos;
      while (rightPos <= valLn && !boundary[rightPos]) {
        rightPos++;
      }

      // Try left
      let leftPos = caretPos;
      while (leftPos >= 0 && !boundary[leftPos]) {
        leftPos--;
      }

      // Choose closest
      if (rightPos <= valLn && leftPos >= 0) {
        caretPos = caretPos - leftPos < rightPos - caretPos ? leftPos : rightPos;
      } else if (rightPos <= valLn) {
        caretPos = rightPos;
      } else if (leftPos >= 0) {
        caretPos = leftPos;
      }
    }
  }

  // Fallback: if still invalid, use end of value
  if (caretPos === -1 || caretPos > valLn) {
    caretPos = valLn;
  }

  return caretPos;
}

