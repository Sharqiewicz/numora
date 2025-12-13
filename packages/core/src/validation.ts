import { FormatOn } from './types';
import { ThousandStyle } from './types';

export interface NumoraInputValidationOptions {
  decimalMaxLength?: number;
  decimalMinLength?: number;
  formatOn?: FormatOn;
  thousandSeparator?: string;
  thousandStyle?: ThousandStyle;
  decimalSeparator?: string;
  enableCompactNotation?: boolean;
  enableNegative?: boolean;
  enableLeadingZeros?: boolean;
  rawValueMode?: boolean;
  onChange?: (value: string) => void;
}

/**
 * Validates all NumoraInput constructor parameters.
 * Throws descriptive errors for invalid values.
 */
export function validateNumoraInputOptions(options: NumoraInputValidationOptions): void {
  validateDecimalMaxLength(options.decimalMaxLength);
  validateDecimalMinLength(options.decimalMinLength);
  validateDecimalLengths(options.decimalMinLength, options.decimalMaxLength);
  validateFormatOn(options.formatOn);
  validateThousandSeparator(options.thousandSeparator);
  validateThousandStyle(options.thousandStyle);
  validateDecimalSeparator(options.decimalSeparator);
  validateSeparatorConflict(options.thousandSeparator, options.decimalSeparator);
  validateBooleanOption('enableCompactNotation', options.enableCompactNotation);
  validateBooleanOption('enableNegative', options.enableNegative);
  validateBooleanOption('enableLeadingZeros', options.enableLeadingZeros);
  validateBooleanOption('rawValueMode', options.rawValueMode);
  validateOnChange(options.onChange);
}

function validateDecimalMaxLength(value: number | undefined): void {
  if (value === undefined) {
    return;
  }

  if (typeof value !== 'number') {
    throw new Error(
      `decimalMaxLength must be a number. ` +
      `Received: ${typeof value} (${JSON.stringify(value)})`
    );
  }

  if (!Number.isInteger(value)) {
    throw new Error(
      `decimalMaxLength must be an integer. ` +
      `Received: ${value}`
    );
  }

  if (value < 0) {
    throw new Error(
      `decimalMaxLength must be non-negative. ` +
      `Received: ${value}`
    );
  }
}

function validateDecimalMinLength(value: number | undefined): void {
  if (value === undefined) {
    return;
  }

  if (typeof value !== 'number') {
    throw new Error(
      `decimalMinLength must be a number. ` +
      `Received: ${typeof value} (${JSON.stringify(value)})`
    );
  }

  if (!Number.isInteger(value)) {
    throw new Error(
      `decimalMinLength must be an integer. ` +
      `Received: ${value}`
    );
  }

  if (value < 0) {
    throw new Error(
      `decimalMinLength must be non-negative. ` +
      `Received: ${value}`
    );
  }
}

function validateDecimalLengths(minLength: number | undefined, maxLength: number | undefined): void {
  if (minLength === undefined || maxLength === undefined) {
    return;
  }

  if (minLength > maxLength) {
    throw new Error(
      `decimalMinLength (${minLength}) cannot be greater than decimalMaxLength (${maxLength}).`
    );
  }
}

function validateFormatOn(value: FormatOn | undefined): void {
  if (value === undefined) {
    return;
  }

  if (value !== FormatOn.Blur && value !== FormatOn.Change) {
    throw new Error(
      `formatOn must be either ${FormatOn.Blur} or ${FormatOn.Change}. ` +
      `Received: ${JSON.stringify(value)}`
    );
  }
}

function validateThousandSeparator(value: string | undefined): void {
  if (value === undefined) {
    return;
  }

  if (typeof value !== 'string') {
    throw new Error(
      `thousandSeparator must be a string. ` +
      `Received: ${typeof value} (${JSON.stringify(value)})`
    );
  }

  if (value.length === 0) {
    throw new Error(
      `thousandSeparator cannot be empty. ` +
      `Received: ${JSON.stringify(value)}`
    );
  }

  if (value.length > 1) {
    throw new Error(
      `thousandSeparator must be a single character. ` +
      `Received: "${value}" (length: ${value.length})`
    );
  }
}

function validateThousandStyle(value: ThousandStyle | undefined): void {
  if (value === undefined) {
    return;
  }

  if (!Object.values(ThousandStyle).includes(value)) {
    throw new Error(
      `ThousandStyle must be one of: ${Object.values(ThousandStyle).map(s => `'${s}'`).join(', ')}. ` +
      `Received: ${JSON.stringify(value)}`
    );
  }

}

function validateDecimalSeparator(value: string | undefined): void {
  if (value === undefined) {
    return;
  }

  if (typeof value !== 'string') {
    throw new Error(
      `decimalSeparator must be a string. ` +
      `Received: ${typeof value} (${JSON.stringify(value)})`
    );
  }

  if (value.length === 0) {
    throw new Error(
      `decimalSeparator cannot be empty. ` +
      `Received: ${JSON.stringify(value)}`
    );
  }

  if (value.length > 1) {
    throw new Error(
      `decimalSeparator must be a single character. ` +
      `Received: "${value}" (length: ${value.length})`
    );
  }
}

function validateSeparatorConflict(
  thousandSeparator: string | undefined,
  decimalSeparator: string | undefined
): void {
  if (thousandSeparator === undefined || decimalSeparator === undefined) {
    return;
  }

  if (thousandSeparator === decimalSeparator) {
    throw new Error(
      `Decimal separator can't be same as thousand separator. ` +
      `thousandSeparator: ${thousandSeparator}, ` +
      `decimalSeparator: ${decimalSeparator}`
    );
  }
}

function validateBooleanOption(name: string, value: boolean | undefined): void {
  if (value === undefined) {
    return;
  }

  if (typeof value !== 'boolean') {
    throw new Error(
      `${name} must be a boolean. ` +
      `Received: ${typeof value} (${JSON.stringify(value)})`
    );
  }
}

function validateOnChange(value: ((value: string) => void) | undefined): void {
  if (value === undefined) {
    return;
  }

  if (typeof value !== 'function') {
    throw new Error(
      `onChange must be a function or undefined. ` +
      `Received: ${typeof value} (${JSON.stringify(value)})`
    );
  }
}