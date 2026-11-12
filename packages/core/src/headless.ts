import type { NumoraOptions } from './types';
import { appValue } from './utils/app-value';
import { formatForDisplay } from './utils/dom-events';
import { takeRemovedOptions, warnRemovedOptions } from './utils/removed-options';
import { resolveOptions } from './utils/resolve-options';

// Removed v4 option names already warned about here: these functions can run on every render.
const warned = new Set<string>();

/** Resolves options, warning once per name for an option removed since v4 (it is ignored). */
function resolve(options?: NumoraOptions) {
  if (options) {
    const fresh = takeRemovedOptions({ ...options }).filter((name) => !warned.has(name));
    for (const name of fresh) warned.add(name);
    warnRemovedOptions(fresh);
  }
  return resolveOptions(options);
}

/**
 * Formats a canonical raw value (`'1234.5'`: ASCII digits, `.` decimal, optional `-`) the way
 * a field with these options shows it at rest: grouped, padded to `decimalMinLength`, cut
 * (never rounded) to `decimalMaxLength`, `maxLength` applied. No input element involved.
 * `isAllowed` is ignored. Anything that is not a number gives `''`, `null` and `undefined`
 * included; a number is formatted with a development warning, like the input's own values.
 *
 * @example
 * formatValue('1234.5')                                             // '1,234.5'
 * formatValue('1234.5', { locale: 'de-DE', decimalMinLength: 2 })   // '1.234,50'
 *
 * @throws when `options` are invalid, like the input does.
 */
export function formatValue(value: string, options?: NumoraOptions): string {
  const resolved = resolve(options);
  return formatForDisplay(
    appValue(value, 'formatValue()', resolved.allowCompactNotation),
    resolved,
    'canonical'
  ).formatted;
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
  // Formatted text is what `parseValue` is for, so only a non-string goes through `appValue`.
  return formatForDisplay(
    typeof text === 'string' ? text : appValue(text, 'parseValue()'),
    resolve(options)
  ).raw;
}
