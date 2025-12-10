import { escapeRegExp } from '@/utils/escape-reg-exp';

/**
 * Builds an input pattern that allows optional negative sign and a single custom decimal separator.
 * The separator is escaped so any character can be safely used.
 */
export function getNumoraPattern(decimalSeparator: string, enableNegative: boolean) {
  const escapedSeparator = escapeRegExp(decimalSeparator);
  return enableNegative
    ? `^-?[0-9]*[${escapedSeparator}]?[0-9]*$`
    : `^[0-9]*[${escapedSeparator}]?[0-9]*$`;
}
