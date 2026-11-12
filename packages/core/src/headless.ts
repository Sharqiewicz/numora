import type { NumoraOptions } from './types';
import { formatForDisplay } from './utils/dom-events';
import { resolveOptions } from './utils/resolve-options';

// A lone sign or separator is not a number.
const numeric = (text: string): string => (/\d/.test(text) ? text : '');

/**
 * Formats a canonical raw value (`'1234.5'`: ASCII digits, `.` decimal, optional `-`) the way
 * a field with these options shows it at rest: grouped, padded to `decimalMinLength`, cut
 * (never rounded) to `decimalMaxLength`, `maxLength` applied. No input element involved.
 * `isAllowed` is ignored. Anything that is not a number gives `''`.
 *
 * @example
 * formatValue('1234.5')                                             // '1,234.5'
 * formatValue('1234.5', { locale: 'de-DE', decimalMinLength: 2 })   // '1.234,50'
 *
 * @throws when `options` are invalid, like the input does.
 */
export function formatValue(value: string, options?: NumoraOptions): string {
  return numeric(formatForDisplay(value, resolveOptions(options), 'canonical').formatted);
}

/**
 * The inverse of {@link formatValue}: reads text written in the format these options
 * describe and returns the canonical raw value. It reads its own format only, with no
 * guessing: under the default options `,` is grouping, so `parseValue('1,5')` is `'15'`.
 * Anything that is not a number gives `''`.
 *
 * @example
 * parseValue('1,234.50')                         // '1234.50'
 * parseValue('1.234,50', { locale: 'de-DE' })    // '1234.50'
 *
 * @throws when `options` are invalid, like the input does.
 */
export function parseValue(text: string, options?: NumoraOptions): string {
  return numeric(formatForDisplay(text, resolveOptions(options)).raw);
}
