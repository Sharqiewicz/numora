import type { FormatOn } from './types';
import type { thousandStyle } from './utils/formatting';

export interface NumoraInputValidationOptions {
  decimalMaxLength?: number;
  formatOn?: FormatOn;
  thousandSeparator?: string;
  thousandStyle?: thousandStyle;
  decimalSeparator?: string;
  enableCompactNotation?: boolean;
  enableNegative?: boolean;
  enableLeadingZeros?: boolean;
  onChange?: (value: string) => void;
}

/**
 * Validates all NumoraInput constructor parameters.
 * Throws descriptive errors for invalid values.
 */
export function validateNumoraInputOptions(options: NumoraInputValidationOptions): void {
  validateDecimalMaxLength(options.decimalMaxLength);
  validateFormatOn(options.formatOn);
  validateThousandSeparator(options.thousandSeparator);
  validateThousandStyle(options.thousandStyle);
  validateDecimalSeparator(options.decimalSeparator);
  validateSeparatorConflict(options.thousandSeparator, options.decimalSeparator);
  validateBooleanOption('enableCompactNotation', options.enableCompactNotation);
  validateBooleanOption('enableNegative', options.enableNegative);
  validateBooleanOption('enableLeadingZeros', options.enableLeadingZeros);
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

function validateFormatOn(value: FormatOn | undefined): void {
  if (value === undefined) {
    return;
  }

  if (value !== 'blur' && value !== 'change') {
    throw new Error(
      `formatOn must be either 'blur' or 'change'. ` +
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

function validateThousandStyle(value: thousandStyle | undefined): void {
  if (value === undefined) {
    return;
  }

  const validStyles: thousandStyle[] = ['thousand', 'lakh', 'wan'];

  if (!validStyles.includes(value)) {
    throw new Error(
      `thousandStyle must be one of: ${validStyles.map(s => `'${s}'`).join(', ')}. ` +
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
      `onChange must be a function. ` +
      `Received: ${typeof value} (${JSON.stringify(value)})`
    );
  }
}
