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

export function applyLocale(
  locale: string | true | undefined,
  options: { thousandSeparator?: string; decimalSeparator?: string }
): { thousandSeparator?: string; decimalSeparator?: string } {
  if (!locale) return options;
  const tag = locale === true ? undefined : locale;
  const seps = getSeparatorsFromLocale(tag);
  return {
    thousandSeparator: options.thousandSeparator ?? seps.thousandSeparator,
    decimalSeparator: options.decimalSeparator ?? seps.decimalSeparator,
  };
}
