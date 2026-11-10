import {
  DEFAULT_PAD_LEADING_ZERO,
  DEFAULT_DECIMAL_MAX_LENGTH,
  DEFAULT_DECIMAL_MIN_LENGTH,
  DEFAULT_DECIMAL_SEPARATOR,
  DEFAULT_ALLOW_COMPACT_NOTATION,
  DEFAULT_ALLOW_LEADING_ZEROS,
  DEFAULT_ALLOW_NEGATIVE,
  DEFAULT_ALLOW_SCIENTIFIC_NOTATION,
  DEFAULT_FORMAT_ON,
  DEFAULT_GROUPING_STYLE,
  DEFAULT_THOUSAND_SEPARATOR,
} from '../config';
import type { NumoraOptions } from '../types';
import { validateNumoraInputOptions } from '../validation';
import type { ResolvedNumoraOptions } from './dom-events';
import { applyLocale } from './locale';

/**
 * The one place options become runnable: locale → separators, then defaults, then
 * validation. Both wrappers call it, so they cannot drift.
 *
 * Validation runs on the RESOLVED options: the separator-conflict and min/max-decimal checks
 * need both operands, and `{ decimalSeparator: ',' }` alone only conflicts once the default
 * thousand separator is filled in. `onChange` is accepted only to be type-checked.
 */
export function resolveOptions(
  options: NumoraOptions & { onChange?: unknown } = {}
): ResolvedNumoraOptions {
  const {
    locale,
    thousandSeparator,
    decimalSeparator,
    // Not defaulted before `applyLocale`: it derives the style from the locale (Indic
    // locales -> Lakh), and a pre-applied default would swallow the derived value.
    groupingStyle,
  } = options;
  const separators = applyLocale(locale, { thousandSeparator, decimalSeparator, groupingStyle });

  const resolved: ResolvedNumoraOptions = {
    formatOn: options.formatOn ?? DEFAULT_FORMAT_ON,
    thousandSeparator: separators.thousandSeparator ?? DEFAULT_THOUSAND_SEPARATOR,
    groupingStyle: separators.groupingStyle ?? DEFAULT_GROUPING_STYLE,
    decimalSeparator: separators.decimalSeparator ?? DEFAULT_DECIMAL_SEPARATOR,
    decimalMaxLength: options.decimalMaxLength ?? DEFAULT_DECIMAL_MAX_LENGTH,
    decimalMinLength: options.decimalMinLength ?? DEFAULT_DECIMAL_MIN_LENGTH,
    allowCompactNotation: options.allowCompactNotation ?? DEFAULT_ALLOW_COMPACT_NOTATION,
    allowScientificNotation:
      options.allowScientificNotation ?? DEFAULT_ALLOW_SCIENTIFIC_NOTATION,
    allowNegative: options.allowNegative ?? DEFAULT_ALLOW_NEGATIVE,
    allowLeadingZeros: options.allowLeadingZeros ?? DEFAULT_ALLOW_LEADING_ZEROS,
    padLeadingZero: options.padLeadingZero ?? DEFAULT_PAD_LEADING_ZERO,
    maxLength: options.maxLength,
    isAllowed: options.isAllowed,
  };
  validateNumoraInputOptions({ ...resolved, onChange: options.onChange });
  return resolved;
}
