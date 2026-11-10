import {
  DEFAULT_AUTO_ADD_LEADING_ZERO,
  DEFAULT_DECIMAL_MAX_LENGTH,
  DEFAULT_DECIMAL_MIN_LENGTH,
  DEFAULT_DECIMAL_SEPARATOR,
  DEFAULT_ENABLE_COMPACT_NOTATION,
  DEFAULT_ENABLE_LEADING_ZEROS,
  DEFAULT_ENABLE_NEGATIVE,
  DEFAULT_ENABLE_SCIENTIFIC_NOTATION,
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
    enableCompactNotation: options.enableCompactNotation ?? DEFAULT_ENABLE_COMPACT_NOTATION,
    enableScientificNotation:
      options.enableScientificNotation ?? DEFAULT_ENABLE_SCIENTIFIC_NOTATION,
    enableNegative: options.enableNegative ?? DEFAULT_ENABLE_NEGATIVE,
    enableLeadingZeros: options.enableLeadingZeros ?? DEFAULT_ENABLE_LEADING_ZEROS,
    autoAddLeadingZero: options.autoAddLeadingZero ?? DEFAULT_AUTO_ADD_LEADING_ZERO,
    maxLength: options.maxLength,
    isAllowed: options.isAllowed,
  };
  validateNumoraInputOptions({ ...resolved, onChange: options.onChange });
  return resolved;
}
