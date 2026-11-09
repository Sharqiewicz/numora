import { FormatOn, GroupingStyle, type FormattingOptions, type NumoraValues } from './types';

// Derived from FormattingOptions so adding a new field to that interface automatically
// flows into validation - no more drift between the option surface and the validator.
export type NumoraInputValidationOptions = FormattingOptions & {
  onChange?: (values: NumoraValues) => void;
};

/**
 * Validates all NumoraInput constructor parameters.
 * Throws descriptive errors for invalid values.
 */
export function validateNumoraInputOptions(options: NumoraInputValidationOptions): void {
  assertNonNegativeInt('decimalMaxLength', options.decimalMaxLength);
  assertNonNegativeInt('decimalMinLength', options.decimalMinLength);
  assertDecimalLengths(options.decimalMinLength, options.decimalMaxLength);
  assertEnumValue('formatOn', options.formatOn, [FormatOn.Blur, FormatOn.Change]);
  // Empty string is a valid thousandSeparator: runtime treats a falsy separator as
  // "grouping disabled" (applyDisplaySeparators / sanitization both gate on truthiness).
  assertSingleChar('thousandSeparator', options.thousandSeparator, true);
  assertSeparatorNotDigit('thousandSeparator', options.thousandSeparator);
  assertSeparatorNotReserved('thousandSeparator', options.thousandSeparator);
  assertEnumValue('groupingStyle', options.groupingStyle, Object.values(GroupingStyle));
  assertSingleChar('decimalSeparator', options.decimalSeparator);
  assertSeparatorNotDigit('decimalSeparator', options.decimalSeparator);
  assertSeparatorNotReserved('decimalSeparator', options.decimalSeparator);
  assertSeparatorConflict(options.thousandSeparator, options.decimalSeparator);
  assertBoolean('enableCompactNotation', options.enableCompactNotation);
  assertBoolean('enableScientificNotation', options.enableScientificNotation);
  assertBoolean('enableNegative', options.enableNegative);
  assertBoolean('enableLeadingZeros', options.enableLeadingZeros);
  assertBoolean('autoAddLeadingZero', options.autoAddLeadingZero);
  assertPositiveInt('maxLength', options.maxLength);
  assertFunction('isAllowed', options.isAllowed);
  assertFunction('onChange', options.onChange);
}

function assertNonNegativeInt(name: string, value: number | undefined): void {
  if (value === undefined) return;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0) {
    throw new Error(`${name} must be a non-negative integer. Received: ${JSON.stringify(value)}`);
  }
}

function assertPositiveInt(name: string, value: number | undefined): void {
  if (value === undefined) return;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new Error(
      `${name} must be a positive integer (>= 1). Received: ${JSON.stringify(value)}`
    );
  }
}

function assertSingleChar(name: string, value: string | undefined, allowEmpty = false): void {
  if (value === undefined) return;
  if (allowEmpty && value === '') return;
  if (typeof value !== 'string' || value.length !== 1) {
    throw new Error(`${name} must be a single character. Received: ${JSON.stringify(value)}`);
  }
}

function assertSeparatorNotDigit(name: string, value: string | undefined): void {
  if (value === undefined || value === '') return;
  // A digit separator is indistinguishable from a real digit at runtime: the strip/insert
  // logic would treat every matching digit in the value as a separator and scramble it.
  if (/[0-9]/.test(value)) {
    throw new Error(`${name} cannot be a digit. Received: ${JSON.stringify(value)}`);
  }
}

// Reserved parser-grammar characters: the sign (- +), the exponent marker (e E), and the
// compact-notation suffixes (k K m M b B t T). Accepting any of these as a separator makes
// the value ambiguous - the same character means something different to the sanitization
// pipeline than "thousand/decimal separator". Whitespace (including U+00A0 NBSP and
// U+202F NNBSP, used by locales such as fr-FR) is intentionally NOT reserved.
const RESERVED_SEPARATOR_CHARS = /[-+eEkKmMbBtT]/;

function assertSeparatorNotReserved(name: string, value: string | undefined): void {
  if (value === undefined || value === '') return;
  if (RESERVED_SEPARATOR_CHARS.test(value)) {
    throw new Error(
      `${name} cannot be one of the reserved characters -+eEkKmMbBtT (sign, exponent, or compact-notation suffix). Received: ${JSON.stringify(value)}`
    );
  }
}

function assertBoolean(name: string, value: boolean | undefined): void {
  if (value === undefined) return;
  if (typeof value !== 'boolean') {
    throw new Error(`${name} must be a boolean. Received: ${JSON.stringify(value)}`);
  }
}

function assertFunction(name: string, value: unknown): void {
  if (value === undefined) return;
  if (typeof value !== 'function') {
    throw new Error(`${name} must be a function. Received: ${JSON.stringify(value)}`);
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

function assertDecimalLengths(minLength: number | undefined, maxLength: number | undefined): void {
  if (minLength === undefined || maxLength === undefined) return;
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
  if (thousandSeparator === undefined || decimalSeparator === undefined) return;
  if (thousandSeparator === decimalSeparator) {
    throw new Error(
      `decimalSeparator cannot equal thousandSeparator. Both were ${JSON.stringify(thousandSeparator)}.`
    );
  }
}
