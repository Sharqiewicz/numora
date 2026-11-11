import { FormatOn, GroupingStyle, type NumoraOptions } from './types';

// Derived from NumoraOptions so adding a new field to that interface automatically
// flows into validation - no more drift between the option surface and the validator.
// The callbacks are `unknown`: only their `typeof` is checked. `onChange` is React's.
type NumoraInputValidationOptions = NumoraOptions & {
  onChange?: unknown;
  onValueChange?: unknown;
};

/**
 * Validates all NumoraInput constructor parameters.
 * Throws descriptive errors for invalid values.
 */
export function validateNumoraInputOptions(options: NumoraInputValidationOptions): void {
  assertInt('decimalMaxLength', options.decimalMaxLength, 0, 'a non-negative integer');
  assertInt('decimalMinLength', options.decimalMinLength, 0, 'a non-negative integer');
  assertDecimalLengths(options.decimalMinLength, options.decimalMaxLength);
  assertEnumValue('formatOn', options.formatOn, [FormatOn.Blur, FormatOn.Change]);
  // One way to turn grouping off: `groupingStyle: 'none'`. An empty separator is rejected.
  if (options.thousandSeparator === '') {
    throw new Error("thousandSeparator cannot be empty. Use groupingStyle: 'none'.");
  }
  assertSeparator('thousandSeparator', options.thousandSeparator);
  assertEnumValue('groupingStyle', options.groupingStyle, Object.values(GroupingStyle));
  assertSeparator('decimalSeparator', options.decimalSeparator);
  assertSeparatorConflict(options.thousandSeparator, options.decimalSeparator);
  assertType('allowCompactNotation', options.allowCompactNotation, 'boolean');
  assertType('allowScientificNotation', options.allowScientificNotation, 'boolean');
  assertType('allowNegative', options.allowNegative, 'boolean');
  assertType('allowLeadingZeros', options.allowLeadingZeros, 'boolean');
  assertType('padLeadingZero', options.padLeadingZero, 'boolean');
  assertInt('maxLength', options.maxLength, 1, 'a positive integer (>= 1)');
  assertType('isAllowed', options.isAllowed, 'function');
  assertType('onChange', options.onChange, 'function');
  assertType('onValueChange', options.onValueChange, 'function');
}

function assertInt(name: string, value: number | undefined, min: number, expected: string): void {
  if (value === undefined) return;
  if (!Number.isInteger(value) || value < min) {
    throw new Error(`${name} must be ${expected}. Received: ${JSON.stringify(value)}`);
  }
}

// Reserved parser-grammar characters: the sign (- +), the exponent marker (e E), and the
// compact-notation suffixes (k K m M b B t T). Accepting any of these as a separator makes
// the value ambiguous - the same character means something different to the sanitization
// pipeline than "thousand/decimal separator". Whitespace (including U+00A0 NBSP and
// U+202F NNBSP, used by locales such as fr-FR) is intentionally NOT reserved.
const RESERVED_SEPARATOR_CHARS = /[-+eEkKmMbBtT]/;

function assertSeparator(name: string, value: string | undefined): void {
  if (value === undefined) return;
  const received = `Received: ${JSON.stringify(value)}`;
  if (typeof value !== 'string' || value.length !== 1) {
    throw new Error(`${name} must be a single character. ${received}`);
  }
  // A digit separator is indistinguishable from a real digit at runtime: the strip/insert
  // logic would treat every matching digit in the value as a separator and scramble it.
  if (/[0-9]/.test(value)) throw new Error(`${name} cannot be a digit. ${received}`);
  if (RESERVED_SEPARATOR_CHARS.test(value)) {
    throw new Error(
      `${name} cannot be one of the reserved characters -+eEkKmMbBtT (sign, exponent, or compact-notation suffix). ${received}`
    );
  }
}

function assertType(name: string, value: unknown, type: 'boolean' | 'function'): void {
  if (value === undefined) return;
  if (typeof value !== type) {
    throw new Error(`${name} must be a ${type}. Received: ${JSON.stringify(value)}`);
  }
}

function assertEnumValue<T extends string>(
  name: string,
  value: T | undefined,
  allowed: readonly T[]
): void {
  if (value === undefined) return;
  if (!allowed.includes(value)) {
    throw new Error(
      `${name} must be one of: ${allowed.map((v) => `'${v}'`).join(', ')}. Received: ${JSON.stringify(value)}`
    );
  }
}

function assertDecimalLengths(minLength = 0, maxLength = Infinity): void {
  if (minLength > maxLength) {
    throw new Error(
      `decimalMinLength (${minLength}) cannot be greater than decimalMaxLength (${maxLength}).`
    );
  }
}

function assertSeparatorConflict(
  thousandSeparator: string | undefined,
  decimalSeparator: string | undefined
): void {
  if (thousandSeparator && thousandSeparator === decimalSeparator) {
    throw new Error(
      `decimalSeparator cannot equal thousandSeparator. Both were ${JSON.stringify(thousandSeparator)}.`
    );
  }
}
