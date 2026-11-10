/**
 * Prepends `0` before a bare leading decimal separator so `.5` → `0.5` (and `-.5` → `-0.5`).
 * Intended to run inside the sanitization pipeline AFTER `removeLeadingZeros`, since stripping
 * `0.5` → `.5` is exactly the case this reverses.
 */
export function prependLeadingZero(value: string, decimalSeparator: string = '.'): string {
  const signLength = value.startsWith('-') ? 1 : 0;
  return value.startsWith(decimalSeparator, signLength)
    ? `${value.slice(0, signLength)}0${value.slice(signLength)}`
    : value;
}
