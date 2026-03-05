import {
  DEFAULT_THOUSAND_SEPARATOR,
  DEFAULT_DECIMAL_SEPARATOR,
  DEFAULT_THOUSAND_STYLE,
} from '../config';
import { ThousandStyle } from '../types';

export function getSeparatorsFromLocale(locale?: string): {
  thousandSeparator: string;
  decimalSeparator: string;
} {
  try {
    const formatter = new Intl.NumberFormat(locale);
    const parts = formatter.formatToParts(1234567.89);
    return {
      decimalSeparator: parts.find(p => p.type === 'decimal')?.value ?? '.',
      thousandSeparator: parts.find(p => p.type === 'group')?.value ?? ',',
    };
  } catch {
    return { thousandSeparator: ',', decimalSeparator: '.' };
  }
}

export function resolveLocaleOptions(options: {
  thousandSeparator?: string;
  thousandStyle?: ThousandStyle;
  decimalSeparator?: string;
}): {
  thousandSeparator: string;
  thousandStyle: ThousandStyle;
  decimalSeparator: string;
} {
  let thousandSeparator = options.thousandSeparator ?? DEFAULT_THOUSAND_SEPARATOR;
  let decimalSeparator  = options.decimalSeparator  ?? DEFAULT_DECIMAL_SEPARATOR;
  let thousandStyle     = options.thousandStyle     ?? DEFAULT_THOUSAND_STYLE;

  const needsLocale =
    options.thousandStyle === ThousandStyle.Locale ||
    options.decimalSeparator === 'auto';

  if (needsLocale) {
    const localeSeps = getSeparatorsFromLocale();
    if (options.thousandStyle === ThousandStyle.Locale) {
      thousandSeparator = options.thousandSeparator ?? localeSeps.thousandSeparator;
      decimalSeparator  = options.decimalSeparator === 'auto' || options.decimalSeparator === undefined
        ? localeSeps.decimalSeparator
        : options.decimalSeparator;
      thousandStyle = ThousandStyle.Thousand;
    }
    if (options.decimalSeparator === 'auto') {
      decimalSeparator = localeSeps.decimalSeparator;
    }
  }

  return { thousandSeparator, thousandStyle, decimalSeparator };
}
