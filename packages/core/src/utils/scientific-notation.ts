/**
 * Expands scientific notation to decimal notation using string manipulation only.
 * Handles formats like: 1.5e-7, 2e+5, 1.23e-4, etc.
 * Finds and expands scientific notation anywhere in the string.
 *
 * @param value - The string value that may contain scientific notation
 * @returns The expanded decimal string, or original value if not scientific notation
 */
export function expandScientificNotation(value: string): string {
  const scientificNotationRegex = /([+-]?\d+\.?\d*)[eE]([+-]?\d+)/g;
  let result = value;
  let match;
  const matches: Array<{ full: string; expanded: string }> = [];

  while ((match = scientificNotationRegex.exec(value)) !== null) {
    const fullMatch = match[0];
    const base = match[1];
    const exponent = parseInt(match[2], 10);

    let expanded: string;
    if (exponent === 0) {
      expanded = base;
    } else {
      const isNegative = base.startsWith('-');
      const baseWithoutSign = isNegative ? base.slice(1) : base;
      const [integerPart, decimalPart = ''] = baseWithoutSign.split('.');

      if (exponent > 0) {
        expanded = expandPositiveExponent(integerPart, decimalPart, exponent, baseWithoutSign.includes('.'));
      } else {
        expanded = expandNegativeExponent(integerPart, decimalPart, Math.abs(exponent), baseWithoutSign.includes('.'));
      }

      if (isNegative) {
        expanded = '-' + expanded;
      }
    }

    matches.push({ full: fullMatch, expanded });
  }

  for (const { full, expanded } of matches) {
    result = result.replace(full, expanded);
  }

  return result;
}

function expandPositiveExponent(
  integerPart: string,
  decimalPart: string,
  exponent: number,
  hadDecimalPoint: boolean
): string {
  const allDigits = integerPart + decimalPart;

  if (allDigits === '0' || allDigits.match(/^0+$/)) {
    return '0';
  }

  const currentDecimalPosition = decimalPart.length;

  if (exponent <= currentDecimalPosition) {
    const newIntegerPart = allDigits.slice(0, integerPart.length + exponent);
    const newDecimalPart = allDigits.slice(integerPart.length + exponent);
    return newDecimalPart ? `${newIntegerPart}.${newDecimalPart}` : newIntegerPart;
  }

  const zerosToAdd = exponent - currentDecimalPosition;
  return allDigits + '0'.repeat(zerosToAdd);
}

function expandNegativeExponent(
  integerPart: string,
  decimalPart: string,
  exponent: number,
  hadDecimalPoint: boolean
): string {
  const allDigits = integerPart + decimalPart;

  if (allDigits === '0' || allDigits.match(/^0+$/)) {
    return '0';
  }

  const currentDecimalPosition = integerPart.length;

  const totalPlacesToMove = exponent;
  const newDecimalPosition = currentDecimalPosition - totalPlacesToMove;

  if (newDecimalPosition <= 0) {
    const leadingZeros = Math.abs(newDecimalPosition);
    const result = `0.${'0'.repeat(leadingZeros)}${allDigits}`;
    return trimTrailingZeros(result);
  }

  if (newDecimalPosition < integerPart.length) {
    const newIntegerPart = allDigits.slice(0, newDecimalPosition);
    const newDecimalPart = allDigits.slice(newDecimalPosition);
    const result = `${newIntegerPart}.${newDecimalPart}`;
    return trimTrailingZeros(result);
  }

  return trimTrailingZeros(allDigits);
}

function trimTrailingZeros(value: string): string {
  if (!value.includes('.')) {
    return value;
  }

  if (value === '0' || value === '0.') {
    return '0';
  }

  if (value.startsWith('0.')) {
    const trimmed = value.replace(/\.?0+$/, '');
    return trimmed === '0' ? '0' : trimmed || '0';
  }

  if (value.startsWith('-0.')) {
    const trimmed = value.replace(/\.?0+$/, '');
    if (trimmed === '-0' || trimmed === '0') {
      return '0';
    }
    return trimmed || '0';
  }

  return value.replace(/\.?0+$/, '') || value;
}

